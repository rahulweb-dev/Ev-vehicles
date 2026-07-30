import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect  from "@/lib/mongodb";
import PageView   from "@/lib/models/PageView";

export const revalidate = 0;

export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  await dbConnect();

  const path = `/news/${slug}`;
  const now  = new Date();

  const dayStart   = new Date(now); dayStart.setHours(0, 0, 0, 0);
  const weekStart  = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [today, week, total, scrollData] = await Promise.all([
    PageView.countDocuments({ path, createdAt: { $gte: dayStart } }),
    PageView.countDocuments({ path, createdAt: { $gte: weekStart } }),
    PageView.countDocuments({ path }),
    PageView.aggregate([
      { $match: { path, scrollDepth: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$scrollDepth" } } },
    ]),
  ]);

  const avgScroll = scrollData[0]?.avg ?? 0;

  // Daily breakdown for the past 7 days
  const daily = await PageView.aggregate([
    { $match: { path, createdAt: { $gte: weekStart } } },
    { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" } },
      count: { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
  ]);

  return NextResponse.json({ today, week, total, avgScroll: Math.round(avgScroll), daily });
}
