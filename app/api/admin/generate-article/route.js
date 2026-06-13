import { requireAuth } from "@/lib/requireAuth";
import dbConnect       from "@/lib/mongodb";
import Vehicle         from "@/lib/models/Vehicle";
import Article         from "@/lib/models/Article";

export const maxDuration = 60;

const GEMINI_API   = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-flash-latest";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function extractJson(text) {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0, inString = false, escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape)              { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"')          { inString = !inString; continue; }
    if (inString)            continue;
    if (ch === "{")          depth++;
    else if (ch === "}") { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return null;
}

export async function POST(request) {
  const authErr = await requireAuth(request);
  if (authErr) return authErr;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

  const { vehicleId, style = "review" } = await request.json();
  if (!vehicleId) return Response.json({ error: "vehicleId required" }, { status: 400 });

  await dbConnect();
  const vehicle = await Vehicle.findById(vehicleId).lean();
  if (!vehicle) return Response.json({ error: "Vehicle not found" }, { status: 404 });

  const year  = new Date().getFullYear();
  const price = vehicle.variants?.[0]?.exShowroomPrice || "N/A";
  const range = vehicle.performance?.drivingRange || "N/A";
  const power = vehicle.performance?.power        || "N/A";
  const speed = vehicle.performance?.topSpeed     || "N/A";

  const styleGuides = {
    review:    "Write a comprehensive review with pros, cons, verdict, and driving experience.",
    launch:    "Write a launch announcement article covering pricing, availability, and key highlights.",
    comparison:"Write a buyer's guide comparing this vehicle to its top 2 competitors.",
  };

  const prompt = `You are an expert EV journalist for EVRadar.in (India's top EV news site).

${styleGuides[style] || styleGuides.review}

Vehicle details:
- Name: ${vehicle.name}
- Brand: ${vehicle.brand}
- Year: ${year}
- Ex-showroom price: ${price}
- ARAI range: ${range}
- Power: ${power}
- Top speed: ${speed}
- Battery: ${vehicle.battery?.capacity || "N/A"}
- Charging time (AC): ${vehicle.charging?.acChargingTime || "N/A"}
- Key features: ${Object.entries(vehicle.features?.comfort || {}).filter(([,v]) => v).map(([k]) => k).join(", ") || "N/A"}
- Category: ${vehicle.vehicleType}

Write a professional 600-800 word article in HTML format (use <h2>, <p>, <ul>, <li> tags only — no <html>, <body>, <head>, <style> tags).

Return ONLY a JSON object with this exact structure:
{
  "title": "SEO-optimized article title (under 70 chars)",
  "excerpt": "Compelling excerpt under 160 characters",
  "content": "Full HTML article content (600-800 words)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readTime": "X min",
  "metaTitle": "SEO meta title under 60 chars",
  "metaDescription": "SEO meta description 120-155 chars"
}`;

  const res = await fetch(
    `${GEMINI_API}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: "Gemini API error", detail: err }, { status: 500 });
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonStr = extractJson(text);
  if (!jsonStr) return Response.json({ error: "Failed to parse AI response" }, { status: 500 });

  let generated;
  try { generated = JSON.parse(jsonStr); }
  catch { return Response.json({ error: "Invalid JSON from AI" }, { status: 500 }); }

  /* Build draft article */
  const category  = vehicle.vehicleType === "car" ? "cars" : vehicle.vehicleType === "bike" ? "bikes" : "commercial";
  const baseSlug  = slugify(generated.title || vehicle.name);
  let   slug      = baseSlug;
  let   attempt   = 0;

  while (await Article.exists({ slug })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const article = await Article.create({
    title:           generated.title           || `${vehicle.name} ${year} Review`,
    slug,
    excerpt:         generated.excerpt         || "",
    content:         generated.content         || "",
    image:           vehicle.featuredImage     || "",
    imageAlt:        `${vehicle.name} ${year}`,
    category,
    author:          "EV News India Team",
    tags:            generated.tags            || [vehicle.brand, vehicle.name, "EV India"],
    readTime:        generated.readTime        || "5 min",
    status:          "draft",
    metaTitle:       generated.metaTitle       || generated.title,
    metaDescription: generated.metaDescription || generated.excerpt,
    featured:        false,
  });

  return Response.json({
    success: true,
    article: { _id: article._id, slug: article.slug, title: article.title },
  });
}
