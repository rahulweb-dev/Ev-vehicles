import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    articleSlug: { type: String, required: true, index: true },
    name:        { type: String, required: true, trim: true, maxlength: 60 },
    content:     { type: String, required: true, trim: true, maxlength: 1000 },
    approved:    { type: Boolean, default: false, index: true },
    likes:       { type: Number, default: 0 },
    reactions: {
      like:    { type: Number, default: 0 },
      love:    { type: Number, default: 0 },
      fire:    { type: Number, default: 0 },
      insight: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

CommentSchema.index({ articleSlug: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
