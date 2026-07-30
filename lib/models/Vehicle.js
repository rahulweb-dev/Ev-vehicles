import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema(
  {
    name:    { type: String, trim: true, default: "" },
    hexCode: { type: String, trim: true, default: "#000000" },
    image:   { type: String, default: "" },
  },
  { _id: false }
);

const VariantSchema = new mongoose.Schema(
  {
    name:               { type: String, trim: true },
    // Prices stored as Numbers (paise-free rupees) for range queries & sorting.
    // Display layer formats as "₹X Lakh" — never store "₹" in DB.
    exShowroomPrice:    { type: Number, default: null },
    onRoadPrice:        { type: Number, default: null },
    // Legacy string fields kept for backward compat during migration
    exShowroomPriceStr: { type: String, trim: true, default: "" },
    onRoadPriceStr:     { type: String, trim: true, default: "" },
    batteryCapacity:    { type: String, trim: true },
    range:              { type: String, trim: true },
    availabilityStatus: { type: String, trim: true, default: "Available" },
    features:           [{ type: String, trim: true }],
  },
  { _id: false }
);

const VehicleSchema = new mongoose.Schema(
  {
    /* ── Basic ─────────────────────────────────────────────── */
    name:         { type: String, required: true, trim: true },
    brand:        { type: String, required: true, trim: true },
    vehicleType:  { type: String, enum: ["car", "bike", "commercial"], required: true },
    category:     { type: String, enum: ["upcoming", "popular"], required: true },
    availability: { type: String, enum: ["upcoming", "available", "discontinued"], default: "available" },

    slug:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    status:   { type: String, enum: ["draft", "published"], default: "draft" },
    featured: { type: Boolean, default: false },

    launchDate:       { type: Date },
    shortDescription: { type: String, default: "", trim: true },
    description:      { type: String, default: "" },
    videoUrl:         { type: String, default: "", trim: true },
    featuredImage:    { type: String, default: "" },
    gallery:          [{ type: String }],
    colors:           [ColorSchema],

    /* ── Variants & Pricing ────────────────────────────────── */
    variants: [VariantSchema],

    /* ── Performance ───────────────────────────────────────── */
    performance: {
      batteryCapacity: { type: String, default: "" },
      drivingRange:    { type: String, default: "" },
      power:           { type: String, default: "" },
      peakPower:       { type: String, default: "" },
      torque:          { type: String, default: "" },
      topSpeed:        { type: String, default: "" },
      acceleration:    { type: String, default: "" },
      driveType:       { type: String, default: "" },
      batteryType:     { type: String, default: "" },
    },

    /* ── Charging ──────────────────────────────────────────── */
    charging: {
      acChargingTime: { type: String, default: "" },
      dcChargingTime: { type: String, default: "" },
      fastCharging:   { type: Boolean, default: false },
      chargingPort:   { type: String, default: "" },
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
      tyreType:        { type: String, default: "" },
      wheelSize:       { type: String, default: "" },
    },

    /* ── Key Features (boolean flags) ──────────────────────── */
    keyFeatures: {
      touchscreen:       { type: Boolean, default: false },
      instrumentCluster: { type: Boolean, default: false },
      navigation:        { type: Boolean, default: false },
      bluetooth:         { type: Boolean, default: false },
      androidAuto:       { type: Boolean, default: false },
      appleCarPlay:      { type: Boolean, default: false },
      otaUpdates:        { type: Boolean, default: false },
      cruiseControl:     { type: Boolean, default: false },
      keylessEntry:      { type: Boolean, default: false },
      sunroof:           { type: Boolean, default: false },
      ventilatedSeats:   { type: Boolean, default: false },
      wirelessCharging:  { type: Boolean, default: false },
    },

    /* ── Feature Lists ─────────────────────────────────────── */
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
      ebd:                 { type: Boolean, default: false },
      esc:                 { type: Boolean, default: false },
      tractionControl:     { type: Boolean, default: false },
      tpms:                { type: Boolean, default: false },
      hillHoldAssist:      { type: Boolean, default: false },
      reverseCamera:       { type: Boolean, default: false },
      parkingSensors:      { type: Boolean, default: false },
      adasFeatures:        [{ type: String, trim: true }],
      safetyRating:        { type: String, default: "" },
      additionalEquipment: [{ type: String, trim: true }],
    },

    /* ── Warranty ───────────────────────────────────────────── */
    warranty: {
      vehicle:            { type: String, default: "" },
      battery:            { type: String, default: "" },
      motor:              { type: String, default: "" },
      roadsideAssistance: { type: String, default: "" },
    },

    /* ── Pros & Cons ───────────────────────────────────────── */
    pros: [{ type: String, trim: true }],
    cons: [{ type: String, trim: true }],

    /* ── Price History ─────────────────────────────────────────── */
    priceHistory: [{
      price: { type: String, trim: true },
      date:  { type: Date, default: Date.now },
      note:  { type: String, trim: true, default: "" },
      _id:   false,
    }],

    /* ── SEO ───────────────────────────────────────────────── */
    metaTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    focusKeyword:    { type: String, default: "", trim: true },
    keywords:        [{ type: String, trim: true }],
    canonicalUrl:    { type: String, default: "", trim: true },
    ogTitle:         { type: String, default: "" },
    ogDescription:   { type: String, default: "" },
    ogImage:         { type: String, default: "" },

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

VehicleSchema.index({ status: 1, vehicleType: 1, category: 1 });
VehicleSchema.index({ brand: 1 });
VehicleSchema.index({ featured: 1, status: 1 });
// Price-range filter: "EVs under ₹10 lakh"
VehicleSchema.index({ "variants.exShowroomPrice": 1, status: 1 });
// Full-text search (used by chatbot and vehicle search API)
VehicleSchema.index({ name: "text", brand: "text", shortDescription: "text" }, { weights: { name: 10, brand: 5, shortDescription: 1 } });

// Auto-parse string prices to numbers on every save
VehicleSchema.pre("save", async function () {
  const { parsePrice } = await import("../priceUtils.js");
  if (this.variants?.length) {
    for (const v of this.variants) {
      if (v.exShowroomPrice == null && v.exShowroomPriceStr) {
        v.exShowroomPrice = parsePrice(v.exShowroomPriceStr);
      }
      if (v.onRoadPrice == null && v.onRoadPriceStr) {
        v.onRoadPrice = parsePrice(v.onRoadPriceStr);
      }
    }
  }
});

const Vehicle =
  mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);

export default Vehicle;
