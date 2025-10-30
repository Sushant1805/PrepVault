import { getServerSession } from 'next-auth/next';
import { options } from '../auth/[...nextauth]/options';
import connectToMongoose from '../../../lib/mongoose';
import Problem from '../../../models/Problems';
import Dashboard from '../../../models/Dashboard';

export async function POST(req) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();

    // basic required validation
    if (!body.title || !body.link || !body.topic) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    await connectToMongoose();

    const doc = await Problem.create({
      title: body.title,
      link: body.link,
      topic: body.topic,
      subtopics: Array.isArray(body.subtopics) ? body.subtopics : (body.subtopics || []),
      difficulty: body.difficulty || 'Medium',
      platform: body.platform || '',
      status: body.status || 'Unsolved',
      note: body.note || '',
      tags: Array.isArray(body.tags) ? body.tags : (body.tags || []),
      userId: session.user.id,
    });

    // update dashboard counts for the user
    try {
      const isSolved = (doc.status === 'Solved')
      const inc = {
        totalProblems: 1,
        revisedThisWeek: isSolved ? 1 : 0,
        remainingToRevise: isSolved ? 0 : 1,
      }

      await Dashboard.findOneAndUpdate(
        { userId: doc.userId },
        { $inc: inc, $setOnInsert: { weekStart: new Date() } },
        { upsert: true, new: true }
      )
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update dashboard after create:', err)
    }

    // clamp any negative values (defensive): ensure counts are >= 0
    try {
      await Dashboard.findOneAndUpdate(
        { userId: doc.userId },
        [
          { $set: {
            totalProblems: { $max: ["$totalProblems", 0] },
            revisedThisWeek: { $max: ["$revisedThisWeek", 0] },
            remainingToRevise: { $max: ["$remainingToRevise", 0] }
          } }
        ],
        { new: true }
      )
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to clamp dashboard counts after create:', err)
    }
    return new Response(JSON.stringify(doc), { status: 201 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error creating problem:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function GET(req){
  await connectToMongoose();

  try {
    const url = new URL(req.url)
    const name = url.searchParams.get('name')

    const query = {}
    if (name) {
      // case-insensitive, partial match on title
      query.title = { $regex: name, $options: 'i' }
    }

    const Problems = await Problem.find(query).sort({ createdAt: -1 })

    return new Response(JSON.stringify({
      message: 'Problems Fetched Successfully!',
      problems: Problems,
    }))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching problems:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
