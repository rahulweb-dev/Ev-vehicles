import { revalidatePath }            from "next/cache";
import Article                       from "@/lib/models/Article";
import Blog                          from "@/lib/models/Blog";
import { sendArticlePublishedEmail } from "@/lib/notifications";
import { pingIndexNow, buildArticleUrl, buildBlogUrl } from "@/lib/indexnow";

// Publishes every draft blog whose scheduledAt has passed. No subscriber email —
// only news articles trigger the email broadcast.
async function publishDueBlogs() {
  const due = await Blog.find({
    status:      "draft",
    scheduledAt: { $lte: new Date(), $ne: null },
  }).lean();

  if (due.length === 0) return [];

  for (const blog of due) {
    await Blog.updateOne(
      { _id: blog._id },
      {
        $set:   { status: "published", publishedAt: blog.publishedAt || blog.scheduledAt },
        $unset: { scheduledAt: "" },
      }
    );
    revalidatePath(`/blogs/${blog.slug}`);
  }
  revalidatePath("/blogs");
  revalidatePath("/");

  pingIndexNow(due.map(b => buildBlogUrl(b.slug))).catch(console.error);

  return due;
}

// Publishes every draft article and blog whose scheduledAt has passed. Caller must dbConnect() first.
export async function publishDueArticles() {
  const dueBlogs = await publishDueBlogs();

  const due = await Article.find({
    status:      "draft",
    scheduledAt: { $lte: new Date(), $ne: null },
  }).lean();

  if (due.length === 0) {
    await runSocial([], dueBlogs);
    return dueBlogs;
  }

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

  await runSocial(due, dueBlogs);
  return [...due, ...dueBlogs];
}

// Facebook/Instagram: auto-post newly published content (if enabled in Social Settings) and
// publish any scheduled social posts that are due. Never blocks or fails content publishing.
async function runSocial(articles, blogs) {
  try {
    const { autoPostContent, publishDueSocialPosts } = await import("@/lib/social/socialPosts");
    for (const a of articles) await autoPostContent(a, "article").catch((e) => console.error("[social auto-post]", e.message));
    for (const b of blogs) await autoPostContent(b, "blog").catch((e) => console.error("[social auto-post]", e.message));
    await publishDueSocialPosts();
  } catch (e) {
    console.error("[social scheduler]", e?.message || e);
  }
}

// Accepts ?secret=, or the "Authorization: Bearer <secret>" header Vercel Cron / GitHub Actions send.
export function isCronAuthorized(request) {
  // Either secret works: Vercel Cron sends CRON_SECRET, GitHub Actions/manual calls use SCHEDULER_SECRET
  const accepted = [process.env.SCHEDULER_SECRET, process.env.CRON_SECRET].filter(Boolean);
  if (!accepted.length) return process.env.NODE_ENV !== "production";
  const { searchParams } = new URL(request.url);
  const bearer = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return accepted.includes(searchParams.get("secret")) || accepted.includes(bearer);
}
