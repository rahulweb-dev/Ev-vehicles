import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import Image from "next/image";
import Link from "next/link";
import { Clock3, Calendar, ChevronRight, Tag } from "lucide-react";
import NewsCard from "@/components/news/NewsCard";
import ShareLikeButtons from "@/components/news/ShareLikeButtons";
import { AdBannerInArticle } from "@/components/ads/AdBanner";
import { SITE_URL, SITE_NAME } from "@/app/layout";
import ArticleAudioPlayer from "@/components/audio/ArticleAudioPlayer";
import ReadingProgress from "@/components/ReadingProgress";
import NewsletterSidebar from "@/components/NewsletterSidebar";
import PromoBanner from "@/components/PromoBanner";
import BookmarkButton from "@/components/BookmarkButton";
import ArticleViewCounter from "@/components/ArticleViewCounter";
import ArticleComments from "@/components/ArticleComments";
import TrendingWidget from "@/components/TrendingWidget";
import ArticleStickyBar from "@/components/ArticleStickyBar";

export const revalidate = 300;

async function getArticle(slug) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article = (await import("@/lib/models/Article")).default;
    await dbConnect();
    const article = await Article.findOne({ slug, status: "published" }).lean();
    return article || null;
  } catch {
    const { getArticleBySlug } = await import("@/data/newsArticles");
    return getArticleBySlug(slug);
  }
}

async function getFeaturedVehicle(tags = []) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const orConditions = tags.map(t => ({ name: { $regex: t, $options: "i" } }))
      .concat(tags.map(t => ({ brand: { $regex: t, $options: "i" } })));
    if (!orConditions.length) return null;
    return await Vehicle.findOne({ status: "published", $or: orConditions })
      .select("slug name brand featuredImage variants performance vehicleType")
      .lean();
  } catch {
    return null;
  }
}

