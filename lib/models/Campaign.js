import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    subject:      { type: String, required: true, trim: true },
    previewText:  { type: String, default: "" },
    html:         { type: String, required: true },
    template:     { type: String, default: "custom" },
    channel:      { type: String, enum: ["email", "whatsapp"], default: "email" },
    status:       { type: String, enum: ["draft", "sending", "sent", "failed"], default: "draft" },
    recipientCount: { type: Number, default: 0 },
    sentCount:    { type: Number, default: 0 },
    failedCount:  { type: Number, default: 0 },
    sentAt:       { type: Date, default: null },
    openCount:    { type: Number, default: 0 },
    clickCount:   { type: Number, default: 0 },
    clickUrls:    [{ url: String, at: Date }],
    createdBy:    { type: String, default: "admin" },
  },
  { timestamps: true }
);

export default mongoose.models.Campaign ||
  mongoose.model("Campaign", CampaignSchema);
