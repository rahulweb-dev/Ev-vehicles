import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import ArticlesFeed from "@/components/skeletons/ArticlesFeed";
import { SITE_URL } from "../layout";
import BikesClient from "./BikesClient";

export const revalidate = 60;

async function getInitialBikes() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const vehicles = await Vehicle.find({ status: "published", vehicleType: "bike" })
      .select("slug name brand featuredImage variants performance featured category colors")
      .sort({ featured: -1, name: 1 })
      .lean();
    return vehicles.map(v => ({
      slug:          v.slug,
      name:          v.name,
      brand:         v.brand,
      featuredImage: v.featuredImage || null,
      variants:      (v.variants || []).map(vr => ({
        exShowroomPrice: vr.exShowroomPrice || null,
        range:           vr.range           || null,
        batteryCapacity: vr.batteryCapacity || null,
      })),
      performance: {
        drivingRange:    v.performance?.drivingRange    || null,
        batteryCapacity: v.performance?.batteryCapacity || null,
        power:           v.performance?.power           || null,
        topSpeed:        v.performance?.topSpeed        || null,
      },
      featured: !!v.featured,
      category: v.category  || "",
      colors:   (v.colors   || []).map(c =>
        typeof c === "string" ? { name: c, hex: "#888" } : { name: c.name || "", hex: c.hexCode || "#888" }
      ),
    }));
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Electric Bikes & Scooters in India 2026 – Price, Range & Specs | EV Radar",
  description:
    "Compare all electric scooters and bikes in India 2026. Filter by budget, brand, range and battery. Ather 450X, Ola S1 Pro, TVS iQube, Bajaj Chetak and more.",
  keywords: "electric bikes india 2026, electric scooters india, best electric scooter india, ola s1 pro price, ather 450x price, tvs iqube price, electric two wheeler india, electric bike price india",
  alternates: { canonical: `${SITE_URL}/bikes` },
  openGraph: {
    title: "Electric Bikes & Scooters in India 2026 – Price, Range & Specs",
    description: "Compare all electric scooters and bikes in India. Ather 450X, Ola S1 Pro, TVS iQube, Bajaj Chetak and more.",
    url: `${SITE_URL}/bikes`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=Electric Bikes %26 Scooters 2026&subtitle=Compare by price, range %26 battery&tag=bikes&type=page`, width: 1200, height: 630, alt: "Electric Bikes & Scooters in India 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Electric Bikes & Scooters in India 2026",
    description: "Compare all electric scooters and bikes in India. Ather, Ola, TVS, Bajaj and more.",
    images: [`${SITE_URL}/api/og?title=Electric Bikes %26 Scooters 2026&subtitle=Compare by price, range %26 battery&tag=bikes&type=page`],
  },
};

export default async function BikesPage({ searchParams }) {
  const sp     = await searchParams;
  const brand  = sp?.brand  || null;
  const budget = sp?.budget || null;
  const search = sp?.search || null;

  const initialBikes = await getInitialBikes();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",           item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Electric Bikes", item: `${SITE_URL}/bikes` },
    ],
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/bikes#collection`,
    name: "Electric Bikes & Scooters in India 2026 – Complete Database",
    description: "Comprehensive database of all electric scooters and bikes available in India. Compare prices, range, battery, and performance for Ather, Ola, TVS, Bajaj, Hero, and more EV brands.",
    url: `${SITE_URL}/bikes`,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: { "@type": "Thing", name: "Electric Scooters and Bikes in India" },
    keywords: "electric scooters india 2026, electric bike india, ola s1 pro, ather 450x, tvs iqube, bajaj chetak, best electric scooter india",
    audience: {
      "@type": "Audience",
      geographicArea: { "@type": "Country", name: "India" },
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Electric Scooters and Bikes in India",
      description: "All electric two-wheelers available in India sorted by price, range, and popularity",
      url: `${SITE_URL}/bikes`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which is the best electric scooter in India in 2026?",
        acceptedAnswer: { "@type": "Answer", text: "The best electric scooters in India in 2026 are the Ola S1 Pro Gen 2 (195 km range, ₹1.47L), Ather 450X Gen 3 (146 km, ₹1.50L), TVS iQube S (100 km, ₹98K), and Bajaj Chetak (126 km, ₹95K). The Ola S1 Pro leads on range and features, while the Ather 450X is the top pick for build quality and fast-charging network access." },
      },
      {
        "@type": "Question",
        name: "What is the cheapest electric scooter in India in 2026?",
        acceptedAnswer: { "@type": "Answer", text: "The most affordable electric scooters in India in 2026 start from around ₹44,000. Options include the Ampere Nexus (₹44,400), Hero Electric Optima ER (₹45,990), and Okinawa Ridge+ (₹47,990) for under ₹50,000. For better range and features, the Ola S1 Air (₹84,999) and Hero Vida V1 Lite (₹89,994) are the top picks under ₹1 lakh." },
      },
      {
        "@type": "Question",
        name: "What is the range of electric scooters available in India?",
        acceptedAnswer: { "@type": "Answer", text: "Electric scooters in India in 2026 offer a certified range of 60 km to 212 km per charge. The Simple One leads with 212 km ARAI range, followed by the Ola S1 Pro Gen 2 (195 km) and Ola S1 Air (101 km). Mid-range scooters like TVS iQube and Bajaj Chetak offer 100–140 km range, which is sufficient for most daily urban commutes." },
      },
      {
        "@type": "Question",
        name: "Can I charge an electric scooter at home?",
        acceptedAnswer: { "@type": "Answer", text: "Yes — all electric scooters include a portable home charger that works with a standard 5A or 15A socket. A full charge costs ₹10–20 depending on your state's electricity tariff. Charging time is 4–8 hours overnight. Some premium scooters like Ola S1 Pro support fast charging at dedicated charger networks." },
      },
      {
        "@type": "Question",
        name: "Are electric scooters better than petrol scooters in India?",
        acceptedAnswer: { "@type": "Answer", text: "For daily city commutes, electric scooters are more economical than petrol scooters. Running cost is ₹0.15–₹0.30 per km vs ₹2.50–₹3.50 per km for petrol. Annual savings for a 40 km/day commute can be ₹30,000–₹50,000. Electric scooters also need less maintenance (no oil changes, fewer moving parts) and benefit from government subsidies and lower road tax." },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="min-h-screen bg-gray-50">

        <div className="bg-linear-to-br from-green-900 to-green-950 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="mb-4 flex items-center gap-2 text-sm text-green-300">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={14} />
              <Link href="/bikes" className="hover:text-white transition">Electric Bikes</Link>
              {brand && <><ChevronRight size={14} /><span className="text-white">{brand}</span></>}
            </nav>
            <h1 className="text-4xl font-black text-white md:text-5xl">
              {brand ? `${brand} Electric Bikes` : "Electric Bikes & Scooters 2026"}
            </h1>
            <p className="mt-2 text-green-300">Filter by budget, range, battery &amp; brand</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">

          {/* Editorial intro — visible to Googlebot and readers */}
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed">
              Electric scooters and bikes are transforming urban mobility in India, with two-wheelers accounting for nearly 55% of all EV sales in 2024. Brands like <strong>Ola Electric</strong>, <strong>Ather Energy</strong>, <strong>TVS</strong>, <strong>Bajaj</strong>, and <strong>Hero Vida</strong> are competing fiercely on range, features, and price — from budget scooters under ₹50,000 to performance bikes above ₹1.5 lakh. EV Radar covers every electric two-wheeler launch, long-term review, and real-world range test to help Indian riders make smarter buying decisions. Use the filters below to find the right electric scooter or bike for your daily commute or weekend ride.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span className="text-gray-600">50+ models listed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-gray-600">Real-world range figures</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-gray-600">Prices updated daily</span>
              </div>
            </div>
          </div>

          <AdBannerHorizontal slot="8901234567" />

          <div className="mt-8">
            <BikesClient
              initialBrand={brand}
              initialBudget={budget}
              initialSearch={search}
              initialVehicles={initialBikes}
            />
          </div>

          <div className="my-10"><AdBannerHorizontal slot="9012345678" /></div>

          {/* Visible FAQ section — same content as FAQPage JSON-LD above */}
          <section className="mb-10">
            <h2 className="mb-6 text-2xl font-black text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Which is the best electric scooter in India in 2026?",
                  a: "The best electric scooters in India in 2026 are the Ola S1 Pro Gen 2 (195 km range, ₹1.47L), Ather 450X Gen 3 (146 km, ₹1.50L), TVS iQube S (100 km, ₹98K), and Bajaj Chetak (126 km, ₹95K). The Ola S1 Pro leads on range and features, while the Ather 450X is the top pick for build quality and fast-charging network access.",
                },
                {
                  q: "What is the cheapest electric scooter in India in 2026?",
                  a: "The most affordable electric scooters in India in 2026 start from around ₹44,000. Options include the Ampere Nexus (₹44,400) and Hero Electric Optima ER (₹45,990) for under ₹50,000. For better range and features, the Ola S1 Air (₹84,999) and Hero Vida V1 Lite (₹89,994) are the top picks under ₹1 lakh.",
                },
                {
                  q: "What is the range of electric scooters available in India?",
                  a: "Electric scooters in India in 2026 offer a certified range of 60 km to 212 km per charge. The Simple One leads with 212 km ARAI range, followed by the Ola S1 Pro Gen 2 (195 km) and Ola S1 Air (101 km). Mid-range scooters like TVS iQube and Bajaj Chetak offer 100–140 km range, which is sufficient for most daily urban commutes.",
                },
                {
                  q: "Can I charge an electric scooter at home?",
                  a: "Yes — all electric scooters include a portable home charger that works with a standard 5A or 15A socket. A full charge costs ₹10–20 depending on your state's electricity tariff. Charging time is 4–8 hours overnight. Some premium scooters like Ola S1 Pro support fast charging at dedicated charger networks.",
                },
                {
                  q: "Are electric scooters better than petrol scooters in India?",
                  a: "For daily city commutes, electric scooters are more economical than petrol scooters. Running cost is ₹0.15–₹0.30 per km vs ₹2.50–₹3.50 per km for petrol. Annual savings for a 40 km/day commute can be ₹30,000–₹50,000. Electric scooters also need less maintenance and benefit from government subsidies and lower road tax.",
                },
              ].map(({ q, a }) => (
                <details key={q} className="group rounded-2xl border border-gray-200 bg-white">
                  <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-semibold text-gray-900 marker:hidden list-none">
                    {q}
                    <span className="ml-4 shrink-0 text-green-600 group-open:rotate-45 transition-transform duration-200">＋</span>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600">{a}</p>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-black text-gray-900">Latest Electric Bike News</h2>
            <ArticlesFeed category="bikes" limit={8} cols="sm:grid-cols-2 lg:grid-cols-4" skeletonCount={4} />
          </section>
        </div>
      </div>
    </>
  );
}
