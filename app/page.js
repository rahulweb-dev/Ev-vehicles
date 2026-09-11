import Link from "next/link";
import Image from "next/image";
import EVHomepage from "@/components/home/HeroSection";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import HomeCompareWidget from "@/components/home/HomeCompareWidget";
import VehicleSlider from "@/components/home/VehicleSlider";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import NewsletterForm from "@/components/NewsletterForm";
import { SITE_URL } from "./layout";

const GUIDE_LINKS = [
  { href: "/best-electric-cars-india-2026",  icon: "🏆", color: "from-amber-500 to-orange-500", bg: "bg-amber-50", border: "border-amber-200", title: "Best Electric Cars 2026",  desc: "Expert-ranked top 10 EVs" },
  { href: "/best-electric-bikes-india-2026", icon: "🛵", color: "from-blue-500 to-cyan-500",   bg: "bg-blue-50",   border: "border-blue-200",   title: "Best Electric Bikes 2026", desc: "Top scooters & bikes ranked" },
  { href: "/upcoming-electric-cars-india",   icon: "📅", color: "from-purple-500 to-pink-500", bg: "bg-purple-50", border: "border-purple-200", title: "Upcoming EVs India",        desc: "Launch dates & expected prices" },
  { href: "/electric-cars-under-10-lakh",    icon: "💰", color: "from-green-500 to-emerald-500", bg: "bg-green-50", border: "border-green-200", title: "EVs Under ₹10 Lakh",       desc: "Affordable electric cars" },
  { href: "/ev-charging-guide",              icon: "⚡", color: "from-yellow-500 to-amber-500", bg: "bg-yellow-50", border: "border-yellow-200", title: "EV Charging Guide",         desc: "Home & public charging explained" },
  { href: "/subsidies",                      icon: "🎁", color: "from-rose-500 to-pink-500",   bg: "bg-rose-50",   border: "border-rose-200",   title: "EV Subsidies India",        desc: "FAME, PM E-Drive & state schemes" },
  { href: "/charging-stations",              icon: "📍", color: "from-indigo-500 to-blue-500", bg: "bg-indigo-50", border: "border-indigo-200", title: "Charging Stations Map",     desc: "Find chargers near you" },
  { href: "/government-ev-policy-india",     icon: "📋", color: "from-teal-500 to-green-500",  bg: "bg-teal-50",   border: "border-teal-200",   title: "EV Policy India 2026",      desc: "FAME 2, PM E-Drive, PLI explained" },
];

const STATS = [
  { value: "80+",    label: "EV Articles" },
  { value: "200+",   label: "EVs Tracked" },
  { value: "50+",    label: "Brands Covered" },
  { value: "1 Lakh+", label: "Monthly Readers" },
];

export const revalidate = 120;

export const metadata = {
  title: "EV Radar – India's #1 Electric Vehicle News Platform",
  description:
    "India's most trusted electric vehicle news platform. Get latest EV news, reviews, prices, and buying guides for electric cars, bikes, scooters, and commercial vehicles in India.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "EV Radar – India's #1 Electric Vehicle News Platform",
    description: "Latest EV news, launches, reviews and prices for electric cars and bikes in India.",
    url: SITE_URL,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Radar&subtitle=India's %231 Electric Vehicle News Platform&tag=default&type=page`, width: 1200, height: 630, alt: "EV Radar – India's #1 Electric Vehicle News Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Radar – India's #1 Electric Vehicle News Platform",
    description: "Latest EV news, launches, reviews and prices for electric cars and bikes in India.",
    images: [`${SITE_URL}/api/og?title=EV Radar&subtitle=India's %231 Electric Vehicle News Platform&tag=default&type=page`],
  },
};

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

async function getInitialNews() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();
    const articles = await Article.find({ status: "published", category: "cars" })
      .sort({ publishedAt: -1 })
      .limit(6)
      .select("slug title image excerpt category readTime publishedAt")
      .lean();
    if (!articles.length) return null;
    return articles.map(a => ({
      image:       a.image       || "",
      title:       a.title       || "",
      excerpt:     a.excerpt     || "",
      slug:        a.slug        || "",
      category:    a.category    || "cars",
      readTime:    a.readTime    || "5 min",
      publishedAt: a.publishedAt || null,
    }));
  } catch {
    return null;
  }
}

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

