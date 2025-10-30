import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/[...nextauth]/options';
import connectToMongoose from '../../../../lib/mongoose';
import Problem from '../../../../models/Problems';
import Dashboard from '../../../../models/Dashboard';

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    // Only allow updating note and status
    const update = {};
    if (typeof body.note !== 'undefined') update.note = body.note;
    if (typeof body.status !== 'undefined') update.status = body.status;

    await connectToMongoose();

    const problem = await Problem.findById(id);
    if (!problem) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    // ensure user owns the problem
    if (String(problem.userId) !== String(session.user.id)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const previousStatus = problem.status

    Object.assign(problem, update);
    await problem.save();

    // adjust dashboard counts if status changed
    try {
      if (typeof update.status !== 'undefined' && String(problem.userId)) {
        const userId = problem.userId
        const prevSolved = previousStatus === 'Solved'
        const nowSolved = problem.status === 'Solved'

        const ops = {}
        if (!prevSolved && nowSolved) {
          // moved to solved: increment revised count and decrement remaining
          ops.$inc = { revisedThisWeek: 1, remainingToRevise: -1 }
        } else if (prevSolved && !nowSolved) {
          // reverted from solved: do NOT decrement revisedThisWeek (it should be monotonic)
          // but increase remainingToRevise since it's now to-be-revised
          ops.$inc = { remainingToRevise: 1 }
        }

        if (ops.$inc) {
          // ensure we don't make negative counts on revisedThisWeek
          await Dashboard.findOneAndUpdate(
            { userId },
            ops,
            { upsert: true, new: true }
          )
          // clamp negative values defensively
          try {
            await Dashboard.findOneAndUpdate(
              { userId },
              [ { $set: {
                totalProblems: { $max: ["$totalProblems", 0] },
                revisedThisWeek: { $max: ["$revisedThisWeek", 0] },
                remainingToRevise: { $max: ["$remainingToRevise", 0] }
              } } ],
              { new: true }
            )
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to clamp dashboard counts after status change:', err)
          }
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update dashboard after status change:', err)
    }

    return new Response(JSON.stringify(problem), { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error updating problem:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;

    await connectToMongoose();

    const problem = await Problem.findById(id);
    if (!problem) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    if (String(problem.userId) !== String(session.user.id)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    await Problem.deleteOne({ _id: id });

    // update dashboard counts to reflect deletion
    try {
      const isSolved = (problem.status === 'Solved')
      const inc = {
        totalProblems: -1,
        // Do NOT decrement revisedThisWeek on delete; revised count is monotonic
        revisedThisWeek: 0,
        remainingToRevise: isSolved ? 0 : -1,
      }

      await Dashboard.findOneAndUpdate(
        { userId: problem.userId },
        { $inc: inc },
        { new: true }
      )
      // clamp negative values defensively
      try {
        await Dashboard.findOneAndUpdate(
          { userId: problem.userId },
          [ { $set: {
            totalProblems: { $max: ["$totalProblems", 0] },
            revisedThisWeek: { $max: ["$revisedThisWeek", 0] },
            remainingToRevise: { $max: ["$remainingToRevise", 0] }
          } } ],
          { new: true }
        )
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to clamp dashboard counts after delete:', err)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update dashboard after delete:', err)
    }

    return new Response(JSON.stringify({ message: 'Deleted' }), { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error deleting problem:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
