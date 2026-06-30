import Link from "next/link";
import Image from "next/image";
import { Search, Car, Bike, Newspaper, ArrowRight, ChevronRight } from "lucide-react";
import { SITE_URL } from "@/app/layout";

export const revalidate = 0; // always fresh — search results must not be cached

export async function generateMetadata({ searchParams }) {
  const { q = "" } = await searchParams;
  if (!q.trim()) {
    return {
      title: "Search EVs & News",
      robots: { index: false, follow: true },
    };
  }
  return {
    title: `"${q}" – Search Results`,
    description: `Find electric vehicles and EV news matching "${q}" in India. Browse matching cars, bikes, and articles.`,
    alternates: { canonical: `${SITE_URL}/search?q=${encodeURIComponent(q)}` },
    robots: { index: false, follow: true },
  };
}

async function runSearch(q, type) {
  if (!q?.trim()) return { articles: [], cars: [], bikes: [] };
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();

    const rex = { $regex: q, $options: "i" };
    const wantVehicles = type !== "news";
    const wantArticles = type !== "cars" && type !== "bikes";

    const [vehicleDocs, articleDocs] = await Promise.all([
      wantVehicles
        ? Vehicle.find({
            status: "published",
            ...(type === "cars"  ? { vehicleType: "car"  } : {}),
            ...(type === "bikes" ? { vehicleType: "bike" } : {}),
            $or: [{ name: rex }, { brand: rex }],
          })
            .sort({ createdAt: -1 })
            .limit(24)
            .lean()
        : [],
      wantArticles
        ? Article.find({
            status: "published",
            $or: [
              { title:   rex },
              { excerpt: rex },
              { tags:    { $elemMatch: rex } },
            ],
          })
            .sort({ publishedAt: -1 })
            .limit(16)
            .lean()
        : [],
    ]);

    return {
      cars:     vehicleDocs.filter(v => v.vehicleType === "car"),
      bikes:    vehicleDocs.filter(v => v.vehicleType === "bike"),
      articles: articleDocs,
    };
  } catch {
    return { articles: [], cars: [], bikes: [] };
  }
}

/* Breadcrumb JSON-LD */
function BreadcrumbLd({ q }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home",   item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Search", item: `${SITE_URL}/search${q ? `?q=${encodeURIComponent(q)}` : ""}` },
          ],
        }),
      }}
    />
  );
}

