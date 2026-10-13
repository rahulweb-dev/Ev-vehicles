import { NextResponse }                          from "next/server";
import dbConnect                                 from "@/lib/mongodb";
import { publishDueArticles, isCronAuthorized }  from "@/lib/publishScheduled";

// GET /api/admin/scheduler?secret=YOUR_SCHEDULER_SECRET  (or Authorization: Bearer <secret>)
// Publishes drafts whose scheduledAt has passed. /api/cron/auto-news also does this hourly.
export async function GET(request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const due = await publishDueArticles();

  if (due.length === 0) {
    return NextResponse.json({ published: 0, message: "Nothing due" });
  }
  return NextResponse.json({
    published: due.length,
    slugs: due.map(a => a.slug),
  });
}
