#!/usr/bin/env node
/**
 * Diagnose social credentials: checks DB storage and decryption for all platforms.
 * Run: node scripts/test-social-creds.mjs
 */
import { readFileSync } from "fs";
import { resolve }      from "path";
import crypto           from "crypto";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envLines = readFileSync(envPath, "utf8").split("\n");
for (const line of envLines) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
console.log("\n=== ENCRYPTION KEY ===");
console.log(`Length : ${ENCRYPTION_KEY.length} chars (need 64)`);
console.log(`Status : ${ENCRYPTION_KEY.length === 64 ? "✅ OK" : "❌ WRONG LENGTH"}`);
if (ENCRYPTION_KEY.length > 0) {
  console.log(`Preview: ${ENCRYPTION_KEY.slice(0, 8)}...${ENCRYPTION_KEY.slice(-8)}`);
}

function decrypt(data) {
  if (!data) return "";
  try {
    const [ivHex, tagHex, encHex] = data.split(":");
    if (!ivHex || !tagHex || !encHex) return `[NOT_ENCRYPTED: ${data.slice(0, 20)}]`;
    const key      = Buffer.from(ENCRYPTION_KEY, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([
      decipher.update(Buffer.from(encHex, "hex")),
      decipher.final(),
    ]).toString("utf8");
  } catch (e) {
    return `[DECRYPT_FAILED: ${e.message}]`;
  }
}

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "";
const { MongoClient } = await import("mongodb");
const client = new MongoClient(MONGO_URI);

try {
  await client.connect();
  const db   = client.db();
  const docs  = await db.collection("socialsettings").find({}).toArray();

  console.log(`\n=== SOCIAL SETTINGS IN DB (${docs.length} platforms) ===`);

  if (docs.length === 0) {
    console.log("❌ No social settings found in DB at all — credentials were never saved.");
  }

  for (const doc of docs) {
    console.log(`\n--- ${doc.platform.toUpperCase()} (enabled: ${doc.enabled}) ---`);
    const creds = doc.credentials || {};
    for (const [field, val] of Object.entries(creds)) {
      if (!val) {
        console.log(`  ${field}: [EMPTY]`);
        continue;
      }
      const decrypted = decrypt(val);
      const ok = !decrypted.startsWith("[");
      console.log(`  ${field}: ${ok ? "✅ " + decrypted.slice(0, 6) + "***" : "❌ " + decrypted}`);
    }
  }
} finally {
  await client.close();
}
