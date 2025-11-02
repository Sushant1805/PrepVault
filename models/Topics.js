import mongoose from 'mongoose'

const revisionSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    subtopics: [String],
    resources: [String],
    importance: { type: String, enum: ['Low', 'Normal', 'High'] },
    tags: [String],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    subtopics: [String],
    resources: [String], // e.g. urls or short descriptions
    importance: { type: String, enum: ['Low', 'Normal', 'High'], default: 'Normal' },
    tags: [String],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // revision tracking
    revisions: [revisionSchema],
    revisionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const Topic = mongoose.models.Topic || mongoose.model('Topic', topicSchema)

export default Topic
