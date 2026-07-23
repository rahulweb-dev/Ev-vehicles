import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MapPin, IndianRupee, CheckCircle, Info } from "lucide-react";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

/* ─── City data ──────────────────────────────────────────────────── */
const CITIES = {
  mumbai:     { name: "Mumbai",     state: "Maharashtra", roadTaxPct: 0,   regFeePct: 2, insurance: 15000, handling: 10000, notes: "Maharashtra provides 100% road tax exemption on EVs. Registration fee applies." },
  delhi:      { name: "Delhi",      state: "Delhi",       roadTaxPct: 0,   regFeePct: 0, insurance: 13000, handling: 8000,  notes: "Delhi offers 100% road tax and registration fee waiver on EVs under its EV Policy." },
  bangalore:  { name: "Bangalore",  state: "Karnataka",   roadTaxPct: 0,   regFeePct: 2, insurance: 14000, handling: 9000,  notes: "Karnataka provides 100% road tax waiver on EVs. Registration fee of ~2% applies." },
  hyderabad:  { name: "Hyderabad",  state: "Telangana",   roadTaxPct: 0,   regFeePct: 2, insurance: 14000, handling: 9000,  notes: "Telangana provides 100% road tax waiver on EVs. Standard registration fee applies." },
  chennai:    { name: "Chennai",    state: "Tamil Nadu",  roadTaxPct: 0,   regFeePct: 2, insurance: 13500, handling: 9000,  notes: "Tamil Nadu provides 100% road tax exemption on EVs. Registration fee applies." },
  pune:       { name: "Pune",       state: "Maharashtra", roadTaxPct: 0,   regFeePct: 2, insurance: 13000, handling: 8500,  notes: "Maharashtra waives road tax on EVs. Pune buyers get 100% road tax waiver + EV subsidy." },
  ahmedabad:  { name: "Ahmedabad",  state: "Gujarat",     roadTaxPct: 0,   regFeePct: 2, insurance: 12500, handling: 8000,  notes: "Gujarat offers 50% road tax concession on EVs plus state subsidy up to ₹1.5 lakh." },
  kolkata:    { name: "Kolkata",    state: "West Bengal", roadTaxPct: 3,   regFeePct: 2, insurance: 12000, handling: 8500,  notes: "West Bengal charges a reduced road tax rate for EVs compared to petrol vehicles." },
  jaipur:     { name: "Jaipur",     state: "Rajasthan",   roadTaxPct: 0,   regFeePct: 1, insurance: 11500, handling: 8000,  notes: "Rajasthan provides 100% road tax exemption on EVs. Low registration fee applies." },
  lucknow:    { name: "Lucknow",    state: "Uttar Pradesh", roadTaxPct: 0, regFeePct: 1, insurance: 11000, handling: 8000,  notes: "UP provides 100% road tax exemption on EVs under its EV Policy 2022." },
  chandigarh: { name: "Chandigarh", state: "Chandigarh",  roadTaxPct: 0,   regFeePct: 1, insurance: 11000, handling: 7500,  notes: "Chandigarh UT offers full road tax exemption on EVs and reduced registration charges." },
  bhopal:     { name: "Bhopal",     state: "Madhya Pradesh", roadTaxPct: 0, regFeePct: 2, insurance: 11000, handling: 7500, notes: "Madhya Pradesh provides road tax exemption on EVs. Standard registration applies." },
};

const NEARBY = {
  mumbai:     ["pune", "ahmedabad"],
  delhi:      ["jaipur", "lucknow", "chandigarh"],
  bangalore:  ["hyderabad", "chennai"],
  hyderabad:  ["bangalore", "chennai"],
  chennai:    ["bangalore", "hyderabad"],
  pune:       ["mumbai", "ahmedabad"],
  ahmedabad:  ["mumbai", "jaipur"],
  kolkata:    ["lucknow"],
  jaipur:     ["delhi", "ahmedabad"],
  lucknow:    ["delhi", "kolkata"],
  chandigarh: ["delhi"],
  bhopal:     ["lucknow", "jaipur"],
};

