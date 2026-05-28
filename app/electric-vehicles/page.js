import NewsCard from "@/components/news/NewsCard";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { SITE_URL } from "../layout";

export const revalidate = 60;

export const metadata = {
  title: "EV Charging News India – Fast Charging, Battery Swapping & Infrastructure 2026",
  description:
    "Latest EV charging infrastructure news in India. Fast chargers, battery swapping, home charging tips, charging costs, and India's expanding charging network.",
  alternates: { canonical: `${SITE_URL}/electric-vehicles` },
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

export default async function EVChargingPage() {
  const articles = await getArticles("charging");

  return (
    <div className="bg-white">
      <div className="bg-linear-to-br from-green-900 to-green-950 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-4 text-sm text-green-300">
            <a href="/" className="hover:text-white">Home</a>
            <span className="mx-2">/</span>
            <span className="text-white">EV Charging</span>
          </nav>
          <h1 className="text-4xl font-black text-white">EV Charging &amp; Infrastructure</h1>
          <p className="mt-2 text-green-300">India&apos;s growing EV charging ecosystem — news, guides, and updates</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <AdBannerHorizontal slot="1357924680" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article._id || article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
