import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import NewsCard from "@/components/news/NewsCard";
import { SITE_URL } from "../layout";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const LIMIT = 20;

const CATEGORY_PILLS = [
  { label: "All News",       href: "/news",                     cat: null         },
  { label: "Electric Cars",  href: "/news?category=cars",       cat: "cars"       },
  { label: "Electric Bikes", href: "/news?category=bikes",      cat: "bikes"      },
  { label: "Commercial EVs", href: "/news?category=commercial", cat: "commercial" },
  { label: "EV Charging",    href: "/news?category=charging",   cat: "charging"   },
];

const CAT_LABELS = { cars: "Electric Cars", bikes: "Electric Bikes", commercial: "Commercial EVs", charging: "EV Charging" };

async function getArticles(category, page = 1) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();
    const filter = { status: "published", image: { $exists: true, $nin: [null, ""] }, ...(category ? { category } : {}) };
    const skip   = (page - 1) * LIMIT;
    const [articles, total] = await Promise.all([
      Article.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(LIMIT)
        .select("slug title image excerpt publishedAt readTime category tags views")
        .lean(),
      Article.countDocuments(filter),
    ]);
    return { articles, total, pages: Math.ceil(total / LIMIT) || 1 };
  } catch {
    return { articles: [], total: 0, pages: 1 };
  }
}

function buildNewsCanonical(cat, page) {
  const p = new URLSearchParams();
  if (cat)    p.set("category", cat);
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return `${SITE_URL}/news${qs ? `?${qs}` : ""}`;
}

export async function generateMetadata({ searchParams }) {
  const sp   = await searchParams;
  const cat  = sp?.category || null;
  const page = Math.max(1, parseInt(sp?.page || "1", 10));
  const label = CAT_LABELS[cat] || "All";
  const canonical = buildNewsCanonical(cat, page);
  return {
    title: cat
      ? `${label} News India 2026 – Latest ${label} Updates | EV News India`
      : `Latest EV News India 2026 – Electric Vehicle Updates`,
    description:
      cat
        ? `Latest ${label.toLowerCase()} news from India. New ${label.toLowerCase()} launches, prices, range, and reviews updated daily.`
        : "Get the latest electric vehicle news from India. EV launches, reviews, price updates, government policies, and charging infrastructure news updated daily.",
    keywords: cat
      ? `${label.toLowerCase()} news india, ${label.toLowerCase()} 2026, ev ${label.toLowerCase()} india, latest ${label.toLowerCase()} updates`
      : undefined,
    alternates: { canonical },
    openGraph: {
      title: `${label} EV News – Electric Vehicle Updates India 2026`,
      description: "Get the latest electric vehicle news, launches, reviews, and price updates from India.",
      url: canonical,
      type: "website",
      images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(label + " EV News India")}&subtitle=Latest launches, reviews %26 price updates&tag=news&type=page`, width: 1200, height: 630, alt: `${label} EV News India` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} EV News – Electric Vehicle Updates India 2026`,
      description: "Get the latest EV news, launches, reviews, and price updates from India.",
      images: [`${SITE_URL}/api/og?title=${encodeURIComponent(label + " EV News India")}&subtitle=Latest launches, reviews %26 price updates&tag=news&type=page`],
    },
  };
}

export default async function NewsPage({ searchParams }) {
  const sp       = await searchParams;
  const category = sp?.category || null;
  const page     = Math.max(1, parseInt(sp?.page || "1", 10));
  const heading  = category ? CAT_LABELS[category] ?? "EV News" : "Latest EV News";

  const { articles, total, pages } = await getArticles(category, page);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}/news` },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${heading} – EV News India`,
    description: "Latest electric vehicle news from India covering launches, prices, reviews, and EV policy.",
    url: `${SITE_URL}/news`,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(articles.length > 0 && {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: total,
        itemListElement: articles.map((a, i) => ({
          "@type": "ListItem",
          position: (page - 1) * LIMIT + i + 1,
          url: `${SITE_URL}/news/${a.slug}`,
          name: a.title,
        })),
      },
    }),
  };

  const buildHref = (p) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/news${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
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
                  <span className="text-white capitalize">{CAT_LABELS[category]}</span>
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

          {/* Server-rendered article grid — fully crawlable by Googlebot */}
          <div className="mt-8">
            <h2 className="mb-6 text-2xl font-black text-gray-900">
              {category ? `${CAT_LABELS[category]} News` : "All Latest News"}
              {total > 0 && <span className="ml-3 text-base font-normal text-gray-400">{total.toLocaleString("en-IN")} articles</span>}
            </h2>

            {articles.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">No articles found.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {articles.map((article) => (
                  <NewsCard key={article._id?.toString()} article={article} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                {page > 1 && (
                  <Link
                    href={buildHref(page - 1)}
                    className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-green-500 hover:text-green-700"
                  >
                    <ChevronLeft size={16} /> Prev
                  </Link>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    let p;
                    if (pages <= 7) p = i + 1;
                    else if (page <= 4) p = i + 1;
                    else if (page >= pages - 3) p = pages - 6 + i;
                    else p = page - 3 + i;
                    return (
                      <Link
                        key={p}
                        href={buildHref(p)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition ${
                          p === page
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>

                {page < pages && (
                  <Link
                    href={buildHref(page + 1)}
                    className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-green-500 hover:text-green-700"
                  >
                    Next <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            )}

            {pages > 1 && (
              <p className="mt-4 text-center text-xs text-gray-400">
                Page {page} of {pages} · {total.toLocaleString("en-IN")} articles
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
