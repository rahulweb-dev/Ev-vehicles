// Quick one-shot Facebook test — run with: node scripts/test-facebook.mjs
import { readFileSync } from "fs";
import { createDecipheriv } from "crypto";
import mongoose from "mongoose";

// ── Load .env.local manually ─────────────────────────────────────
const env = readFileSync(".env.local", "utf8");
const getEnv = (key) => {
  const line = env.split("\n").find((l) => l.trim().startsWith(key));
  return line ? line.split("=").slice(1).join("=").trim() : "";
};

const MONGODB_URI    = getEnv("MONGODB_URI");
const ENCRYPTION_KEY = getEnv("ENCRYPTION_KEY");
const SITE_URL       = getEnv("NEXT_PUBLIC_SITE_URL") || "https://www.evradar.in";

if (!MONGODB_URI)    { console.error("❌ MONGODB_URI missing in .env.local"); process.exit(1); }
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  console.error(`❌ ENCRYPTION_KEY missing or wrong length (got ${ENCRYPTION_KEY.length} chars, need 64)`);
  process.exit(1);
}

function decrypt(data) {
  if (!data) return "";
  try {
    const [ivHex, tagHex, encHex] = data.split(":");
    const key      = Buffer.from(ENCRYPTION_KEY, "hex");
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([
      decipher.update(Buffer.from(encHex, "hex")),
      decipher.final(),
    ]).toString("utf8");
  } catch { return ""; }
}

await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
console.log("✅ MongoDB connected\n");

const SocialSettings = mongoose.model("SocialSettings", new mongoose.Schema({
  platform: String, enabled: Boolean,
  credentials: { type: mongoose.Schema.Types.Mixed },
  updatedAt: Date,
}));

const Article = mongoose.model("Article", new mongoose.Schema({
  title: String, excerpt: String, slug: String, status: String, publishedAt: Date,
}));

const setting = await SocialSettings.findOne({ platform: "facebook" }).lean();
if (!setting) {
  console.error("❌ No Facebook settings saved in DB at all.");
  process.exit(1);
}

const raw         = setting.credentials ?? {};
const accessToken = decrypt(raw.accessToken || "");
const pageId      = decrypt(raw.pageId      || "");

console.log("📋 Facebook Settings in DB:");
console.log("   enabled    :", setting.enabled);
console.log("   updatedAt  :", setting.updatedAt);
console.log("   Page ID    :", pageId      || "⚠️  EMPTY");
console.log("   Token chars:", accessToken ? accessToken.length : "⚠️  EMPTY");
console.log("   Token start:", accessToken ? accessToken.slice(0, 20) + "..." : "none");

if (!pageId || !accessToken) {
  console.error("\n❌ Page ID or Token is empty in DB. Re-enter them in Social Settings and Save.");
  process.exit(1);
}

// ── Debug the token via Facebook ─────────────────────────────────
console.log("\n🔍 Checking token identity...");
const debugRes  = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${accessToken}`);
const debugData = await debugRes.json();

if (debugData.error) {
  console.error("❌ Token is INVALID:", debugData.error.message);
  console.error("   Get a fresh one from Graph API Explorer → GET /me/accounts");
  await mongoose.disconnect();
  process.exit(1);
}

console.log("   Token identity:", debugData.name, `(id: ${debugData.id})`);

// A Page token's /me returns the Page itself — so id should match pageId
const isPageToken = debugData.id === pageId;
console.log("   Token type    :", isPageToken ? "✅ PAGE token (correct)" : "❌ USER token (wrong — cannot post to page)");

if (!isPageToken) {
  console.warn("\n⚠️  You are using a USER Access Token. This cannot post to a Page.");
  console.warn("\n   How to get the correct PAGE token:");
  console.warn("   1. Go to: https://developers.facebook.com/tools/explorer");
  console.warn("   2. Select your App in the top-right dropdown");
  console.warn("   3. Add permissions: pages_manage_posts + pages_read_engagement");
  console.warn("   4. Click 'Generate Access Token' → Login and Accept");
  console.warn("   5. In the query box, type:  me/accounts  → click Submit");
  console.warn('   6. Find "Autonews" in the result → copy its "access_token" value');
  console.warn("   7. Paste THAT token in Admin → Social Settings → Facebook → Page Access Token");
  await mongoose.disconnect();
  process.exit(1);
}

// ── All good — post ──────────────────────────────────────────────
const article = await Article.findOne({ status: "published" }).sort({ publishedAt: -1 }).lean();
const articleUrl = `${SITE_URL.replace(/\/$/, "")}/news/${article.slug}`;
const message = [`⚡ ${article.title}`, "", article.excerpt, "", `🔗 Read more: ${articleUrl}`, "", "#EVNews #ElectricVehicles #EV #EVRadar"].join("\n");

console.log(`\n🚀 Posting "${article.title}" to Facebook Page ${pageId}...`);

const postRes  = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message, link: articleUrl, access_token: accessToken }),
});
const postData = await postRes.json();

if (postData.error) {
  console.error("\n❌ Post failed:", postData.error.message, `(code ${postData.error.code})`);
} else {
  console.log("\n✅ SUCCESS! Post ID:", postData.id);
  console.log("   View: https://www.facebook.com/" + postData.id.replace("_", "/posts/"));
}

await mongoose.disconnect();
