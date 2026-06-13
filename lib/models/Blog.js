import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt:     { type: String, default: "", maxlength: 400 },
    content:     { type: String, default: "" },
    image:       { type: String, default: "" },
    imageAlt:    { type: String, default: "" },
    category:    { type: String, enum: ["tips", "guides", "reviews", "news", "comparison", "other"], default: "guides" },
    author:      { type: String, default: "EVRadar Team" },
    tags:        [{ type: String, trim: true }],
    readTime:    { type: String, default: "5 min" },
    featured:    { type: Boolean, default: false },
    status:      { type: String, enum: ["draft", "published"], default: "draft" },
    views:       { type: Number, default: 0 },
    metaTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BlogSchema.pre("save", function () {
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ category: 1, status: 1 });

const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
export default Blog;
