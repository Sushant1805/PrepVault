import mongoose from 'mongoose'

const dashboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalProblems: {
      type: Number,
      default: 0,
    },
    revisedThisWeek: {
      type: Number,
      default: 0,
    },
    remainingToRevise: {
      type: Number,
      default: 0,
    },
    // optional: track the week start for potential weekly resets
    weekStart: {
      type: Date,
    },
  },
  { timestamps: true }
)

const Dashboard = mongoose.models.Dashboard || mongoose.model('Dashboard', dashboardSchema)

export default Dashboard
