import { NextResponse } from "next/server";

// POST /api/articles/[slug]/like  body: { action: "like" | "unlike" }
export async function POST(request, { params }) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article  = (await import("@/lib/models/Article")).default;
    await dbConnect();

    const { id: slug } = await params;
    let action = "like";
    try { ({ action } = await request.json()); } catch {}

    const delta = action === "unlike" ? -1 : 1;
    const article = await Article.findOneAndUpdate(
      { slug },
      { $inc: { likes: delta } },
      { new: true }
    );

    return NextResponse.json({ likes: Math.max(0, article?.likes ?? 0) });
  } catch {
    return NextResponse.json({ likes: 0 });
  }
}
