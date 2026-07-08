import crypto from "crypto";

const ALG = "aes-256-gcm";

function getKey() {
  const hex = process.env.ENCRYPTION_KEY || "";
  if (hex.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be 64 hex chars (32 bytes). Generate with: openssl rand -hex 32");
  }
  return Buffer.from(hex, "hex");
}

export function encrypt(text) {
  if (!text) return "";
  const key = getKey();
  const iv  = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(data) {
  if (!data) return "";
  try {
    const [ivHex, tagHex, encHex] = data.split(":");
    if (!ivHex || !tagHex || !encHex) return "";
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALG, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([
      decipher.update(Buffer.from(encHex, "hex")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return "";
  }
}

// Returns true if a value looks like an encrypted blob (not a plain-text token)
export function isEncrypted(val) {
  return typeof val === "string" && val.split(":").length === 3;
}
