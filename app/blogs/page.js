import { blogsData } from "@/data/blogsData";
import Image from "next/image";
import Link from "next/link";
import { Clock3, ArrowRight, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { SITE_URL } from "../layout";

export const revalidate = 300;

export async function generateMetadata({ searchParams }) {
  const sp   = await searchParams;
  const page = Math.max(1, parseInt(sp?.page || "1", 10));
  return {
    title: "EV Blogs & Guides – Electric Vehicle Tips, Buying Guides & Analysis India",
    description:
      "In-depth electric vehicle guides, buying tips, cost analysis, and EV ownership advice for India. Everything you need to know about EVs in India.",
    keywords: ["EV guides India", "electric vehicle tips", "EV buying guide", "EV blogs India 2026"],
    alternates: { canonical: page > 1 ? `${SITE_URL}/blogs?page=${page}` : `${SITE_URL}/blogs` },
    openGraph: {
      title: "EV Blogs & Guides – Electric Vehicle Tips for India",
      description: "In-depth EV guides, buying tips, and ownership advice for Indian EV buyers.",
      url: page > 1 ? `${SITE_URL}/blogs?page=${page}` : `${SITE_URL}/blogs`,
      type: "website",
      images: [{ url: `${SITE_URL}/api/og?title=EV Blogs %26 Guides India&subtitle=Buying tips, cost analysis %26 EV ownership advice&tag=default&type=page`, width: 1200, height: 630, alt: "EV Blogs & Guides India" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "EV Blogs & Guides – Electric Vehicle Tips for India",
      description: "In-depth EV guides, buying tips, and ownership advice for Indian EV buyers.",
      images: [`${SITE_URL}/api/og?title=EV Blogs %26 Guides India&subtitle=Buying tips, cost analysis %26 EV ownership advice&tag=default&type=page`],
    },
  };
}

const BLOGS_PER_PAGE = 12;

async function getBlogs(page = 1) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Blog = (await import("@/lib/models/Blog")).default;
    await dbConnect();
    const skip = (page - 1) * BLOGS_PER_PAGE;
    const [docs, total] = await Promise.all([
      Blog.find({ status: "published" })
        .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(BLOGS_PER_PAGE)
        .lean(),
      Blog.countDocuments({ status: "published" }),
    ]);
    if (total > 0) {
      return {
        blogs: docs.map(b => ({
          id:          b._id.toString(),
          slug:        b.slug,
          title:       b.title,
          excerpt:     b.excerpt || "",
          image:       b.image || "",
          category:    b.category || "guides",
          author:      b.author || "EVRadar Team",
          publishedAt: b.publishedAt || b.createdAt,
          readTime:    b.readTime || "5 min",
          featured:    b.featured || false,
          tags:        b.tags || [],
          views:       b.views || 0,
        })),
        total,
        totalPages: Math.ceil(total / BLOGS_PER_PAGE),
      };
    }
  } catch {}
  // fallback to static data
  return {
    blogs: blogsData,
    total: blogsData.length,
    totalPages: 1,
  };
}

const categoryColors = {
  guide:      "bg-green-100 text-green-700",
  guides:     "bg-green-100 text-green-700",
  listicle:   "bg-blue-100 text-blue-700",
  analysis:   "bg-purple-100 text-purple-700",
  tips:       "bg-orange-100 text-orange-700",
  reviews:    "bg-rose-100 text-rose-700",
  news:       "bg-sky-100 text-sky-700",
  comparison: "bg-indigo-100 text-indigo-700",
  other:      "bg-gray-100 text-gray-600",
};

export default async function BlogsPage({ searchParams }) {
  const sp   = await searchParams;
  const page = Math.max(1, parseInt(sp?.page || "1", 10));
  const { blogs: allBlogs, total, totalPages } = await getBlogs(page);
  const featured = page === 1 ? (allBlogs.find(b => b.featured) || allBlogs[0]) : null;
  const rest = featured
    ? allBlogs.filter(b => b.id !== featured?.id && b.slug !== featured?.slug)
    : allBlogs;

  const blogsBreadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "EV Blogs & Guides", item: `${SITE_URL}/blogs` },
    ],
  };

  const blogsItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "EV Blogs & Guides – Electric Vehicle Tips India",
    description: "In-depth electric vehicle guides, buying tips, and EV ownership advice for India.",
    url: `${SITE_URL}/blogs`,
    numberOfItems: allBlogs.length,
    itemListElement: allBlogs.map((blog, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: blog.title,
      url: `${SITE_URL}/blogs/${blog.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogsItemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogsBreadcrumbJsonLd) }} />

      <div className="bg-white">
        {/* Header */}
        <div className="bg-gray-950 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="mb-4 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white">Blogs</span>
            </nav>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-white md:text-5xl">
                  EV Blogs & <span className="text-green-400">Guides</span>
                </h1>
                <p className="mt-3 text-gray-400">
                  Expert insights, buying guides, and everything you need to know about electric vehicles in India
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <BookOpen size={16} className="text-green-400" />
                <span className="text-sm font-bold text-white">{total}</span>
                <span className="text-sm text-gray-400">articles</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12">
          {/* Featured Blog */}
          {featured && (
            <section className="mb-12">
              <Link href={`/blogs/${featured.slug}`} className="group block">
                <article className="grid overflow-hidden rounded-3xl border border-gray-100 shadow-lg md:grid-cols-2">
                  <div className="relative h-64 md:h-auto">
                    {featured.image ? (
                      <Image
                        src={featured.image}
                        alt={featured.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-green-700 to-green-500">
                        <BookOpen size={48} className="text-white/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent md:hidden" />
                  </div>
                  <div className="flex flex-col justify-center p-8">
                    <div className="mb-3 flex gap-2">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        FEATURED
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${categoryColors[featured.category] || "bg-gray-100 text-gray-600"}`}>
                        {featured.category}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black leading-tight text-gray-900 group-hover:text-green-600 md:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-4 leading-relaxed text-gray-500">{featured.excerpt}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{featured.author}</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <Clock3 size={14} />
                          {featured.readTime}
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-semibold text-green-600 transition-all group-hover:gap-2">
                        Read <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </section>
          )}

          <AdBannerHorizontal slot="2468013579" />

          {/* All Blogs Grid */}
          {rest.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-6 text-2xl font-black text-gray-900">
                {page === 1 ? "All Articles" : `Articles — Page ${page}`}
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((blog) => (
                  <Link key={blog.id || blog.slug} href={`/blogs/${blog.slug}`} className="group block">
                    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative h-48 overflow-hidden">
                        {blog.image ? (
                          <Image
                            src={blog.image}
                            alt={blog.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-800 to-gray-600">
                            <BookOpen size={32} className="text-white/30" />
                          </div>
                        )}
                        <div className="absolute left-3 top-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${categoryColors[blog.category] || "bg-gray-100 text-gray-600"}`}>
                            {blog.category}
                          </span>
                        </div>
                        {blog.featured && (
                          <div className="absolute right-3 top-3">
                            <span className="rounded-full bg-green-600 px-2.5 py-1 text-xs font-bold text-white">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 group-hover:text-green-600">
                          {blog.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-gray-500">{blog.excerpt}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock3 size={13} />
                            {blog.readTime}
                          </div>
                          <span>
                            {blog.publishedAt
                              ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric",
                                })
                              : ""}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              {page > 1 && (
                <Link
                  href={`/blogs?page=${page - 1}`}
                  className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-green-500 hover:text-green-700"
                >
                  <ChevronLeft size={16} /> Prev
                </Link>
              )}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p;
                  if (totalPages <= 7) p = i + 1;
                  else if (page <= 4) p = i + 1;
                  else if (page >= totalPages - 3) p = totalPages - 6 + i;
                  else p = page - 3 + i;
                  return (
                    <Link
                      key={p}
                      href={`/blogs?page=${p}`}
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
              {page < totalPages && (
                <Link
                  href={`/blogs?page=${page + 1}`}
                  className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-green-500 hover:text-green-700"
                >
                  Next <ChevronRight size={16} />
                </Link>
              )}
            </div>
          )}
          {totalPages > 1 && (
            <p className="mt-4 text-center text-xs text-gray-400">
              Page {page} of {totalPages} · {total.toLocaleString("en-IN")} articles
            </p>
          )}
        </div>
      </div>
    </>
  );
}
