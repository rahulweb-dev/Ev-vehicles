import { notFound }    from "next/navigation";
import Link             from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NewsCard          from "@/components/news/NewsCard";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { SITE_URL }     from "@/app/layout";

export const revalidate = 60;

const LIMIT = 20;

const VALID_CATEGORIES = {
  cars:       "Electric Cars",
  bikes:      "Electric Bikes",
  commercial: "Commercial EVs",
  charging:   "EV Charging",
};

async function getArticles(category, page = 1) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();
    const filter = {
      status:   "published",
      image:    { $exists: true, $nin: [null, ""] },
      category,
    };
    const skip = (page - 1) * LIMIT;
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(LIMIT)
        .select("slug title image excerpt publishedAt readTime category tags views")
        .lean(),
      Article.countDocuments(filter),
    ]);
    return { articles, total, pages: Math.ceil(total / LIMIT) || 1 };
  } catch {
    return { articles: [], total: 0, pages: 1 };
  }
}

export async function generateStaticParams() {
  return Object.keys(VALID_CATEGORIES).map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  if (!VALID_CATEGORIES[category]) return {};
  const label = VALID_CATEGORIES[category];
  const title = `${label} News India 2026 – Latest ${label} Updates | EV Radar`;
  const description = `Latest ${label.toLowerCase()} news from India. New ${label.toLowerCase()} launches, prices, range, and reviews updated daily on EV Radar.`;
  const canonicalUrl = `${SITE_URL}/news/category/${category}`;
  return {
    title,
    description,
    keywords: `${label.toLowerCase()} news india, ${label.toLowerCase()} 2026, ev ${label.toLowerCase()} india, latest ${label.toLowerCase()} updates`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [{
        url: `${SITE_URL}/api/og?title=${encodeURIComponent(label + " News India")}&subtitle=Latest launches%2C reviews %26 price updates&tag=news&type=page`,
        width: 1200,
        height: 630,
        alt: `${label} News India`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/api/og?title=${encodeURIComponent(label + " News India")}&subtitle=Latest launches%2C reviews %26 price updates&tag=news&type=page`],
    },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  if (!VALID_CATEGORIES[category]) notFound();

  const sp   = await searchParams;
  const page = Math.max(1, parseInt(sp?.page || "1", 10));
  const label = VALID_CATEGORIES[category];

  const { articles, total, pages } = await getArticles(category, page);

  const canonicalUrl = `${SITE_URL}/news/category/${category}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",      item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News",      item: `${SITE_URL}/news` },
      { "@type": "ListItem", position: 3, name: label,       item: canonicalUrl },
    ],
  };

  const collectionJsonLd = {
    "@context":   "https://schema.org",
    "@type":      "CollectionPage",
    name:         `${label} – EV News India`,
    description:  `Latest ${label.toLowerCase()} news from India covering launches, prices, and reviews.`,
    url:          canonicalUrl,
    inLanguage:   "en-IN",
    publisher:    { "@id": `${SITE_URL}/#organization` },
    ...(articles.length > 0 && {
      mainEntity: {
        "@type":          "ItemList",
        numberOfItems:    total,
        itemListElement:  articles.map((a, i) => ({
          "@type":    "ListItem",
          position:   (page - 1) * LIMIT + i + 1,
          url:        `${SITE_URL}/news/${a.slug}`,
          name:       a.title,
        })),
      },
    }),
  };

  const buildHref = (p) =>
    p > 1 ? `/news/category/${category}?page=${p}` : `/news/category/${category}`;

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
              <span className="mx-2">/</span>
              <span className="text-white">{label}</span>
            </nav>
            <h1 className="text-4xl font-black text-white md:text-5xl">
              {label.split(" ").map((w, i) =>
                i === 0 ? <span key={i}>{w} </span> : <span key={i} className="text-green-400">{w} </span>
              )}
            </h1>
            <p className="mt-3 text-gray-400">Latest {label.toLowerCase()} news from India</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10">
          {/* Category filter pills */}
          <div className="mb-8 flex flex-wrap gap-3">
            <Link
              href="/news"
              className="rounded-full bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-green-600 hover:text-white"
            >
              All News
            </Link>
            {Object.entries(VALID_CATEGORIES).map(([cat, lbl]) => (
              <Link
                key={cat}
                href={`/news/category/${cat}`}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  cat === category
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white"
                }`}
              >
                {lbl}
              </Link>
            ))}
          </div>

          <AdBannerHorizontal slot="2345678901" />

          <div className="mt-8">
            <h2 className="mb-6 text-2xl font-black text-gray-900">
              {label} News
              {total > 0 && (
                <span className="ml-3 text-base font-normal text-gray-400">
                  {total.toLocaleString("en-IN")} articles
                </span>
              )}
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
