import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Blog from "@/lib/models/Blog";
import { rateLimit, getIp } from "@/lib/rateLimit";

const viewLimiter = rateLimit({ windowMs: 30 * 60_000, max: 1 });

export async function POST(request, { params }) {
  const { id } = await params;
  const ip = getIp(request);
  const rl = viewLimiter.check(`blog:${ip}:${id}`);
  if (!rl.ok) return NextResponse.json({ ok: true });

  try {
    await dbConnect();
    await Blog.updateOne(
      { slug: id, status: "published" },
      { $inc: { views: 1 } }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
