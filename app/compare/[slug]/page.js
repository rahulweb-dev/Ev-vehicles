import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight, CheckCircle, XCircle, ThumbsUp, ThumbsDown,
  BatteryCharging, Gauge, Zap, Clock3, ArrowRight,
} from "lucide-react";
import { SITE_URL } from "@/app/layout";
import { parsePrice } from "@/lib/priceUtils";
import { COMPARISONS, findComparison, comparisonsFor } from "@/lib/comparisons";
import LeadButton from "@/components/LeadButton";

export const revalidate = 3600;

/* ─── Pre-build the curated pairs (each has hand-written editorial) ── */
export async function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
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

/* ─── Price helpers: lowest–highest numeric variant price ───────── */
function priceBounds(v) {
  const priced = (v.variants || [])
    .map((x) => ({ raw: x.exShowroomPrice, n: parsePrice(String(x.exShowroomPrice || "").replace(/\(.*?\)/g, "").split(/\s[-–]\s/)[0]) }))
    .filter((x) => x.n);
  if (!priced.length) return null;
  priced.sort((a, b) => a.n - b.n);
  return { min: priced[0], max: priced[priced.length - 1] };
}
function startingPrice(v) {
  return priceBounds(v)?.min.raw || v.variants?.[0]?.exShowroomPrice || "Price not announced";
}
function priceDisplay(v) {
  const b = priceBounds(v);
  if (!b) return v.variants?.[0]?.exShowroomPrice || "Price not announced";
  return b.max.n !== b.min.n ? `${b.min.raw} – ${b.max.raw}` : b.min.raw;
}
const detailHref = (v) => `/${v.vehicleType === "car" ? "cars" : v.vehicleType === "commercial" ? "commercial" : "bikes"}/${v.slug}`;

