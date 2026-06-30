import { requireAuth } from "@/lib/auth";
import dbConnect       from "@/lib/mongodb";
import Article         from "@/lib/models/Article";
import Vehicle         from "@/lib/models/Vehicle";

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function autoMetaTitle(name, type = "article") {
  if (type === "vehicle") {
    const year = new Date().getFullYear();
    const t = `${name} Price in India ${year} – Range, Specs & Colors`;
    return t.length > 60 ? t.slice(0, 57) + "…" : t;
  }
  return name.length > 60 ? name.slice(0, 57) + "…" : name;
}

function autoMetaDesc(item, type = "article") {
  if (type === "vehicle") {
    const price = item.variants?.[0]?.exShowroomPrice || "";
    const range = item.performance?.drivingRange || "";
    const base  = `${item.name} electric vehicle in India.${price ? ` Price starts at ${price} ex-showroom.` : ""}${range ? ` ARAI range: ${range}.` : ""} Check full specs, variants, and colors.`;
    return base.length > 160 ? base.slice(0, 157) + "…" : base;
  }
  const text = item.excerpt ? stripHtml(item.excerpt) : stripHtml(item.content || "");
  return text.length > 160 ? text.slice(0, 157) + "…" : text;
}

export async function GET(request) {
  const auth = await requireAuth();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  await dbConnect();

  const [articles, vehicles] = await Promise.all([
    Article.find({ status: "published" })
      .select("title slug metaTitle metaDescription image tags readTime excerpt content")
      .lean(),
    Vehicle.find({ status: "published" })
      .select("name slug vehicleType metaTitle metaDescription featuredImage gallery variants performance")
      .lean(),
  ]);

  const issues = [];
  let autoFixable = 0;

  /* ── Article checks ─────────────────────────────────── */
  for (const a of articles) {
    const url = `/news/${a.slug}`;

    if (!a.metaTitle || a.metaTitle.length < 30) {
      issues.push({ type: "article", url, title: a.title, issue: "Missing or short meta title (< 30 chars)", severity: "high", fixable: true });
      autoFixable++;
    } else if (a.metaTitle.length > 60) {
      issues.push({ type: "article", url, title: a.title, issue: `Meta title too long (${a.metaTitle.length} chars, ideal ≤ 60)`, severity: "medium", fixable: true });
      autoFixable++;
    }

    if (!a.metaDescription || a.metaDescription.length < 80) {
      issues.push({ type: "article", url, title: a.title, issue: "Missing or short meta description (< 80 chars)", severity: "high", fixable: true });
      autoFixable++;
    } else if (a.metaDescription.length > 160) {
      issues.push({ type: "article", url, title: a.title, issue: `Meta description too long (${a.metaDescription.length} chars, ideal ≤ 160)`, severity: "medium", fixable: true });
      autoFixable++;
    }

    if (!a.image)
      issues.push({ type: "article", url, title: a.title, issue: "No featured image — affects social sharing & CTR", severity: "high", fixable: false });

    if (!a.tags?.length)
      issues.push({ type: "article", url, title: a.title, issue: "No tags set — reduces topic relevance signals", severity: "low", fixable: false });

    if (!a.excerpt || a.excerpt.length < 50) {
      issues.push({ type: "article", url, title: a.title, issue: "Excerpt missing or too short — used for meta description fallback", severity: "medium", fixable: !!(a.content) });
      if (a.content) autoFixable++;
    }
  }

  /* ── Vehicle checks ──────────────────────────────────── */
  for (const v of vehicles) {
    const section = v.vehicleType === "car" ? "cars" : v.vehicleType === "bike" ? "bikes" : "commercial";
    const url = `/${section}/${v.slug}`;

    if (!v.metaTitle || v.metaTitle.length < 30) {
      issues.push({ type: "vehicle", url, title: v.name, issue: "Missing or short meta title", severity: "high", fixable: true });
      autoFixable++;
    } else if (v.metaTitle.length > 60) {
      issues.push({ type: "vehicle", url, title: v.name, issue: `Meta title too long (${v.metaTitle.length} chars)`, severity: "medium", fixable: true });
      autoFixable++;
    }

    if (!v.metaDescription || v.metaDescription.length < 80) {
      issues.push({ type: "vehicle", url, title: v.name, issue: "Missing or short meta description", severity: "high", fixable: true });
      autoFixable++;
    }

    if (!v.featuredImage)
      issues.push({ type: "vehicle", url, title: v.name, issue: "No featured image — needed for OG card & Google Images", severity: "high", fixable: false });

    if (!v.gallery?.length)
      issues.push({ type: "vehicle", url, title: v.name, issue: "No gallery images — adds visual content for Google Images", severity: "medium", fixable: false });

    if (!v.variants?.some(vr => vr.exShowroomPrice))
      issues.push({ type: "vehicle", url, title: v.name, issue: "No price set — missing from Product schema & structured data", severity: "high", fixable: false });
  }

  /* ── Stats ───────────────────────────────────────────── */
  const high   = issues.filter(i => i.severity === "high").length;
  const medium = issues.filter(i => i.severity === "medium").length;
  const low    = issues.filter(i => i.severity === "low").length;
  const total  = issues.length;
  const score  = Math.max(0, Math.round(100 - (high * 4) - (medium * 1.5) - (low * 0.5)));

  return Response.json({
    score,
    total,
    high, medium, low,
    autoFixable,
    issues,   /* no slice — return all */
    counts:   { articles: articles.length, vehicles: vehicles.length },
  });
}
