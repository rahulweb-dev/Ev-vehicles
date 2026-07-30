import { NextResponse }         from "next/server";
import { revalidatePath }        from "next/cache";
import dbConnect                 from "@/lib/mongodb";
import Article                   from "@/lib/models/Article";
import { requireAuth }           from "@/lib/auth";
import { pingIndexNow, buildArticleUrl } from "@/lib/indexnow";
import { notifyArticlePublished } from "@/lib/notifications";
import { publishToSocial }       from "@/lib/social/publisher";
import { sanitizeArticleContent } from "@/lib/sanitize";
import { logError } from "@/lib/logger";

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

    // Sanitize HTML content before saving — strips XSS vectors
    if (body.content) body.content = sanitizeArticleContent(body.content);

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

    // Preserve socialTargets from body if provided
    const socialTargets = Array.isArray(body.socialTargets) ? body.socialTargets : existing.socialTargets ?? [];

    const updated = await Article.findByIdAndUpdate(
      id,
      { ...body, socialTargets },
      { returnDocument: "after", runValidators: true }
    );

    // Ping search engines if publishing or updating a published article
    if (isPublishingNow || existing.status === "published") {
      // Bust ISR cache immediately so Googlebot sees fresh content on next crawl
      revalidatePath("/");
      revalidatePath("/news");
      revalidatePath(`/news/${updated.slug}`);
      if (updated.category) revalidatePath(`/news/category/${updated.category}`);

      // Notify Bing + Yandex via IndexNow (article URL + homepage + news listing)
      pingIndexNow([
        buildArticleUrl(updated.slug),
        "https://www.evradar.in/",
        "https://www.evradar.in/news",
      ]).catch(console.error);
    }

    // On first publish: send email/WhatsApp + post to social media
    if (isPublishingNow) {
      notifyArticlePublished(updated).catch(console.error);
      if (socialTargets.length > 0) {
        publishToSocial(String(updated._id), socialTargets).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    logError("PUT /api/articles", error);
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
