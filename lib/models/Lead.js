import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    vehicleName: { type: String, required: true },
    vehicleSlug: { type: String, required: true },
    vehicleType: { type: String, enum: ["car", "bike", "commercial"], required: true },
    intent: { type: String, enum: ["test_drive", "price_quote", "finance", "general"], default: "general" },
    source: { type: String, default: "website" },
    status: { type: String, enum: ["new", "contacted", "converted", "lost"], default: "new" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

LeadSchema.index({ vehicleSlug: 1, createdAt: -1 });
LeadSchema.index({ phone: 1 });
LeadSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
