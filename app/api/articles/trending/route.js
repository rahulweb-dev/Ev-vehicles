import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET(request) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article  = (await import("@/lib/models/Article")).default;
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 10);

    const articles = await Article.find({ status: "published" })
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .select("title slug image views publishedAt category")
      .lean();

    // Client-side fetch from TrendingWidget bypasses ISR — explicit CDN cache header needed.
    return NextResponse.json(
      { articles },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
