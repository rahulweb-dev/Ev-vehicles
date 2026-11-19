import mongoose from "mongoose";

// Real-time events received from Meta webhooks (new DMs and comments on Facebook / Instagram).
const SocialEventSchema = new mongoose.Schema({
  platform: { type: String, enum: ["facebook", "instagram"], required: true },
  kind: { type: String, enum: ["message", "comment"], required: true },
  externalId: { type: String, required: true, unique: true }, // message mid / comment id — dedupes Meta retries
  senderId: String,
  senderName: String,
  text: String,
  postId: String,
  at: Date,
  read: { type: Boolean, default: false },
  accountExternalId: String,                                           // Page / Instagram account the event belongs to
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // set when it's a user's My Social account
}, { timestamps: true });

SocialEventSchema.index({ read: 1, createdAt: -1 });

export default mongoose.models.SocialEvent || mongoose.model("SocialEvent", SocialEventSchema);
