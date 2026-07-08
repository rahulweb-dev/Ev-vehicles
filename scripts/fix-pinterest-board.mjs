import { readFileSync } from "fs";
import { createDecipheriv, createCipheriv, randomBytes } from "crypto";
import mongoose from "mongoose";

const env = readFileSync(".env.local", "utf8");
const getEnv = (key) => {
  const line = env.split("\n").find((l) => l.trim().startsWith(key));
  return line ? line.split("=").slice(1).join("=").trim() : "";
};
const MONGODB_URI    = getEnv("MONGODB_URI");
const ENCRYPTION_KEY = getEnv("ENCRYPTION_KEY");

function encrypt(text) {
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv  = randomBytes(12);
  const c   = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return `${iv.toString("hex")}:${c.getAuthTag().toString("hex")}:${enc.toString("hex")}`;
}

function decrypt(data) {
  if (!data) return "";
  try {
    const [ivHex, tagHex, encHex] = data.split(":");
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const d = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    d.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([d.update(Buffer.from(encHex, "hex")), d.final()]).toString("utf8");
  } catch { return ""; }
}

await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const SocialSettings = mongoose.model("SocialSettings", new mongoose.Schema({
  platform: String,
  credentials: { type: mongoose.Schema.Types.Mixed },
  updatedAt: Date,
}, { strict: false }));

const s = await SocialSettings.findOne({ platform: "pinterest" }).lean();
const oldBoardId = decrypt(s.credentials.boardId);
console.log("Old board ID (decrypted):", oldBoardId);

const newBoardId = "1145251448932750509"; // "news" board
await SocialSettings.updateOne(
  { platform: "pinterest" },
  { $set: { "credentials.boardId": encrypt(newBoardId), updatedAt: new Date() } },
);
console.log("✅ Updated board ID to:", newBoardId, "(news board)");
await mongoose.disconnect();
