import mongoose from "mongoose";

const SubscriberSchema = new mongoose.Schema(
  {
    email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ["active", "unsubscribed"], default: "active" },
    source: { type: String, default: "website" },
  },
  { timestamps: true }
);

export default mongoose.models.Subscriber ||
  mongoose.model("Subscriber", SubscriberSchema);
