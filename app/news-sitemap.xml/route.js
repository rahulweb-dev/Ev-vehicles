const SITE_URL = "https://www.evradar.in";
const SITE_NAME = "EV Radar";

export const revalidate = 300;

export async function GET() {
  let articles = [];

  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article = (await import("@/lib/models/Article")).default;
    await dbConnect();

    // Google News sitemap: articles up to 2 days old are preferred,
    // but always include at least the 50 most recent to avoid an empty sitemap.
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const recent = await Article.find({ status: "published", publishedAt: { $gte: twoDaysAgo } })
      .sort({ publishedAt: -1 })
      .limit(100)
      .select("slug title publishedAt tags image")
      .lean();

    if (recent.length >= 5) {
      articles = recent;
    } else {
      // Fallback: always show at least the 50 most recent articles
      articles = await Article.find({ status: "published" })
        .sort({ publishedAt: -1 })
        .limit(50)
        .select("slug title publishedAt tags image")
        .lean();
    }
  } catch {
    // DB unavailable — return empty sitemap
  }

  const xmlItems = articles
    .map((article) => {
      const pubDate = new Date(article.publishedAt).toISOString();
      const keywords = article.tags?.join(", ") || "";
      return `  <url>
    <loc>${SITE_URL}/news/${article.slug}</loc>
    <lastmod>${pubDate}</lastmod>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>${keywords ? `\n      <news:keywords><![CDATA[${keywords}]]></news:keywords>` : ""}
    </news:news>${article.image ? `\n    <image:image>\n      <image:loc>${article.image}</image:loc>\n      <image:title><![CDATA[${article.title}]]></image:title>\n    </image:image>` : ""}
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${xmlItems}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
    },
  });
}
