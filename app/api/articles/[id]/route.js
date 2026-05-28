import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/lib/models/Article";
import { requireAuth } from "@/lib/auth";
import { pingIndexNow, buildArticleUrl } from "@/lib/indexnow";

// GET /api/articles/[id] — public, by id or slug
export async function GET(request, context) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const article = await Article.findById(id).lean();
    if (!article) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Increment view count
    Article.findByIdAndUpdate(id, { $inc: { views: 1 } }).catch(() => {});

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT /api/articles/[id] — admin only
export async function PUT(request, context) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await context.params;
    await dbConnect();
    const body = await request.json();

    const existing = await Article.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Track if we're publishing for the first time
    const isPublishingNow =
      existing.status !== "published" && body.status === "published";

    if (isPublishingNow && !body.publishedAt) {
      body.publishedAt = new Date();
    }

    const updated = await Article.findByIdAndUpdate(id, body, { returnDocument: "after", runValidators: true });

    // Ping search engines if publishing or updating a published article
    if (isPublishingNow || existing.status === "published") {
      pingIndexNow(buildArticleUrl(updated.slug)).catch(console.error);
    }

    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    console.error("[PUT /api/articles]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/articles/[id] — admin only
export async function DELETE(request, context) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await context.params;
    await dbConnect();
    const deleted = await Article.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
