import Link from "next/link";
import EVHomepage from "@/components/home/HeroSection";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import HomeCompareWidget from "@/components/home/HomeCompareWidget";
import VehicleSlider from "@/components/home/VehicleSlider";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { SITE_URL } from "./layout";

const GUIDE_LINKS = [
  { href: "/best-electric-cars-india-2026", title: "Best EVs 2026", desc: "Expert-ranked top 10", emoji: "🏆" },
  { href: "/upcoming-electric-cars-india",  title: "Upcoming EVs",   desc: "Launching soon in India", emoji: "🚀" },
  { href: "/electric-cars-under-10-lakh",   title: "Under ₹10 Lakh", desc: "Budget EV picks", emoji: "💰" },
  { href: "/ev-charging-guide",             title: "Charging Guide",  desc: "Everything about EV charging", emoji: "⚡" },
  { href: "/subsidy-calculator",            title: "Subsidy Calculator", desc: "Check your EV savings", emoji: "🧮" },
  { href: "/government-ev-policy-india",    title: "EV Policy India", desc: "FAME, PM E-Drive & more", emoji: "📋" },
];

export const revalidate = 120; // re-fetch from DB every 2 minutes

export const metadata = {
  title: "EV News India – India's #1 Electric Vehicle News Platform",
  description:
    "India's most trusted electric vehicle news platform. Get latest EV news, reviews, prices, and buying guides for electric cars, bikes, scooters, and commercial vehicles in India.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "EV News India – India's #1 Electric Vehicle News Platform",
    description: "Latest EV news, launches, reviews and prices for electric cars and bikes in India.",
    url: SITE_URL,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV News India&subtitle=India's %231 Electric Vehicle News Platform&tag=default&type=page`, width: 1200, height: 630, alt: "EV News India – India's #1 Electric Vehicle News Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV News India – India's #1 Electric Vehicle News Platform",
    description: "Latest EV news, launches, reviews and prices for electric cars and bikes in India.",
    images: [`${SITE_URL}/api/og?title=EV News India&subtitle=India's %231 Electric Vehicle News Platform&tag=default&type=page`],
  },
};

/* ── Map MongoDB Vehicle → VehicleSlider card format ─────────────── */
function mapVehicle(v, brandLogoMap = {}) {
  const firstVariant = v.variants?.[0];
  const lastVariant  = v.variants?.[v.variants.length - 1];
  const colors = (v.colors || []).map((c) =>
    typeof c === "string" ? c : (c.hexCode || "#888888")
  );
  const brandKey = (v.brand || "").toLowerCase().replace(/\s+/g, "-");
  return {
    id:          v._id?.toString() || v.slug,
    slug:        v.slug,
    name:        v.name,
    brand:       v.brand,
    brandLogo:   brandLogoMap[brandKey] || "",
    price:       firstVariant?.exShowroomPrice || "Price TBA",
    priceMax:    lastVariant?.exShowroomPrice  || firstVariant?.exShowroomPrice || "",
    emi:         "",
    image:       v.featuredImage || "",
    speed:       v.performance?.topSpeed    || "—",
    range:       v.performance?.drivingRange || v.variants?.[0]?.range || "—",
    motor:       v.performance?.power       || "—",
    colors,
    rating:      0,
    reviewCount: 0,
    tag:         v.featured ? "Featured" : v.category === "upcoming" ? "Coming Soon" : "Popular",
  };
}

/* ── Fetch latest blog posts for home section ────────────────────── */
async function getLatestBlogs() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Blog      = (await import("@/lib/models/Blog")).default;
    await dbConnect();
    const docs = await Blog.find({ status: "published" })
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .limit(3)
      .select("slug title excerpt image category author readTime publishedAt featured")
      .lean();
    return docs;
  } catch {
    return [];
  }
}

/* ── Fetch latest articles for ItemList schema ───────────────────── */
async function getLatestArticles() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article = (await import("@/lib/models/Article")).default;
    await dbConnect();
    return await Article.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(10)
      .select("slug title")
      .lean();
  } catch {
    return [];
  }
}

/* ── Fetch initial news for LatestNewsSection SSR ────────────────── */
async function getInitialNews() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();
    const articles = await Article.find({ status: "published", category: "cars", image: { $exists: true, $nin: [null, ""] } })
      .sort({ publishedAt: -1 })
      .limit(6)
      .select("slug title image excerpt category readTime")
      .lean();
    if (!articles.length) return null;
    return articles.map(a => ({
      image:    a.image    || "",
      title:    a.title    || "",
      excerpt:  a.excerpt  || "",
      slug:     a.slug     || "",
      category: a.category || "cars",
      readTime: a.readTime || "5 min",
    }));
  } catch {
    return null;
  }
}

/* ── Fetch brand logo map  slug → url ────────────────────────────── */
async function getBrandLogos() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Brand     = (await import("@/lib/models/Brand")).default;
    await dbConnect();
    const brands = await Brand.find({ logo: { $ne: "" } }).select("slug logo").lean();
    return Object.fromEntries(brands.map(b => [b.slug, b.logo]));
  } catch {
    return {};
  }
}

/* ── Fetch a section from MongoDB ────────────────────────────────── */
async function getVehicles({ category, vehicleType, featured }) {
  const dbConnect = (await import("@/lib/mongodb")).default;
  const Vehicle   = (await import("@/lib/models/Vehicle")).default;
  await dbConnect();
  const filter = { vehicleType, status: "published" };
  if (category) filter.category = category;
  if (featured) filter.featured = true;
  const docs = await Vehicle.find(filter)
    .sort({ createdAt: -1 })
    .limit(12)
    .select("slug name brand vehicleType category featured featuredImage performance variants colors")
    .lean();
  /* brandLogoMap is applied separately after all parallel fetches */
  return docs;
}

