// Data-driven buying guides ("electric cars under ₹15 lakh", "longest-range EVs" …).
// Everything shown is computed from the vehicles collection, so the pages stay correct
// when prices change — no figures are hard-coded here.
import { cache } from "react";
import { parsePrice } from "@/lib/priceUtils";

export const GUIDES = {
  "electric-cars-under-10-lakh":     { type: "car",  budget: 10_00_000, label: "Electric Cars Under ₹10 Lakh" },
  "electric-cars-under-15-lakh":     { type: "car",  budget: 15_00_000, label: "Electric Cars Under ₹15 Lakh" },
  "electric-cars-under-20-lakh":     { type: "car",  budget: 20_00_000, label: "Electric Cars Under ₹20 Lakh" },
  "longest-range-electric-cars-india": { type: "car", budget: null,     label: "Longest-Range Electric Cars", sort: "range" },
  "electric-bikes-under-50000":      { type: "bike", budget: 50_000,    label: "Electric Two-Wheelers Under ₹50,000" },
  "electric-bikes-under-1-lakh":     { type: "bike", budget: 1_00_000,  label: "Electric Scooters Under ₹1 Lakh" },
  "electric-scooters-under-1-5-lakh": { type: "bike", budget: 1_50_000, label: "Electric Scooters Under ₹1.5 Lakh" },
};

/** "₹14,49,000 (approx.)" → 1449000; ranges like "₹11,30,000 - ₹11,50,000" use the low end. */
export function priceNum(raw) {
  const s = String(raw || "").replace(/\(.*?\)/g, "").split(/\s[-–]\s/)[0].trim();
  if (!/\d/.test(s)) return null;
  return parsePrice(s);
}
/** First "NNN km" in a string → number. */
export function kmNum(raw) {
  const m = String(raw || "").replace(/,/g, "").match(/(\d{2,4})\s*km/i);
  return m ? Number(m[1]) : null;
}
/** ₹ amount in Indian style: 14.49 lakh / 1.26 crore / ₹99,999 */
export function fmtINR(n) {
  if (n == null) return "—";
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} crore`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2).replace(/\.00$/, "")} lakh`;
  return `₹${n.toLocaleString("en-IN")}`;
}
export const budgetLabel = (b) => (b >= 1_00_000 ? `₹${(b / 1_00_000).toString()} lakh` : `₹${b.toLocaleString("en-IN")}`);

const loadVehicles = cache(async (type) => {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    return await Vehicle.find({ status: "published", vehicleType: type, availability: { $nin: ["upcoming", "discontinued"] } })
      .select("slug name brand vehicleType featuredImage variants performance safety updatedAt")
      .lean();
  } catch {
    return [];
  }
});

function summarise(v, budget) {
  const variants = (v.variants || [])
    .map((x) => ({ name: x.name, price: priceNum(x.exShowroomPrice), priceRaw: x.exShowroomPrice, km: kmNum(x.range), battery: x.batteryCapacity }))
    .filter((x) => x.price);
  if (!variants.length) return null;
  variants.sort((a, b) => a.price - b.price);
  const within = budget ? variants.filter((x) => x.price <= budget) : variants;
  if (!within.length) return null;
  const bestRange = within.filter((x) => x.km).sort((a, b) => b.km - a.km)[0] || null;
  const rating = v.safety?.safetyRating || "";
  return {
    slug: v.slug, name: v.name, brand: v.brand, image: v.featuredImage || "",
    href: `/${v.vehicleType === "car" ? "cars" : "bikes"}/${v.slug}`,
    minPrice: variants[0].price, maxPrice: variants[variants.length - 1].price,
    maxWithin: within[within.length - 1].price,
    variantsTotal: variants.length, variantsWithin: within.length,
    bestRange, // best claimed range among variants within budget
    claimedRange: v.performance?.drivingRange || "",
    realWorld: v.performance?.realWorldRange || "",
    realWorldKm: kmNum(v.performance?.realWorldRange),
    battery: v.performance?.batteryCapacity || "",
    safety: rating,
    fiveStar: /^5-Star (Bharat|Global) NCAP/i.test(rating),
    updatedAt: v.updatedAt,
  };
}

/** Vehicles for a guide, plus computed highlights. */
export async function getGuideData(key) {
  const g = GUIDES[key];
  const all = await loadVehicles(g.type);
  let list = all.map((v) => summarise(v, g.budget)).filter(Boolean);
  if (g.sort === "range") list = list.filter((x) => x.bestRange).sort((a, b) => b.bestRange.km - a.bestRange.km).slice(0, 12);
  else list.sort((a, b) => a.minPrice - b.minPrice);

  // If nothing fits the budget, show the cheapest options instead (and say so)
  let overBudget = false;
  if (!list.length && g.budget) {
    overBudget = true;
    list = all.map((v) => summarise(v, null)).filter(Boolean).sort((a, b) => a.minPrice - b.minPrice).slice(0, 5);
  }

  const withRange = list.filter((x) => x.bestRange);
  const highlights = {
    cheapest: list[0] || null,
    longestRange: withRange.length ? withRange.reduce((a, b) => (b.bestRange.km > a.bestRange.km ? b : a)) : null,
    longestRealWorld: list.filter((x) => x.realWorldKm).sort((a, b) => b.realWorldKm - a.realWorldKm)[0] || null,
    fiveStar: list.filter((x) => x.fiveStar),
  };
  const lastUpdated = list.reduce((d, x) => (x.updatedAt && new Date(x.updatedAt) > d ? new Date(x.updatedAt) : d), new Date(0));
  return { guide: g, list, highlights, overBudget, lastUpdated: lastUpdated.getTime() ? lastUpdated : new Date() };
}
