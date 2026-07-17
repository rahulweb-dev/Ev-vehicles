import mongoose from "mongoose";

const EVBrandSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo:      { type: String, default: "" },
    segment:   { type: String, enum: ["car", "two-wheeler", "commercial", "all"], default: "all" },
    country:   { type: String, default: "India" },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.EVBrand || mongoose.model("EVBrand", EVBrandSchema);
