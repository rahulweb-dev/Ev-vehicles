import mongoose from "mongoose";

// Visitor reports: a missing station, or a problem with an existing one. Admin approves/rejects.
const StationReportSchema = new mongoose.Schema({
  kind: { type: String, enum: ["missing", "problem"], required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: "ChargingStation" }, // for "problem"
  issue: { type: String, enum: ["not_working", "wrong_location", "closed", "wrong_details", "other", ""], default: "" },
  name: { type: String, trim: true, default: "" },
  network: { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  city: { type: String, trim: true, default: "" },
  location: { type: { type: String, enum: ["Point"], default: "Point" }, coordinates: [Number] }, // [lng, lat]
  chargerType: { type: String, trim: true, default: "" }, // "DC fast (car)", "AC (car)", "Two-wheeler", "Battery swap"
  details: { type: String, trim: true, default: "" },
  reporterName: { type: String, trim: true, default: "" },
  reporterPhone: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  adminNote: { type: String, default: "" },
}, { timestamps: true });

StationReportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.StationReport || mongoose.model("StationReport", StationReportSchema);
