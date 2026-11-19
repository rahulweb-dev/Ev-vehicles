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
}, { timestamps: true });

SocialEventSchema.index({ read: 1, createdAt: -1 });

export default mongoose.models.SocialEvent || mongoose.model("SocialEvent", SocialEventSchema);
