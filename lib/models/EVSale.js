import mongoose from "mongoose";

const EVSaleSchema = new mongoose.Schema(
  {
    brand:            { type: String, required: true, trim: true },
    brandSlug:        { type: String, required: true, trim: true, lowercase: true },
    segment:          { type: String, enum: ["car", "two-wheeler", "commercial"], required: true },
    state:            { type: String, trim: true, default: "National" },
    month:            { type: Number, required: true, min: 1, max: 12 },
    year:             { type: Number, required: true },
    unitsSold:        { type: Number, required: true, min: 0 },
    marketShare:      { type: Number, default: 0, min: 0, max: 100 },
    growthPercentage: { type: Number, default: 0 },
    isNational:       { type: Boolean, default: true },
  },
  { timestamps: true }
);

EVSaleSchema.index({ brand: 1, segment: 1, month: 1, year: 1, state: 1 }, { unique: true });
EVSaleSchema.index({ year: 1, month: 1 });
EVSaleSchema.index({ segment: 1 });
EVSaleSchema.index({ brandSlug: 1 });

export default mongoose.models.EVSale || mongoose.model("EVSale", EVSaleSchema);
