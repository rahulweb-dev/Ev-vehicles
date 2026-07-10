/**
 * ping-indexnow.mjs
 *
 * Notifies Bing (and all IndexNow partners) about new bike city price pages.
 * Run after deploying new /bikes/[slug]/price-in-[city] pages.
 *
 * Usage:
 *   node scripts/ping-indexnow.mjs
 *
 * Set INDEXNOW_KEY in .env.local (any random hex string — also place the key
 * at https://www.evradar.in/<your-key>.txt to verify ownership).
 */

import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);

// Load .env.local
const dotenv = await import("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const SITE_URL     = "https://www.evradar.in";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "";

const CITIES = [
  "mumbai", "delhi", "bangalore", "hyderabad", "chennai",
  "pune", "ahmedabad", "kolkata", "jaipur", "lucknow",
  "chandigarh", "bhopal",
];

if (!INDEXNOW_KEY) {
  console.error("❌ INDEXNOW_KEY is not set in .env.local");
  console.error("   Add INDEXNOW_KEY=<any-random-hex-string> to .env.local");
  console.error("   Then place a text file at https://www.evradar.in/<key>.txt containing just the key.");
  process.exit(1);
}

async function getBikeSlugs() {
  const { default: dbConnect } = await import("../lib/mongodb.js");
  const mongoose = (await import("mongoose")).default;

  await dbConnect();

  // Use mongoose directly since Vehicle model may or may not be cached
  const Vehicle = mongoose.models.Vehicle ||
    (await import("../lib/models/Vehicle.js")).default;

  const bikes = await Vehicle.find({ vehicleType: "bike", status: "published" })
    .select("slug")
    .lean();

  return bikes.map(b => b.slug);
}

async function pingIndexNow(urls) {
  const body = JSON.stringify({
    host:    "www.evradar.in",
    key:     INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method:  "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body,
  });

  return res;
}

async function main() {
  console.log("🔍 Fetching published bike slugs from MongoDB…");
  let slugs;
  try {
    slugs = await getBikeSlugs();
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }

  console.log(`✅ Found ${slugs.length} bikes`);

  // Build all city price URLs
  const urls = slugs.flatMap(slug =>
    CITIES.map(city => `${SITE_URL}/bikes/${slug}/price-in-${city}`)
  );

  console.log(`📋 Total URLs to submit: ${urls.length} (${slugs.length} bikes × ${CITIES.length} cities)`);

  // IndexNow accepts max 10,000 URLs per batch; split just in case
  const BATCH = 10000;
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = urls.slice(i, i + BATCH);
    process.stdout.write(`📡 Submitting batch ${Math.floor(i / BATCH) + 1} (${batch.length} URLs)… `);

    try {
      const res = await pingIndexNow(batch);
      if (res.ok || res.status === 202) {
        console.log(`✅ ${res.status} ${res.statusText}`);
      } else {
        const text = await res.text();
        console.log(`⚠️  ${res.status} ${res.statusText}: ${text}`);
      }
    } catch (err) {
      console.log(`❌ Network error: ${err.message}`);
    }
  }

  // Also ping main sitemap URL so Bing re-crawls it
  process.stdout.write("📡 Pinging sitemap URL… ");
  try {
    const res = await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITE_URL + "/sitemap.xml")}`
    );
    console.log(`✅ ${res.status}`);
  } catch (err) {
    console.log(`⚠️  ${err.message}`);
  }

  console.log("\n✅ Done! Bing (and IndexNow partners) have been notified.");
  console.log("💡 Also submit your sitemap in Google Search Console — GSC doesn't use IndexNow.");
  process.exit(0);
}

main();
