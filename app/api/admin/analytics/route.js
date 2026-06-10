import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();

    const Article   = (await import("@/lib/models/Article")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    const Lead      = (await import("@/lib/models/Lead")).default;
    const Subscriber = (await import("@/lib/models/Subscriber")).default;

    const now   = new Date();
    const day7  = new Date(now - 7  * 24 * 3600000);
    const day30 = new Date(now - 30 * 24 * 3600000);

    const [
      totalArticles, publishedArticles, draftArticles,
      totalVehicles, publishedVehicles,
      totalLeads, leadsThisWeek, leadsThisMonth,
      totalSubscribers,
      topArticles,
      recentArticles,
      articlesByCategory,
    ] = await Promise.all([
      Article.countDocuments({}),
      Article.countDocuments({ status: "published" }),
      Article.countDocuments({ status: "draft" }),
      Vehicle.countDocuments({}),
      Vehicle.countDocuments({ status: "published" }),
      Lead.countDocuments({}),
      Lead.countDocuments({ createdAt: { $gte: day7 } }),
      Lead.countDocuments({ createdAt: { $gte: day30 } }),
      Subscriber.countDocuments({ status: "active" }),
      Article.find({ status: "published" }).sort({ views: -1 }).limit(5).select("title slug views category publishedAt").lean(),
      Article.find({ status: "published" }).sort({ publishedAt: -1 }).limit(5).select("title slug category publishedAt views").lean(),
      Article.aggregate([
        { $match: { status: "published" } },
        { $group: { _id: "$category", count: { $sum: 1 }, totalViews: { $sum: "$views" } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return NextResponse.json({
      articles: { total: totalArticles, published: publishedArticles, draft: draftArticles },
      vehicles: { total: totalVehicles, published: publishedVehicles },
      leads:    { total: totalLeads, thisWeek: leadsThisWeek, thisMonth: leadsThisMonth },
      subscribers: { total: totalSubscribers },
      topArticles,
      recentArticles,
      articlesByCategory,
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
