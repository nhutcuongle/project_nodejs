import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approved: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
