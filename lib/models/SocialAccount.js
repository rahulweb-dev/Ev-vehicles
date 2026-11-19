import mongoose from "mongoose";

// A Facebook Page or Instagram professional account that a site user (dealer/partner/admin)
// connected through "My Social". Tokens are AES-256-GCM encrypted (lib/encrypt).
const SocialAccountSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  platform: { type: String, enum: ["facebook", "instagram"], required: true },
  externalId: { type: String, required: true },           // Page ID or Instagram professional account ID
  mode: { type: String, enum: ["facebook-page", "instagram-login"], required: true },
  name: { type: String, default: "" },
  username: { type: String, default: "" },
  picture: { type: String, default: "" },
  token: { type: String, default: "" },                    // encrypted Page token / Instagram token
  pageId: { type: String, default: "" },                   // for Instagram linked via a Page
  tokenExpiresAt: Date,
  tokenRefreshedAt: Date,
  webhookSubscribed: { type: Boolean, default: false },
  webhookError: { type: String, default: "" },
  lastError: { type: String, default: "" },
  connectedAt: { type: Date, default: Date.now },
}, { timestamps: true });

SocialAccountSchema.index({ owner: 1, platform: 1, externalId: 1 }, { unique: true });
SocialAccountSchema.index({ externalId: 1 });

export default mongoose.models.SocialAccount || mongoose.model("SocialAccount", SocialAccountSchema);
