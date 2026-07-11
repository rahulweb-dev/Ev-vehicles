import { NextResponse } from "next/server";

const SITE_URL = "https://www.evradar.in";
const SITE_NAME = "EV News India";

// Google News sitemap — must only contain articles published in the last 2 days
// Served at /sitemap-news.xml via this route
export async function GET() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const articles = await Article.find({
      status: "published",
      publishedAt: { $gte: twoDaysAgo },
    })
      .select("slug title publishedAt tags author")
      .sort({ publishedAt: -1 })
      .limit(1000)
      .lean();

    const urls = articles.map(a => {
      const pubDate = new Date(a.publishedAt).toISOString();
      const keywords = (a.tags || []).slice(0, 10).join(", ");
      return `
  <url>
    <loc>${SITE_URL}/news/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${a.title}]]></news:title>
      ${keywords ? `<news:keywords><![CDATA[${keywords}]]></news:keywords>` : ""}
    </news:news>
    <lastmod>${pubDate}</lastmod>
  </url>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
>${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Cache for 1 hour — Google re-fetches news sitemaps frequently
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    console.error("[sitemap-news]", err);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
