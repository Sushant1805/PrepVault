import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    link: {
      type: String,
      required: true,
    },

    topic: {
      type: String,
      required: true, // e.g. "Array", "DP", "Graph"
    },

    subtopics: [String], // e.g. ["Sliding Window", "Two Pointers"]

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    platform: {
      type: String,
      enum: ["LeetCode", "CodeStudio", "GFG", "CSES", "Custom"],
      default: "",
    },

    status: {
      type: String,
      enum: ["Unsolved", "Solved", "Revision Pending", "Needs Review"],
      default: "Unsolved",
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },
    lastRevisedAt: {
      type: Date,
    },

    revisionCount: {
      type: Number,
      default: 0,
    },

    tags: [String], // e.g. ["Important", "Must Revise", "Amazon"]

    // For user personalization
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Problem = mongoose.models.Problem || mongoose.model("Problem", problemSchema);

export default Problem;
