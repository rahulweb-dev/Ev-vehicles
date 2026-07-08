import { readFileSync } from "fs";
import { createDecipheriv } from "crypto";
import mongoose from "mongoose";

const env = readFileSync(".env.local", "utf8");
const getEnv = (key) => {
  const line = env.split("\n").find((l) => l.trim().startsWith(key));
  return line ? line.split("=").slice(1).join("=").trim() : "";
};

const MONGODB_URI    = getEnv("MONGODB_URI");
const ENCRYPTION_KEY = getEnv("ENCRYPTION_KEY");
const SITE_URL       = getEnv("NEXT_PUBLIC_SITE_URL") || "https://www.evradar.in";

function decrypt(data) {
  if (!data) return "";
  try {
    const [ivHex, tagHex, encHex] = data.split(":");
    const key      = Buffer.from(ENCRYPTION_KEY, "hex");
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
  } catch { return ""; }
}

await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
console.log("✅ MongoDB connected\n");

const SocialSettings = mongoose.model("SocialSettings", new mongoose.Schema({
  platform: String, enabled: Boolean,
  credentials: { type: mongoose.Schema.Types.Mixed }, updatedAt: Date,
}));
const Article = mongoose.model("Article", new mongoose.Schema({
  title: String, excerpt: String, slug: String, image: String, status: String, publishedAt: Date,
}));

// ── Load Pinterest settings ───────────────────────────────────────
const setting = await SocialSettings.findOne({ platform: "pinterest" }).lean();
if (!setting) {
  console.error("❌ No Pinterest settings in DB. Go to Admin → Social Settings and save them first.");
  process.exit(1);
}

const raw         = setting.credentials ?? {};
const accessToken = decrypt(raw.accessToken || "");
const boardId     = decrypt(raw.boardId     || "");

console.log("📋 Pinterest Settings in DB:");
console.log("   enabled     :", setting.enabled);
console.log("   updatedAt   :", setting.updatedAt);
console.log("   Board ID    :", boardId     || "⚠️  EMPTY");
console.log("   Token chars :", accessToken ? accessToken.length : "⚠️  EMPTY");
console.log("   Token start :", accessToken ? accessToken.slice(0, 20) + "..." : "none");

if (!accessToken || !boardId) {
  console.error("\n❌ Access Token or Board ID is empty. Fill them in Admin → Social Settings → Pinterest");
  process.exit(1);
}

// ── Verify token via Pinterest API ───────────────────────────────
console.log("\n🔍 Checking Pinterest token...");
const meRes  = await fetch("https://api.pinterest.com/v5/user_account", {
  headers: { Authorization: `Bearer ${accessToken}` },
});
const meData = await meRes.json();

if (!meRes.ok || meData.code) {
  console.error("❌ Token is INVALID:", meData.message || JSON.stringify(meData));
  console.error("   Get a fresh token from: https://developers.pinterest.com/tools/oauth-token");
  await mongoose.disconnect();
  process.exit(1);
}
console.log("   Account     :", meData.username, `(${meData.account_type})`);

// ── Verify board exists ───────────────────────────────────────────
console.log("\n🔍 Checking board", boardId, "...");
const boardRes  = await fetch(`https://api.pinterest.com/v5/boards/${boardId}`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
const boardData = await boardRes.json();

if (!boardRes.ok || boardData.code) {
  console.error("❌ Board not found:", boardData.message || JSON.stringify(boardData));
  console.error("   Make sure the Board ID is correct. Find it in the board URL on Pinterest.");
  await mongoose.disconnect();
  process.exit(1);
}
console.log("   Board name  :", boardData.name);

// ── Pick latest published article ────────────────────────────────
const article = await Article.findOne({ status: "published", image: { $ne: "" } })
  .sort({ publishedAt: -1 }).lean();
if (!article) {
  console.error("❌ No published articles with images found.");
  process.exit(1);
}

const articleUrl = `${SITE_URL.replace(/\/$/, "")}/news/${article.slug}`;
// Pinterest optimal: 1000×1500 (2:3 tall pin)
const imageUrl   = article.image.includes("ik.imagekit.io")
  ? article.image.split("?")[0] + "?tr=w-1000,h-1500,fo-auto,q-85,f-jpg"
  : article.image;

console.log(`\n📰 Pinning: "${article.title}"`);
console.log("   Image       :", imageUrl);

// ── Create Pinterest Pin ──────────────────────────────────────────
console.log("\n🚀 Creating Pinterest Pin...");
const pinRes  = await fetch("https://api.pinterest.com/v5/pins", {
  method:  "POST",
  headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    title:       article.title,
    description: article.excerpt + "\n\n#EVNews #ElectricVehicles #India #EV",
    link:        articleUrl,
    board_id:    boardId,
    media_source: { source_type: "image_url", url: imageUrl },
  }),
});
const pinData = await pinRes.json();

if (!pinRes.ok || pinData.code) {
  console.error("\n❌ Pin creation failed:");
  console.error("   Message:", pinData.message || JSON.stringify(pinData));
  console.error("   Code   :", pinData.code);
} else {
  console.log("\n✅ SUCCESS! Pin ID:", pinData.id);
  console.log("   View: https://www.pinterest.com/pin/" + pinData.id);
}

await mongoose.disconnect();
