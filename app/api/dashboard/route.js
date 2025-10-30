import { getServerSession } from 'next-auth/next'
import { options } from '../auth/[...nextauth]/options'
import connectToMongoose from '../../../lib/mongoose'
import Dashboard from '../../../models/Dashboard'

export async function GET(req) {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    await connectToMongoose()

    const doc = await Dashboard.findOne({ userId: session.user.id })
    if (!doc) {
      return new Response(
        JSON.stringify({
          totalProblems: 0,
          revisedThisWeek: 0,
          remainingToRevise: 0,
        }),
        { status: 200 }
      )
    }

    return new Response(JSON.stringify({
      totalProblems: doc.totalProblems,
      revisedThisWeek: doc.revisedThisWeek,
      remainingToRevise: doc.remainingToRevise,
    }), { status: 200 })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching dashboard:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
