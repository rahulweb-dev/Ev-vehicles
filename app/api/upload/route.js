import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAuth } from "@/lib/auth";
import { uploadToImageKit } from "@/lib/imagekit";

export const dynamic = "force-dynamic";

const MAX_WIDTH  = 1920;
const MAX_BYTES  = 5 * 1024 * 1024; // 5 MB input limit

// MIME types sharp can process
const OPTIMIZABLE = new Set(["image/jpeg","image/jpg","image/png","image/webp","image/gif","image/avif","image/tiff"]);

async function optimizeImage(buffer, mimeType) {
  if (!OPTIMIZABLE.has(mimeType)) return buffer; // pass SVG / unknown through as-is

  const img = sharp(buffer);
  const meta = await img.metadata();

  // Resize only if wider than MAX_WIDTH (preserve aspect ratio)
  const pipeline = meta.width > MAX_WIDTH
    ? img.resize({ width: MAX_WIDTH, withoutEnlargement: true })
    : img;

  // Re-encode as WebP for best compression; keep quality high enough for news photos
  return pipeline
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const formData = await request.formData();
    const file     = formData.get("file");
    const folder   = formData.get("folder") || "/ev-news";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
    }

    const rawBuffer = Buffer.from(bytes);
    const mimeType  = file.type || "image/jpeg";

    // Optimize: resize + re-encode as WebP
    const optimized = await optimizeImage(rawBuffer, mimeType);

    // Use .webp extension for optimized images so CDN serves correct Content-Type
    const originalName = file.name.replace(/\.[^.]+$/, "") + ".webp";

    const result = await uploadToImageKit(optimized, originalName, folder);

    return NextResponse.json({
      success: true,
      ...result,
      originalSize:  rawBuffer.byteLength,
      optimizedSize: optimized.byteLength,
      savings: `${Math.round((1 - optimized.byteLength / rawBuffer.byteLength) * 100)}%`,
    });
  } catch (error) {
    console.error("[Upload]", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
