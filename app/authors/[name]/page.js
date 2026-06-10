import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Newspaper } from "lucide-react";
import NewsCard from "@/components/news/NewsCard";
import { SITE_URL, SITE_NAME } from "@/app/layout";

export const revalidate = 300;

async function getAuthorArticles(name) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();
    const decoded = decodeURIComponent(name).replace(/-/g, " ");
    const articles = await Article.find({
      status: "published",
      author: { $regex: new RegExp(decoded, "i") },
    }).sort({ publishedAt: -1 }).limit(30).lean();
    return { articles, authorName: articles[0]?.author || decoded };
  } catch {
    return { articles: [], authorName: decodeURIComponent(name).replace(/-/g, " ") };
  }
}

export async function generateMetadata({ params }) {
  const { name } = await params;
  const decoded = decodeURIComponent(name).replace(/-/g, " ");
  return {
    title: `${decoded} – EV News Author`,
    description: `Articles by ${decoded} on ${SITE_NAME} – India's leading electric vehicle news platform.`,
    alternates: { canonical: `${SITE_URL}/authors/${name}` },
  };
}

export default async function AuthorPage({ params }) {
  const { name } = await params;
  const { articles, authorName } = await getAuthorArticles(name);

  if (!articles.length) notFound();

  const categories = [...new Set(articles.map(a => a.category))];

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: authorName,
    url: `${SITE_URL}/authors/${name}`,
    worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",   item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News",   item: `${SITE_URL}/news` },
      { "@type": "ListItem", position: 3, name: authorName, item: `${SITE_URL}/authors/${name}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <ChevronRight size={14} />
          <Link href="/news" className="hover:text-green-600">News</Link>
          <ChevronRight size={14} />
          <span className="text-green-600">{authorName}</span>
        </nav>

        {/* Author card */}
        <div className="mb-8 flex items-center gap-5 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-600 text-2xl font-black text-white">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{authorName}</h1>
            <p className="mt-0.5 text-sm text-gray-500">{SITE_NAME} Contributor</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Newspaper size={14} /> {articles.length} article{articles.length !== 1 ? "s" : ""}</span>
              <div className="flex gap-1.5">
                {categories.map(c => (
                  <span key={c} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-green-700">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((a) => (
            <NewsCard key={a._id?.toString()} article={a} />
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
