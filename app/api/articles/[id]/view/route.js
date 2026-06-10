import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/lib/models/Article";

// POST /api/articles/[id]/view — increment view count by slug
export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    await Article.findOneAndUpdate(
      { slug: id, status: "published" },
      { $inc: { views: 1 } }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
