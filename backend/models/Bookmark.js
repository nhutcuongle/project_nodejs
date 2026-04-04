import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetType" },
    targetType: { type: String, enum: ["Question", "Video"], default: "Question" },
  },
  { timestamps: true }
);

// Mỗi user chỉ bookmark 1 lần mỗi nội dung
bookmarkSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

export default mongoose.model("Bookmark", bookmarkSchema);
