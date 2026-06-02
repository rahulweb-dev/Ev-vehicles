import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    name:           { type: String, trim: true },
    exShowroomPrice:{ type: String, trim: true },
    onRoadPrice:    { type: String, trim: true },
    features:       [{ type: String, trim: true }],
  },
  { _id: false }
);

const VehicleSchema = new mongoose.Schema(
  {
    /* ── Basic ─────────────────────────────────────────────── */
    name:        { type: String, required: true, trim: true },
    brand:       { type: String, required: true, trim: true },
    vehicleType: { type: String, enum: ["car", "bike"], required: true },
    category:    { type: String, enum: ["upcoming", "popular"], required: true },

    slug:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    status:  { type: String, enum: ["draft", "published"], default: "draft" },
    featured:{ type: Boolean, default: false },

    launchDate:    { type: Date },
    featuredImage: { type: String, default: "" },
    gallery:       [{ type: String }],
    colors:        [{ type: String, trim: true }],

    /* ── Variants & Pricing ────────────────────────────────── */
    variants: [VariantSchema],

    /* ── Performance & Range ───────────────────────────────── */
    performance: {
      batteryCapacity:    { type: String, default: "" },
      drivingRange:       { type: String, default: "" },
      power:              { type: String, default: "" },
      torque:             { type: String, default: "" },
      topSpeed:           { type: String, default: "" },
      acceleration:       { type: String, default: "" },
      dcFastChargingTime: { type: String, default: "" },
      acChargingTime:     { type: String, default: "" },
    },

    /* ── Specifications ────────────────────────────────────── */
    specs: {
      length:          { type: String, default: "" },
      width:           { type: String, default: "" },
      height:          { type: String, default: "" },
      wheelbase:       { type: String, default: "" },
      groundClearance: { type: String, default: "" },
      kerbWeight:      { type: String, default: "" },
      seatingCapacity: { type: String, default: "" },
      bootSpace:       { type: String, default: "" },
    },

    /* ── Features ──────────────────────────────────────────── */
    features: {
      infotainment: [{ type: String, trim: true }],
      connectivity: [{ type: String, trim: true }],
      comfort:      [{ type: String, trim: true }],
      technology:   [{ type: String, trim: true }],
    },

    /* ── Safety ────────────────────────────────────────────── */
    safety: {
      airbags:             { type: String, default: "" },
      abs:                 { type: Boolean, default: false },
      esc:                 { type: Boolean, default: false },
      adasFeatures:        [{ type: String, trim: true }],
      safetyRating:        { type: String, default: "" },
      additionalEquipment: [{ type: String, trim: true }],
    },

    /* ── Warranty ───────────────────────────────────────────── */
    warranty: {
      vehicle: { type: String, default: "" },
      battery: { type: String, default: "" },
      motor:   { type: String, default: "" },
    },

    /* ── Pros & Cons ───────────────────────────────────────── */
    pros: [{ type: String, trim: true }],
    cons: [{ type: String, trim: true }],

    /* ── SEO ───────────────────────────────────────────────── */
    metaTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords:        [{ type: String, trim: true }],

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

VehicleSchema.index({ slug: 1 });
VehicleSchema.index({ status: 1, vehicleType: 1, category: 1 });
VehicleSchema.index({ brand: 1 });
VehicleSchema.index({ featured: 1, status: 1 });

const Vehicle =
  mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);

export default Vehicle;
