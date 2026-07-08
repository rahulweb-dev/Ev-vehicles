import { NextResponse } from "next/server";
import dbConnect        from "@/lib/mongodb";
import Article          from "@/lib/models/Article";
import { requireAuth }  from "@/lib/auth";

// GET /api/admin/social-report?page=1&limit=20
// Returns published articles with their socialStatus for the report dashboard
export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get("page")  || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip  = (page - 1) * limit;

    const filter = {
      status: "published",
      // Only return articles that have at least one social target
      $or: [
        { "socialTargets.0": { $exists: true } },
        { "socialStatus.facebook.published": true },
        { "socialStatus.linkedin.published": true },
        { "socialStatus.pinterest.published": true },
        { "socialStatus.telegram.published": true },
      ],
    };

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("title slug category publishedAt socialStatus socialTargets")
        .lean(),
      Article.countDocuments(filter),
    ]);

    return NextResponse.json({
      articles,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[GET social-report]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
