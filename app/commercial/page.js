import Link from "next/link";
import Image from "next/image";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import { SITE_URL } from "../layout";
import { Truck, Bus, Package, Zap, ChevronRight } from "lucide-react";

async function getCommercialArticles() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article   = (await import("@/lib/models/Article")).default;
    await dbConnect();
    const articles = await Article.find({ status: "published", category: "commercial" })
      .sort({ publishedAt: -1 })
      .limit(6)
      .select("slug title excerpt image author readTime publishedAt")
      .lean();
    return articles.map(a => ({
      slug:     a.slug,
      title:    a.title,
      excerpt:  a.excerpt || "",
      image:    a.image || "",
      author:   a.author || "EVRadar Team",
      readTime: a.readTime || "5 min",
      date:     a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
    }));
  } catch {
    return [];
  }
}

export const revalidate = 60;

export const metadata = {
  title: "Commercial Electric Vehicle News India – EV Trucks, Buses & Vans 2026",
  description:
    "Latest commercial EV news in India. Electric trucks, buses, delivery vans, and three-wheelers — launches, prices, and fleet operator reviews.",
  alternates: { canonical: `${SITE_URL}/commercial` },
  openGraph: {
    title: "Commercial Electric Vehicles India 2026 – Trucks, Buses & Vans",
    description: "Latest commercial EV news in India. Electric trucks, buses, delivery vans, and three-wheelers — launches, prices, and reviews.",
    url: `${SITE_URL}/commercial`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=Commercial EVs India 2026&subtitle=Electric trucks, buses %26 delivery vans&tag=commercial&type=page`, width: 1200, height: 630, alt: "Commercial Electric Vehicles India 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commercial Electric Vehicles India 2026",
    description: "Latest commercial EV news — electric trucks, buses, delivery vans, and three-wheelers.",
    images: [`${SITE_URL}/api/og?title=Commercial EVs India 2026&subtitle=Electric trucks, buses %26 delivery vans&tag=commercial&type=page`],
  },
};

const SEGMENTS = [
  {
    icon: Bus,
    title: "Electric Buses",
    desc: "BEST, DTC and state transport undertakings replacing diesel buses with zero-emission electric buses from TATA, Olectra, and Switch Mobility.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: Truck,
    title: "Electric Trucks",
    desc: "Tata Motors, Ashok Leyland, and Volvo leading India's electric heavy-commercial vehicle segment with long-range freight trucks.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    icon: Package,
    title: "Last-Mile Delivery",
    desc: "Mahindra Treo Zor, Euler HiLoad, and Piaggio Ape EV powering e-commerce and logistics companies with clean last-mile delivery.",
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    icon: Zap,
    title: "Electric 3-Wheelers",
    desc: "Auto-rickshaws going electric with Bajaj RE EV, Mahindra Treo, and Piaggio Ape — cutting fuel costs for lakhs of drivers.",
    color: "bg-green-50 text-green-600 border-green-100",
  },
];

const commercialJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Commercial Electric Vehicles", item: `${SITE_URL}/commercial` },
  ],
};

const commercialFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which is the best electric bus in India?",
      acceptedAnswer: { "@type": "Answer", text: "The Tata Motors Starbus EV and Olectra-BYD K9 are among the best electric buses in India. Tata's buses are widely deployed by BEST Mumbai and DTC Delhi, while Olectra-BYD buses serve multiple state transport undertakings. Both offer 200–300 km range per charge." },
    },
    {
      "@type": "Question",
      name: "Which electric delivery van is best for last-mile logistics in India?",
      acceptedAnswer: { "@type": "Answer", text: "The Mahindra Treo Zor electric three-wheeler and Piaggio Ape E-City are popular for last-mile logistics. For cargo vans, the Tata Ace EV and Mahindra eSupro are widely used by e-commerce companies including Flipkart and Amazon in India." },
    },
    {
      "@type": "Question",
      name: "What is the subsidy on commercial electric vehicles in India?",
      acceptedAnswer: { "@type": "Answer", text: "Under FAME II, electric buses received a subsidy of ₹20,000–₹55,000 per kWh of battery capacity. Electric three-wheelers (e-rickshaws) received up to ₹50,000 subsidy. The PM E-Drive scheme also provides incentives for electric buses procured by state transport undertakings." },
    },
  ],
};

export default async function CommercialPage() {
  const commercialArticles = await getCommercialArticles();
  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(commercialJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(commercialFaqJsonLd) }} />
    <div className="bg-white min-h-screen">
      <div className="bg-linear-to-br from-purple-900 to-purple-950 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-4 flex items-center gap-2 text-sm text-purple-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Commercial EVs</span>
          </nav>
          <h1 className="text-4xl font-black text-white md:text-5xl">Commercial Electric Vehicles</h1>
          <p className="mt-2 text-purple-300">
            Electric trucks, buses &amp; three-wheelers shaping India&apos;s green logistics revolution
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <AdBannerHorizontal slot="0123456789" />

        {/* Segment info cards — always visible */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SEGMENTS.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={`rounded-2xl border p-5 ${color.split(" ").filter(c => c.startsWith("border")).join(" ")} bg-white shadow-sm`}>
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl border ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-black text-gray-900 text-base mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Articles — SSR so Bing/Yahoo/Google can read them */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-black text-gray-900">Latest Commercial EV Radar</h2>
          {commercialArticles.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {commercialArticles.map((article) => (
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
                      <h3 className="line-clamp-2 font-bold text-gray-900 group-hover:text-purple-700 transition text-sm leading-snug">{article.title}</h3>
                      {article.excerpt && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{article.excerpt}</p>}
                      <p className="mt-2 text-xs text-gray-400">{article.readTime} · {article.date}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No commercial EV news right now. Check back soon.</p>
          )}
          <div className="mt-5 text-center">
            <Link href="/news?category=commercial" className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition">
              View all commercial EV news <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
