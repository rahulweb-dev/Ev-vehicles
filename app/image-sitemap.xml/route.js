import dbConnect from "@/lib/mongodb";
import Article   from "@/lib/models/Article";
import Vehicle   from "@/lib/models/Vehicle";

const SITE_URL = "https://www.evradar.in";

export const revalidate = 3600; // 1 hour

function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&apos;");
}

export async function GET() {
  try {
    await dbConnect();

    const [articles, vehicles] = await Promise.all([
      Article.find({ status: "published", image: { $exists: true, $ne: "" } })
        .sort({ publishedAt: -1 })
        .limit(1000)
        .select("slug title image imageAlt publishedAt category")
        .lean(),
      Vehicle.find({ status: "published", featuredImage: { $exists: true, $ne: "" } })
        .limit(500)
        .select("slug name brand featuredImage vehicleType")
        .lean(),
    ]);

    const articleEntries = articles.map((a) => `
  <url>
    <loc>${SITE_URL}/news/${escapeXml(a.slug)}</loc>
    <image:image>
      <image:loc>${escapeXml(a.image)}</image:loc>
      <image:title>${escapeXml(a.imageAlt || a.title)}</image:title>
      <image:caption>${escapeXml(a.title)}</image:caption>
    </image:image>
  </url>`).join("");

    const vehicleEntries = vehicles.map((v) => {
      const type = v.vehicleType === "car" ? "cars" : v.vehicleType === "bike" ? "bikes" : "commercial";
      return `
  <url>
    <loc>${SITE_URL}/${type}/${escapeXml(v.slug)}</loc>
    <image:image>
      <image:loc>${escapeXml(v.featuredImage)}</image:loc>
      <image:title>${escapeXml(`${v.brand} ${v.name}`)}</image:title>
      <image:caption>${escapeXml(`${v.brand} ${v.name} – Electric Vehicle India`)}</image:caption>
    </image:image>
  </url>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>${articleEntries}${vehicleEntries}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[image-sitemap]", err);
    return new Response("<?xml version=\"1.0\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"/>", {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
