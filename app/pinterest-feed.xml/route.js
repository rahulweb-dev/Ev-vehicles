import { NextResponse } from "next/server";
import { pinCard, contentLabel } from "@/lib/social/socialImages";

// RSS feed for Pinterest "Auto-publish from RSS" (Pinterest business account → Settings → Bulk create Pins).
// Each item carries the tall 1000×1500 pin image, the article link and a short description.
// Works without Pinterest API access, so pins publish even while the API app is on Trial access.
const SITE_URL = "https://www.evradar.in";
export const revalidate = 900;

const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cdata = (s) => `<![CDATA[${String(s || "").replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
const tags = (list = []) => [...new Set([...list.slice(0, 4).map((t) => "#" + String(t).replace(/[^A-Za-z0-9]/g, "")).filter((t) => t.length > 2), "#EV", "#ElectricVehicles", "#EVRadar"])].join(" ");

export async function GET() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article = (await import("@/lib/models/Article")).default;
    const Blog = (await import("@/lib/models/Blog")).default;
    await dbConnect();
    const fields = "title slug excerpt image category tags publishedAt updatedAt";
    const [news, guides] = await Promise.all([
      Article.find({ status: "published", image: { $nin: [null, ""] } }).sort({ publishedAt: -1 }).limit(25).select(fields).lean(),
      Blog.find({ status: "published", image: { $nin: [null, ""] } }).sort({ publishedAt: -1 }).limit(10).select(fields).lean(),
    ]);
    const docs = [...news.map((d) => ({ d, kind: "article" })), ...guides.map((d) => ({ d, kind: "blog" }))]
      .sort((a, b) => new Date(b.d.publishedAt || b.d.updatedAt) - new Date(a.d.publishedAt || a.d.updatedAt))
      .slice(0, 30);

    const items = docs.map(({ d, kind }) => {
      const url = `${SITE_URL}/${kind === "blog" ? "blogs" : "news"}/${d.slug}`;
      const img = pinCard(d.image, { title: d.title, label: contentLabel(d, kind) });
      const desc = `${(d.excerpt || "").slice(0, 380)} ${tags(d.tags)}`.trim();
      return `
    <item>
      <title>${cdata(String(d.title).slice(0, 100))}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${cdata(`<img src="${esc(img)}" alt="${esc(d.title)}"/><p>${esc(desc)}</p>`)}</description>
      <pubDate>${new Date(d.publishedAt || d.updatedAt).toUTCString()}</pubDate>
      <enclosure url="${esc(img)}" type="image/jpeg" length="0"/>
      <media:content url="${esc(img)}" medium="image" type="image/jpeg" width="1000" height="1500"/>
    </item>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>EV Radar – Electric Vehicle News for Pinterest</title>
    <link>${SITE_URL}</link>
    <description>Electric vehicle news, prices and buyer's guides for India, as Pinterest pins.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/pinterest-feed.xml" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>`;
    return new NextResponse(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch (e) {
    console.error("[pinterest-feed]", e);
    return new NextResponse("Feed unavailable", { status: 500 });
  }
}
