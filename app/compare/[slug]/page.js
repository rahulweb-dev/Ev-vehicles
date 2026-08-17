import { notFound } from "next/navigation";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight, CheckCircle, XCircle, ThumbsUp, ThumbsDown,
  BatteryCharging, Gauge, Zap, Clock3, Shield,
} from "lucide-react";
import { SITE_URL, SITE_NAME } from "@/app/layout";
import { parsePrice } from "@/lib/priceUtils";

export const revalidate = 3600;

/* ─── Pre-generate top vehicle pairs for Google indexing ────────── */
// Only pre-build the most popular/featured compare pairs.
// Pairwise combinations from N vehicles = N*(N-1)/2 pages — at N=15 that's 105
// near-identical template pages which dilute overall site quality for AdSense.
// Non-listed pairs still render on-demand when visited; they just aren't pre-built.
const FEATURED_PAIRS = [
  "tata-nexon-ev-vs-tata-punch-ev",
  "hyundai-creta-electric-vs-tata-nexon-ev",
  "mahindra-be-6-vs-tata-nexon-ev",
  "ola-s1-pro-vs-ather-450x",
  "tata-punch-ev-vs-mg-windsor-ev",
  "tvs-iqube-vs-bajaj-chetak",
];

export async function generateStaticParams() {
  return FEATURED_PAIRS.map(slug => ({ slug }));
}

/* ─── parse "slug1-vs-slug2" ────────────────────────────────────── */
function parsePair(slug) {
  const idx = slug.indexOf("-vs-");
  if (idx === -1) return null;
  return [slug.slice(0, idx), slug.slice(idx + 4)];
}

/* ─── DB helpers ────────────────────────────────────────────────── */
// cache() deduplicates DB calls between generateMetadata and the page component
const getVehicle = cache(async (slug) => {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    return await Vehicle.findOne({ slug, status: "published" }).lean();
  } catch {
    return null;
  }
});

