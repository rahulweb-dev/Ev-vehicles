const SITE_URL = "https://www.evradar.in";
const SITE_NAME = "EV News India";

export const revalidate = 300;

export async function GET() {
  let articles = [];

  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article = (await import("@/lib/models/Article")).default;
    await dbConnect();

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    articles = await Article.find({
      status: "published",
      publishedAt: { $gte: twoDaysAgo },
    })
      .sort({ publishedAt: -1 })
      .limit(100)
      .select("slug title publishedAt tags")
      .lean();
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
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
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
