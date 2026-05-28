import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import NewsCard from "@/components/news/NewsCard";
import { SITE_URL } from "../layout";

export const revalidate = 60;

export const metadata = {
  title: "Latest EV News – Electric Vehicle Updates India 2026",
  description:
    "Get the latest electric vehicle news from India and worldwide. EV launches, reviews, price updates, government policies, and charging infrastructure news updated daily.",
  alternates: { canonical: `${SITE_URL}/news` },
  openGraph: {
    title: "Latest EV News – Electric Vehicle Updates India 2026",
    description: "Get the latest electric vehicle news, launches, reviews, and price updates from India.",
    url: `${SITE_URL}/news`,
    type: "website",
  },
};

async function getArticles(params = {}) {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const qs = new URLSearchParams({ status: "published", limit: "20", ...params }).toString();
  try {
    const res = await fetch(`${BASE}/api/articles?${qs}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return data.articles || [];
  } catch {
    // Fallback to static data if MongoDB not connected yet
    const { newsArticles } = await import("@/data/newsArticles");
    return newsArticles;
  }
}

export default async function NewsPage() {
  const articles = await getArticles();
  const featured = articles.filter((a) => a.featured).slice(0, 3);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}/news` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="bg-white">
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="mb-4 text-sm text-gray-400">
              <a href="/" className="hover:text-white">Home</a>
              <span className="mx-2">/</span>
              <span className="text-white">News</span>
            </nav>
            <h1 className="text-4xl font-black text-white md:text-5xl">
              Latest <span className="text-green-400">EV News</span>
            </h1>
            <p className="mt-3 text-gray-400">Breaking electric vehicle news from India and beyond</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10">
          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-3">
            {[
              { label: "All News", href: "/news" },
              { label: "Electric Cars", href: "/cars" },
              { label: "Electric Bikes", href: "/bikes" },
              { label: "Commercial EVs", href: "/commercial" },
              { label: "EV Charging", href: "/electric-vehicles" },
            ].map((c) => (
              <a
                key={c.href}
                href={c.href}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  c.href === "/news"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white"
                }`}
              >
                {c.label}
              </a>
            ))}
          </div>

          {featured.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-black text-gray-900">Featured Stories</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((article) => (
                  <NewsCard key={article._id || article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          <AdBannerHorizontal slot="2345678901" />

          <section className="mt-8">
            <h2 className="mb-6 text-2xl font-black text-gray-900">All Latest News</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {articles.map((article) => (
                <NewsCard key={article._id || article.id} article={article} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