async function getRelated(category, currentSlug) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article = (await import("@/lib/models/Article")).default;
    await dbConnect();
    const articles = await Article.find({ category, status: "published", slug: { $ne: currentSlug } })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();
    return articles;
  } catch {
    const { getRelatedArticles } = await import("@/data/newsArticles");
    return getRelatedArticles(currentSlug, category, 3);
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    keywords: article.tags,
    authors: [{ name: article.author }],
    alternates: { canonical: `${SITE_URL}/news/${article.slug}` },
    other: {
      "news_keywords": article.tags?.join(", ") || "",
      "article:publisher":      "https://www.facebook.com/EVNewsIndia",
      "article:published_time": article.publishedAt ? new Date(article.publishedAt).toISOString() : "",
      "article:modified_time":  article.updatedAt  ? new Date(article.updatedAt).toISOString()  : (article.publishedAt ? new Date(article.publishedAt).toISOString() : ""),
      "article:author":         article.author || "",
      "article:section":        article.category || "Electric Vehicles",
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${SITE_URL}/news/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: [{
        url: article.image || `${SITE_URL}/api/og?title=${encodeURIComponent(article.title)}&tag=${encodeURIComponent(article.category)}&type=article`,
        width: 1200, height: 630, alt: article.title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image || `${SITE_URL}/api/og?title=${encodeURIComponent(article.title)}&tag=${encodeURIComponent(article.category)}`, alt: article.title }],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const [related, featuredVehicle] = await Promise.all([
    getRelated(article.category, slug),
    getFeaturedVehicle(article.tags || []),
  ]);

  const safeContent = sanitizeHtml(article.content || "", {
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

  const wordCount = safeContent
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [article.image],
    url: `${SITE_URL}/news/${slug}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    wordCount,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".article-lede"],
    },
    author: {
      "@type": "Person",
      name: article.author,
      url: `${SITE_URL}/authors/${encodeURIComponent((article.author || "").toLowerCase().replace(/\s+/g, "-"))}`,
      worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/news/${slug}` },
    keywords: article.tags?.join(", "),
    articleSection: article.category,
    about: { "@type": "Thing", name: article.category },
    ...(article.tags?.length && {
      mentions: article.tags.map(tag => ({ "@type": "Thing", name: tag })),
    }),
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    copyrightYear: new Date(article.publishedAt || Date.now()).getFullYear(),
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}/news` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${SITE_URL}/news/${slug}` },
    ],
  };

  const faqJsonLd = article.faqs?.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  } : null;

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
            <article>
              {/* Breadcrumb */}
              <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
                <Link href="/" className="hover:text-green-600">Home</Link>
                <ChevronRight size={14} />
                <Link href="/news" className="hover:text-green-600">News</Link>
                <ChevronRight size={14} />
                <Link href={`/news?category=${article.category}`} className="capitalize text-green-600 hover:text-green-800">{article.category}</Link>
              </nav>

              <header>
                <div className="mb-4 flex flex-wrap gap-2">
                  {article.tags?.map((tag) => (
                    <Link key={tag} href={`/news/tags/${encodeURIComponent(tag)}`} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 transition">
                      <Tag size={11} />{tag}
                    </Link>
                  ))}
                </div>
                <h1 className="text-3xl font-black leading-tight text-gray-900 md:text-4xl lg:text-5xl">
                  {article.title}
                </h1>
                <div className="article-lede mt-4 rounded-xl border-l-4 border-green-500 bg-green-50 px-5 py-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-green-700">Quick Summary</p>
                  <p className="text-lg leading-relaxed text-gray-700">{article.excerpt}</p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-gray-100 py-4 text-sm text-gray-500">
                  <Link href={`/authors/${encodeURIComponent(article.author?.toLowerCase().replace(/\s+/g, "-") || "")}`} className="flex items-center gap-2 hover:opacity-80 transition">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                      {article.author?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{article.author}</p>
                      <p className="text-xs">EV News India</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={15} />
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock3 size={15} />
                    {article.readTime} read
                  </div>
                  <ArticleViewCounter slug={article.slug} initialViews={article.views || 0} />
                </div>
              </header>

              {/* Share & Like bar */}
              <div className="my-6 flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
                <p className="text-sm font-semibold text-gray-600">Enjoyed this article?</p>
                <div className="flex items-center gap-2">
                  <BookmarkButton slug={article.slug} title={article.title} image={article.image} excerpt={article.excerpt} />
                  <ShareLikeButtons slug={article.slug} title={article.title} url={`${SITE_URL.replace(/\/$/, "")}/news/${article.slug}`} image={article.image} initialLikes={article.likes || 0} />
                </div>
              </div>

              {/* Audio Player */}
              <ArticleAudioPlayer title={article.title} content={article.content} />

              {article.image && (
                <div className="relative my-8 h-62.5 overflow-hidden rounded-2xl sm:h-87.5 md:h-112.5">
                  <Image src={article.image} alt={article.imageAlt || article.title} fill className="object-cover" priority sizes="800px" />
                </div>
              )}

              <AdBannerInArticle slot="4567890123" />

              <div
                className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:my-1"
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />

              <AdBannerInArticle slot="5678901234" />

              {article.faqs?.length > 0 && (
                <section className="mt-10 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                  <h2 className="mb-4 text-xl font-black text-gray-900">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {article.faqs.map(({ question, answer }, i) => (
                      <details key={i} className="group rounded-xl border border-gray-200 bg-white">
                        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-base font-semibold text-gray-900">
                          {question}
                          <span className="ml-2 shrink-0 text-gray-400 transition-transform group-open:rotate-180">▾</span>
                        </summary>
                        <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">{answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Prominent WhatsApp share CTA */}
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
                <div>
                  <p className="font-black text-gray-900 text-base">Found this helpful?</p>
                  <p className="text-sm text-gray-600">Share with your friends &amp; EV community</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(article.title + "\n\nRead more: " + SITE_URL + "/news/" + article.slug)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#20bd5b] transition active:scale-95"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Share on WhatsApp
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(SITE_URL + "/news/" + article.slug)}&text=${encodeURIComponent(article.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-[#2AABEE] px-4 py-3 text-sm font-bold text-white shadow hover:bg-[#229ed9] transition active:scale-95"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Telegram
                  </a>
                </div>
              </div>

              <ArticleComments slug={article.slug} />

              {article.tags?.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <Tag size={13} /> Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/news/tags/${encodeURIComponent(tag)}`}
                        className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <aside className="space-y-8">
              <div className="sticky top-24 space-y-8">
                <AdBannerInArticle slot="6789012345" />
                <TrendingWidget />
                {featuredVehicle && (
                  <div className="overflow-hidden rounded-2xl border border-green-100 bg-green-50">
                    <div className="border-b border-green-100 bg-green-600 px-4 py-2.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-white">Featured EV</p>
                    </div>
                    <Link href={`/${featuredVehicle.vehicleType === "car" ? "cars" : "bikes"}/${featuredVehicle.slug}`} className="group block p-4">
                      {featuredVehicle.featuredImage && (
                        <div className="relative mb-3 h-36 overflow-hidden rounded-xl bg-white">
                          <Image
                            src={featuredVehicle.featuredImage}
                            alt={featuredVehicle.name}
                            fill
                            className="object-contain p-2 transition duration-300 group-hover:scale-105"
                            sizes="320px"
                          />
                        </div>
                      )}
                      <p className="text-xs font-bold uppercase tracking-wide text-green-700">{featuredVehicle.brand}</p>
                      <p className="text-base font-black text-gray-900 group-hover:text-green-700 transition">{featuredVehicle.name}</p>
                      {featuredVehicle.variants?.[0]?.exShowroomPrice && (
                        <p className="mt-1 text-sm font-semibold text-gray-600">
                          From {featuredVehicle.variants[0].exShowroomPrice}
                        </p>
                      )}
                      {featuredVehicle.performance?.drivingRange && (
                        <p className="text-xs text-gray-500">Range: {featuredVehicle.performance.drivingRange}</p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white group-hover:bg-green-700 transition">
                        View Full Details →
                      </span>
                    </Link>
                  </div>
                )}
                {related.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-lg font-black text-gray-900">Related Stories</h3>
                    <div className="space-y-3">
                      {related.map((a) => (
                        <NewsCard key={a._id || a.id} article={a} variant="horizontal" />
                      ))}
                    </div>
                  </div>
                )}
                <NewsletterSidebar />
                <PromoBanner platform="desktop" position="sidebar" />
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <section className="mt-16 border-t border-gray-100 pt-10">
              <h2 className="mb-6 text-2xl font-black text-gray-900">More Stories You May Like</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((a) => (
                  <NewsCard key={a._id || a.id} article={a} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Author Bio */}
        {article.author && (
          <div className="mx-auto max-w-7xl px-4 pb-10">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex items-start gap-4">
                <Link
                  href={`/authors/${encodeURIComponent((article.author || "").toLowerCase().replace(/\s+/g, "-"))}`}
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-2xl font-black text-white hover:opacity-90 transition"
                >
                  {article.author.charAt(0).toUpperCase()}
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Written by</p>
                  <Link
                    href={`/authors/${encodeURIComponent((article.author || "").toLowerCase().replace(/\s+/g, "-"))}`}
                    className="text-lg font-black text-gray-900 hover:text-green-700 transition"
                  >
                    {article.author}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    EV journalist at EV News India — covering electric cars, bikes, and India&apos;s EV revolution.
                  </p>
                  <Link
                    href={`/authors/${encodeURIComponent((article.author || "").toLowerCase().replace(/\s+/g, "-"))}`}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition"
                  >
                    View all articles by {article.author} →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ArticleStickyBar />
    </>
  );
}
