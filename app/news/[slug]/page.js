import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock3, Calendar, ChevronRight, Tag } from "lucide-react";
import NewsCard from "@/components/news/NewsCard";
import ShareLikeButtons from "@/components/news/ShareLikeButtons";
import { AdBannerInArticle } from "@/components/ads/AdBanner";
import { SITE_URL, SITE_NAME } from "@/app/layout";
import ArticleAudioPlayer from "@/components/audio/ArticleAudioPlayer";

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
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${SITE_URL}/news/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: [{ url: article.image, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const related = await getRelated(article.category, slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [article.image],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: { "@type": "Person", name: article.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/news/${slug}` },
    keywords: article.tags?.join(", "),
    articleSection: article.category,
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

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
                <span className="capitalize text-green-600">{article.category}</span>
              </nav>

              <header>
                <div className="mb-4 flex flex-wrap gap-2">
                  {article.tags?.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      <Tag size={11} />{tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl font-black leading-tight text-gray-900 md:text-4xl lg:text-5xl">
                  {article.title}
                </h1>
                <p className="mt-4 text-lg leading-relaxed text-gray-600">{article.excerpt}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-gray-100 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                      {article.author?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{article.author}</p>
                      <p className="text-xs">EV News India</p>
                    </div>
                  </div>
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
                </div>
              </header>

              {/* Share & Like bar */}
              <div className="my-6 flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
                <p className="text-sm font-semibold text-gray-600">Enjoyed this article?</p>
                <ShareLikeButtons slug={article.slug} title={article.title} url={`${SITE_URL.replace(/\/$/, "")}/news/${article.slug}`} />
              </div>

              {/* Audio Player */}
              <ArticleAudioPlayer title={article.title} content={article.content} />

              <div className="relative my-8 h-[250px] overflow-hidden rounded-2xl sm:h-[350px] md:h-[450px]">
                <Image src={article.image} alt={article.imageAlt || article.title} fill className="object-cover" priority sizes="800px" />
              </div>

              <AdBannerInArticle slot="4567890123" />

              <div
                className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:my-1"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <AdBannerInArticle slot="5678901234" />

              <div className="mt-8 flex flex-wrap gap-2 border-t border-gray-100 pt-6">
                {article.tags?.map((tag) => (
                  <span key={tag} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">#{tag}</span>
                ))}
              </div>
            </article>

            <aside className="space-y-8">
              <div className="sticky top-24 space-y-8">
                <AdBannerInArticle slot="6789012345" />
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
                <div className="rounded-2xl bg-green-600 p-5 text-white">
                  <h3 className="font-bold text-lg">Get EV News Daily</h3>
                  <p className="mt-1 text-sm text-green-100">Join 50,000+ readers who never miss an EV update.</p>
                  <input type="email" placeholder="Your email" className="mt-4 w-full rounded-xl bg-white/20 px-4 py-2.5 text-sm text-white placeholder-green-200 outline-none" />
                  <button className="mt-3 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-green-700">Subscribe Free</button>
                </div>
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
      </div>
    </>
  );
}
