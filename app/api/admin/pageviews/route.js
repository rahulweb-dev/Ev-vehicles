import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect      from "@/lib/mongodb";
import PageView       from "@/lib/models/PageView";

let _cache   = null;
let _cacheAt = 0;

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (_cache && Date.now() - _cacheAt < 2 * 60 * 1000) {
    return NextResponse.json({ ..._cache, cached: true });
  }

  try {
    await dbConnect();

    const now            = new Date();
    const todayStart     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart      = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 6);
    const monthStart     = new Date(todayStart); monthStart.setDate(monthStart.getDate() - 29);

    const [
      todayViews,
      todayUnique,
      yestViews,
      yestUnique,
      monthViews,
      last7,
      topPages,
      devices,
    ] = await Promise.all([
      PageView.countDocuments({ createdAt: { $gte: todayStart } }),
      PageView.distinct("sessionId", { createdAt: { $gte: todayStart } }),
      PageView.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: todayStart } }),
      PageView.distinct("sessionId", { createdAt: { $gte: yesterdayStart, $lt: todayStart } }),
      PageView.countDocuments({ createdAt: { $gte: monthStart } }),

      // Last 7 days by date (IST)
      PageView.aggregate([
        { $match: { createdAt: { $gte: weekStart } } },
        { $group: {
          _id:      { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" } },
          views:    { $sum: 1 },
          sessions: { $addToSet: "$sessionId" },
        }},
        { $project: { date: "$_id", views: 1, unique: { $size: "$sessions" }, _id: 0 } },
        { $sort: { date: 1 } },
      ]),

      // Top 8 pages today
      PageView.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: "$path", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 8 },
        { $project: { path: "$_id", views: 1, _id: 0 } },
      ]),

      // Device split today
      PageView.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
      ]),
    ]);

    _cache = {
      today:     { views: todayViews, unique: todayUnique.length },
      yesterday: { views: yestViews,  unique: yestUnique.length },
      month:     { views: monthViews },
      last7days: last7,
      topPages,
      devices:   Object.fromEntries(devices.map(d => [d._id, d.count])),
      fetchedAt: new Date().toISOString(),
    };
    _cacheAt = Date.now();

    return NextResponse.json(_cache);
  } catch (err) {
    console.error("[GET /api/admin/pageviews]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
