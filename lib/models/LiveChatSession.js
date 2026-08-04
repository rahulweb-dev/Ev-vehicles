import mongoose from "mongoose";

const MsgSchema = new mongoose.Schema({
  role:       { type: String, enum: ["user", "agent"], required: true },
  content:    { type: String, required: true },
  senderName: { type: String, default: "" },
}, { timestamps: true });

const LiveChatSessionSchema = new mongoose.Schema({
  sessionId:         { type: String, required: true, unique: true },
  status:            { type: String, enum: ["waiting", "active", "closed"], default: "waiting", index: true },
  assignedToId:      { type: String, default: "" },
  assignedToName:    { type: String, default: "" },
  userName:          { type: String, default: "Visitor" },
  userPhone:         { type: String, default: "" },
  userCity:          { type: String, default: "" },
  interestedVehicle: { type: String, default: "" },
  messages:          [MsgSchema],
  lastMessageAt:     { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.LiveChatSession
  || mongoose.model("LiveChatSession", LiveChatSessionSchema);
