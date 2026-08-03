import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import EVSale from "@/lib/models/EVSale";
import { FALLBACK_ANALYTICS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const year    = parseInt(searchParams.get("year") || new Date().getFullYear());
    const segment = searchParams.get("segment");

    const matchBase = { year, isNational: true };
    if (segment) matchBase.segment = segment;

    const [totals, brandRankings, monthlyTrend, segmentBreakdown, stateSales] = await Promise.all([
      // Overall totals for the year
      EVSale.aggregate([
        { $match: matchBase },
        { $group: { _id: "$segment", totalUnits: { $sum: "$unitsSold" }, avgGrowth: { $avg: "$growthPercentage" } } },
      ]),

      // Top brands by total units
      EVSale.aggregate([
        { $match: matchBase },
        { $group: { _id: { brand: "$brand", brandSlug: "$brandSlug", segment: "$segment" }, totalUnits: { $sum: "$unitsSold" }, avgMarketShare: { $avg: "$marketShare" }, avgGrowth: { $avg: "$growthPercentage" } } },
        { $sort: { totalUnits: -1 } },
        { $limit: 20 },
        { $project: { brand: "$_id.brand", brandSlug: "$_id.brandSlug", segment: "$_id.segment", totalUnits: 1, avgMarketShare: 1, avgGrowth: 1, _id: 0 } },
      ]),

      // Monthly trend (national, all segments)
      EVSale.aggregate([
        { $match: { year, isNational: true, ...(segment ? { segment } : {}) } },
        { $group: { _id: "$month", totalUnits: { $sum: "$unitsSold" } } },
        { $sort: { _id: 1 } },
        { $project: { month: "$_id", totalUnits: 1, _id: 0 } },
      ]),

      // Segment breakdown
      EVSale.aggregate([
        { $match: matchBase },
        { $group: { _id: "$segment", totalUnits: { $sum: "$unitsSold" } } },
      ]),

      // State-wise totals
      EVSale.aggregate([
        { $match: { year, isNational: false, ...(segment ? { segment } : {}) } },
        { $group: { _id: "$state", totalUnits: { $sum: "$unitsSold" }, avgGrowth: { $avg: "$growthPercentage" } } },
        { $sort: { totalUnits: -1 } },
        { $limit: 12 },
        { $project: { state: "$_id", totalUnits: 1, avgGrowth: 1, _id: 0 } },
      ]),
    ]);

    // If no data in DB, return fallback
    const hasData = totals.length > 0 || brandRankings.length > 0;
    if (!hasData) {
      return NextResponse.json(FALLBACK_ANALYTICS(year), {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
      });
    }

    // Compute grand total
    const grandTotal = totals.reduce((s, t) => s + t.totalUnits, 0);
    const segMap = Object.fromEntries(totals.map((t) => [t._id, t]));

    return NextResponse.json(
      {
        year,
        grandTotal,
        totals: {
          car:           segMap.car?.totalUnits || 0,
          "two-wheeler": segMap["two-wheeler"]?.totalUnits || 0,
          commercial:    segMap.commercial?.totalUnits || 0,
        },
        avgGrowth: totals.reduce((s, t) => s + (t.avgGrowth || 0), 0) / (totals.length || 1),
        marketShare: { car: 0, "two-wheeler": 0, commercial: 0 },
        brandRankings,
        monthlyTrend,
        segmentBreakdown: segmentBreakdown.map((s) => ({
          segment: s._id,
          totalUnits: s.totalUnits,
          share: grandTotal > 0 ? ((s.totalUnits / grandTotal) * 100).toFixed(1) : 0,
        })),
        stateSales,
        isFallback: false,
      },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } }
    );
  } catch (err) {
    return NextResponse.json({ ...FALLBACK_ANALYTICS(new Date().getFullYear()), error: err.message });
  }
}
