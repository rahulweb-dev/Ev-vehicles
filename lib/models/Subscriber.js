import mongoose from "mongoose";

const SubscriberSchema = new mongoose.Schema(
  {
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    status:    { type: String, enum: ["active", "unsubscribed"], default: "active" },
    source:    { type: String, default: "website" },
    interests: [{ type: String, enum: ["cars", "bikes", "charging", "commercial", "policy"] }],
  },
  { timestamps: true }
);

SubscriberSchema.index({ status: 1, createdAt: -1 });
// Segmented campaign queries: find subscribers where interests includes "cars"
SubscriberSchema.index({ interests: 1, status: 1 });

export default mongoose.models.Subscriber ||
  mongoose.model("Subscriber", SubscriberSchema);
