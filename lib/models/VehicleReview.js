import mongoose from "mongoose";

const VehicleReviewSchema = new mongoose.Schema({
  vehicleSlug: { type: String, required: true, index: true },
  vehicleName: { type: String, required: true },
  vehicleType: { type: String, enum: ["car", "bike", "commercial"], default: "car" },

  name:   { type: String, required: true, trim: true, maxlength: 60 },
  city:   { type: String, trim: true, maxlength: 40 },
  email:  { type: String, trim: true, lowercase: true },

  rating:         { type: Number, required: true, min: 1, max: 5 },
  ratingRange:    { type: Number, min: 1, max: 5 },
  ratingComfort:  { type: Number, min: 1, max: 5 },
  ratingCharging: { type: Number, min: 1, max: 5 },
  ratingValue:    { type: Number, min: 1, max: 5 },

  title:   { type: String, trim: true, maxlength: 120 },
  body:    { type: String, required: true, trim: true, maxlength: 1000 },
  pros:    { type: String, trim: true, maxlength: 200 },
  cons:    { type: String, trim: true, maxlength: 200 },

  ownedMonths: { type: Number },
  verified:    { type: Boolean, default: false },
  status:      { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  helpful:     { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.VehicleReview ||
  mongoose.model("VehicleReview", VehicleReviewSchema);
