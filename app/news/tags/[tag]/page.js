import { notFound } from "next/navigation";
import Link from "next/link";
import { Tag, ChevronRight } from "lucide-react";
import NewsCard from "@/components/news/NewsCard";
import { SITE_URL } from "@/app/layout";

export const revalidate = 300;

async function getArticlesByTag(tag) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();
    const decoded = decodeURIComponent(tag);
    const articles = await Article.find({
      status: "published",
      tags: { $regex: new RegExp(`^${decoded}$`, "i") },
    }).sort({ publishedAt: -1 }).limit(30).lean();
    return { articles, tag: decoded };
  } catch {
    return { articles: [], tag: decodeURIComponent(tag) };
  }
}

export async function generateMetadata({ params }) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} – EV News`,
    description: `Latest electric vehicle news tagged with ${decoded} on EVRadar India.`,
    alternates: { canonical: `${SITE_URL}/news/tags/${tag}` },
  };
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  const { articles, tag: decodedTag } = await getArticlesByTag(tag);

  if (!articles.length) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",          item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News",          item: `${SITE_URL}/news` },
      { "@type": "ListItem", position: 3, name: `#${decodedTag}`, item: `${SITE_URL}/news/tags/${tag}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <ChevronRight size={14} />
          <Link href="/news" className="hover:text-green-600">News</Link>
          <ChevronRight size={14} />
          <span className="text-green-600">#{decodedTag}</span>
        </nav>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
            <Tag size={22} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">#{decodedTag}</h1>
            <p className="mt-0.5 text-sm text-gray-500">{articles.length} article{articles.length !== 1 ? "s" : ""}</p>
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
