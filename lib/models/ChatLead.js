import mongoose from "mongoose";

const ChatLeadSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true },
    phone:            { type: String, required: true, trim: true },
    email:            { type: String, trim: true, lowercase: true, default: "" },
    city:             { type: String, trim: true, default: "" },
    interestedVehicle:{ type: String, trim: true, default: "" },
    vehicleType:      { type: String, enum: ["car", "bike", "commercial", "any"], default: "any" },
    status:           { type: String, enum: ["new", "contacted", "converted", "lost"], default: "new" },
    notes:            { type: String, default: "" },
  },
  { timestamps: true }
);

ChatLeadSchema.index({ createdAt: -1 });
ChatLeadSchema.index({ status: 1 });

export default mongoose.models.ChatLead || mongoose.model("ChatLead", ChatLeadSchema);
