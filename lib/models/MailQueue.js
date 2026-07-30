import mongoose from "mongoose";

const MailQueueSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
  email:      { type: String, required: true, lowercase: true, trim: true },
  subject:    { type: String, required: true },
  html:       { type: String, required: true },
  status:     { type: String, enum: ["pending","sent","failed"], default: "pending" },
  attempts:   { type: Number, default: 0 },
  error:      { type: String, default: "" },
  processAt:  { type: Date, default: Date.now },
}, { timestamps: true });

// Worker query: { status: "pending", processAt: { $lte: now } }
MailQueueSchema.index({ status: 1, processAt: 1 });
// Cleanup: auto-delete sent/failed items after 7 days
MailQueueSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export default mongoose.models.MailQueue || mongoose.model("MailQueue", MailQueueSchema);
