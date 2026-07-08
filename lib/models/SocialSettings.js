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
  },
  { _id: false }
);

const SocialSettingsSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ["facebook", "linkedin", "pinterest", "telegram"],
      required: true,
      unique: true,
    },
    enabled:     { type: Boolean, default: false },
    credentials: { type: credSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.models.SocialSettings ||
  mongoose.model("SocialSettings", SocialSettingsSchema);
