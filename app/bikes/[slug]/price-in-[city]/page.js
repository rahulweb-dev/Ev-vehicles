import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MapPin, CheckCircle, Info } from "lucide-react";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

const CITIES = {
  mumbai:     { name: "Mumbai",     state: "Maharashtra",    roadTaxPct: 0, regFeePct: 1, insurance: 4000, handling: 3000, notes: "Maharashtra waives road tax on electric two-wheelers." },
  delhi:      { name: "Delhi",      state: "Delhi",          roadTaxPct: 0, regFeePct: 0, insurance: 3500, handling: 2500, notes: "Delhi offers 100% road tax and registration fee waiver on electric two-wheelers plus up to ₹30,000 subsidy." },
  bangalore:  { name: "Bangalore",  state: "Karnataka",      roadTaxPct: 0, regFeePct: 1, insurance: 3800, handling: 2800, notes: "Karnataka provides 100% road tax waiver on electric two-wheelers." },
  hyderabad:  { name: "Hyderabad",  state: "Telangana",      roadTaxPct: 0, regFeePct: 1, insurance: 3800, handling: 2800, notes: "Telangana provides 100% road tax waiver on electric two-wheelers." },
  chennai:    { name: "Chennai",    state: "Tamil Nadu",     roadTaxPct: 0, regFeePct: 1, insurance: 3600, handling: 2700, notes: "Tamil Nadu waives road tax on electric two-wheelers." },
  pune:       { name: "Pune",       state: "Maharashtra",    roadTaxPct: 0, regFeePct: 1, insurance: 3500, handling: 2500, notes: "Maharashtra waives road tax on electric two-wheelers." },
  ahmedabad:  { name: "Ahmedabad",  state: "Gujarat",        roadTaxPct: 0, regFeePct: 1, insurance: 3200, handling: 2500, notes: "Gujarat offers road tax exemption and ₹10,000–20,000 subsidy on electric two-wheelers." },
  kolkata:    { name: "Kolkata",    state: "West Bengal",    roadTaxPct: 2, regFeePct: 1, insurance: 3000, handling: 2500, notes: "West Bengal charges a reduced road tax rate on electric two-wheelers." },
  jaipur:     { name: "Jaipur",     state: "Rajasthan",      roadTaxPct: 0, regFeePct: 1, insurance: 3000, handling: 2200, notes: "Rajasthan waives road tax on electric two-wheelers and provides ₹10,000 subsidy." },
  lucknow:    { name: "Lucknow",    state: "Uttar Pradesh",  roadTaxPct: 0, regFeePct: 1, insurance: 2800, handling: 2200, notes: "UP waives road tax on electric two-wheelers and provides ₹5,000 subsidy." },
  chandigarh: { name: "Chandigarh", state: "Chandigarh",     roadTaxPct: 0, regFeePct: 1, insurance: 2800, handling: 2000, notes: "Chandigarh UT provides 100% road tax exemption on electric two-wheelers." },
  bhopal:     { name: "Bhopal",     state: "Madhya Pradesh", roadTaxPct: 0, regFeePct: 1, insurance: 2800, handling: 2200, notes: "Madhya Pradesh provides road tax exemption on electric two-wheelers." },
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
    return await Vehicle.findOne({ slug, vehicleType: "bike", status: "published" })
      .select("name brand slug featuredImage variants performance specs availability")
      .lean();
  } catch { return null; }
}

export async function generateStaticParams() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const bikes = await Vehicle.find({ vehicleType: "bike", status: "published" }).select("slug").lean();
    return bikes.flatMap(b => Object.keys(CITIES).map(city => ({ slug: b.slug, city })));
  } catch { return []; }
}

export async function generateMetadata({ params }) {
  const { slug, city } = await params;
  const cityData = CITIES[city];
  if (!cityData) return { title: "Page Not Found" };
  const bike = await getVehicle(slug);
  if (!bike) return { title: "Bike Not Found" };
  const price = bike.variants?.[0]?.exShowroomPrice || "";
  const year  = new Date().getFullYear();
  const title = `${bike.name} On-Road Price in ${cityData.name} ${year} – Road Tax, Registration & Insurance | EV News India`;
  const desc  = `${bike.name} on-road price in ${cityData.name}. Includes ex-showroom${price ? " " + price : ""}, road tax (${cityData.roadTaxPct}%), registration fee, and insurance. Full cost breakdown for ${cityData.name}.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/bikes/${slug}/price-in-${city}` },
    ...(!price && { robots: { index: false, follow: true } }),
    openGraph: { title, description: desc, url: `${SITE_URL}/bikes/${slug}/price-in-${city}`, type: "website", images: bike.featuredImage ? [{ url: bike.featuredImage }] : [] },
  };
}

