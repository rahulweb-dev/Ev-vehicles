import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import ArticlesFeed from "@/components/skeletons/ArticlesFeed";
import { SITE_URL } from "../layout";
import CarsClient from "./CarsClient";

export const revalidate = 60;

async function getInitialCars() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const vehicles = await Vehicle.find({ status: "published", vehicleType: "car" })
      .select("slug name brand featuredImage variants performance featured category colors")
      .sort({ featured: -1, name: 1 })
      .lean();
    return vehicles.map(v => ({
      slug:         v.slug,
      name:         v.name,
      brand:        v.brand,
      featuredImage: v.featuredImage || null,
      variants:     (v.variants || []).map(vr => ({
        exShowroomPrice: vr.exShowroomPrice || null,
        range:           vr.range           || null,
        batteryCapacity: vr.batteryCapacity || null,
      })),
      performance:  {
        drivingRange:     v.performance?.drivingRange     || null,
        batteryCapacity:  v.performance?.batteryCapacity  || null,
        power:            v.performance?.power            || null,
        topSpeed:         v.performance?.topSpeed         || null,
      },
      featured:  !!v.featured,
      category:  v.category  || "",
      colors:    (v.colors   || []).map(c =>
        typeof c === "string" ? { name: c, hex: "#888" } : { name: c.name || "", hex: c.hexCode || "#888" }
      ),
    }));
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Electric Cars in India 2026 – Price, Range & Specs | EV News India",
  description:
    "Compare all electric cars in India 2026. Filter by budget, brand, range and battery. Check specs, colors and latest news for Tata, Mahindra, Hyundai, BYD, Kia EVs.",
  keywords: "electric cars india 2026, electric car price india, best electric car india, tata nexon ev price, mahindra be6, hyundai creta electric, ev range india, electric suv india",
  alternates: { canonical: `${SITE_URL}/cars` },
  openGraph: {
    title: "Electric Cars in India 2026 – Price, Range & Specs",
    description: "Compare all electric cars in India. Filter by budget, brand, range & battery. Tata, Mahindra, Hyundai, BYD, Kia EVs.",
    url: `${SITE_URL}/cars`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=Electric Cars in India 2026&subtitle=Compare by price, range %26 battery&tag=cars&type=page`, width: 1200, height: 630, alt: "Electric Cars in India 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Electric Cars in India 2026 – Price, Range & Specs",
    description: "Compare all electric cars in India. Filter by budget, brand, range & battery.",
    images: [`${SITE_URL}/api/og?title=Electric Cars in India 2026&subtitle=Compare by price, range %26 battery&tag=cars&type=page`],
  },
};

export default async function CarsPage({ searchParams }) {
  const sp     = await searchParams;
  const brand  = sp?.brand  || null;
  const budget = sp?.budget || null;
  const search = sp?.search || null;

  const initialCars = await getInitialCars();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",          item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Electric Cars", item: `${SITE_URL}/cars` },
    ],
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/cars#collection`,
    name: "Electric Cars in India 2026 – Complete Database",
    description: "Comprehensive database of all electric cars available and upcoming in India. Compare prices, range, battery capacity, motor power, and specifications for Tata, Mahindra, Hyundai, Kia, BYD, MG, and more EVs.",
    url: `${SITE_URL}/cars`,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: { "@type": "Thing", name: "Electric Cars in India" },
    keywords: "electric cars india 2026, best electric car india, ev price india, electric car range india, tata ev, mahindra ev",
    audience: {
      "@type": "Audience",
      geographicArea: { "@type": "Country", name: "India" },
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Electric Cars in India",
      description: "All electric cars available in India sorted by price, range, and popularity",
      url: `${SITE_URL}/cars`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which is the best electric car in India in 2026?",
        acceptedAnswer: { "@type": "Answer", text: "The best electric cars in India in 2026 include the Tata Nexon EV (489 km range, from ₹14.49L), Mahindra BE 6 (682 km range, from ₹18.90L), MG Windsor EV (331 km, from ₹13.50L), and Hyundai Creta Electric (473 km, from ₹17.99L). The Tata Nexon EV is the best-seller thanks to its price, range, and nationwide service network." },
      },
      {
        "@type": "Question",
        name: "What is the cheapest electric car in India in 2026?",
        acceptedAnswer: { "@type": "Answer", text: "The most affordable electric cars in India in 2026 are the MG Comet EV starting at ₹6.99 lakh and the Tata Tiago EV starting at ₹7.99 lakh (ex-showroom). Both are ideal for city driving. The Tata Punch EV at ₹9.99 lakh offers the best balance of range (421 km) and features in the budget EV segment." },
      },
      {
        "@type": "Question",
        name: "What is the range of electric cars available in India?",
        acceptedAnswer: { "@type": "Answer", text: "Electric cars available in India in 2026 offer a certified range of 230 km to 682 km on a full charge. The Mahindra BE 6e leads with 682 km ARAI range, followed by the BYD Seal (650 km), Hyundai Ioniq 6 (631 km), and Tata Nexon EV (489 km). Most popular EVs offer 350–500 km which is sufficient for highway travel with planned charging stops." },
      },
      {
        "@type": "Question",
        name: "How much does it cost to charge an electric car at home in India?",
        acceptedAnswer: { "@type": "Answer", text: "Charging an electric car at home in India costs ₹6–9 per unit (kWh) depending on your state electricity tariff. A full charge for a 40 kWh battery (Tata Nexon EV) costs ₹240–360, compared to ₹2,500–3,000 for a petrol equivalent — saving 80–90% on fuel costs. Charging time at home is 7–12 hours using the included 3.3 kW portable charger." },
      },
      {
        "@type": "Question",
        name: "What government subsidies are available for electric cars in India?",
        acceptedAnswer: { "@type": "Answer", text: "In 2026, electric cars in India are eligible for subsidies under the PM E-Drive scheme, income tax deduction under Section 80EEB (up to ₹1.5 lakh interest deduction), and state-level road tax exemptions. States like Delhi, Maharashtra, Gujarat, and Rajasthan offer additional incentives. Use our Subsidy Calculator to check your exact savings." },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <div className="bg-linear-to-br from-green-900 to-green-950 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="mb-4 flex items-center gap-2 text-sm text-green-300">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={14} />
              <Link href="/cars" className="hover:text-white transition">Electric Cars</Link>
              {brand && <><ChevronRight size={14} /><span className="text-white">{brand}</span></>}
            </nav>
            <h1 className="text-4xl font-black text-white md:text-5xl">
              {brand ? `${brand} Electric Cars` : "Electric Cars in India 2026"}
            </h1>
            <p className="mt-2 text-green-300">Filter by budget, range, battery &amp; brand</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          <AdBannerHorizontal slot="7890123456" />

          <div className="mt-8">
            <CarsClient
              initialBrand={brand}
              initialBudget={budget}
              initialSearch={search}
              initialVehicles={initialCars}
            />
          </div>

          <div className="my-10"><AdBannerHorizontal slot="7890123457" /></div>

          <section>
            <h2 className="mb-6 text-2xl font-black text-gray-900">Latest Electric Car News</h2>
            <ArticlesFeed category="cars" limit={8} cols="sm:grid-cols-2 lg:grid-cols-4" skeletonCount={4} />
          </section>
        </div>
      </div>
    </>
  );
}
