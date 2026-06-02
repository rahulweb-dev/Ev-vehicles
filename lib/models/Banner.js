import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true },
    subtitle:  { type: String, default: "",   trim: true },
    image:     { type: String, required: true },
    tag:       { type: String, default: "",   trim: true },
    tagColor:  { type: String, default: "bg-green-500" },
    ctaLabel:  { type: String, default: "Explore",  trim: true },
    ctaHref:   { type: String, default: "/",         trim: true },
    status:   { type: String, enum: ["active", "inactive"], default: "active" },
    platform: { type: String, enum: ["desktop", "mobile"],  default: "desktop" },
    order:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

BannerSchema.index({ status: 1, platform: 1, order: 1 });

const Banner =
  mongoose.models.Banner || mongoose.model("Banner", BannerSchema);

export default Banner;
