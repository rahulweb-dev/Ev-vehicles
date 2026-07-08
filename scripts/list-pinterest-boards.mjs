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
}));

const s = await SocialSettings.findOne({ platform: "pinterest" }).lean();
const token = decrypt(s.credentials.accessToken);

const res  = await fetch("https://api.pinterest.com/v5/boards?page_size=25", {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();

console.log("\nYour Pinterest Boards:");
if (!data.items?.length) {
  console.log("No boards found.", JSON.stringify(data));
} else {
  data.items.forEach((b) => console.log(`  ID: ${b.id}   Name: ${b.name}`));
}

await mongoose.disconnect();