function parsePriceNum(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[₹,\s]/g, "").toLowerCase();
  const m = cleaned.match(/([\d.]+)\s*(lakh|l|cr|crore)?/);
  if (!m) return 0;
  const num = parseFloat(m[1]);
  const unit = m[2] || "";
  if (unit.startsWith("cr")) return Math.round(num * 10000000);
  if (unit === "lakh" || unit === "l") return Math.round(num * 100000);
  return Math.round(num);
}

function fmtINR(n) {
  if (!n) return "TBA";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} Lakh`;
  return `₹${new Intl.NumberFormat("en-IN").format(n)}`;
}

async function getVehicle(slug) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    return await Vehicle.findOne({ slug, vehicleType: "car", status: "published" })
      .select("name brand slug featuredImage variants performance specs availability metaTitle")
      .lean();
  } catch { return null; }
}

export async function generateStaticParams() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const cars = await Vehicle.find({ vehicleType: "car", status: "published" }).select("slug").lean();
    return cars.flatMap(c => Object.keys(CITIES).map(city => ({ slug: c.slug, city })));
  } catch { return []; }
}

export async function generateMetadata({ params }) {
  const { slug, city } = await params;
  const cityData = CITIES[city];
  if (!cityData) return { title: "Page Not Found" };
  const car = await getVehicle(slug);
  if (!car) return { title: "Car Not Found" };

  const price = car.variants?.[0]?.exShowroomPrice || "";
  const title = `${car.name} On-Road Price in ${cityData.name} ${new Date().getFullYear()} – Road Tax, Registration & Insurance | EV News India`;
  const desc  = `${car.name} on-road price in ${cityData.name} (${cityData.state}). Includes ex-showroom price${price ? " starting at " + price : ""}, road tax (${cityData.roadTaxPct}%), registration fee, and insurance. Full cost breakdown for ${cityData.name} buyers.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/cars/${slug}/price-in-${city}` },
    ...(!price && { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description: desc,
      url:  `${SITE_URL}/cars/${slug}/price-in-${city}`,
      type: "website",
      images: car.featuredImage ? [{ url: car.featuredImage, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function CarCityPricePage({ params }) {
  const { slug, city } = await params;
  const cityData = CITIES[city];
  if (!cityData) notFound();
  const car = await getVehicle(slug);
  if (!car) notFound();

  const basePrice  = parsePriceNum(car.variants?.[0]?.exShowroomPrice);
  const roadTax    = Math.round(basePrice * cityData.roadTaxPct / 100);
  const regFee     = Math.round(basePrice * cityData.regFeePct / 100);
  const insurance  = cityData.insurance;
  const handling   = cityData.handling;
  const onRoad     = basePrice + roadTax + regFee + insurance + handling;

  const year = new Date().getFullYear();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "Product",
    name:       car.name,
    brand:      { "@type": "Brand", name: car.brand },
    description: `${car.name} on-road price in ${cityData.name}`,
    image:      car.featuredImage ? [car.featuredImage] : [],
    url:        `${SITE_URL}/cars/${slug}`,
    offers: {
      "@type":       "Offer",
      priceCurrency: "INR",
      price:         basePrice || undefined,
      priceValidUntil: `${year + 1}-12-31`,
      availability:  "https://schema.org/InStock",
      areaServed:    { "@type": "City", name: cityData.name, addressRegion: cityData.state, addressCountry: "IN" },
      url: `${SITE_URL}/cars/${slug}/price-in-${city}`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the on-road price of ${car.name} in ${cityData.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: onRoad
            ? `The on-road price of ${car.name} in ${cityData.name} is approximately ${fmtINR(onRoad)}, which includes ex-showroom price of ${fmtINR(basePrice)}, road tax (${cityData.roadTaxPct}%), registration fee, insurance, and handling charges.`
            : `The on-road price of ${car.name} in ${cityData.name} includes ex-showroom price, road tax (${cityData.roadTaxPct}%), registration fee of approximately ${cityData.regFeePct}%, insurance (~₹${(insurance / 1000).toFixed(0)}K), and dealer handling charges.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the road tax for ${car.name} in ${cityData.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: cityData.roadTaxPct === 0
            ? `There is 0% road tax on the ${car.name} in ${cityData.name}. ${cityData.notes}`
            : `The road tax for ${car.name} in ${cityData.name} is ${cityData.roadTaxPct}% of the ex-showroom price, approximately ${fmtINR(roadTax)}.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${car.name} available in ${cityData.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, the ${car.name} is available at authorised ${car.brand} dealerships in ${cityData.name}, ${cityData.state}. Contact your nearest dealer for exact on-road pricing and test drive booking.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the EMI for ${car.name} in ${cityData.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: onRoad
            ? `Assuming a 20% down payment, 9% interest rate and 5-year tenure, the EMI for ${car.name} in ${cityData.name} would be approximately ₹${Math.round(((onRoad * 0.8) * (0.09 / 12) * Math.pow(1 + 0.09 / 12, 60)) / (Math.pow(1 + 0.09 / 12, 60) - 1)).toLocaleString("en-IN")}/month. Use our EMI calculator for exact figures.`
            : `Use our EV EMI calculator to calculate the exact monthly EMI for ${car.name} in ${cityData.name} based on your down payment and loan tenure.`,
        },
      },
    ],
  };

  const breakdownRows = [
    { label: "Ex-Showroom Price",  value: fmtINR(basePrice), note: "Base price (all variants start here)" },
    { label: `Road Tax (${cityData.roadTaxPct}%)`, value: cityData.roadTaxPct === 0 ? "₹0 (Waived)" : fmtINR(roadTax), note: `${cityData.state} EV road tax rate`, highlight: cityData.roadTaxPct === 0 },
    { label: `Registration Fee (~${cityData.regFeePct}%)`, value: cityData.regFeePct === 0 ? "₹0 (Waived)" : fmtINR(regFee), note: "RTO registration charges", highlight: cityData.regFeePct === 0 },
    { label: "Insurance (1-yr comprehensive)", value: fmtINR(insurance), note: "Approximate. Varies by insurer." },
    { label: "Dealer Handling / Logistics", value: fmtINR(handling), note: "Varies by dealership" },
    { label: `On-Road Price in ${cityData.name}`, value: fmtINR(onRoad), total: true },
  ];

  const nearby = (NEARBY[city] || []).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main className="min-h-screen bg-gray-50 pb-16">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
              <Link href="/" className="hover:text-green-600">Home</Link>
              <ChevronRight size={11} />
              <Link href="/cars" className="hover:text-green-600">Electric Cars</Link>
              <ChevronRight size={11} />
              <Link href={`/cars/${slug}`} className="hover:text-green-600">{car.name}</Link>
              <ChevronRight size={11} />
              <span className="text-gray-800 font-semibold">Price in {cityData.name}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              {/* Hero */}
              <div className="flex items-start gap-3 mb-6">
                <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 shrink-0">
                  <MapPin size={12} /> {cityData.name}
                </div>
              </div>
              <h1 className="text-2xl font-black text-gray-900 leading-tight sm:text-3xl">
                {car.name} On-Road Price in {cityData.name} {year}
              </h1>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                Complete on-road price breakdown for {car.name} in {cityData.name}, {cityData.state} — including road tax, RTO registration, insurance and dealer handling charges.
              </p>

              {/* EV badge */}
              {cityData.roadTaxPct === 0 && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <CheckCircle size={15} className="text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800"><strong>EV Benefit:</strong> {cityData.notes}</p>
                </div>
              )}

              {/* Price table */}
              <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="font-black text-gray-900">{car.name} Price Breakdown — {cityData.name}</h2>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {breakdownRows.map((row, i) => (
                      <tr key={i} className={row.total ? "bg-green-50 font-black text-green-800" : i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {row.highlight && <CheckCircle size={13} className="text-green-500 shrink-0" />}
                            <span className={row.total ? "font-black text-green-800" : "text-gray-700"}>{row.label}</span>
                          </div>
                          {row.note && !row.total && <p className="text-[10px] text-gray-400 mt-0.5 ml-5">{row.note}</p>}
                        </td>
                        <td className={`px-5 py-3.5 text-right font-bold whitespace-nowrap ${row.total ? "text-xl text-green-800" : row.highlight ? "text-green-700" : "text-gray-900"}`}>
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-gray-100 px-5 py-3 bg-yellow-50">
                  <p className="text-xs text-yellow-800 flex items-start gap-1.5">
                    <Info size={12} className="shrink-0 mt-0.5" />
                    Prices are indicative. Contact your nearest {car.brand} showroom in {cityData.name} for exact on-road pricing including current offers and state subsidies.
                  </p>
                </div>
              </div>

              {/* Variants */}
              {car.variants?.length > 1 && (
                <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="font-black text-gray-900">{car.name} Variant-wise Price in {cityData.name}</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {car.variants.map((v, i) => {
                      const vBase = parsePriceNum(v.exShowroomPrice);
                      const vOnRoad = vBase + Math.round(vBase * cityData.roadTaxPct / 100) + Math.round(vBase * cityData.regFeePct / 100) + insurance + handling;
                      return (
                        <div key={i} className="flex items-center justify-between px-5 py-4">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{v.name || `Variant ${i + 1}`}</p>
                            {v.exShowroomPrice && <p className="text-xs text-gray-400">Ex-showroom: {v.exShowroomPrice}</p>}
                          </div>
                          <div className="text-right">
                            <p className="font-black text-gray-900">{fmtINR(vOnRoad)}</p>
                            <p className="text-[10px] text-gray-400">on-road est.</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FAQ */}
              <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="font-black text-gray-900 mb-4">{car.name} Price in {cityData.name} — FAQs</h2>
                {faqJsonLd.mainEntity.map((faq, i) => (
                  <details key={i} className="border-b border-gray-100 last:border-0 py-3">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-800">{faq.name}</summary>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.acceptedAnswer.text}</p>
                  </details>
                ))}
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              {/* Quick price card */}
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">On-Road Price</p>
                <p className="text-3xl font-black text-green-800">{fmtINR(onRoad)}</p>
                <p className="text-xs text-green-600 mt-1">in {cityData.name} (approx.)</p>
                <Link href={`/cars/${slug}`}
                  className="mt-4 block rounded-xl bg-green-600 py-2.5 text-sm font-black text-white hover:bg-green-700 transition">
                  View Full Specs →
                </Link>
                <Link href="/emi-calculator"
                  className="mt-2 block rounded-xl border border-green-300 py-2.5 text-sm font-bold text-green-700 hover:bg-green-100 transition">
                  Calculate EMI
                </Link>
              </div>

              {/* Key specs */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <h3 className="font-black text-gray-800 text-sm mb-3">Quick Specs</h3>
                {[
                  { label: "Range", value: car.performance?.drivingRange },
                  { label: "Battery", value: car.performance?.batteryCapacity },
                  { label: "Power",  value: car.performance?.power },
                  { label: "0–100 km/h", value: car.performance?.acceleration },
                ].filter(s => s.value).map(s => (
                  <div key={s.label} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500">{s.label}</span>
                    <span className="font-bold text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Price in other cities */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <h3 className="font-black text-gray-800 text-sm mb-3">{car.name} Price in Other Cities</h3>
                <div className="space-y-1.5">
                  {Object.entries(CITIES).filter(([key]) => key !== city).slice(0, 6).map(([key, c]) => (
                    <Link key={key} href={`/cars/${slug}/price-in-${key}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition">
                      <span className="flex items-center gap-1.5"><MapPin size={11} />{c.name}</span>
                      <ChevronRight size={11} className="text-gray-300" />
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
