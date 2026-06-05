import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import ArticlesFeed from "@/components/skeletons/ArticlesFeed";
import { SITE_URL } from "../layout";
import CarsClient from "./CarsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Electric Cars in India 2026 – Price, Range & Specs | EV News India",
  description:
    "Compare all electric cars in India 2026. Filter by budget, brand, range and battery. Check specs, colors and latest news for Tata, Mahindra, Hyundai, BYD, Kia EVs.",
  alternates: { canonical: `${SITE_URL}/cars` },
};

export default async function CarsPage({ searchParams }) {
  const sp     = await searchParams;
  const brand  = sp?.brand  || null;
  const budget = sp?.budget || null;
  const search = sp?.search || null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",          item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Electric Cars", item: `${SITE_URL}/cars` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