export default async function SearchPage({ searchParams }) {
  const { q = "", type = "all" } = await searchParams;
  const { articles, cars, bikes } = await runSearch(q, type);

  const totalAll   = articles.length + cars.length + bikes.length;
  const totalCars  = type === "all" ? cars.length  : type === "cars"  ? cars.length  : 0;
  const totalBikes = type === "all" ? bikes.length : type === "bikes" ? bikes.length : 0;
  const totalNews  = type === "all" || type === "news" ? articles.length : 0;

  const TABS = [
    { id: "all",   label: "All",  count: type === "all" ? totalAll : null },
    { id: "cars",  label: "Cars",  count: totalCars  || null, icon: <Car  size={13} /> },
    { id: "bikes", label: "Bikes", count: totalBikes || null, icon: <Bike size={13} /> },
    { id: "news",  label: "News",  count: totalNews  || null, icon: <Newspaper size={13} /> },
  ];

  const buildUrl = (t) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (t !== "all") params.set("type", t);
    return `/search?${params.toString()}`;
  };

  return (
    <>
      <BreadcrumbLd q={q} />
      <div className="min-h-screen bg-gray-50">
        {/* Hero search bar */}
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="mx-auto max-w-3xl px-4">
            <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
              <Link href="/" className="hover:text-green-600">Home</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600">Search</span>
            </nav>

            <form action="/search" method="GET">
              <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 shadow-sm focus-within:border-green-500 transition">
                <Search size={22} className="shrink-0 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Search electric cars, bikes, news…"
                  autoFocus={!q}
                  className="flex-1 text-lg text-gray-800 outline-none placeholder:text-gray-400 bg-transparent"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700 transition"
                >
                  Search
                </button>
              </div>
            </form>

            {q && (
              <p className="mt-3 text-sm text-gray-500">
                {totalAll > 0
                  ? <>{totalAll} result{totalAll !== 1 ? "s" : ""} for <strong className="text-gray-800">&ldquo;{q}&rdquo;</strong></>
                  : <>No results found for <strong className="text-gray-800">&ldquo;{q}&rdquo;</strong></>
                }
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6">
          {q ? (
            <>
              {/* Tabs */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {TABS.map(tab => (
                  <Link
                    key={tab.id}
                    href={buildUrl(tab.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      type === tab.id
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-green-400 hover:text-green-700"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.count != null && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        type === tab.id ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {totalAll === 0 ? (
                <EmptyState q={q} />
              ) : (
                <div className="space-y-10">
                  {/* Cars */}
                  {cars.length > 0 && (
                    <section>
                      <SectionHead title="Electric Cars" icon={<Car size={18} className="text-blue-600" />} count={cars.length} />
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {cars.map(v => <VehicleCard key={v._id?.toString()} vehicle={v} type="cars" />)}
                      </div>
                    </section>
                  )}

                  {/* Bikes */}
                  {bikes.length > 0 && (
                    <section>
                      <SectionHead title="Electric Bikes & Scooters" icon={<Bike size={18} className="text-orange-600" />} count={bikes.length} />
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {bikes.map(v => <VehicleCard key={v._id?.toString()} vehicle={v} type="bikes" />)}
                      </div>
                    </section>
                  )}

                  {/* News */}
                  {articles.length > 0 && (
                    <section>
                      <SectionHead title="News & Reviews" icon={<Newspaper size={18} className="text-green-600" />} count={articles.length} />
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {articles.map(a => <ArticleCard key={a._id?.toString()} article={a} />)}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </>
          ) : (
            <SearchLanding />
          )}
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function SectionHead({ title, icon, count }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <h2 className="text-lg font-black text-gray-900">{title}</h2>
      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-500">{count}</span>
    </div>
  );
}

function VehicleCard({ vehicle, type }) {
  const img   = vehicle.featuredImage || vehicle.image || "";
  const price = vehicle.variants?.[0]?.exShowroomPrice || "Price TBA";
  return (
    <Link
      href={`/${type}/${vehicle.slug}`}
      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {img ? (
          <Image src={img} alt={vehicle.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="300px" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-gray-200">⚡</div>
        )}
        {vehicle.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-[#00a651] px-2.5 py-1 text-[10px] font-bold text-white shadow">Featured</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-green-600">{vehicle.brand}</p>
        <h3 className="mt-0.5 text-sm font-black text-gray-900 group-hover:text-green-600 transition line-clamp-2">{vehicle.name}</h3>
        <p className="mt-1.5 text-base font-black text-gray-800">{price}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${type === "cars" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
            {type === "cars" ? "Car" : "Bike"}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-green-600 group-hover:underline">
            View details <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ article }) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-lg hover:border-green-200"
    >
      <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {article.image ? (
          <Image src={article.image} alt={article.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="128px" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-gray-200">⚡</div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-between py-0.5">
        {article.category && (
          <span className="mb-1 inline-block w-fit rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-bold capitalize text-yellow-700">
            {article.category}
          </span>
        )}
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-green-700 transition">{article.title}</h3>
        {date && <p className="mt-1 text-[11px] text-gray-400">{date}</p>}
      </div>
    </Link>
  );
}

function EmptyState({ q }) {
  return (
    <div className="py-16 text-center">
      <Search size={48} className="mx-auto mb-4 text-gray-200" />
      <h2 className="text-xl font-black text-gray-700">No results for &ldquo;{q}&rdquo;</h2>
      <p className="mt-2 text-gray-400">Try a shorter keyword, or browse by category below.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/cars"    className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100 transition"><Car  size={15} /> All Cars</Link>
        <Link href="/bikes"   className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-100 transition"><Bike size={15} /> All Bikes</Link>
        <Link href="/news"    className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-bold text-green-700 hover:bg-green-100 transition"><Newspaper size={15} /> Latest News</Link>
        <Link href="/compare" className="flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-5 py-2.5 text-sm font-bold text-purple-700 hover:bg-purple-100 transition"><ArrowRight size={15} /> Compare EVs</Link>
      </div>
    </div>
  );
}

function SearchLanding() {
  const POPULAR = [
    { label: "Tata Nexon EV",      href: "/cars/tata-nexon-ev" },
    { label: "Ola S1 Pro",         href: "/bikes/ola-s1-pro" },
    { label: "Mahindra XEV 9e",    href: "/cars/mahindra-xev-9e" },
    { label: "Bajaj Chetak",       href: "/bikes/bajaj-chetak" },
    { label: "Tata Punch EV",      href: "/cars/tata-punch-ev" },
    { label: "Ather 450X",         href: "/bikes/ather-450x" },
  ];
  const CATEGORIES = [
    { label: "Popular Electric Cars",  href: "/cars",    icon: <Car  size={20} />, bg: "bg-blue-50 text-blue-700 border-blue-200" },
    { label: "Electric Bikes",         href: "/bikes",   icon: <Bike size={20} />, bg: "bg-orange-50 text-orange-700 border-orange-200" },
    { label: "Latest EV News",         href: "/news",    icon: <Newspaper size={20} />, bg: "bg-green-50 text-green-700 border-green-200" },
  ];
  return (
    <div className="py-4">
      <div className="mb-8">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">Browse Categories</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {CATEGORIES.map(c => (
            <Link key={c.href} href={c.href}
              className={`flex items-center gap-3 rounded-2xl border px-5 py-4 font-bold transition hover:shadow-md ${c.bg}`}>
              {c.icon}
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">Popular Searches</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map(p => (
            <Link key={p.href} href={p.href}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-green-400 hover:text-green-700 transition shadow-sm">
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
