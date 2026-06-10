import { NextResponse } from "next/server";

const SITE_URL  = "https://www.evradar.in";
const SITE_NAME = "EV News India";

export const revalidate = 600; // regenerate every 10 minutes

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article  = (await import("@/lib/models/Article")).default;
    await dbConnect();

    const articles = await Article.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(30)
      .select("title slug excerpt image author category tags publishedAt updatedAt")
      .lean();

    const items = articles.map(a => `
    <item>
      <title>${esc(a.title)}</title>
      <link>${SITE_URL}/news/${esc(a.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/news/${esc(a.slug)}</guid>
      <description>${esc(a.excerpt || "")}</description>
      <pubDate>${new Date(a.publishedAt || a.updatedAt).toUTCString()}</pubDate>
      <dc:creator>${esc(a.author || "Editorial Team")}</dc:creator>
      <category>${esc(a.category || "")}</category>
      ${a.image ? `<media:content url="${esc(a.image)}" medium="image"/>` : ""}
      ${(a.tags || []).map(t => `<category>${esc(t)}</category>`).join("\n      ")}
    </item>`).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://www.rssboard.org/media-rss">
  <channel>
    <title>${SITE_NAME} – India's #1 Electric Vehicle News</title>
    <link>${SITE_URL}</link>
    <description>Latest electric vehicle news, reviews, prices and launches in India.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>editorial@evradar.in (${SITE_NAME})</managingEditor>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/images/logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, stale-while-revalidate=60",
      },
    });
  } catch {
    return new NextResponse("Feed unavailable", { status: 500 });
  }
}
