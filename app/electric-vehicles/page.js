import Link from "next/link";
import Image from "next/image";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { SITE_URL } from "../layout";
import { BatteryCharging, Zap, Home, ChevronRight } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "EV Charging News India – Fast Charging, Battery Swapping & Infrastructure 2026",
  description:
    "Latest EV charging infrastructure news in India. Fast chargers, battery swapping, home charging tips, charging costs, and India's expanding charging network.",
  alternates: { canonical: `${SITE_URL}/electric-vehicles` },
  openGraph: {
    title: "EV Charging Infrastructure India 2026 – Fast Charging & Battery Swapping News",
    description: "Latest EV charging news from India — fast chargers, battery swapping, home charging and the expanding charging network.",
    url: `${SITE_URL}/electric-vehicles`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Charging India 2026&subtitle=Fast charging, battery swapping %26 infrastructure news&tag=charging&type=page`, width: 1200, height: 630, alt: "EV Charging India 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Charging Infrastructure India 2026",
    description: "Latest EV charging news — fast chargers, battery swapping, home charging and network updates.",
    images: [`${SITE_URL}/api/og?title=EV Charging India 2026&subtitle=Fast charging, battery swapping %26 infrastructure news&tag=charging&type=page`],
  },
};

const CHARGING_TYPES = [
  {
    icon: Home,
    title: "Home Charging (AC)",
    speed: "3.3 – 7.2 kW",
    time: "6 – 12 hours",
    desc: "Level 1/2 AC chargers installed at home using a standard 15A or dedicated EV socket. Cheapest per-unit cost.",
    color: "border-green-100 text-green-600 bg-green-50",
  },
  {
    icon: BatteryCharging,
    title: "Public AC Charger",
    speed: "7.2 – 22 kW",
    time: "2 – 6 hours",
    desc: "Found in malls, offices and parking lots. Bharat AC-001 standard ensures compatibility across brands.",
    color: "border-blue-100 text-blue-600 bg-blue-50",
  },
  {
    icon: Zap,
    title: "DC Fast Charger",
    speed: "25 – 150 kW",
    time: "30 – 90 mins",
    desc: "CCS2 and CHAdeMO connectors at highways and Tata Power, EESL, Ather grid stations. 80% charge in ~45 min.",
    color: "border-orange-100 text-orange-600 bg-orange-50",
  },
  {
    icon: Zap,
    title: "Battery Swapping",
    speed: "Instant",
    time: "< 5 minutes",
    desc: "Swap a depleted battery for a charged one at Gogoro, Sun Mobility, and Ola swap stations — zero wait time.",
    color: "border-purple-100 text-purple-600 bg-purple-50",
  },
];

const evChargingBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "EV Charging India", item: `${SITE_URL}/electric-vehicles` },
  ],
};

const evChargingFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How many EV charging stations are there in India?",
      acceptedAnswer: { "@type": "Answer", text: "As of 2025, India has over 25,000 public EV charging stations installed across the country. The government aims to reach 1 lakh (100,000) public charging stations by 2030. Major networks include Tata Power EV, Ather Grid, BPCL Pulse, Statiq, and ChargeZone." },
    },
    {
      "@type": "Question",
      name: "How long does it take to charge an electric car in India?",
      acceptedAnswer: { "@type": "Answer", text: "Charging time depends on the charger type: Home AC charger (3.3–7.2 kW) takes 6–12 hours for a full charge; public AC fast charger (22 kW) takes 2–4 hours; and DC fast charger (50–100 kW) charges up to 80% in 45–90 minutes. Tesla Supercharger-equivalent speeds (150+ kW) are not yet widely available in India." },
    },
    {
      "@type": "Question",
      name: "What is the cost of charging an EV at a public station in India?",
      acceptedAnswer: { "@type": "Answer", text: "Public EV charging in India costs ₹12–25 per kWh depending on the network and city. Most networks charge ₹15–18 per kWh, meaning a full charge for a 40 kWh battery costs ₹600–720. Home charging is cheaper at ₹6–9 per kWh (₹240–360 for the same battery), saving ₹300–400 per charge." },
    },
  ],
};

async function getChargingArticles() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();
    const articles = await Article.find({ status: "published", category: "charging" })
      .sort({ publishedAt: -1 })
      .limit(6)
      .select("slug title excerpt image author readTime publishedAt")
      .lean();
    return articles.map(a => ({
      slug:        a.slug,
      title:       a.title,
      excerpt:     a.excerpt || "",
      image:       a.image || "",
      author:      a.author || "EVRadar Team",
      readTime:    a.readTime || "5 min",
      publishedAt: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
    }));
  } catch {
    return [];
  }
}

export default async function EVChargingPage() {
  const chargingArticles = await getChargingArticles();
  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(evChargingFaqJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(evChargingBreadcrumb) }} />
    <div className="bg-white min-h-screen">
      <div className="bg-linear-to-br from-green-900 to-green-950 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-4 flex items-center gap-2 text-sm text-green-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">EV Charging</span>
          </nav>
          <h1 className="text-4xl font-black text-white md:text-5xl">EV Charging &amp; Infrastructure</h1>
          <p className="mt-2 text-green-300">India&apos;s growing EV charging ecosystem — news, guides &amp; updates</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <AdBannerHorizontal slot="1357924680" />

        {/* Charging type cards — always visible */}
        <div className="mt-10">
          <h2 className="mb-6 text-2xl font-black text-gray-900">Types of EV Charging in India</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CHARGING_TYPES.map(({ icon: Icon, title, speed, time, desc, color }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-black text-gray-900 mb-1">{title}</h3>
                <div className="flex gap-3 mb-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">{speed}</span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">{time}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Articles from DB — server-rendered for Bing/Yahoo/Google */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-black text-gray-900">Latest EV Charging News</h2>
          {chargingArticles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {chargingArticles.map((article) => (
                <Link key={article.slug} href={`/news/${article.slug}`} className="group block">
                  <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    {article.image && (
                      <div className="relative h-44 overflow-hidden">
                        <Image src={article.image} alt={article.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="line-clamp-2 font-bold text-gray-900 group-hover:text-green-600 transition">{article.title}</h3>
                      {article.excerpt && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{article.excerpt}</p>}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <span>{article.author}</span>
                        <span>{article.readTime} · {article.publishedAt}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No charging news available right now. Check back soon.</p>
          )}
          <div className="mt-6 text-center">
            <Link href="/news?category=charging" className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition">
              View all charging news <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Blog CTA */}
        <div className="mt-10 rounded-2xl bg-green-50 border border-green-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-gray-900">New to EV Charging?</h3>
            <p className="text-sm text-gray-500 mt-1">Read our complete guide to EV charger types, costs, and installation in India.</p>
          </div>
          <Link href="/blogs/ev-charging-types-india-guide-ac-dc-fast-charging"
            className="shrink-0 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
            Read the Guide →
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
