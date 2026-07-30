import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/lib/models/Comment";
import { commentLimiter, getIp } from "@/lib/rateLimit";

// GET /api/comments?slug=xxx
export async function GET(request) {
  try {
    await dbConnect();
    const slug = new URL(request.url).searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    const comments = await Comment.find({ articleSlug: slug, approved: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return NextResponse.json({ comments, total: comments.length });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/comments
export async function POST(request) {
  const rl = commentLimiter.check(getIp(request));
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });

  try {
    await dbConnect();
    const { articleSlug, name, content, website } = await request.json();

    // Honeypot — bots fill hidden fields, humans never do
    if (website) return NextResponse.json({ comment: null, pending: true }, { status: 201 });

    if (!articleSlug || !name?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (content.length > 1000) {
      return NextResponse.json({ error: "Comment too long (max 1000 chars)." }, { status: 400 });
    }

    const comment = await Comment.create({ articleSlug, name: name.trim(), content: content.trim(), approved: false });
    return NextResponse.json({ comment, pending: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