/* ─── Metadata ──────────────────────────────────────────────────── */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pair = parsePair(slug);
  if (!pair) return { title: "EV Comparison", robots: { index: false, follow: true } };

  const { comparison } = findComparison(pair[0], pair[1]);
  const canonicalSlug = comparison?.slug || slug;
  const [vA, vB] = await Promise.all([getVehicle(pair[0]), getVehicle(pair[1])]);
  if (!vA || !vB) return { title: "EV Comparison", robots: { index: false, follow: true } };

  const year  = new Date().getFullYear();
  const title = `${vA.name} vs ${vB.name} ${year} – Price, Range & Which to Buy`;
  const rangeA = vA.performance?.drivingRange || "";
  const rangeB = vB.performance?.drivingRange || "";
  const desc  = [
    `${vA.name} vs ${vB.name}: which should you buy in ${year}?`,
    `${vA.name} starts at ${startingPrice(vA)}${rangeA ? ` (${rangeA})` : ""};`,
    `${vB.name} starts at ${startingPrice(vB)}${rangeB ? ` (${rangeB})` : ""}.`,
    comparison ? "Key differences, real-world range and our verdict." : "Full specs side by side.",
  ].join(" ").slice(0, 300);
  const img = vA.featuredImage || vB.featuredImage || `${SITE_URL}/api/og?title=${encodeURIComponent(vA.name + " vs " + vB.name)}&subtitle=EV Comparison India ${year}&tag=cars&type=page`;

  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/compare/${canonicalSlug}` },
    // Only curated pairs (with editorial) are indexed; ad-hoc pairs are thin template pages.
    ...(comparison ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title, description: desc, url: `${SITE_URL}/compare/${canonicalSlug}`, type: "article", images: [{ url: img, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: desc, images: [img] },
  };
}

/* ─── Spec rows to compare ──────────────────────────────────────── */
const SPEC_ROWS = [
  { label: "Ex-Showroom Price",   fn: (v) => priceDisplay(v) },
  { label: "Variants",            fn: (v) => (v.variants?.length > 1 ? `${v.variants.length}` : "—") },
  { label: "Battery Capacity",    fn: (v) => v.performance?.batteryCapacity || v.variants?.[0]?.batteryCapacity || "—" },
  { label: "Claimed Range",       fn: (v) => v.performance?.drivingRange || v.variants?.[0]?.range || "—" },
  { label: "Real-World Range",    fn: (v) => v.performance?.realWorldRange || "—" },
  { label: "Motor Power",         fn: (v) => v.performance?.power || "—" },
  { label: "Torque",              fn: (v) => v.performance?.torque || "—" },
  { label: "Top Speed",           fn: (v) => v.performance?.topSpeed || "—" },
  { label: "Acceleration",        fn: (v) => v.performance?.acceleration || "—" },
  { label: "AC Charging Time",    fn: (v) => v.charging?.acChargingTime || "—" },
  { label: "DC Fast Charging",    fn: (v) => v.charging?.dcChargingTime || "—" },
  { label: "Safety Rating",       fn: (v) => v.safety?.safetyRating || "—" },
  { label: "Airbags",             fn: (v) => v.safety?.airbags || "—" },
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

/* ─── Page ──────────────────────────────────────────────────────── */
export default async function ComparePairPage({ params }) {
  const { slug } = await params;
  const pair = parsePair(slug);
  if (!pair) notFound();

  // Curated pair requested in reverse order → one canonical URL per pair
  const { comparison: c, reversed } = findComparison(pair[0], pair[1]);
  if (reversed) permanentRedirect(`/compare/${c.slug}`);

  const [vA, vB] = await Promise.all([getVehicle(pair[0]), getVehicle(pair[1])]);
  if (!vA || !vB) notFound();

  const year = new Date().getFullYear();
  const isTwoWheeler = vA.vehicleType === "bike" && vB.vehicleType === "bike";

  /* JSON-LD: two Product schemas + BreadcrumbList + FAQPage */
  const makeProduct = (v) => {
    const b = priceBounds(v);
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name:  v.name,
      brand: { "@type": "Brand", name: v.brand },
      image: v.featuredImage || "",
      description: v.shortDescription || v.metaDescription || `${v.name} electric vehicle`,
      ...(b ? { offers: b.max.n !== b.min.n
        ? { "@type": "AggregateOffer", priceCurrency: "INR", lowPrice: b.min.n, highPrice: b.max.n, offerCount: v.variants.length }
        : { "@type": "Offer", priceCurrency: "INR", price: b.min.n, availability: "https://schema.org/InStock" } } : {}),
    };
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",    item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare` },
      { "@type": "ListItem", position: 3, name: `${vA.name} vs ${vB.name}`, item: `${SITE_URL}/compare/${slug}` },
    ],
  };

  const faqs = c?.faqs?.length ? c.faqs : [
    {
      question: `What is the price difference between ${vA.name} and ${vB.name}?`,
      answer: `The ${vA.name} costs ${priceDisplay(vA)} (ex-showroom) and the ${vB.name} costs ${priceDisplay(vB)} (ex-showroom). On-road prices vary by city.`,
    },
    ...(vA.performance?.drivingRange && vB.performance?.drivingRange ? [{
      question: `Which has more range — ${vA.name} or ${vB.name}?`,
      answer: `The ${vA.name} has a claimed range of ${vA.performance.drivingRange} and the ${vB.name} ${vB.performance.drivingRange}. Real-world range is usually 20–30% lower than the claimed figure.`,
    }] : []),
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  const vehicles = [vA, vB];
  const related = [...comparisonsFor(vA.slug), ...comparisonsFor(vB.slug)]
    .filter((x, i, arr) => x.slug !== (c?.slug || slug) && arr.findIndex((y) => y.slug === x.slug) === i)
    .slice(0, 6);
  // Names for related links come from the slugs' curated pages; fall back to prettified slugs
  const pretty = (s) => s.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()).replace(/\bEv\b/g, "EV");

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
              Price, range, specs and which one to buy ({year})
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">

          {/* Intro (curated pairs) */}
          {c?.intro && (
            <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-700 shadow-sm sm:text-base">{c.intro}</p>
          )}

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
                      { icon: <Clock3          size={12} className="text-orange-500"/>, label: "Accel.", val: v.performance?.acceleration || "—" },
                    ].map(({ icon, label, val }) => val !== "—" && (
                      <div key={label} className="rounded-xl bg-gray-50 p-2 text-center">
                        <div className="flex justify-center mb-0.5">{icon}</div>
                        <p className="text-[9px] text-gray-500">{label}</p>
                        <p className="text-[10px] font-black text-gray-900 leading-tight">{val}</p>
                      </div>
                    ))}
                  </div>
                  <LeadButton vehicleName={v.name} vehicleSlug={v.slug} vehicleType={v.vehicleType} source="compare-page"
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2 text-xs font-bold text-white hover:bg-green-700 transition" />
                  <Link href={detailHref(v)}
                    className="mt-2 block rounded-xl bg-gray-900 py-2 text-center text-xs font-bold text-white hover:bg-gray-700 transition">
                    View Full Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Key differences (curated) */}
          {c?.differences?.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-black text-gray-900">Key Differences</h2>
              <ul className="space-y-2">
                {c.differences.map((d, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-gray-700">
                    <ArrowRight size={15} className="mt-0.5 shrink-0 text-green-600" />{d}
                  </li>
                ))}
              </ul>
            </div>
          )}

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

          {/* Key features (cars only — the flags don't apply to two-wheelers) */}
          {!isTwoWheeler && (vA.keyFeatures || vB.keyFeatures) && (
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
                          {v.cons.map((x, j) => (
                            <li key={j} className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-gray-700">
                              <span className="shrink-0 font-bold text-red-500">–</span>{x}
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

          {/* Verdict */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-black text-gray-900">
              {vA.name} vs {vB.name} — Which Should You Buy?
            </h2>
            {c ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-2">Buy the {vA.name} if…</p>
                    <p className="text-sm leading-relaxed text-gray-700">{c.buyA}</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">Buy the {vB.name} if…</p>
                    <p className="text-sm leading-relaxed text-gray-700">{c.buyB}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-800"><strong>Our verdict:</strong> {c.verdict}</p>
              </>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {[vA, vB].map((v, i) => (
                  <div key={v.slug} className={`rounded-xl border p-4 ${i === 0 ? "bg-green-50 border-green-100" : "bg-blue-50 border-blue-100"}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${i === 0 ? "text-green-700" : "text-blue-700"}`}>{v.name}</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li><strong>Price:</strong> {priceDisplay(v)} (ex-showroom)</li>
                      {v.performance?.drivingRange && <li><strong>Claimed range:</strong> {v.performance.drivingRange}</li>}
                      {v.performance?.realWorldRange && <li><strong>Real-world range:</strong> {v.performance.realWorldRange}</li>}
                      {v.performance?.batteryCapacity && <li><strong>Battery:</strong> {v.performance.batteryCapacity}</li>}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Prices are ex-showroom and were last checked in {new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}.
              {isTwoWheeler ? " Electric two-wheelers are eligible for the PM E-Drive purchase incentive (until March 2028), which is already reflected in ex-showroom prices." : ""}
              {" "}Check the on-road price in your city before deciding.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={detailHref(vA)} className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition">
                Full {vA.name} Details →
              </Link>
              <Link href={detailHref(vB)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition">
                Full {vB.name} Details →
              </Link>
            </div>
          </div>

          {/* FAQs */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-black text-gray-900">Frequently Asked Questions</h2>
            <div className="divide-y divide-gray-100">
              {faqs.map((f, i) => (
                <details key={i} className="group py-3" open={i === 0}>
                  <summary className="cursor-pointer list-none text-sm font-bold text-gray-900 group-open:text-green-700">{f.question}</summary>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Related comparisons (internal links) */}
          {related.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-base font-black text-gray-900">Related Comparisons</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {related.map((r) => (
                  <Link key={r.slug} href={`/compare/${r.slug}`}
                    className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-400 hover:text-green-700 transition">
                    {r.nameA || pretty(r.a)} vs {r.nameB || pretty(r.b)}
                    <ChevronRight size={14} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Compare another CTA */}
          <div className="rounded-2xl bg-gray-900 p-6 text-center">
            <p className="text-base font-bold text-white">Compare more EVs</p>
            <p className="mt-1 text-sm text-gray-400">Try a different combination</p>
            <Link href="/compare"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
              Open Compare Tool →
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
