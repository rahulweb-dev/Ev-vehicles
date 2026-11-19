import mongoose from "mongoose";

// A Facebook / Instagram post composed in the admin (or auto-created for a newly published
// article/guide). Published immediately or at scheduledAt by the scheduler cron.
const ResultSchema = new mongoose.Schema({
  ok: Boolean, postId: String, permalink: String, error: String, at: Date,
}, { _id: false });

const SocialPostSchema = new mongoose.Schema({
  platforms: [{ type: String, enum: ["facebook", "instagram"] }],
  message: { type: String, default: "" },          // Facebook text
  igCaption: { type: String, default: "" },        // Instagram caption (falls back to message)
  link: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  scheduledAt: { type: Date, default: null },
  status: { type: String, enum: ["draft", "scheduled", "publishing", "published", "partial", "failed"], default: "draft" },
  results: { facebook: ResultSchema, instagram: ResultSchema },
  source: { kind: { type: String, default: "manual" }, refId: String, slug: String }, // manual | article | blog
  // My Social posts: made by a site user to their own connected accounts (site posts leave these empty)
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "SocialAccount" }],
  accountResults: [{ account: mongoose.Schema.Types.ObjectId, platform: String, name: String, ok: Boolean, postId: String, permalink: String, error: String, at: Date, _id: false }],
}, { timestamps: true });

SocialPostSchema.index({ status: 1, scheduledAt: 1 });
SocialPostSchema.index({ owner: 1, createdAt: -1 });
SocialPostSchema.index({ "source.kind": 1, "source.refId": 1 });

export default mongoose.models.SocialPost || mongoose.model("SocialPost", SocialPostSchema);
