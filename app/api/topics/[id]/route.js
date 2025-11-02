import { getServerSession } from 'next-auth/next'
import { options } from '../../auth/[...nextauth]/options'
import connectToMongoose from '../../../../lib/mongoose'
import Topic from '../../../../models/Topics'
import Dashboard from '../../../../models/Dashboard'

export async function GET(req, { params }) {
  try {
    await connectToMongoose()
    const { id } = params
    const topic = await Topic.findById(id)
    if (!topic) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    return new Response(JSON.stringify({ topic }), { status: 200 })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching topic by id:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const { id } = params
    const body = await req.json()
    await connectToMongoose()

    const topic = await Topic.findById(id)
    if (!topic) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

    // Only owner can edit
    if (topic.userId.toString() !== session.user.id.toString()) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }

    // Create a revision snapshot from current data
    const snapshot = {
      title: topic.title,
      description: topic.description,
      subtopics: topic.subtopics || [],
      resources: topic.resources || [],
      importance: topic.importance,
      tags: topic.tags || [],
      userId: session.user.id,
      updatedAt: new Date(),
    }

    // prepend to revisions
    topic.revisions = topic.revisions || []
    topic.revisions.unshift(snapshot)
    topic.revisionCount = (topic.revisionCount || 0) + 1

    // Apply updates (only allow known fields)
    const allowed = ['title', 'description', 'subtopics', 'resources', 'importance', 'tags']
    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(body, k)) {
        topic[k] = body[k]
      }
    })

    await topic.save()
    return new Response(JSON.stringify({ topic }), { status: 200 })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error updating topic:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const { id } = params
    await connectToMongoose()
    const topic = await Topic.findById(id)
    if (!topic) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

    if (topic.userId.toString() !== session.user.id.toString()) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }

    await Topic.deleteOne({ _id: id })

    // update dashboard counts (best-effort)
    try {
      await Dashboard.findOneAndUpdate({ userId: topic.userId }, { $inc: { totalTopics: -1 } })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update dashboard after topic delete:', err)
    }

    return new Response(JSON.stringify({ message: 'Deleted' }), { status: 200 })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error deleting topic:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
