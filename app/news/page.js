import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import ArticlesFeed from "@/components/skeletons/ArticlesFeed";
import { SITE_URL } from "../layout";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const sp  = await searchParams;
  const cat = sp?.category;
  const labels = { cars: "Electric Cars", bikes: "Electric Bikes", commercial: "Commercial EVs", charging: "EV Charging" };
  const label  = labels[cat] || "All";
  return {
    title: `${label} News – Electric Vehicle Updates India 2026`,
    description:
      "Get the latest electric vehicle news from India and worldwide. EV launches, reviews, price updates, government policies, and charging infrastructure news updated daily.",
    alternates: { canonical: `${SITE_URL}/news${cat ? `?category=${cat}` : ""}` },
    openGraph: {
      title: `${label} EV News – Electric Vehicle Updates India 2026`,
      description: "Get the latest electric vehicle news, launches, reviews, and price updates from India.",
      url: `${SITE_URL}/news${cat ? `?category=${cat}` : ""}`,
      type: "website",
    },
  };
}

const CATEGORY_PILLS = [
  { label: "All News",       href: "/news",                    cat: null         },
  { label: "Electric Cars",  href: "/news?category=cars",      cat: "cars"       },
  { label: "Electric Bikes", href: "/news?category=bikes",     cat: "bikes"      },
  { label: "Commercial EVs", href: "/news?category=commercial",cat: "commercial" },
  { label: "EV Charging",    href: "/news?category=charging",  cat: "charging"   },
];

export default async function NewsPage({ searchParams }) {
  const sp       = await searchParams;
  const category = sp?.category || null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}/news` },
    ],
  };

  const catLabels = { cars: "Electric Cars", bikes: "Electric Bikes", commercial: "Commercial EVs", charging: "EV Charging" };
  const heading   = category ? catLabels[category] ?? "EV News" : "Latest EV News";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="bg-white">

        {/* Header */}
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="mb-4 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/news" className="hover:text-white">News</Link>
              {category && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-white capitalize">{catLabels[category]}</span>
                </>
              )}
            </nav>
            <h1 className="text-4xl font-black text-white md:text-5xl">
              {heading.split(" ").map((w, i) =>
                i === 0 ? <span key={i}>{w} </span> : <span key={i} className="text-green-400">{w} </span>
              )}
            </h1>
            <p className="mt-3 text-gray-400">Breaking electric vehicle news from India and beyond</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10">
          {/* Category filter pills */}
          <div className="mb-8 flex flex-wrap gap-3">
            {CATEGORY_PILLS.map((c) => {
              const isActive = c.cat === category;
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>

          <AdBannerHorizontal slot="2345678901" />

          {/* Articles feed — re-fetches when category changes */}
          <div className="mt-8">
            <h2 className="mb-6 text-2xl font-black text-gray-900">
              {category ? `${catLabels[category]} News` : "All Latest News"}
            </h2>
            <ArticlesFeed
              category={category}
              limit={20}
              cols="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              skeletonCount={12}
            />
          </div>
        </div>
      </div>
    </>
  );
}
