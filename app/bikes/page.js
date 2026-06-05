import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import ArticlesFeed from "@/components/skeletons/ArticlesFeed";
import { SITE_URL } from "../layout";
import BikesClient from "./BikesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Electric Bikes & Scooters in India 2026 – Price, Range & Specs | EV News India",
  description:
    "Compare all electric scooters and bikes in India 2026. Filter by budget, brand, range and battery. Ather 450X, Ola S1 Pro, TVS iQube, Bajaj Chetak and more.",
  alternates: { canonical: `${SITE_URL}/bikes` },
};

export default async function BikesPage({ searchParams }) {
  const sp     = await searchParams;
  const brand  = sp?.brand  || null;
  const budget = sp?.budget || null;
  const search = sp?.search || null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",           item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Electric Bikes", item: `${SITE_URL}/bikes` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
