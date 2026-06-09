import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role:    { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  at:      { type: Date, default: Date.now },
});

const ChatHistorySchema = new mongoose.Schema(
  {
    sessionId:     { type: String, required: true, index: true },
    messages:      [MessageSchema],
    leadCaptured:  { type: Boolean, default: false },
    userAgent:     { type: String },
  },
  { timestamps: true }
);

ChatHistorySchema.index({ createdAt: -1 });

export default mongoose.models.ChatHistory ||
  mongoose.model("ChatHistory", ChatHistorySchema);
