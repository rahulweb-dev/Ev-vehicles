/**
 * seed-author-rakesh.mjs
 *
 * Creates the Rakesh author profile in MongoDB.
 * Run once: node scripts/seed-author-rakesh.mjs
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually (no dotenv dependency needed)
try {
  const env = readFileSync(join(__dirname, "../.env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch { /* .env.local not found */ }

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set in .env.local");
  process.exit(1);
}

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

const Author = mongoose.models?.Author || mongoose.model("Author", AuthorSchema);

const rakesh = {
  name:        "Rakesh",
  slug:        "rakesh",
  title:       "Senior EV Journalist",
  bio:         "Rakesh is a senior electric vehicle journalist and automotive writer with over 5 years of experience covering India's EV industry. He has tested and reviewed more than 50 electric cars, bikes, and scooters across the country, and closely tracks government policy, battery technology, and charging infrastructure developments. His work helps Indian consumers make informed EV buying decisions.",
  expertise:   [
    "Electric Cars India",
    "Electric Bikes & Scooters",
    "EV Battery Technology",
    "Government EV Policy",
    "EV Test Drives & Reviews",
    "Charging Infrastructure",
  ],
  credentials: [
    "5+ years covering India EV industry",
    "50+ EV test drives and reviews",
    "Covers FAME, PM E-Drive, and state subsidy schemes",
    "Regular contributor to EV News India",
  ],
  yearsExp:    5,
  photo:       "",
  twitter:     "",
  linkedin:    "",
  email:       "",
};

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const result = await Author.findOneAndUpdate(
    { slug: rakesh.slug },
    rakesh,
    { upsert: true, new: true, runValidators: true }
  );

  console.log(`Author saved: ${result.name} (slug: ${result.slug}, id: ${result._id})`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
