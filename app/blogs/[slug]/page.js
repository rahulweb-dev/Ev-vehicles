import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import Image from "next/image";
import Link from "next/link";
import { Clock3, Calendar, ChevronRight, Zap } from "lucide-react";
import { getBlogBySlug, getRelatedBlogs, blogsData } from "@/data/blogsData";
import { AdBannerInArticle, AdBannerHorizontal } from "@/components/ads/AdBanner";
import { SITE_URL, SITE_NAME } from "@/app/layout";
import ArticleAudioPlayer from "@/components/audio/ArticleAudioPlayer";
import ShareButtons from "@/components/ShareButtons";
import TableOfContents from "@/components/TableOfContents";

async function getBlogFromDb(slug) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Blog = (await import("@/lib/models/Blog")).default;
    await dbConnect();
    const blog = await Blog.findOne({ slug, status: "published" }).lean();
    if (blog) return { ...blog, id: blog._id.toString(), tags: blog.tags || [] };
  } catch {}
  return null;
}

async function getFeaturedVehicle(tags = []) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const query = tags.length
      ? { status: "published", $or: [{ brand: { $in: tags } }, { name: { $in: tags } }] }
      : { status: "published", featured: true };
    return await Vehicle.findOne(query)
      .sort({ featured: -1 })
      .select("slug name brand featuredImage performance variants vehicleType")
      .lean();
  } catch { return null; }
}

