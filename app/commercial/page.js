import NewsCard from "@/components/news/NewsCard";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { SITE_URL } from "../layout";

export const revalidate = 60;

export const metadata = {
  title: "Commercial Electric Vehicle News India – EV Trucks, Buses & Vans 2026",
  description:
    "Latest commercial EV news in India. Electric trucks, buses, delivery vans, and three-wheelers — launches, prices, and fleet operator reviews.",
  alternates: { canonical: `${SITE_URL}/commercial` },
};

async function getArticles(category) {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${BASE}/api/articles?status=published&category=${category}&limit=20`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data.articles || [];
  } catch {
    const { getArticlesByCategory } = await import("@/data/newsArticles");
    return getArticlesByCategory(category);
  }
}

export default async function CommercialPage() {
  const articles = await getArticles("commercial");

  return (
    <div className="bg-white">
      <div className="bg-linear-to-br from-purple-900 to-purple-950 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-4 text-sm text-purple-300">
            <a href="/" className="hover:text-white">Home</a>
            <span className="mx-2">/</span>
            <span className="text-white">Commercial EVs</span>
          </nav>
          <h1 className="text-4xl font-black text-white">Commercial Electric Vehicles</h1>
          <p className="mt-2 text-purple-300">Electric trucks, buses, and commercial vehicles shaping India&apos;s green logistics</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <AdBannerHorizontal slot="0123456789" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article._id || article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