async function getVehicles({ category, vehicleType, featured }) {
  try {
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
    return docs;
  } catch {
    return [];
  }
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
        name: "Latest EV Radar",
        url: `${SITE_URL}/news`,
        itemListElement: latestArticles.map((article, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/news/${article.slug}`,
          name: article.title,
        })),
      }
    : null;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: "EV Radar – India's #1 Electric Vehicle News Platform",
    description: "India's most trusted electric vehicle news platform. Get latest EV news, reviews, prices, and buying guides for electric cars, bikes, scooters, and commercial vehicles in India.",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@type": "Thing", name: "Electric Vehicles India" },
    breadcrumb: { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }] },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which is the best electric car in India in 2026?",
        acceptedAnswer: { "@type": "Answer", text: "The best electric cars in India in 2026 include the Tata Nexon EV, Mahindra BE 6, MG Windsor EV, and Hyundai Creta Electric. The Tata Nexon EV is the best seller offering a range of up to 489 km, while the Mahindra BE 6 leads on performance with 682 km range." },
      },
      {
        "@type": "Question",
        name: "What is the cheapest electric car in India in 2026?",
        acceptedAnswer: { "@type": "Answer", text: "The most affordable electric cars in India in 2026 start from around ₹6–9 lakh. The Tata Tiago EV starts at approximately ₹7.99 lakh, making it one of the cheapest electric cars in India with a range of up to 315 km." },
      },
      {
        "@type": "Question",
        name: "How much does it cost to charge an electric car at home in India?",
        acceptedAnswer: { "@type": "Answer", text: "Charging an electric car at home in India costs ₹6–9 per kWh depending on your state's electricity tariff. A full charge for a 40 kWh battery (like the Tata Nexon EV) costs ₹240–360, compared to ₹2,500–3,000 for an equivalent petrol fill-up — saving around 80–90% on fuel costs." },
      },
      {
        "@type": "Question",
        name: "What government subsidies are available for EVs in India?",
        acceptedAnswer: { "@type": "Answer", text: "India offers EV subsidies under the PM E-Drive scheme (2024–2026), providing up to ₹50,000 off on electric two-wheelers and ₹25,000 on electric three-wheelers. Several states like Delhi, Maharashtra, and Gujarat offer additional state subsidies and road tax exemptions, making the effective cost of EVs significantly lower." },
      },
    ],
  };

  return (
    <>
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <EVHomepage />
      {/* Latest News */}
      <LatestNewsSection initialArticles={initialNews} />

      {/* Compare Widget */}
      <HomeCompareWidget />

      {/* Featured Cars */}
      {fCars.length > 0 && (
        <VehicleSlider
          title="Featured Electric Cars"
          subtitle="Editor's Top Picks"
          vehicles={fCars}
          vehicleType="cars"
        />
      )}

      {/* Featured Bikes */}
      {fBikes.length > 0 && (
        <VehicleSlider
          title="Featured Electric Bikes"
          subtitle="Editor's Top Picks"
          vehicles={fBikes}
          vehicleType="bikes"
        />
      )}

      {/* Popular Cars */}
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
          <AdBannerHorizontal slot="9176755624" />
        </div>
      </div>

      {/* Popular Bikes */}
      {pBikes.length > 0 && (
        <VehicleSlider
          title="Popular Electric Bikes"
          subtitle="Trending EV Bikes in India"
          vehicles={pBikes}
          vehicleType="bikes"
        />
      )}

      {/* Upcoming Cars */}
      {uCars.length > 0 && (
        <VehicleSlider
          title="Upcoming Electric Cars"
          subtitle="Launching Soon in India"
          vehicles={uCars}
          vehicleType="cars"
        />
      )}

      {/* Upcoming Bikes */}
      {uBikes.length > 0 && (
        <VehicleSlider
          title="Upcoming Electric Bikes"
          subtitle="Launching Soon in India"
          vehicles={uBikes}
          vehicleType="bikes"
        />
      )}

      {/* Commercial EVs */}
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

      {/* Blogs section */}
      {latestBlogs.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-7 flex items-end justify-between gap-4 sm:mb-10">
              <div>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-700">
                  EV Knowledge
                </span>
                <h2 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">Guides &amp; Deep Dives</h2>
                <p className="mt-1 text-sm text-gray-500">In-depth tips, analysis, and advice for Indian EV buyers</p>
              </div>
              <Link
                href="/blogs"
                className="shrink-0 rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-bold text-green-600 hover:border-green-400 hover:bg-green-50 transition"
              >
                View All →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {latestBlogs.map((blog, idx) => (
                <Link key={blog._id?.toString()} href={`/blogs/${blog.slug}`} className="group block">
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-lg">
                    <div className="relative h-48 overflow-hidden bg-gray-100 sm:h-52">
                      {blog.image && (
                        <Image
                          src={blog.image}
                          alt={blog.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={idx === 0}
                        />
                      )}
                      <div className="absolute left-3 top-3">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold capitalize text-green-700 shadow-sm backdrop-blur-sm">
                          {blog.category}
                        </span>
                      </div>
                      {blog.featured && (
                        <div className="absolute right-3 top-3">
                          <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-900">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <h3 className="line-clamp-2 flex-1 text-sm font-bold leading-snug text-gray-900 group-hover:text-green-700 transition sm:text-[15px]">
                        {blog.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{blog.excerpt}</p>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                            {blog.author?.charAt(0) || "E"}
                          </div>
                          <span className="font-medium text-gray-600">{blog.author}</span>
                        </div>
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

    
    </>
  );
}
