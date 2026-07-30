import mongoose from "mongoose";

const DripQueueSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true, trim: true },
  step:      { type: Number, default: 1 },       // which drip to send next (1, 2, 3…)
  sendAt:    { type: Date,   required: true },    // when to send the next drip
  status:    { type: String, enum: ["pending", "done", "unsubscribed"], default: "pending" },
}, { timestamps: true });

DripQueueSchema.index({ sendAt: 1, status: 1 });
DripQueueSchema.index({ email: 1 });

export default mongoose.models.DripQueue || mongoose.model("DripQueue", DripQueueSchema);