export default async function BikeCityPricePage({ params }) {
  const { slug, city } = await params;
  const cityData = CITIES[city];
  if (!cityData) notFound();
  const bike = await getVehicle(slug);
  if (!bike) notFound();

  const basePrice = parsePriceNum(bike.variants?.[0]?.exShowroomPrice);
  const roadTax   = Math.round(basePrice * cityData.roadTaxPct / 100);
  const regFee    = Math.round(basePrice * cityData.regFeePct / 100);
  const insurance = cityData.insurance;
  const handling  = cityData.handling;
  const onRoad    = basePrice + roadTax + regFee + insurance + handling;
  const year      = new Date().getFullYear();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bike.name,
    brand: { "@type": "Brand", name: bike.brand },
    url:  `${SITE_URL}/bikes/${slug}`,
    image: bike.featuredImage ? [bike.featuredImage] : [],
    offers: {
      "@type":       "Offer",
      priceCurrency: "INR",
      price:         basePrice || undefined,
      availability:  "https://schema.org/InStock",
      areaServed:    { "@type": "City", name: cityData.name, addressRegion: cityData.state, addressCountry: "IN" },
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the on-road price of ${bike.name} in ${cityData.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: onRoad ? `The estimated on-road price of ${bike.name} in ${cityData.name} is ${fmtINR(onRoad)}, including ex-showroom price of ${fmtINR(basePrice)}, ${cityData.roadTaxPct}% road tax, ${cityData.regFeePct}% registration fee, insurance and handling.` : `Contact your nearest ${bike.brand} dealer in ${cityData.name} for the exact on-road price.`,
        },
      },
      {
        "@type": "Question",
        name: `Is road tax waived on ${bike.name} in ${cityData.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: cityData.roadTaxPct === 0 ? `Yes, road tax is completely waived on electric two-wheelers in ${cityData.name}. ${cityData.notes}` : `Road tax on electric two-wheelers in ${cityData.name} is ${cityData.roadTaxPct}%, which amounts to approximately ${fmtINR(roadTax)}.`,
        },
      },
      {
        "@type": "Question",
        name: `Are there subsidies available for ${bike.name} in ${cityData.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${cityData.notes} Additionally, the central government's PM E-DRIVE scheme provides up to ₹10,000 subsidy on electric two-wheelers. Check with your dealer for the latest combined subsidy applicable in ${cityData.name}.`,
        },
      },
    ],
  };

  const rows = [
    { label: "Ex-Showroom Price",  value: fmtINR(basePrice) },
    { label: `Road Tax (${cityData.roadTaxPct}%)`, value: cityData.roadTaxPct === 0 ? "₹0 (Waived)" : fmtINR(roadTax), highlight: cityData.roadTaxPct === 0 },
    { label: `Registration Fee (~${cityData.regFeePct}%)`, value: cityData.regFeePct === 0 ? "₹0 (Waived)" : fmtINR(regFee), highlight: cityData.regFeePct === 0 },
    { label: "Insurance (1st year)", value: fmtINR(insurance) },
    { label: "Handling Charges", value: fmtINR(handling) },
    { label: `On-Road Price — ${cityData.name}`, value: fmtINR(onRoad), total: true },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main className="min-h-screen bg-gray-50 pb-16">
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
              <Link href="/" className="hover:text-green-600">Home</Link>
              <ChevronRight size={11} />
              <Link href="/bikes" className="hover:text-green-600">Electric Bikes</Link>
              <ChevronRight size={11} />
              <Link href={`/bikes/${slug}`} className="hover:text-green-600">{bike.name}</Link>
              <ChevronRight size={11} />
              <span className="text-gray-800 font-semibold">Price in {cityData.name}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                  <MapPin size={12} /> {cityData.name}, {cityData.state}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
                {bike.name} On-Road Price in {cityData.name} {year}
              </h1>
              <p className="mt-2 text-sm text-gray-500">Complete price breakdown including road tax, registration, insurance and handling charges.</p>

              {cityData.roadTaxPct === 0 && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <CheckCircle size={14} className="text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{cityData.notes}</p>
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="font-black text-gray-900">{bike.name} Price Breakdown — {cityData.name}</h2>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className={row.total ? "bg-green-50 font-black" : i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                        <td className={`px-5 py-3.5 ${row.total ? "text-green-800 font-black" : "text-gray-700"}`}>
                          {row.highlight && <CheckCircle size={12} className="inline text-green-500 mr-1.5" />}
                          {row.label}
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
                    Prices are indicative estimates. Contact your nearest {bike.brand} dealer in {cityData.name} for exact pricing and available offers.
                  </p>
                </div>
              </div>

              {/* FAQ */}
              <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="font-black text-gray-900 mb-4">FAQs — {bike.name} Price in {cityData.name}</h2>
                {faqJsonLd.mainEntity.map((faq, i) => (
                  <details key={i} className="border-b border-gray-100 last:border-0 py-3">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-800">{faq.name}</summary>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.acceptedAnswer.text}</p>
                  </details>
                ))}
              </section>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">On-Road Price</p>
                <p className="text-3xl font-black text-green-800">{fmtINR(onRoad)}</p>
                <p className="text-xs text-green-600 mt-1">in {cityData.name} (approx.)</p>
                <Link href={`/bikes/${slug}`} className="mt-4 block rounded-xl bg-green-600 py-2.5 text-sm font-black text-white hover:bg-green-700 transition">
                  View Full Specs →
                </Link>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <h3 className="font-black text-gray-800 text-sm mb-3">Price in Other Cities</h3>
                <div className="space-y-1">
                  {Object.entries(CITIES).filter(([k]) => k !== city).slice(0, 8).map(([key, c]) => (
                    <Link key={key} href={`/bikes/${slug}/price-in-${key}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition">
                      <span className="flex items-center gap-1.5"><MapPin size={10} />{c.name}</span>
                      <ChevronRight size={11} className="text-gray-300" />
                    </Link>
                  ))}
                </div>
              </div>

              <Link href="/ev-subsidy" className="block rounded-2xl border border-blue-100 bg-blue-50 p-4 hover:border-blue-300 transition">
                <p className="font-black text-blue-800 text-sm mb-1">Check State EV Subsidies</p>
                <p className="text-xs text-blue-600">Get additional ₹5,000–30,000 subsidy in your state</p>
              </Link>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
