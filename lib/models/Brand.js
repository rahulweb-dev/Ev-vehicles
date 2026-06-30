import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, unique: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo:        { type: String, default: "" },
    website:     { type: String, default: "" },
    description: { type: String, default: "" },
    category:    { type: String, enum: ["car", "bike", "commercial", "all"], default: "all" },
  },
  { timestamps: true }
);

const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);
export default Brand;
