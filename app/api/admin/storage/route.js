import { NextResponse }  from "next/server";
import { requireAuth }   from "@/lib/auth";
import dbConnect         from "@/lib/mongodb";
import mongoose          from "mongoose";

// In-memory cache so we don't hammer APIs on every dashboard load
let cache = null;
let cacheAt = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function getMongoStats() {
  await dbConnect();
  try {
    const stats = await mongoose.connection.db.command({ dbStats: 1, scale: 1 });
    return {
      dataSize:    stats.dataSize    || 0,  // bytes
      storageSize: stats.storageSize || 0,
      indexSize:   stats.indexSize   || 0,
      collections: stats.collections || 0,
      objects:     stats.objects     || 0,
      // Atlas exposes fsTotalSize/fsUsedSize on paid tiers; 0 on free
      fsTotalSize: stats.fsTotalSize || 0,
      fsUsedSize:  stats.fsUsedSize  || 0,
    };
  } catch {
    return null;
  }
}

async function getImageKitStats() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) return null;

  try {
    let totalSize  = 0;
    let totalFiles = 0;
    let skip = 0;
    const limit = 1000;
    const MAX_PAGES = 5; // cap at 5000 files to avoid long-running requests

    for (let page = 0; page < MAX_PAGES; page++) {
      const url = `https://api.imagekit.io/v1/files?limit=${limit}&skip=${skip}&type=file`;
      const res = await fetch(url, {
        headers: {
          Authorization: "Basic " + Buffer.from(privateKey + ":").toString("base64"),
        },
      });

      if (!res.ok) break;

      const files = await res.json();
      if (!Array.isArray(files) || files.length === 0) break;

      files.forEach((f) => { totalSize += f.size || 0; });
      totalFiles += files.length;
      skip += files.length;

      if (files.length < limit) break; // last page
    }

    return { totalFiles, totalSize, truncated: skip >= MAX_PAGES * limit };
  } catch {
    return null;
  }
}

export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Serve cached response if fresh
  if (cache && Date.now() - cacheAt < CACHE_TTL) {
    return NextResponse.json({ ...cache, cached: true });
  }

  const [mongo, imagekit] = await Promise.all([getMongoStats(), getImageKitStats()]);

  const result = { mongo, imagekit, fetchedAt: new Date().toISOString() };
  cache = result;
  cacheAt = Date.now();

  return NextResponse.json(result);
}
