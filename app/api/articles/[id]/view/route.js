import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/lib/models/Article";
import { rateLimit, getIp } from "@/lib/rateLimit";

// 1 view-count increment per article per IP per 30 minutes
const viewLimiter = rateLimit({ windowMs: 30 * 60_000, max: 1 });

// POST /api/articles/[id]/view — increment view count by slug (deduplicated per IP per 30min)
export async function POST(request, { params }) {
  const { id } = await params;
  const ip = getIp(request);
  const rl = viewLimiter.check(`${ip}:${id}`);
  if (!rl.ok) return NextResponse.json({ ok: true }); // silently skip duplicate

  try {
    await dbConnect();
    await Article.findOneAndUpdate(
      { slug: id, status: "published" },
      { $inc: { views: 1 } }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
