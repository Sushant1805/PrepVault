import { getServerSession } from 'next-auth/next'
import { options } from '../auth/[...nextauth]/options'
import connectToMongoose from '../../../lib/mongoose'
import Problem from '../../../models/Problems'

// NOTE: This route expects the environment variable PERPLEXITY_API_KEY to be set.
// Optionally you may set PERPLEXITY_API_URL to override the endpoint.

export async function POST(req) {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const body = await req.json()
    const { code, problemId } = body || {}
    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing code' }), { status: 400 })
    }

    // Basic permission: require problemId to save directly. If not provided, we'll still call the API and return notes.
    await connectToMongoose()

    // Build a concise prompt for the external API
    const prompt = `Generate concise study notes and explanations for the following code. Focus on algorithmic idea, complexity, caveats, and helpful tips. Use bullet points or short paragraphs.\n\n${code}`

    // Use Hugging Face Inference API with a BigCode/StarCoder model
    // Requires HF_API_KEY in env (you can also set HF_MODEL to override)
    const hfKey = process.env.HF_API_KEY
    if (!hfKey) {
      return new Response(JSON.stringify({ error: 'Hugging Face API key not configured on server (HF_API_KEY)' }), { status: 500 })
    }

  const model = process.env.HF_MODEL || 'bigcode/starcoder'
  // Use the new Hugging Face Inference Providers router endpoint
  // See: https://huggingface.co/docs/inference-providers
  const hfUrl = `https://router.huggingface.co/hf-inference/models/${model}`
  const fallbackModel = process.env.HF_FALLBACK_MODEL || 'Salesforce/codegen-2-1B'

    // Call Hugging Face Inference API
    let extRes
    // Try the new router endpoint first
    try {
      extRes = await fetch(hfUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 400, temperature: 0.2 } }),
      })
    } catch (fetchErr) {
      // eslint-disable-next-line no-console
      console.error('Failed to reach Hugging Face Inference router endpoint', fetchErr)
      return new Response(JSON.stringify({ error: 'Failed to contact Hugging Face Inference API' }), { status: 502 })
    }

    // If model is gated or token lacks permissions, try fallback model before failing
  // If router responds 403/404 (model gated or not found on router), try fallback model on router
  if (!extRes.ok && (extRes.status === 403 || extRes.status === 404) && fallbackModel) {
      // log initial failure
      const firstTxt = await extRes.text().catch(() => '')
      // eslint-disable-next-line no-console
      console.warn('Primary HF model call failed; attempting fallback model', { model, status: extRes.status, body: firstTxt })
      try {
        const fallbackUrl = `https://router.huggingface.co/hf-inference/models/${fallbackModel}`
        const fr = await fetch(fallbackUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 300, temperature: 0.2 } }),
        })
        if (fr.ok) {
          extRes = fr
        } else {
          const ftxt = await fr.text().catch(() => '')
          // eslint-disable-next-line no-console
          console.error('Fallback HF model failed', { fallbackModel, status: fr.status, body: ftxt })
        }
      } catch (fe) {
        // eslint-disable-next-line no-console
        console.error('Fallback HF fetch failed', fe)
      }
    }
    // If still not OK, try legacy api-inference endpoint as a last resort (some tokens/models still need it)
    if (!extRes.ok && (extRes.status === 403 || extRes.status === 404)) {
      const legacyUrl = `https://api-inference.huggingface.co/models/${model}`
      try {
        const legacyRes = await fetch(legacyUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 400, temperature: 0.2 } }),
        })
        if (legacyRes.ok) {
          extRes = legacyRes
        } else {
          const ltxt = await legacyRes.text().catch(() => '')
          // eslint-disable-next-line no-console
          console.error('Legacy HF endpoint failed', { legacyUrl, status: legacyRes.status, body: ltxt })
        }
      } catch (le) {
        // eslint-disable-next-line no-console
        console.error('Failed to reach legacy Hugging Face endpoint', le)
      }
    }

    if (!extRes.ok) {
      const txt = await extRes.text().catch(() => '')
      // eslint-disable-next-line no-console
      console.error('Hugging Face API call failed', { status: extRes.status, statusText: extRes.statusText, body: txt })
      // Improve guidance for common gating/permission issues
      const guidance = (extRes.status === 403 || extRes.status === 404)
        ? 'Model may be gated or your token lacks inference permissions. Ensure you accepted the model license on Hugging Face and that HF_API_KEY has read/inference scope. You can also set HF_FALLBACK_MODEL to a public model.'
        : ''
      return new Response(JSON.stringify({ error: 'Hugging Face API error', status: extRes.status, statusText: extRes.statusText, detail: txt, guidance }), { status: 502 })
    }

    let extJson = null
    try {
      extJson = await extRes.json()
    } catch (parseErr) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse HF JSON response', parseErr)
      const raw = await extRes.text().catch(() => '')
      return new Response(JSON.stringify({ error: 'HF returned non-JSON', detail: raw }), { status: 502 })
    }

    // HF often returns an array of objects with `generated_text` or a single object
    let generated = ''
    if (Array.isArray(extJson) && extJson.length > 0) {
      generated = extJson[0].generated_text || extJson[0].generated_text || JSON.stringify(extJson[0])
    } else {
      generated = extJson.generated_text || extJson?.data?.[0]?.generated_text || JSON.stringify(extJson)
    }

    // If a problemId was provided, update the problem note in DB (ensuring user owns it)
    let updatedProblem = null
    if (problemId) {
      const problem = await Problem.findById(problemId)
      if (!problem) {
        return new Response(JSON.stringify({ error: 'Problem not found' }), { status: 404 })
      }
      if (String(problem.userId) !== String(session.user.id)) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
      }

      problem.note = generated
      await problem.save()
      updatedProblem = problem
    }

    return new Response(JSON.stringify({ notes: generated, problem: updatedProblem }), { status: 200 })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('generate-notes error', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