async function getRelatedFromDb(slug, category) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Blog = (await import("@/lib/models/Blog")).default;
    await dbConnect();
    return await Blog.find({ slug: { $ne: slug }, status: "published", category })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();
  } catch {}
  return [];
}

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Blog = (await import("@/lib/models/Blog")).default;
    await dbConnect();
    const docs = await Blog.find({ status: "published" }).select("slug").lean();
    if (docs.length > 0) return docs.map(b => ({ slug: b.slug }));
  } catch {}
  return blogsData.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = (await getBlogFromDb(slug)) || getBlogBySlug(slug);

  if (!blog) return { title: "Blog Not Found" };

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: blog.tags,
    authors: [{ name: blog.author }],
    alternates: { canonical: `${SITE_URL}/blogs/${blog.slug}` },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: `${SITE_URL}/blogs/${blog.slug}`,
      type: "article",
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt || blog.publishedAt,
      images: [{ url: blog.image, width: 1200, height: 630, alt: blog.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [{ url: blog.image, alt: blog.title }],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const blog = (await getBlogFromDb(slug)) || getBlogBySlug(slug);

  if (!blog) notFound();

  const [dbRelated, featuredVehicle] = await Promise.all([
    getRelatedFromDb(slug, blog.category),
    getFeaturedVehicle(blog.tags || []),
  ]);
  const related = dbRelated.length > 0 ? dbRelated : getRelatedBlogs(slug, 3);

  const safeContent = sanitizeHtml(blog.content || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img", "h1", "h2", "h3", "h4", "h5", "h6",
      "figure", "figcaption", "table", "thead", "tbody", "tr", "td", "th",
      "iframe", "picture", "source",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "img":    ["src", "alt", "width", "height", "loading", "class"],
      "a":      ["href", "target", "rel", "class"],
      "iframe": ["src", "width", "height", "frameborder", "allowfullscreen", "loading", "title"],
      "table":  ["class"],
      "td":     ["colspan", "rowspan", "class"],
      "th":     ["colspan", "rowspan", "class"],
      "*":      ["class"],
    },
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "player.vimeo.com"],
  });

  // Inject data-toc-id onto h2/h3 so the client TOC component can scroll to them
  let tocIndex = 0;
  const tocContent = safeContent.replace(/<(h[23])(\s[^>]*)?>/g, (_, tag, attrs) => {
    return `<${tag}${attrs || ""} data-toc-id="toc-heading-${tocIndex++}">`;
  });

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blogs", item: `${SITE_URL}/blogs` },
      { "@type": "ListItem", position: 3, name: blog.title, item: `${SITE_URL}/blogs/${blog.slug}` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    image: [blog.image],
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt || blog.publishedAt,
    inLanguage: "en-IN",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".blog-lede"],
    },
    author: {
      "@type": "Person",
      name: blog.author,
      url: `${SITE_URL}/authors/${encodeURIComponent((blog.author || "").toLowerCase().replace(/\s+/g, "-"))}`,
      worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blogs/${blog.slug}`,
    },
    keywords: blog.tags?.join(", "),
    url: `${SITE_URL}/blogs/${blog.slug}`,
    about: { "@type": "Thing", name: blog.category },
    ...(blog.tags?.length && {
      mentions: blog.tags.map(tag => ({ "@type": "Thing", name: tag })),
    }),
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    copyrightYear: new Date(blog.publishedAt || Date.now()).getFullYear(),
    wordCount: blog.content ? blog.content.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <ChevronRight size={14} />
            <Link href="/blogs" className="hover:text-green-600">Blogs</Link>
            <ChevronRight size={14} />
            <span className="capitalize text-green-600">{blog.category}</span>
          </nav>

          {/* Header */}
          <header>
            <div className="mb-4">
              <span className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-bold capitalize text-green-700">
                {blog.category}
              </span>
            </div>
            <h1 className="text-3xl font-black leading-tight text-gray-900 md:text-4xl lg:text-5xl">
              {blog.title}
            </h1>
            <p className="blog-lede mt-4 text-lg text-gray-500 leading-relaxed">{blog.excerpt}</p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-gray-100 py-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  {blog.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{blog.author}</p>
                  <p className="text-xs text-gray-400">EV Radar</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={15} />
                {new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock3 size={15} />
                {blog.readTime} read
              </div>
              <ShareButtons url={`${SITE_URL}/blogs/${blog.slug}`} title={blog.title} />
            </div>
          </header>

          {/* Audio Player */}
          <ArticleAudioPlayer title={blog.title} content={blog.content} />

          {/* Hero Image */}
          <div className="relative my-8 h-[250px] overflow-hidden rounded-2xl sm:h-[400px]">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>

          {/* In-article Ad */}
          <AdBannerInArticle slot="3579124680" />

          {/* Table of Contents */}
          <TableOfContents content={safeContent} />

          {/* Blog Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:my-1 prose-table:text-sm"
            dangerouslySetInnerHTML={{ __html: tocContent }}
          />

          {/* Second Ad */}
          <AdBannerInArticle slot="4680235791" />

          {/* Tags — linked for internal crawl signal */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 border-t border-gray-100 pt-6">
              {blog.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/news/tags/${encodeURIComponent(tag)}`}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-green-100 hover:text-green-700 transition"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Featured vehicle sidebar — cross-links to relevant EV */}
          {featuredVehicle && (
            <div className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-green-600">Featured EV</p>
              <Link
                href={`/${featuredVehicle.vehicleType === "car" ? "cars" : featuredVehicle.vehicleType === "bike" ? "bikes" : "commercial"}/${featuredVehicle.slug}`}
                className="group flex items-center gap-4"
              >
                {featuredVehicle.featuredImage && (
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={featuredVehicle.featuredImage}
                      alt={featuredVehicle.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="112px"
                    />
                  </div>
                )}
                <div>
                  <p className="font-black text-gray-900 group-hover:text-green-700 transition">{featuredVehicle.name}</p>
                  <p className="text-sm text-gray-500">{featuredVehicle.brand}</p>
                  {featuredVehicle.variants?.[0]?.exShowroomPrice && (
                    <p className="mt-1 text-sm font-semibold text-green-700">
                      From {featuredVehicle.variants[0].exShowroomPrice}
                    </p>
                  )}
                  {featuredVehicle.performance?.drivingRange && (
                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Zap size={10} className="text-green-500" />
                      {featuredVehicle.performance.drivingRange} range
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Related Blogs */}
        {related.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 py-12">
            <div className="mx-auto max-w-7xl px-4">
              <AdBannerHorizontal slot="5791346802" />
              <h2 className="mt-8 mb-6 text-2xl font-black text-gray-900">More Articles You&apos;ll Love</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((b) => (
                  <Link key={b.id} href={`/blogs/${b.slug}`} className="group block">
                    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg">
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={b.image}
                          alt={b.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="33vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-green-600">
                          {b.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <Clock3 size={12} />
                          {b.readTime}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
