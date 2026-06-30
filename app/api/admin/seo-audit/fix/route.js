import { requireAuth } from "@/lib/auth";
import dbConnect       from "@/lib/mongodb";
import Article         from "@/lib/models/Article";
import Vehicle         from "@/lib/models/Vehicle";

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function buildArticleMetaTitle(a) {
  const t = a.title || "";
  return t.length > 60 ? t.slice(0, 57) + "…" : t;
}

function buildArticleMetaDesc(a) {
  const text = a.excerpt
    ? stripHtml(a.excerpt)
    : stripHtml((a.content || "").slice(0, 800));
  if (!text) return "";
  return text.length > 160 ? text.slice(0, 157) + "…" : text;
}

function buildVehicleMetaTitle(v) {
  const year = new Date().getFullYear();
  const t = `${v.name} Price in India ${year} – Range, Specs & Colors`;
  return t.length > 60 ? t.slice(0, 57) + "…" : t;
}

function buildVehicleMetaDesc(v) {
  const price = v.variants?.[0]?.exShowroomPrice || "";
  const range = v.performance?.drivingRange || "";
  const kind  = v.vehicleType === "bike" ? "electric scooter/bike" : "electric vehicle";
  const desc  = `${v.name} ${kind} in India.${price ? ` Price starts at ${price} ex-showroom.` : ""}${range ? ` ARAI range: ${range}.` : ""} Check full specs, variants, and colors.`;
  return desc.length > 160 ? desc.slice(0, 157) + "…" : desc;
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  await dbConnect();

  const [articles, vehicles] = await Promise.all([
    Article.find({ status: "published" })
      .select("title slug metaTitle metaDescription excerpt content")
      .lean(),
    Vehicle.find({ status: "published" })
      .select("name slug vehicleType metaTitle metaDescription variants performance")
      .lean(),
  ]);

  const articleOps = [];
  const vehicleOps = [];
  let articleFixed = 0;
  let vehicleFixed = 0;

  for (const a of articles) {
    const updates = {};

    const needsTitle = !a.metaTitle || a.metaTitle.length < 30 || a.metaTitle.length > 60;
    if (needsTitle) {
      const generated = buildArticleMetaTitle(a);
      if (generated) updates.metaTitle = generated;
    }

    const needsDesc = !a.metaDescription || a.metaDescription.length < 80 || a.metaDescription.length > 160;
    if (needsDesc) {
      const generated = buildArticleMetaDesc(a);
      if (generated && generated.length >= 80) updates.metaDescription = generated;
    }

    if (!a.excerpt || a.excerpt.length < 50) {
      const fromContent = stripHtml((a.content || "").slice(0, 600));
      if (fromContent.length >= 50) {
        updates.excerpt = fromContent.length > 280 ? fromContent.slice(0, 277) + "…" : fromContent;
      }
    }

    if (Object.keys(updates).length > 0) {
      articleOps.push({
        updateOne: { filter: { _id: a._id }, update: { $set: updates } },
      });
      articleFixed++;
    }
  }

  for (const v of vehicles) {
    const updates = {};

    const needsTitle = !v.metaTitle || v.metaTitle.length < 30 || v.metaTitle.length > 60;
    if (needsTitle) {
      updates.metaTitle = buildVehicleMetaTitle(v);
    }

    const needsDesc = !v.metaDescription || v.metaDescription.length < 80;
    if (needsDesc) {
      const generated = buildVehicleMetaDesc(v);
      if (generated.length >= 50) updates.metaDescription = generated;
    }

    if (Object.keys(updates).length > 0) {
      vehicleOps.push({
        updateOne: { filter: { _id: v._id }, update: { $set: updates } },
      });
      vehicleFixed++;
    }
  }

  const [articleResult, vehicleResult] = await Promise.all([
    articleOps.length ? Article.bulkWrite(articleOps) : Promise.resolve({ modifiedCount: 0 }),
    vehicleOps.length ? Vehicle.bulkWrite(vehicleOps) : Promise.resolve({ modifiedCount: 0 }),
  ]);

  return Response.json({
    success: true,
    articlesFixed: articleResult.modifiedCount ?? articleFixed,
    vehiclesFixed: vehicleResult.modifiedCount ?? vehicleFixed,
    total: (articleResult.modifiedCount ?? articleFixed) + (vehicleResult.modifiedCount ?? vehicleFixed),
  });
}
