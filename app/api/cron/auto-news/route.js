import { NextResponse }                          from "next/server";
import dbConnect                                 from "@/lib/mongodb";
import { requireAuth }                           from "@/lib/auth";
import { generateAutoNewsArticle }               from "@/lib/autoNews";
import { publishDueArticles, isCronAuthorized }  from "@/lib/publishScheduled";

export const maxDuration = 60;
export const dynamic     = "force-dynamic";

// Each run: publish anything that's due, then write + schedule one new AI article.
async function run() {
  await dbConnect();
  const published = await publishDueArticles();

  if (process.env.AUTO_NEWS_ENABLED === "false") {
    return { published: published.map(a => a.slug), generated: { skipped: true, reason: "AUTO_NEWS_ENABLED=false" } };
  }

  let generated;
  try {
    generated = await generateAutoNewsArticle();
  } catch (e) {
    console.error("[auto-news]", e);
    generated = { error: e.message };
  }
  return { published: published.map(a => a.slug), generated };
}

// GET — hourly cron (GitHub Actions / cron-job.org / Vercel Cron). Auth: ?secret= or Bearer.
export async function GET(request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json(result, { status: result.generated?.error ? 500 : 200 });
}

// POST — "Generate AI news now" button in the admin.
export async function POST() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const result = await run();
  return NextResponse.json(result, { status: result.generated?.error ? 500 : 200 });
}
