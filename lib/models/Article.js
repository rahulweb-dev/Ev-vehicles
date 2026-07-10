import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: { type: String, required: true, maxlength: 300 },
    content: { type: String, required: true },
    image: { type: String, required: true },
    imageAlt: { type: String, default: "" },

    category: {
      type: String,
      enum: ["cars", "bikes", "commercial", "charging"],
      required: true,
    },

    author: {
      type: String,
      default: "EV News India Team",
    },

    tags: [{ type: String, trim: true }],

    readTime: {
      type: String,
      default: "5 min",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    views: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    metaTitle: {
      type: String,
      default: "",
    },

    metaDescription: {
      type: String,
      default: "",
    },

    metaKeywords: {
      type: String,
      default: "",
    },

    canonicalUrl: {
      type: String,
      default: "",
    },

    publishedAt: {
      type: Date,
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    // Structured FAQ pairs — used for FAQPage schema and in-article FAQ block
    faqs: [{
      question: { type: String, trim: true },
      answer:   { type: String, trim: true },
    }],

    // Which platforms to auto-post to on publish
    socialTargets: { type: [String], default: [] },

    // Per-platform publish outcome — updated by the social publisher
    socialStatus: {
      facebook: {
        published:   { type: Boolean, default: false },
        postId:      { type: String,  default: "" },
        publishedAt: { type: Date,    default: null },
        error:       { type: String,  default: "" },
      },
      linkedin: {
        published:   { type: Boolean, default: false },
        postId:      { type: String,  default: "" },
        publishedAt: { type: Date,    default: null },
        error:       { type: String,  default: "" },
      },
      pinterest: {
        published:   { type: Boolean, default: false },
        postId:      { type: String,  default: "" },
        publishedAt: { type: Date,    default: null },
        error:       { type: String,  default: "" },
      },
      telegram: {
        published:   { type: Boolean, default: false },
        messageId:   { type: String,  default: "" },
        publishedAt: { type: Date,    default: null },
        error:       { type: String,  default: "" },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-set publishedAt when status changes to published
// Auto-set publishedAt when status changes to published
ArticleSchema.pre("save", function () {
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
});

ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1, status: 1 });
ArticleSchema.index({ featured: 1, status: 1 });
ArticleSchema.index({ views: -1, status: 1 });
ArticleSchema.index({ author: 1, status: 1 });
ArticleSchema.index({ tags: 1, status: 1 });
ArticleSchema.index({ title: "text", excerpt: "text", content: "text" });

const Article =
  mongoose.models.Article ||
  mongoose.model("Article", ArticleSchema);

export default Article;