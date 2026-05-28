import Image from "next/image";
import Link from "next/link";
import { Star, BatteryCharging, Gauge, Zap, ChevronRight } from "lucide-react";
import NewsCard from "@/components/news/NewsCard";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { electricBikes } from "@/data/vehiclesData";
import { SITE_URL } from "../layout";

export const revalidate = 60;

export const metadata = {
  title: "Electric Bikes & Scooters in India 2026 – Price, Range & Specs | EV News India",
  description:
    "Compare all electric scooters and bikes in India 2026. Ather 450X, Ola S1 Pro, TVS iQube, Bajaj Chetak and more. Prices, specs, colors and best deals.",
  alternates: { canonical: `${SITE_URL}/bikes` },
};

async function getArticles(category) {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${BASE}/api/articles?status=published&category=${category}&limit=8`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data.articles || [];
  } catch {
    const { getArticlesByCategory } = await import("@/data/newsArticles");
    return getArticlesByCategory(category);
  }
}

export default async function BikesPage() {
  const articles = await getArticles("bikes");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
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
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <span className="text-white">Electric Bikes</span>
            </nav>
            <h1 className="text-4xl font-black text-white">Electric Bikes &amp; Scooters in India 2026</h1>
            <p className="mt-2 text-green-300">{electricBikes.length} models available · Prices from ₹1.10 Lakh</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10">
          <AdBannerHorizontal slot="8901234567" />

          <section className="mt-8">
            <h2 className="mb-6 text-2xl font-black text-gray-900">All Electric Bikes & Scooters</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {electricBikes.map((bike) => <BikeCard key={bike.slug} bike={bike} />)}
            </div>
          </section>

          <div className="my-10"><AdBannerHorizontal slot="9012345678" /></div>

          {articles.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-black text-gray-900">Latest Electric Bike News</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {articles.map((article) => (
                  <NewsCard key={article._id || article.id} article={article} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function BikeCard({ bike }) {
  return (
    <Link href={`/bikes/${bike.slug}`} className="group block">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-50 overflow-hidden bg-gray-100">
          <Image
            src={bike.image}
            alt={bike.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold text-white shadow">{bike.tag}</span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-semibold text-green-600">{bike.brand}</p>
          <h3 className="mt-0.5 text-base font-black text-gray-900 group-hover:text-green-600 transition line-clamp-1">{bike.name}</h3>
          <p className="mt-1 text-lg font-black text-green-600">{bike.priceDisplay}</p>
          {bike.emiMin && <p className="text-[11px] text-gray-400">EMI ₹{bike.emiMin.toLocaleString()}/mo</p>}
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <div className="rounded-xl bg-green-50 p-2 text-center">
              <BatteryCharging size={12} className="mx-auto mb-0.5 text-green-600" />
              <p className="text-[10px] text-gray-500">Range</p>
              <p className="text-[11px] font-black text-gray-800 leading-tight">{bike.specs?.range_certified?.split(" (")[0]}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2 text-center">
              <Zap size={12} className="mx-auto mb-0.5 text-blue-600" />
              <p className="text-[10px] text-gray-500">Motor</p>
              <p className="text-[11px] font-black text-gray-800 leading-tight">{bike.specs?.motor}</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-2 text-center">
              <Gauge size={12} className="mx-auto mb-0.5 text-purple-600" />
              <p className="text-[10px] text-gray-500">Speed</p>
              <p className="text-[11px] font-black text-gray-800 leading-tight">{bike.specs?.top_speed}</p>
            </div>
          </div>
          {bike.colors && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">{bike.colors.length} Colors:</span>
              {bike.colors.slice(0, 5).map((c, i) => (
                <div key={i} title={c.name} className="h-4 w-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700">{bike.rating}</span>
              <span className="text-[10px] text-gray-400">({bike.reviewCount?.toLocaleString()})</span>
            </div>
            <span className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white group-hover:bg-green-500 transition">Details →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
