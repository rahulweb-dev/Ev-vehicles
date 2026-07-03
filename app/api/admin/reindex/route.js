import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { pingIndexNow, buildArticleUrl, buildBlogUrl, buildVehicleUrl } from "@/lib/indexnow";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.evradar.in").replace(/\/$/, "");

/**
 * POST /api/admin/reindex
 * Submit all published content to IndexNow in batches.
 * Body: { type: "articles" | "blogs" | "vehicles" | "all", limit?: number }
 */
export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const body = await request.json().catch(() => ({}));
    const type  = body.type  || "all";
    const limit = Math.min(body.limit || 200, 500);

    const Article = (await import("@/lib/models/Article")).default;
    const Blog    = (await import("@/lib/models/Blog")).default;
    const Vehicle = (await import("@/lib/models/Vehicle")).default;

    const urls = [];

    if (type === "all" || type === "articles") {
      const articles = await Article.find({ status: "published" }).select("slug").limit(limit).lean();
      articles.forEach(a => urls.push(buildArticleUrl(a.slug)));
    }

    if (type === "all" || type === "blogs") {
      const blogs = await Blog.find({ status: "published" }).select("slug").limit(limit).lean();
      blogs.forEach(b => urls.push(buildBlogUrl(b.slug)));
    }

    if (type === "all" || type === "vehicles") {
      const vehicles = await Vehicle.find({ status: "published" }).select("slug vehicleType").limit(limit).lean();
      vehicles.forEach(v => urls.push(buildVehicleUrl(v.slug, v.vehicleType)));
    }

    // Always include key static pages
    if (type === "all") {
      urls.push(
        SITE_URL,
        `${SITE_URL}/cars`,
        `${SITE_URL}/bikes`,
        `${SITE_URL}/news`,
        `${SITE_URL}/compare`,
        `${SITE_URL}/ev-charging-guide`,
        `${SITE_URL}/government-ev-policy-india`,
        `${SITE_URL}/best-electric-cars-india-2026`,
        `${SITE_URL}/upcoming-electric-cars-india`,
        `${SITE_URL}/electric-cars-under-10-lakh`,
        `${SITE_URL}/ev-glossary`,
      );
    }

    // IndexNow accepts max 10,000 URLs per request; split into batches of 500
    const results = [];
    for (let i = 0; i < urls.length; i += 500) {
      const batch = urls.slice(i, i + 500);
      const result = await pingIndexNow(batch);
      results.push({ batch: i / 500 + 1, count: batch.length, ...result });
    }

    return NextResponse.json({ success: true, totalUrls: urls.length, results });
  } catch (err) {
    console.error("[POST /api/admin/reindex]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
