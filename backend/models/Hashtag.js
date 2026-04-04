import mongoose from "mongoose";

const hashtagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  usedCount: {
    type: Number,
    default: 1,
  }
}, { timestamps: true });

const Hashtag = mongoose.model("Hashtag", hashtagSchema);
export default Hashtag;
