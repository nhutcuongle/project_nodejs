import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    images: [{ type: String }],
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      default: null,
    },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Answer", answerSchema);
