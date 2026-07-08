import Link from "next/link";
import Image from "next/image";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { SITE_URL } from "../layout";
import {
  BatteryCharging, Zap, Home, ChevronRight, Car, Bike, Truck,
  TrendingUp, Shield, IndianRupee, MapPin, Award,
} from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Electric Vehicles India 2026 – Complete Guide to EVs, Prices & News",
  description:
    "Complete guide to electric vehicles in India 2026. Compare electric cars, bikes, and scooters by price, range & features. Latest EV news, government subsidies, and charging info.",
  keywords: "electric vehicles india, electric vehicle india 2026, electric car india, electric bike india, best ev india, ev price india 2026, electric scooter india",
  alternates: { canonical: `${SITE_URL}/electric-vehicles` },
  openGraph: {
    title: "Electric Vehicles India 2026 – Complete Guide to EVs, Prices & News",
    description: "Your complete guide to electric vehicles in India — cars, bikes, scooters, prices, range, charging, and government subsidies.",
    url: `${SITE_URL}/electric-vehicles`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=Electric Vehicles India 2026&subtitle=Complete Guide – Cars, Bikes, Prices %26 News&tag=cars&type=page`, width: 1200, height: 630, alt: "Electric Vehicles India 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Electric Vehicles India 2026 – Complete Guide",
    description: "Everything about electric vehicles in India — prices, range, charging, subsidies, and expert comparisons.",
    images: [{ url: `${SITE_URL}/api/og?title=Electric Vehicles India 2026&subtitle=Complete Guide – Cars, Bikes, Prices %26 News&tag=cars&type=page`, alt: "Electric Vehicles India 2026 – Complete Guide" }],
  },
};

/* ── Data constants ────────────────────────────────────────────────── */

const EV_STATS = [
  { label: "EVs Sold in India 2025", value: "17 Lakh+", icon: TrendingUp, color: "text-green-600 bg-green-50" },
  { label: "Public Charging Stations", value: "25,000+", icon: BatteryCharging, color: "text-blue-600 bg-blue-50" },
  { label: "EV Models Available", value: "80+",      icon: Car,           color: "text-purple-600 bg-purple-50" },
  { label: "States with EV Policy",   value: "28",   icon: Shield,        color: "text-orange-600 bg-orange-50" },
];

const TOP_CARS = [
  { name: "Tata Punch EV",       slug: "tata-punch-ev",       price: "₹9.99L",  range: "421 km", badge: "#1 Selling" },
  { name: "Tata Nexon EV",       slug: "tata-nexon-ev",       price: "₹14.49L", range: "465 km", badge: "Most Popular" },
  { name: "MG Windsor EV",       slug: "mg-windsor-ev",       price: "₹13.50L", range: "331 km", badge: "Best Value" },
  { name: "Hyundai Creta EV",    slug: "hyundai-creta-electric", price: "₹17.99L", range: "473 km", badge: "Premium" },
  { name: "Mahindra BE 6",       slug: "mahindra-be-6",       price: "₹18.90L", range: "682 km", badge: "Best Range" },
  { name: "BYD Seal",            slug: "byd-seal",            price: "₹41.00L", range: "510 km", badge: "Luxury" },
];

const TOP_BIKES = [
  { name: "Ola S1 Pro",          slug: "ola-s1-pro",          price: "₹1.47L",  range: "195 km", badge: "#1 Selling" },
  { name: "Ather 450X",          slug: "ather-450x",          price: "₹1.50L",  range: "146 km", badge: "Best Tech" },
  { name: "TVS iQube S",         slug: "tvs-iqube-s",         price: "₹1.02L",  range: "145 km", badge: "Reliable" },
  { name: "Bajaj Chetak",        slug: "bajaj-chetak",        price: "₹1.05L",  range: "126 km", badge: "Classic" },
  { name: "Hero Vida V2 Pro",    slug: "hero-vida-v2-pro",    price: "₹1.09L",  range: "143 km", badge: "Value" },
  { name: "Ather Rizta Z",       slug: "ather-rizta-z",       price: "₹1.09L",  range: "160 km", badge: "Family" },
];

const EV_BRANDS = [
  { name: "Tata Motors",  slug: "tata",     type: "Cars",       share: "35%", color: "border-blue-200 bg-blue-50 text-blue-700" },
  { name: "Mahindra",     slug: "mahindra", type: "Cars",       share: "12%", color: "border-red-200 bg-red-50 text-red-700" },
  { name: "Ola Electric", slug: "ola",      type: "Scooters",   share: "30%", color: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  { name: "Ather Energy", slug: "ather",    type: "Scooters",   share: "8%",  color: "border-orange-200 bg-orange-50 text-orange-700" },
  { name: "TVS",          slug: "tvs",      type: "Scooters",   share: "7%",  color: "border-purple-200 bg-purple-50 text-purple-700" },
  { name: "Hyundai",      slug: "hyundai",  type: "Cars",       share: "6%",  color: "border-green-200 bg-green-50 text-green-700" },
];

const GUIDE_LINKS = [
  { href: "/best-electric-cars-india-2026",  title: "Best Electric Cars 2026",  desc: "Expert-ranked top 10 EVs",          icon: Award,         color: "border-yellow-200 bg-yellow-50" },
  { href: "/best-electric-bikes-india-2026", title: "Best Electric Bikes 2026", desc: "Top scooters & bikes ranked",       icon: Bike,          color: "border-orange-200 bg-orange-50" },
  { href: "/upcoming-electric-cars-india",   title: "Upcoming EVs India",        desc: "Launch dates & expected prices",    icon: TrendingUp,    color: "border-blue-200 bg-blue-50" },
  { href: "/electric-cars-under-10-lakh",    title: "EVs Under ₹10 Lakh",       desc: "Affordable electric cars",          icon: IndianRupee,   color: "border-green-200 bg-green-50" },
  { href: "/ev-charging-guide",              title: "EV Charging Guide",         desc: "Home & public charging explained",  icon: BatteryCharging, color: "border-purple-200 bg-purple-50" },
  { href: "/subsidies",                      title: "EV Subsidies India",        desc: "FAME, PM E-Drive & state schemes",  icon: Shield,        color: "border-teal-200 bg-teal-50" },
  { href: "/charging-stations",              title: "Charging Stations Map",     desc: "Find chargers near you",            icon: MapPin,        color: "border-red-200 bg-red-50" },
  { href: "/government-ev-policy-india",     title: "EV Policy India 2026",      desc: "FAME 2, PM E-Drive, PLI explained", icon: Truck,         color: "border-indigo-200 bg-indigo-50" },
];

const CHARGING_TYPES = [
  { icon: Home,            title: "Home Charging (AC)", speed: "3.3–7.2 kW",   time: "6–12 hrs",  color: "border-green-100 text-green-600 bg-green-50" },
  { icon: BatteryCharging, title: "Public AC Charger",  speed: "7.2–22 kW",    time: "2–6 hrs",   color: "border-blue-100 text-blue-600 bg-blue-50" },
  { icon: Zap,             title: "DC Fast Charger",    speed: "25–150 kW",    time: "30–90 min", color: "border-orange-100 text-orange-600 bg-orange-50" },
  { icon: Zap,             title: "Battery Swapping",   speed: "Instant",      time: "< 5 min",   color: "border-purple-100 text-purple-600 bg-purple-50" },
];

/* ── JSON-LD ──────────────────────────────────────────────────────── */

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home",              item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Electric Vehicles", item: `${SITE_URL}/electric-vehicles` },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which electric vehicle is best in India in 2026?",
      acceptedAnswer: { "@type": "Answer", text: "The best electric cars in India in 2026 are: Tata Punch EV (best overall under ₹15L), Tata Nexon EV (most popular, 465 km range), MG Windsor EV (best value), Hyundai Creta Electric (best premium), and Mahindra BE 6 (best performance, 682 km range). For electric bikes, Ola S1 Pro, Ather 450X, and TVS iQube are top picks." },
    },
    {
      "@type": "Question",
      name: "What is the range of electric vehicles in India?",
      acceptedAnswer: { "@type": "Answer", text: "Electric cars in India offer ARAI-certified ranges from 250 km (entry-level Tata Tiago EV) to 682 km (Mahindra BE 6). Most popular EVs like Nexon EV (465 km) and Punch EV (421 km) offer 400–500 km. Real-world range is typically 20–25% lower than ARAI figures. Electric scooters offer 100–200 km range." },
    },
    {
      "@type": "Question",
      name: "How much does an electric vehicle cost in India?",
      acceptedAnswer: { "@type": "Answer", text: "Electric vehicles in India start from ₹1 lakh for electric scooters (TVS iQube at ₹1.02 lakh) to ₹10 lakh for entry electric cars (Tata Tiago EV at ₹7.99 lakh). Mid-range electric cars cost ₹10–25 lakh (Nexon EV, Creta Electric), while premium EVs cost ₹30–70 lakh (BYD Seal, Mercedes EQS). Prices are after FAME 2 and state subsidies." },
    },
    {
      "@type": "Question",
      name: "Is there any government subsidy for electric vehicles in India?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Under the PM E-Drive scheme 2024–2026, electric 2-wheelers get up to ₹10,000 subsidy and electric 3-wheelers up to ₹50,000. Many states offer additional subsidies: Delhi gives ₹30,000 on e-bikes and ₹1.5 lakh on cars. All EVs attract only 5% GST versus 28–50% for petrol vehicles. Section 80EEB allows ₹1.5 lakh annual tax deduction on EV loan interest." },
    },
    {
      "@type": "Question",
      name: "How many electric vehicles are sold in India per month?",
      acceptedAnswer: { "@type": "Answer", text: "India sold approximately 17 lakh electric vehicles in 2024-25, averaging 1.4 lakh EVs per month. Electric two-wheelers dominate at over 10 lakh units, led by Ola Electric and Ather Energy. Electric cars crossed 1 lakh units monthly in 2024, with Tata Motors holding 35%+ market share. India is now the world's third-largest EV market." },
    },
    {
      "@type": "Question",
      name: "How many EV charging stations are in India?",
      acceptedAnswer: { "@type": "Answer", text: "India has over 25,000 public EV charging stations as of 2025, with the government targeting 46,000 by 2030. Major networks include Tata Power EZ Charge (5,000+), ChargeZone (3,500+), Ather Grid (2,000+), Statiq (2,500+), and Jio-BP Pulse (1,200+). Almost all major highways on national routes now have fast-charging stations." },
    },
  ],
};

/* ── Server fetch ─────────────────────────────────────────────────── */

async function getLatestEVNews() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();
    const articles = await Article.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(6)
      .select("slug title excerpt image author readTime publishedAt category")
      .lean();
    return articles.map(a => ({
      slug:     a.slug,
      title:    a.title,
      excerpt:  a.excerpt || "",
      image:    a.image || "",
      author:   a.author || "EVRadar Team",
      readTime: a.readTime || "5 min",
      category: a.category || "news",
      date:     a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
    }));
  } catch {
    return [];
  }
}

/* ── Page Component ───────────────────────────────────────────────── */

export default async function ElectricVehiclesPage() {
  const latestNews = await getLatestEVNews();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="bg-white min-h-screen">

        {/* Hero */}
        <div className="bg-linear-to-br from-green-900 to-green-950 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="mb-4 flex items-center gap-2 text-sm text-green-300">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <span className="text-white font-semibold">Electric Vehicles India</span>
            </nav>
            <h1 className="text-4xl font-black text-white md:text-5xl lg:text-6xl">
              Electric Vehicles<br />
              <span className="text-green-400">India 2026</span>
            </h1>
            <p className="mt-3 text-lg text-green-300 max-w-2xl">
              India&apos;s complete guide to electric cars, bikes, and scooters. Compare prices, range, brands, and find the right EV for your budget.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/cars" className="rounded-xl bg-green-500 hover:bg-green-400 px-5 py-2.5 text-sm font-bold text-white transition">
                Browse Electric Cars →
              </Link>
              <Link href="/bikes" className="rounded-xl border border-green-500 hover:bg-green-900 px-5 py-2.5 text-sm font-bold text-green-300 transition">
                Browse Electric Bikes →
              </Link>
            </div>
          </div>
        </div>

        {/* EV Stats */}
        <div className="border-b border-gray-100 bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {EV_STATS.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm text-center">
                  <div className={`mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                    <Icon size={18} />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10">
          <AdBannerHorizontal slot="1357924680" />

          {/* Top Electric Cars */}
          <section className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Car size={22} className="text-green-600" /> Top Electric Cars in India 2026
              </h2>
              <Link href="/cars" className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TOP_CARS.map((car) => (
                <Link key={car.slug} href={`/cars/${car.slug}`}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-green-400 hover:shadow-md transition group">
                  <div>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 rounded-full px-2 py-0.5">{car.badge}</span>
                    <h3 className="mt-1 font-bold text-gray-900 group-hover:text-green-700 transition text-sm">{car.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Range: {car.range} · From {car.price}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/best-electric-cars-india-2026" className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700">
                See expert-ranked best electric cars 2026 <ChevronRight size={14} />
              </Link>
            </div>
          </section>

          {/* Top Electric Bikes */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Bike size={22} className="text-orange-500" /> Top Electric Bikes & Scooters in India 2026
              </h2>
              <Link href="/bikes" className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TOP_BIKES.map((bike) => (
                <Link key={bike.slug} href={`/bikes/${bike.slug}`}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-orange-400 hover:shadow-md transition group">
                  <div>
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-50 rounded-full px-2 py-0.5">{bike.badge}</span>
                    <h3 className="mt-1 font-bold text-gray-900 group-hover:text-orange-700 transition text-sm">{bike.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Range: {bike.range} · From {bike.price}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/best-electric-bikes-india-2026" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700">
                See expert-ranked best electric bikes 2026 <ChevronRight size={14} />
              </Link>
            </div>
          </section>

          {/* Top EV Brands */}
          <section className="mt-12">
            <h2 className="text-2xl font-black text-gray-900 mb-5">Top Electric Vehicle Brands in India</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {EV_BRANDS.map((brand) => (
                <Link key={brand.slug} href={`/brands/${brand.slug}`}
                  className={`rounded-2xl border p-4 text-center hover:shadow-md transition ${brand.color}`}>
                  <p className="font-black text-sm">{brand.name}</p>
                  <p className="text-xs mt-1 opacity-70">{brand.type}</p>
                  <p className="text-xs font-bold mt-1">{brand.share} market share</p>
                </Link>
              ))}
            </div>
            <div className="mt-3 text-center">
              <Link href="/brands" className="text-sm font-semibold text-green-600 hover:text-green-700">
                View all EV brands in India →
              </Link>
            </div>
          </section>

          {/* Guide Links */}
          <section className="mt-12">
            <h2 className="text-2xl font-black text-gray-900 mb-5">EV Guides & Tools</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {GUIDE_LINKS.map(({ href, title, desc, icon: Icon, color }) => (
                <Link key={href} href={href}
                  className={`rounded-2xl border p-5 hover:shadow-md transition group ${color}`}>
                  <Icon size={20} className="mb-2 text-gray-600" />
                  <h3 className="font-black text-gray-900 text-sm group-hover:text-green-700 transition">{title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Charging Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-black text-gray-900 mb-5">
              <BatteryCharging size={22} className="inline mr-2 text-green-600" />
              EV Charging in India
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CHARGING_TYPES.map(({ icon: Icon, title, speed, time, color }) => (
                <div key={title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${color}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-black text-gray-900 text-sm mb-2">{title}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">{speed}</span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">{time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <Link href="/charging-stations" className="inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 transition">
                <MapPin size={14} /> Find charging stations near me
              </Link>
              <Link href="/ev-charging-guide" className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-green-400 transition">
                Read charging guide →
              </Link>
            </div>
          </section>

          {/* Latest EV News — SSR */}
          {latestNews.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black text-gray-900">Latest Electric Vehicle News India</h2>
                <Link href="/news" className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1">
                  All news <ChevronRight size={14} />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {latestNews.map((article) => (
                  <Link key={article.slug} href={`/news/${article.slug}`} className="group block">
                    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      {article.image && (
                        <div className="relative h-44 overflow-hidden">
                          <Image src={article.image} alt={article.title} fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                        </div>
                      )}
                      <div className="p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-green-600">{article.category}</span>
                        <h3 className="mt-1 line-clamp-2 font-bold text-gray-900 group-hover:text-green-600 transition text-sm leading-snug">{article.title}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{article.excerpt}</p>
                        <p className="mt-2 text-xs text-gray-400">{article.readTime} · {article.date}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ — visible text for AEO / People Also Ask */}
          <section className="mt-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Electric Vehicles India – Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqJsonLd.mainEntity.map((item) => (
                <details key={item.name} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 open:bg-white open:shadow-sm transition-all">
                  <summary className="cursor-pointer font-bold text-gray-900 list-none flex items-center justify-between gap-3">
                    {item.name}
                    <ChevronRight size={16} className="text-gray-400 shrink-0" />
                  </summary>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </section>

          <AdBannerHorizontal slot="9876543210" />
        </div>
      </div>
    </>
  );
}
