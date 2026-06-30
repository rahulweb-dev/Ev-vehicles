import Link from "next/link";
import { AdBannerHorizontal } from "@/components/ads/AdBanner";
import ArticlesFeed from "@/components/skeletons/ArticlesFeed";
import { SITE_URL } from "../layout";
import { Truck, Bus, Package, Zap, ChevronRight } from "lucide-react";

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

export default function CommercialPage() {
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

        {/* Articles from DB */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-black text-gray-900">Latest Commercial EV News</h2>
          <ArticlesFeed category="commercial" skeletonCount={6} />
        </div>
      </div>
    </div>
    </>
  );
}
