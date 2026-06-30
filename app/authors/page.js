import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Newspaper, X, Award } from "lucide-react";
import { FaLinkedin } from "react-icons/fa6";
import { SITE_URL, SITE_NAME } from "@/app/layout";

export const revalidate = 600;

export const metadata = {
  title: `Our Authors & EV Journalists | ${SITE_NAME}`,
  description: `Meet the expert EV journalists and automotive writers behind ${SITE_NAME} — India's #1 electric vehicle news platform.`,
  alternates: { canonical: `${SITE_URL}/authors` },
  openGraph: {
    title: `EV Journalists & Authors | ${SITE_NAME}`,
    description: `Expert writers covering electric vehicles, EV news, and reviews in India.`,
    url: `${SITE_URL}/authors`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Journalists %26 Authors&subtitle=Expert writers covering EVs in India&tag=default&type=page`, width: 1200, height: 630, alt: "EV Journalists & Authors – EV News India" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `EV Journalists & Authors | ${SITE_NAME}`,
    description: `Expert writers covering electric vehicles, EV news, and reviews in India.`,
    images: [`${SITE_URL}/api/og?title=EV Journalists %26 Authors&subtitle=Expert writers covering EVs in India&tag=default&type=page`],
  },
};

async function getAuthors() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article = (await import("@/lib/models/Article")).default;
    const Author = (await import("@/lib/models/Author")).default;
    await dbConnect();

    const [profiles, authorCounts] = await Promise.all([
      Author.find({}).sort({ name: 1 }).lean(),
      Article.aggregate([
        { $match: { status: "published", author: { $exists: true, $ne: "" } } },
        { $group: { _id: "$author", count: { $sum: 1 }, latest: { $max: "$publishedAt" } } },
      ]),
    ]);

    const countMap = Object.fromEntries(authorCounts.map(a => [a._id?.toLowerCase(), { count: a.count, latest: a.latest }]));

    if (profiles.length > 0) {
      return profiles.map(p => ({
        name: p.name,
        slug: p.slug,
        photo: p.photo || "",
        title: p.title || "EV Journalist",
        bio: p.bio || "",
        twitter: p.twitter || "",
        linkedin: p.linkedin || "",
        expertise: p.expertise || [],
        articleCount: countMap[p.name?.toLowerCase()]?.count || 0,
        latestArticle: countMap[p.name?.toLowerCase()]?.latest || null,
      }));
    }

    // Fallback: derive from article authors
    return authorCounts
      .sort((a, b) => b.count - a.count)
      .map(a => ({
        name: a._id,
        slug: a._id?.toLowerCase().replace(/\s+/g, "-"),
        photo: "",
        title: "EV Journalist",
        bio: "",
        twitter: "",
        linkedin: "",
        expertise: [],
        articleCount: a.count,
        latestArticle: a.latest,
      }));
  } catch {
    return [];
  }
}

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Authors", item: `${SITE_URL}/authors` },
  ],
};

export default async function AuthorsPage() {
  const authors = await getAuthors();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-7xl px-4">

          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-400">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <ChevronRight size={13} />
            <span className="text-gray-700 font-medium">Authors</span>
          </nav>

          {/* Header */}
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700">
              Meet the team
            </span>
            <h1 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">Our EV Journalists</h1>
            <p className="mt-3 text-base text-gray-500 max-w-xl mx-auto">
              Expert writers and automotive enthusiasts covering India&apos;s electric vehicle revolution.
            </p>
          </div>

          {authors.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <Newspaper size={40} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">No authors found</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {authors.map(author => (
                <AuthorCard key={author.slug} author={author} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AuthorCard({ author }) {
  const initial = author.name?.charAt(0)?.toUpperCase() || "A";
  return (
    <Link
      href={`/authors/${author.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:border-green-200"
    >
      {/* Top bar */}
      <div className="h-16 bg-linear-to-r from-gray-900 to-gray-700" />

      <div className="px-5 pb-5 -mt-8">
        {/* Avatar */}
        <div className="mb-3 flex items-end justify-between">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border-4 border-white shadow-md">
            {author.photo ? (
              <Image
                src={author.photo}
                alt={author.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-green-100 text-xl font-black text-green-700">
                {initial}
              </div>
            )}
          </div>
          <div className="flex gap-2 pb-0.5">
            {author.twitter && (
              <span className="rounded-full bg-blue-50 p-1.5 text-blue-500">
                <X size={13} />
              </span>
            )}
            {author.linkedin && (
              <span className="rounded-full bg-blue-50 p-1.5 text-blue-600">
                <FaLinkedin size={13} />
              </span>
            )}
          </div>
        </div>

        <h2 className="text-lg font-black text-gray-900 group-hover:text-green-700 transition">{author.name}</h2>
        <p className="text-xs font-semibold text-green-600">{author.title}</p>

        {author.bio && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{author.bio}</p>
        )}

        {author.expertise?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {author.expertise.slice(0, 3).map(e => (
              <span key={e} className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                <Award size={10} className="text-yellow-500" /> {e}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
          <Newspaper size={12} />
          <span className="font-semibold text-gray-600">{author.articleCount}</span>
          <span>article{author.articleCount !== 1 ? "s" : ""} published</span>
        </div>
      </div>
    </Link>
  );
}
