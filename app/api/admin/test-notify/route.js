import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Article from "@/lib/models/Article";
import { notifyArticlePublished } from "@/lib/notifications";
import Subscriber from "@/lib/models/Subscriber";

/**
 * POST /api/admin/test-notify
 * Body: { articleId?: string }   — omit to use the last published article
 *
 * Manually triggers the subscriber email notification for an article.
 * Useful for testing the email system or re-sending a missed notification.
 */
export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();

    const body = await request.json().catch(() => ({}));
    let article;

    if (body.articleId) {
      article = await Article.findById(body.articleId).lean();
    } else {
      article = await Article.findOne({ status: "published" })
        .sort({ publishedAt: -1 })
        .lean();
    }

    if (!article) {
      return NextResponse.json({ error: "No published article found" }, { status: 404 });
    }

    const subscriberCount = await Subscriber.countDocuments({ status: "active" });

    // Fire the full notification pipeline (email + WhatsApp + push)
    await notifyArticlePublished(article);

    return NextResponse.json({
      success: true,
      article: { title: article.title, slug: article.slug, publishedAt: article.publishedAt },
      subscribersNotified: subscriberCount,
      message: `Email queued for ${subscriberCount} subscriber${subscriberCount !== 1 ? "s" : ""}. Mail worker triggered to send immediately.`,
    });
  } catch (err) {
    console.error("[POST /api/admin/test-notify]", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

/**
 * GET /api/admin/test-notify
 * Returns the last published article details + active subscriber count.
 */
export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();

    const [article, subscriberCount] = await Promise.all([
      Article.findOne({ status: "published" })
        .sort({ publishedAt: -1 })
        .select("title slug excerpt image category author publishedAt readTime")
        .lean(),
      Subscriber.countDocuments({ status: "active" }),
    ]);

    if (!article) {
      return NextResponse.json({ error: "No published article found" }, { status: 404 });
    }

    return NextResponse.json({ article, subscriberCount });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
