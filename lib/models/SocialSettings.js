import mongoose from "mongoose";

const credSchema = new mongoose.Schema(
  {
    // Facebook
    appId:        { type: String, default: "" },
    appSecret:    { type: String, default: "" },
    accessToken:  { type: String, default: "" },
    pageId:       { type: String, default: "" },
    // LinkedIn
    clientId:     { type: String, default: "" },
    clientSecret: { type: String, default: "" },
    companyUrn:   { type: String, default: "" },
    // Pinterest
    boardId:      { type: String, default: "" },
    // Telegram
    botToken:     { type: String, default: "" },
    channelId:    { type: String, default: "" },
    igUserId:     { type: String, default: "" }, // Instagram professional account ID (uses the Facebook Page token)
    igAppId:      { type: String, default: "" }, // Instagram Login (Instagram API with Instagram Login)
    igAppSecret:  { type: String, default: "" },
    igToken:      { type: String, default: "" }, // long-lived Instagram user token (refreshed weekly)
    userToken:    { type: String, default: "" },
    refreshToken: { type: String, default: "" }, // Pinterest OAuth refresh token // long-lived user token from "Connect with Facebook" (used to list Pages)
  },
  { _id: false }
);

const SocialSettingsSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ["facebook", "instagram", "linkedin", "pinterest", "telegram"],
      required: true,
      unique: true,
    },
    enabled:     { type: Boolean, default: false },
    autoPost:    { type: Boolean, default: false }, // share newly published articles/guides automatically
    // Display info for the connected account (not secret): { name, username, connectedAt, webhookSubscribed }
    account:     { type: mongoose.Schema.Types.Mixed, default: null },
    credentials: { type: credSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.models.SocialSettings ||
  mongoose.model("SocialSettings", SocialSettingsSchema);
