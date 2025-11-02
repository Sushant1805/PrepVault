import { getServerSession } from 'next-auth/next'
import { options } from '../auth/[...nextauth]/options'
import connectToMongoose from '../../../lib/mongoose'
import Topic from '../../../models/Topics'
import Dashboard from '../../../models/Dashboard'

export async function POST(req) {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const body = await req.json()
    if (!body.title) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    await connectToMongoose()

    const doc = await Topic.create({
      title: body.title,
      description: body.description || '',
      subtopics: Array.isArray(body.subtopics) ? body.subtopics : (body.subtopics || []),
      resources: Array.isArray(body.resources) ? body.resources : (body.resources || []),
      importance: body.importance || 'Normal',
      tags: Array.isArray(body.tags) ? body.tags : (body.tags || []),
      userId: session.user.id,
    })

    // update dashboard counts (non-essential)
    try {
      await Dashboard.findOneAndUpdate(
        { userId: doc.userId },
        { $inc: { totalTopics: 1 } },
        { upsert: true, new: true }
      )
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update dashboard after topic create:', err)
    }

    return new Response(JSON.stringify(doc), { status: 201 })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error creating topic:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

export async function GET(req) {
  await connectToMongoose()
  try {
    const url = new URL(req.url)
    const name = url.searchParams.get('name')
    const query = {}
    if (name) query.title = { $regex: name, $options: 'i' }
    const topics = await Topic.find(query).sort({ createdAt: -1 })
    return new Response(JSON.stringify({ message: 'Topics fetched', topics }), { status: 200 })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching topics:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
