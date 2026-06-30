import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  photo:       { type: String, default: "" },
  title:       { type: String, default: "EV Journalist" },
  bio:         { type: String, default: "" },
  expertise:   [{ type: String }],
  credentials: [{ type: String }],
  yearsExp:    { type: Number, default: 0 },
  twitter:     { type: String, default: "" },
  linkedin:    { type: String, default: "" },
  email:       { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.Author || mongoose.model("Author", AuthorSchema);
