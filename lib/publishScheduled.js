import { revalidatePath }            from "next/cache";
import Article                       from "@/lib/models/Article";
import { sendArticlePublishedEmail } from "@/lib/notifications";
import { pingIndexNow, buildArticleUrl } from "@/lib/indexnow";

// Publishes every draft whose scheduledAt has passed. Caller must dbConnect() first.
export async function publishDueArticles() {
  const due = await Article.find({
    status:      "draft",
    scheduledAt: { $lte: new Date(), $ne: null },
  }).lean();

  if (due.length === 0) return [];

  for (const article of due) {
    await Article.updateOne(
      { _id: article._id },
      {
        $set:   { status: "published", publishedAt: article.publishedAt || article.scheduledAt },
        $unset: { scheduledAt: "" },
      }
    );
  }

  // Notify subscribers + revalidate ISR
  for (const article of due) {
    sendArticlePublishedEmail(article).catch(console.error);
    revalidatePath(`/news/${article.slug}`);
    if (article.category) revalidatePath(`/news/category/${article.category}`);
  }
  revalidatePath("/news");
  revalidatePath("/");

  pingIndexNow(due.map(a => buildArticleUrl(a.slug))).catch(console.error);

  return due;
}

// Accepts ?secret=, or the "Authorization: Bearer <secret>" header Vercel Cron / GitHub Actions send.
export function isCronAuthorized(request) {
  const expected = process.env.SCHEDULER_SECRET || process.env.CRON_SECRET;
  if (!expected) return process.env.NODE_ENV !== "production";
  const { searchParams } = new URL(request.url);
  const bearer = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return searchParams.get("secret") === expected || bearer === expected;
}
