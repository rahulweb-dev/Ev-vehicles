import { blogsData } from "@/data/blogsData";
import Image from "next/image";
import Link from "next/link";
import { Clock3, ArrowRight } from "lucide-react";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { SITE_URL } from "../layout";

export const metadata = {
  title: "EV Blogs & Guides – Electric Vehicle Tips, Buying Guides & Analysis India",
  description:
    "In-depth electric vehicle guides, buying tips, cost analysis, and EV ownership advice for India. Everything you need to know about EVs in India.",
  keywords: ["EV guides India", "electric vehicle tips", "EV buying guide", "EV blogs India 2026"],
  alternates: { canonical: `${SITE_URL}/blogs` },
  openGraph: {
    title: "EV Blogs & Guides – Electric Vehicle Tips for India",
    description: "In-depth EV guides, buying tips, and ownership advice for Indian EV buyers.",
    url: `${SITE_URL}/blogs`,
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

const categoryColors = {
  guide: "bg-green-100 text-green-700",
  listicle: "bg-blue-100 text-blue-700",
  analysis: "bg-purple-100 text-purple-700",
  tips: "bg-orange-100 text-orange-700",
};

const blogsBreadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "EV Blogs & Guides", item: `${SITE_URL}/blogs` },
  ],
};

export default function BlogsPage() {
  const featured = blogsData[0];
  const rest = blogsData.slice(1);

  const blogsItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "EV Blogs & Guides – Electric Vehicle Tips India",
    description: "In-depth electric vehicle guides, buying tips, and EV ownership advice for India.",
    url: `${SITE_URL}/blogs`,
    numberOfItems: blogsData.length,
    itemListElement: blogsData.map((blog, i) => ({
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
            <a href="/" className="hover:text-white">Home</a>
            <span className="mx-2">/</span>
            <span className="text-white">Blogs</span>
          </nav>
          <h1 className="text-4xl font-black text-white md:text-5xl">
            EV Blogs & <span className="text-green-400">Guides</span>
          </h1>
          <p className="mt-3 text-gray-400">
            Expert insights, buying guides, and everything you need to know about electric vehicles in India
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Featured Blog */}
        <section className="mb-12">
          <Link href={`/blogs/${featured.slug}`} className="group block">
            <article className="grid overflow-hidden rounded-3xl border border-gray-100 shadow-lg md:grid-cols-2">
              <div className="relative h-64 md:h-auto">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent md:hidden" />
              </div>
              <div className="flex flex-col justify-center p-8">
                <div className="mb-3 flex gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    FEATURED
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${categoryColors[featured.category]}`}>
                    {featured.category}
                  </span>
                </div>
                <h2 className="text-2xl font-black leading-tight text-gray-900 group-hover:text-green-600 md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-4 text-gray-500 leading-relaxed">{featured.excerpt}</p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>{featured.author}</span>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <Clock3 size={14} />
                      {featured.readTime}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:gap-2 transition-all">
                    Read <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </section>

        <AdBannerHorizontal slot="2468013579" />

        {/* All Blogs Grid */}
        <section className="mt-10">
          <h2 className="mb-6 text-2xl font-black text-gray-900">All Articles</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((blog) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group block">
                <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute left-3 top-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${categoryColors[blog.category] || "bg-gray-100 text-gray-600"}`}>
                        {blog.category}
                      </span>
                    </div>
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
                        {new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
    </>
  );
}