function applyLogos(docs, brandLogoMap) {
  return docs.map(v => mapVehicle(v, brandLogoMap));
}

export default async function Home() {
  const [
    latestArticles,
    latestBlogs,
    brandLogoMap,
    initialNews,
    featuredCars, featuredBikes, featuredCommercial,
    popularCars, popularBikes, popularCommercial,
    upcomingCars, upcomingBikes, upcomingCommercial,
  ] = await Promise.all([
    getLatestArticles(),
    getLatestBlogs(),
    getBrandLogos(),
    getInitialNews(),
    getVehicles({ vehicleType: "car",        featured: true }),
    getVehicles({ vehicleType: "bike",       featured: true }),
    getVehicles({ vehicleType: "commercial", featured: true }),
    getVehicles({ vehicleType: "car",        category: "popular" }),
    getVehicles({ vehicleType: "bike",       category: "popular" }),
    getVehicles({ vehicleType: "commercial", category: "popular" }),
    getVehicles({ vehicleType: "car",        category: "upcoming" }),
    getVehicles({ vehicleType: "bike",       category: "upcoming" }),
    getVehicles({ vehicleType: "commercial", category: "upcoming" }),
  ]);

  const [
    fCars, fBikes, fCommercial,
    pCars, pBikes, pCommercial,
    uCars, uBikes, uCommercial,
  ] = [
    featuredCars, featuredBikes, featuredCommercial,
    popularCars, popularBikes, popularCommercial,
    upcomingCars, upcomingBikes, upcomingCommercial,
  ].map(docs => applyLogos(docs, brandLogoMap));

  const itemListJsonLd = latestArticles.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Latest EV News India",
        url: `${SITE_URL}/news`,
        itemListElement: latestArticles.map((article, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/news/${article.slug}`,
          name: article.title,
        })),
      }
    : null;

  return (
    <>
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      <EVHomepage />

      <div className="bg-white py-2">
        <div className="mx-auto max-w-7xl px-4">
          <AdBannerHorizontal slot="1234567890" />
        </div>
      </div>

      {/* Popular Guides — internal links to high-value SEO pages */}
      <section className="bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-4 text-xl font-black text-gray-900">EV Buying Guides</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {GUIDE_LINKS.map(g => (
              <Link key={g.href} href={g.href}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-green-400 hover:shadow-md transition">
                <span className="text-2xl mb-2">{g.emoji}</span>
                <p className="text-sm font-bold text-gray-900 leading-tight">{g.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{g.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LatestNewsSection initialArticles={initialNews} />

      {/* Latest Blog Posts */}
      {latestBlogs.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900">EV Guides & Blogs</h2>
                <p className="mt-1 text-sm text-gray-500">In-depth tips and analysis for Indian EV buyers</p>
              </div>
              <Link href="/blogs" className="flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700 transition">
                View all →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestBlogs.map(blog => (
                <Link key={blog._id?.toString()} href={`/blogs/${blog.slug}`} className="group block">
                  <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-44 overflow-hidden bg-gray-100">
                      {blog.image && (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute left-3 top-3">
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold capitalize text-green-700">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 group-hover:text-green-600">
                        {blog.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">{blog.excerpt}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <span>{blog.author}</span>
                        <span>{blog.readTime}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <HomeCompareWidget />

      {fCars.length > 0 && (
        <VehicleSlider
          title="Featured Electric Cars"
          subtitle="Editor's Top Picks"
          vehicles={fCars}
          vehicleType="cars"
        />
      )}

      {fBikes.length > 0 && (
        <VehicleSlider
          title="Featured Electric Bikes"
          subtitle="Editor's Top Picks"
          vehicles={fBikes}
          vehicleType="bikes"
        />
      )}

      {pCars.length > 0 && (
        <VehicleSlider
          title="Popular Electric Cars"
          subtitle="Trending EV Cars in India"
          vehicles={pCars}
          vehicleType="cars"
        />
      )}

      <div className="bg-white py-2">
        <div className="mx-auto max-w-7xl px-4">
          <AdBannerHorizontal slot="0987654321" />
        </div>
      </div>

      {pBikes.length > 0 && (
        <VehicleSlider
          title="Popular Electric Bikes"
          subtitle="Trending EV Bikes in India"
          vehicles={pBikes}
          vehicleType="bikes"
        />
      )}

      {uCars.length > 0 && (
        <VehicleSlider
          title="Upcoming Electric Cars"
          subtitle="Launching Soon in India"
          vehicles={uCars}
          vehicleType="cars"
        />
      )}

      {uBikes.length > 0 && (
        <VehicleSlider
          title="Upcoming Electric Bikes"
          subtitle="Launching Soon in India"
          vehicles={uBikes}
          vehicleType="bikes"
        />
      )}

      {fCommercial.length > 0 && (
        <VehicleSlider
          title="Featured Commercial EVs"
          subtitle="Electric Trucks, Buses & Vans"
          vehicles={fCommercial}
          vehicleType="commercial"
        />
      )}

      {pCommercial.length > 0 && (
        <VehicleSlider
          title="Popular Commercial EVs"
          subtitle="Top Electric Trucks, Buses & Delivery Vans in India"
          vehicles={pCommercial}
          vehicleType="commercial"
        />
      )}

      {uCommercial.length > 0 && (
        <VehicleSlider
          title="Upcoming Commercial EVs"
          subtitle="Electric Commercial Vehicles Launching Soon"
          vehicles={uCommercial}
          vehicleType="commercial"
        />
      )}
    </>
  );
}
