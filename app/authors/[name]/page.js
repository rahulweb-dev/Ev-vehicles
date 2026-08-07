import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Newspaper, Award, Clock, BookOpen, CheckCircle } from "lucide-react";
import { FaXTwitter, FaLinkedin } from "react-icons/fa6";
import NewsCard from "@/components/news/NewsCard";
import { SITE_URL, SITE_NAME } from "@/app/layout";

export const revalidate = 300;

async function getAuthorData(name) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    const Author    = (await import("@/lib/models/Author")).default;
    await dbConnect();

    const decoded = decodeURIComponent(name).replace(/-/g, " ");

    const [articles, profile] = await Promise.all([
      Article.find({ status: "published", author: { $regex: new RegExp(decoded, "i") } })
        .sort({ publishedAt: -1 }).limit(30).lean(),
      Author.findOne({ slug: name }).lean(),
    ]);

    const authorName = articles[0]?.author || decoded;
    return { articles, authorName, profile };
  } catch {
    const decoded = decodeURIComponent(name).replace(/-/g, " ");
    return { articles: [], authorName: decoded, profile: null };
  }
}

export async function generateMetadata({ params }) {
  const { name } = await params;
  const { authorName, profile } = await getAuthorData(name);
  const title = profile?.title || "EV Journalist";
  return {
    title: `${authorName} – ${title} | ${SITE_NAME}`,
    description: profile?.bio || `Articles by ${authorName} on ${SITE_NAME} – India's leading electric vehicle news and reviews platform.`,
    alternates: { canonical: `${SITE_URL}/authors/${name}` },
    openGraph: {
      title: `${authorName} – ${title}`,
      description: profile?.bio || `Read ${authorName}'s EV articles on EVRadar.`,
      url: `${SITE_URL}/authors/${name}`,
      type: "profile",
      images: [{
        url: profile?.photo || `${SITE_URL}/api/og?title=${encodeURIComponent(authorName)}&subtitle=${encodeURIComponent(title + " · EV Radar")}&tag=default&type=page`,
        width: 1200, height: 630,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${authorName} – ${title} | ${SITE_NAME}`,
      description: profile?.bio || `Read ${authorName}'s EV articles on EVRadar India.`,
      images: [profile?.photo || `${SITE_URL}/api/og?title=${encodeURIComponent(authorName)}&subtitle=${encodeURIComponent(title + " · EV Radar")}&tag=default&type=page`],
    },
  };
}

export default async function AuthorPage({ params }) {
  const { name } = await params;
  const { articles, authorName, profile } = await getAuthorData(name);

  if (!articles.length) notFound();

  const categories  = [...new Set(articles.map(a => a.category))];
  const totalViews  = articles.reduce((s, a) => s + (a.views || 0), 0);
  const latestDate  = articles[0]?.publishedAt
    ? new Date(articles[0].publishedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short" })
    : null;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: authorName,
    url: `${SITE_URL}/authors/${name}`,
    ...(profile?.photo && { image: profile.photo }),
    ...(profile?.title && { jobTitle: profile.title }),
    ...(profile?.bio   && { description: profile.bio }),
    ...((profile?.twitter || profile?.linkedin) && {
      sameAs: [
        profile?.twitter && `https://twitter.com/${profile.twitter.replace("@", "")}`,
        profile?.linkedin,
      ].filter(Boolean),
    }),
    worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    knowsAbout: profile?.expertise?.length ? profile.expertise : ["Electric Vehicles", "EV Radar"],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",    item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Authors", item: `${SITE_URL}/authors` },
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
            <Link href="/authors" className="hover:text-green-600">Authors</Link>
            <ChevronRight size={14} />
            <span className="text-green-600">{authorName}</span>
          </nav>

          {/* Author hero */}
          <div className="mb-8 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-24 bg-linear-to-r from-green-700 to-emerald-500" />
            <div className="px-6 pb-6 -mt-10 flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="shrink-0">
                {profile?.photo ? (
                  <Image src={profile.photo} alt={authorName} width={80} height={80}
                    className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-green-600 text-3xl font-black text-white shadow-md">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 pt-4 sm:pt-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-gray-900">{authorName}</h1>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                    {profile?.title || "EV Journalist"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Newspaper size={13} /> {articles.length} article{articles.length !== 1 ? "s" : ""}</span>
                  {profile?.yearsExp > 0 && <span className="flex items-center gap-1"><Clock size={13} /> {profile.yearsExp}+ years exp.</span>}
                  {totalViews > 0 && <span className="flex items-center gap-1"><BookOpen size={13} /> {(totalViews / 1000).toFixed(1)}K reads</span>}
                  {latestDate && <span className="text-gray-400">Latest: {latestDate}</span>}
                </div>

                {/* Social */}
                {(profile?.twitter || profile?.linkedin) && (
                  <div className="mt-2 flex gap-2">
                    {profile.twitter && (
                      <a href={`https://twitter.com/${profile.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition">
                        <FaXTwitter size={12} /> {profile.twitter}
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-blue-600 hover:text-blue-700 transition">
                        <FaLinkedin size={12} /> LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bio + credentials — always render a bio (fallback if no DB profile) */}
            <div className="border-t border-gray-100 px-6 py-5 grid sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2">
                <p className="text-sm font-bold text-gray-700 mb-1.5">About</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile?.bio ||
                    `${authorName} is a contributor and journalist at EV Radar — India's leading electric vehicle news and reviews platform. With ${articles.length} published article${articles.length !== 1 ? "s" : ""} covering ${categories.length > 0 ? categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") : "electric vehicles"}, their work helps Indian readers make informed decisions about EV purchases, charging, policy, and the future of mobility.`}
                </p>
              </div>
              <div className="space-y-4">
                {profile?.credentials?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1"><Award size={12} className="text-green-600" /> Credentials</p>
                    <ul className="space-y-1">
                      {profile.credentials.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                          <CheckCircle size={10} className="text-green-500 shrink-0 mt-0.5" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {profile?.expertise?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-1.5">Covers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.expertise.map((e, i) => (
                        <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{e}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category filters */}
          {categories.length > 1 && (
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="text-sm font-semibold text-gray-500 self-center">Topics:</span>
              {categories.map(c => (
                <span key={c} className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold capitalize text-gray-700 shadow-sm">{c}</span>
              ))}
            </div>
          )}

          {/* Articles grid */}
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
