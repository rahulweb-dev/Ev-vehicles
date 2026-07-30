import mongoose from "mongoose";

const PageViewSchema = new mongoose.Schema({
  path:        { type: String, required: true },
  title:       { type: String, default: "" },
  referrer:    { type: String, default: "" },
  sessionId:   { type: String, required: true },
  device:      { type: String, enum: ["mobile", "tablet", "desktop"], default: "desktop" },
  scrollDepth: { type: Number, default: 0 },   // max % scrolled (0-100)
  utm: {
    source:   { type: String, default: "" },
    medium:   { type: String, default: "" },
    campaign: { type: String, default: "" },
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Auto-delete after 90 days
PageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
PageViewSchema.index({ createdAt: -1 });
// Covers per-article analytics queries: countDocuments({ path, createdAt: { $gte: ... } })
PageViewSchema.index({ path: 1, createdAt: -1 });
PageViewSchema.index({ sessionId: 1, path: 1, createdAt: -1 });

export default mongoose.models.PageView || mongoose.model("PageView", PageViewSchema);
