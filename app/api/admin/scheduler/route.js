import { NextResponse }         from "next/server";
import { revalidatePath }        from "next/cache";
import dbConnect                 from "@/lib/mongodb";
import Article                   from "@/lib/models/Article";
import { sendArticlePublishedEmail } from "@/lib/notifications";

// GET /api/admin/scheduler?secret=YOUR_SCHEDULER_SECRET
// Call this via Vercel Cron, cron-job.org, or Zapier every minute/5 minutes.
// vercel.json cron config:
//   { "crons": [{ "path": "/api/admin/scheduler", "schedule": "*/5 * * * *" }] }
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret   = searchParams.get("secret");
  const expected = process.env.SCHEDULER_SECRET;

  // In production require a secret; skip check if SCHEDULER_SECRET is not set (dev only)
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  // Find drafts whose scheduled time has passed
  const due = await Article.find({
    status:      "draft",
    scheduledAt: { $lte: new Date(), $ne: null },
  }).lean();

  if (due.length === 0) {
    return NextResponse.json({ published: 0, message: "Nothing due" });
  }

  const ids = due.map(a => a._id);
  await Article.updateMany(
    { _id: { $in: ids } },
    { $set: { status: "published" }, $unset: { scheduledAt: "" } }
  );
  // Ensure publishedAt is filled
  for (const article of due) {
    if (!article.publishedAt) {
      await Article.findByIdAndUpdate(article._id, {
        $set: { publishedAt: article.scheduledAt },
      });
    }
  }

  // Notify subscribers + revalidate ISR
  for (const article of due) {
    sendArticlePublishedEmail(article).catch(console.error);
    revalidatePath(`/news/${article.slug}`);
    if (article.category) revalidatePath(`/news/category/${article.category}`);
  }
  revalidatePath("/news");
  revalidatePath("/");

  return NextResponse.json({
    published: due.length,
    slugs: due.map(a => a.slug),
  });
}
