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
  title: "Electric Bikes & Scooters in India 2026 – Price, Range & Specs | EV News India",
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }} />
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

          <section>
            <h2 className="mb-6 text-2xl font-black text-gray-900">Latest Electric Bike News</h2>
            <ArticlesFeed category="bikes" limit={8} cols="sm:grid-cols-2 lg:grid-cols-4" skeletonCount={4} />
          </section>
        </div>
      </div>
    </>
  );
}