/* ─── Metadata ──────────────────────────────────────────────────── */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pair = parsePair(slug);
  if (!pair) return { title: "EV Comparison" };

  const [vA, vB] = await Promise.all([getVehicle(pair[0]), getVehicle(pair[1])]);
  if (!vA || !vB) return { title: "EV Comparison" };

  const year   = new Date().getFullYear();
  const priceA = vA.variants?.[0]?.exShowroomPrice || "TBA";
  const priceB = vB.variants?.[0]?.exShowroomPrice || "TBA";
  const rangeA = vA.performance?.drivingRange || "";
  const rangeB = vB.performance?.drivingRange || "";

  const title = `${vA.name} vs ${vB.name} ${year} – Price, Range & Specs Compared | EV Radar`;
  const desc  = [
    `${vA.name} vs ${vB.name}: Which is better in ${year}?`,
    `${vA.name} starts at ${priceA}${rangeA ? ` with ${rangeA} range` : ""}.`,
    `${vB.name} starts at ${priceB}${rangeB ? ` with ${rangeB} range` : ""}.`,
    `Full specs, charging, features & verdict.`,
  ].join(" ");

  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/compare/${slug}` },
    openGraph: {
      title,
      description: desc,
      url:  `${SITE_URL}/compare/${slug}`,
      type: "website",
      images: [{ url: vA.featuredImage || vB.featuredImage || `${SITE_URL}/api/og?title=${encodeURIComponent(vA.name + " vs " + vB.name)}&subtitle=EV Comparison India ${year}&tag=cars&type=page`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [vA.featuredImage || vB.featuredImage || `${SITE_URL}/api/og?title=${encodeURIComponent(vA.name + " vs " + vB.name)}&subtitle=EV Comparison India ${year}&tag=cars&type=page`],
    },
  };
}

/* ─── Spec rows to compare ──────────────────────────────────────── */
const SPEC_ROWS = [
  { label: "Ex-Showroom Price",   fn: (v) => v.variants?.[0]?.exShowroomPrice || "TBA" },
  { label: "Battery Capacity",    fn: (v) => v.performance?.batteryCapacity || v.variants?.[0]?.batteryCapacity || "—" },
  { label: "Certified Range",     fn: (v) => v.performance?.drivingRange || v.variants?.[0]?.range || "—" },
  { label: "Motor Power",         fn: (v) => v.performance?.power || "—" },
  { label: "Torque",              fn: (v) => v.performance?.torque || "—" },
  { label: "Top Speed",           fn: (v) => v.performance?.topSpeed || "—" },
  { label: "0–100 km/h",         fn: (v) => v.performance?.acceleration || "—" },
  { label: "AC Charging Time",    fn: (v) => v.charging?.acChargingTime || "—" },
  { label: "DC Fast Charging",    fn: (v) => v.charging?.dcChargingTime || "—" },
  { label: "Fast Charging",       fn: (v) => v.charging?.fastCharging === true ? "Yes" : v.charging?.fastCharging === false ? "No" : "—" },
  { label: "Seating Capacity",    fn: (v) => v.specs?.seatingCapacity || "—" },
  { label: "Boot Space",          fn: (v) => v.specs?.bootSpace || "—" },
  { label: "Ground Clearance",    fn: (v) => v.specs?.groundClearance || "—" },
  { label: "Kerb Weight",         fn: (v) => v.specs?.kerbWeight || "—" },
  { label: "Drive Type",          fn: (v) => v.performance?.driveType || "—" },
  { label: "Vehicle Warranty",    fn: (v) => v.warranty?.vehicle || "—" },
  { label: "Battery Warranty",    fn: (v) => v.warranty?.battery || "—" },
];

const KEY_FEATURES = [
  ["Touchscreen",      "touchscreen"],
  ["Navigation",       "navigation"],
  ["Android Auto",     "androidAuto"],
  ["Apple CarPlay",    "appleCarPlay"],
  ["OTA Updates",      "otaUpdates"],
  ["Sunroof",          "sunroof"],
  ["Ventilated Seats", "ventilatedSeats"],
  ["Wireless Charging","wirelessCharging"],
  ["Keyless Entry",    "keylessEntry"],
  ["Cruise Control",   "cruiseControl"],
];

function priceDisplay(v) {
  const first = v.variants?.[0]?.exShowroomPrice;
  const last  = v.variants?.[v.variants.length - 1]?.exShowroomPrice;
  if (!first) return "Price TBA";
  return last && last !== first ? `${first} – ${last}` : first;
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default async function ComparePairPage({ params }) {
  const { slug } = await params;
  const pair = parsePair(slug);
  if (!pair) notFound();

  const [vA, vB] = await Promise.all([getVehicle(pair[0]), getVehicle(pair[1])]);
  if (!vA || !vB) notFound();

  const year = new Date().getFullYear();

  /* JSON-LD: two Product schemas + BreadcrumbList */
  const makeProduct = (v) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name:  v.name,
    brand: { "@type": "Brand", name: v.brand },
    image: v.featuredImage || "",
    description: v.shortDescription || v.metaDescription || `${v.name} electric vehicle`,
    ...(() => {
      const p = parsePrice(v.variants?.[0]?.exShowroomPrice);
      return p != null ? { offers: { "@type": "Offer", priceCurrency: "INR", price: p, availability: "https://schema.org/InStock" } } : {};
    })(),
  });

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",    item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare` },
      { "@type": "ListItem", position: 3, name: `${vA.name} vs ${vB.name}`, item: `${SITE_URL}/compare/${slug}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the price difference between ${vA.name} and ${vB.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The ${vA.name} starts at ${vA.variants?.[0]?.exShowroomPrice || "TBA"} (ex-showroom) while the ${vB.name} starts at ${vB.variants?.[0]?.exShowroomPrice || "TBA"} (ex-showroom). Prices may vary by city and variant.`,
        },
      },
      {
        "@type": "Question",
        name: `Which has better range — ${vA.name} or ${vB.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The ${vA.name} offers ${vA.performance?.drivingRange || "unspecified"} range while the ${vB.name} offers ${vB.performance?.drivingRange || "unspecified"} range on a full charge under standard test conditions.`,
        },
      },
      {
        "@type": "Question",
        name: `Which charges faster — ${vA.name} or ${vB.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${vA.name} DC fast charge time: ${vA.charging?.dcChargingTime || "not specified"}. ${vB.name} DC fast charge time: ${vB.charging?.dcChargingTime || "not specified"}. Both support home AC charging for overnight top-ups.`,
        },
      },
      {
        "@type": "Question",
        name: `Should I buy ${vA.name} or ${vB.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The best choice between ${vA.name} and ${vB.name} depends on your needs. The ${vA.name} starts at ${vA.variants?.[0]?.exShowroomPrice || "TBA"} with ${vA.performance?.drivingRange || "unspecified"} range, while the ${vB.name} starts at ${vB.variants?.[0]?.exShowroomPrice || "TBA"} with ${vB.performance?.drivingRange || "unspecified"} range. Compare the full specs, features, and after-sales service before deciding.`,
        },
      },
    ],
  };

  const vehicles = [vA, vB];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(makeProduct(vA)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(makeProduct(vB)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-gray-950 py-10">
          <div className="mx-auto max-w-5xl px-4">
            <nav className="mb-4 flex items-center gap-1.5 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={13} />
              <Link href="/compare" className="hover:text-white">Compare</Link>
              <ChevronRight size={13} />
              <span className="text-gray-200">{vA.name} vs {vB.name}</span>
            </nav>
            <h1 className="text-2xl font-black text-white md:text-4xl">
              {vA.name} <span className="text-green-400">vs</span> {vB.name}
            </h1>
            <p className="mt-2 text-sm text-gray-400 md:text-base">
              Side-by-side electric vehicle comparison — price, range, specs &amp; features ({year})
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">

          {/* Vehicle hero cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {vehicles.map((v, i) => (
              <div key={v.slug} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${i === 0 ? "border-green-200" : "border-blue-200"}`}>
                <div className="relative h-40 overflow-hidden bg-gray-100 sm:h-52">
                  {v.featuredImage ? (
                    <Image src={v.featuredImage} alt={v.name} fill className="object-contain p-3" sizes="(max-width: 640px) 50vw, 400px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300 text-3xl">⚡</div>
                  )}
                  <div className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${i === 0 ? "bg-green-600" : "bg-blue-600"}`}>
                    {i === 0 ? "EV 1" : "EV 2"}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold text-green-600">{v.brand}</p>
                  <h2 className="text-base font-black text-gray-900 sm:text-lg">{v.name}</h2>
                  <p className="mt-1 text-sm font-bold text-gray-700">{priceDisplay(v)}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      { icon: <BatteryCharging size={12} className="text-green-600" />, label: "Range",  val: v.performance?.drivingRange || v.variants?.[0]?.range || "—" },
                      { icon: <Zap             size={12} className="text-blue-600"  />, label: "Power",  val: v.performance?.power || "—" },
                      { icon: <Gauge           size={12} className="text-purple-600"/>, label: "Speed",  val: v.performance?.topSpeed || "—" },
                      { icon: <Clock3          size={12} className="text-orange-500"/>, label: "0–100",  val: v.performance?.acceleration || "—" },
                    ].map(({ icon, label, val }) => val !== "—" && (
                      <div key={label} className="rounded-xl bg-gray-50 p-2 text-center">
                        <div className="flex justify-center mb-0.5">{icon}</div>
                        <p className="text-[9px] text-gray-500">{label}</p>
                        <p className="text-[10px] font-black text-gray-900 leading-tight">{val}</p>
                      </div>
                    ))}
                  </div>
                  <Link href={`/${v.vehicleType === "car" ? "cars" : "bikes"}/${v.slug}`}
                    className="mt-3 block rounded-xl bg-gray-900 py-2 text-center text-xs font-bold text-white hover:bg-green-700 transition">
                    View Full Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Specs comparison table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
              <h2 className="text-base font-black text-gray-900">Specifications Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="w-40 p-4 text-left text-xs font-bold text-gray-400 sm:w-52">Specification</th>
                    <th className="p-4 text-center text-sm font-black text-green-700">{vA.name}</th>
                    <th className="p-4 text-center text-sm font-black text-blue-700">{vB.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {SPEC_ROWS.map(({ label, fn }, idx) => {
                    const aVal = fn(vA);
                    const bVal = fn(vB);
                    if (aVal === "—" && bVal === "—") return null;
                    return (
                      <tr key={label} className={`border-b border-gray-50 ${idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}>
                        <td className="p-3 text-xs font-semibold text-gray-500 sm:p-4 sm:text-sm">{label}</td>
                        <td className={`p-3 text-center text-xs font-medium sm:p-4 sm:text-sm ${aVal === "—" ? "text-gray-300" : "text-gray-800"}`}>{aVal}</td>
                        <td className={`p-3 text-center text-xs font-medium sm:p-4 sm:text-sm ${bVal === "—" ? "text-gray-300" : "text-gray-800"}`}>{bVal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key features */}
          {(vA.keyFeatures || vB.keyFeatures) && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <h2 className="text-base font-black text-gray-900">Key Features</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="w-40 p-4 text-left text-xs font-bold text-gray-400 sm:w-52">Feature</th>
                      <th className="p-4 text-center text-sm font-black text-green-700">{vA.name}</th>
                      <th className="p-4 text-center text-sm font-black text-blue-700">{vB.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KEY_FEATURES.map(([label, key], idx) => {
                      const aHas = !!vA.keyFeatures?.[key];
                      const bHas = !!vB.keyFeatures?.[key];
                      return (
                        <tr key={key} className={`border-b border-gray-50 ${idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}>
                          <td className="p-3 text-xs font-semibold text-gray-500 sm:p-4 sm:text-sm">{label}</td>
                          <td className="p-3 text-center sm:p-4">
                            {aHas ? <CheckCircle size={16} className="mx-auto text-green-500" /> : <XCircle size={16} className="mx-auto text-gray-200" />}
                          </td>
                          <td className="p-3 text-center sm:p-4">
                            {bHas ? <CheckCircle size={16} className="mx-auto text-green-500" /> : <XCircle size={16} className="mx-auto text-gray-200" />}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pros & Cons */}
          {(vA.pros?.length > 0 || vB.pros?.length > 0 || vA.cons?.length > 0 || vB.cons?.length > 0) && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <h2 className="text-base font-black text-gray-900">Pros &amp; Cons</h2>
              </div>
              <div className="grid gap-0 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {[vA, vB].map((v, i) => (
                  <div key={v.slug} className="p-5">
                    <p className={`mb-4 text-sm font-black ${i === 0 ? "text-green-700" : "text-blue-700"}`}>{v.name}</p>
                    {v.pros?.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-green-700">
                          <ThumbsUp size={12} /> Pros
                        </p>
                        <ul className="space-y-1.5">
                          {v.pros.map((p, j) => (
                            <li key={j} className="flex items-start gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-xs text-gray-700">
                              <span className="shrink-0 font-bold text-green-600">+</span>{p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {v.cons?.length > 0 && (
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-red-600">
                          <ThumbsDown size={12} /> Cons
                        </p>
                        <ul className="space-y-1.5">
                          {v.cons.map((c, j) => (
                            <li key={j} className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-gray-700">
                              <span className="shrink-0 font-bold text-red-500">–</span>{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editorial verdict — unique text per pair for Google indexing */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-black text-gray-900">
              {vA.name} vs {vB.name} — Which EV Should You Buy?
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              The <strong>{vA.name}</strong> by {vA.brand} and the <strong>{vB.name}</strong> by {vB.brand} are both
              compelling electric vehicles available in India in {year}. Here is how they compare across the key buying
              criteria Indian EV buyers care about most.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-2">{vA.name}</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li><strong>Starting price:</strong> {vA.variants?.[0]?.exShowroomPrice || "TBA"} (ex-showroom)</li>
                  {vA.performance?.drivingRange && <li><strong>Certified range:</strong> {vA.performance.drivingRange}</li>}
                  {vA.performance?.batteryCapacity && <li><strong>Battery:</strong> {vA.performance.batteryCapacity}</li>}
                  {vA.performance?.power && <li><strong>Motor power:</strong> {vA.performance.power}</li>}
                  {vA.variants?.length > 1 && <li><strong>Variants:</strong> {vA.variants.length} options available</li>}
                </ul>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">{vB.name}</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li><strong>Starting price:</strong> {vB.variants?.[0]?.exShowroomPrice || "TBA"} (ex-showroom)</li>
                  {vB.performance?.drivingRange && <li><strong>Certified range:</strong> {vB.performance.drivingRange}</li>}
                  {vB.performance?.batteryCapacity && <li><strong>Battery:</strong> {vB.performance.batteryCapacity}</li>}
                  {vB.performance?.power && <li><strong>Motor power:</strong> {vB.performance.power}</li>}
                  {vB.variants?.length > 1 && <li><strong>Variants:</strong> {vB.variants.length} options available</li>}
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Both the {vA.name} and {vB.name} are eligible for state EV subsidies under India&apos;s PM E-Drive scheme.
              Check the on-road price in your city using the links above before making a final decision. For the most
              current prices and availability, contact your nearest authorised {vA.brand} and {vB.brand} dealership.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${vA.vehicleType === "car" ? "cars" : "bikes"}/${vA.slug}`}
                className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition">
                Full {vA.name} Details →
              </Link>
              <Link href={`/${vB.vehicleType === "car" ? "cars" : "bikes"}/${vB.slug}`}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition">
                Full {vB.name} Details →
              </Link>
            </div>
          </div>

          {/* Compare another CTA */}
          <div className="rounded-2xl bg-gray-900 p-6 text-center">
            <p className="text-base font-bold text-white">Compare more EVs</p>
            <p className="mt-1 text-sm text-gray-400">Try a different combination</p>
            <Link href="/compare" rel="nofollow"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
              Open Compare Tool →
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
