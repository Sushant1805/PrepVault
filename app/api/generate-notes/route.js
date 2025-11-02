import { getServerSession } from 'next-auth/next'
import { options } from '../auth/[...nextauth]/options'
import connectToMongoose from '../../../lib/mongoose'
import Problem from '../../../models/Problems'
import { GoogleGenAI } from '@google/genai'

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

    // Prefer Gemini (Google Generative Models) when a GEMINI_API_KEY is provided.
    // Assumptions:
    // - GEMINI_API_KEY is a simple API key and can be provided as a query param (?key=...) against
    //   the generativelanguage.googleapis.com endpoint OR as an Authorization bearer token depending on deployment.
    // - The default Gemini model used here is 'models/gemini-1.5-mini' but you can override with GEMINI_MODEL.
    // If GEMINI_API_KEY is not set, fall back to the existing puter.ai client-call behavior.

    const geminiKey = process.env.GEMINI_API_KEY || null
    let generated = ''
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured on server' }), { status: 500 })
    }

    // Use Google's official GenAI SDK when a GEMINI_API_KEY is provided.
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey })
      const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
      const resp = await ai.models.generateContent({ model: geminiModel, contents: prompt })
      // The SDK may return `text` or nested outputs; handle common shapes
      generated = resp?.text || resp?.output?.[0]?.content || resp?.candidates?.[0]?.output || JSON.stringify(resp)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Gemini SDK call failed', err)
      return new Response(JSON.stringify({ error: 'Gemini SDK call failed', detail: String(err) }), { status: 502 })
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
