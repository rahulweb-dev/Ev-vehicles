import Link from "next/link";
import ChargingStationFinder from "@/components/ChargingStationFinder";
import { SITE_URL } from "@/app/layout";

export const metadata = {
  title: "EV Charging Stations Near Me – Find Charging Points in India",
  description: "Find electric vehicle charging stations near you across India. Filter by connector type, network, and availability. Tata Power, Ather Grid, ChargeZone, and more.",
  keywords: "ev charging station near me india, electric car charging point india, tata power ev charging, fast charging station india",
  alternates: { canonical: `${SITE_URL}/charging-stations` },
  openGraph: {
    title: "EV Charging Stations Near Me – India",
    description: "Locate EV charging stations across all Indian cities. Filter by connector type and charging speed.",
    url: `${SITE_URL}/charging-stations`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Charging Stations India&subtitle=Find chargers near you&tag=map`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Charging Stations Near Me – India",
    images: [`${SITE_URL}/api/og?title=EV Charging Stations India&subtitle=Find chargers near you&tag=map`],
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "EV Charging Station Finder India",
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/charging-stations`,
    description: "Find electric vehicle charging stations near any location in India. Search by city, connector type (CCS2, CHAdeMO, Type 2, AC), and charging network.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How many EV charging stations are there in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "India had over 12,000 public EV charging stations as of 2024, installed by networks like Tata Power EV, ChargeZone, Ather Grid, Statiq, and BPCL. The government targets 46,000 charging stations by 2030 under the National Electric Mobility Mission.",
        },
      },
      {
        "@type": "Question",
        name: "Which EV charging networks operate in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Major EV charging networks in India include Tata Power EZ Charge, ChargeZone, Ather Grid, Statiq, Jio-BP Pulse, BPCL EV Recharge, Magenta ChargeGrid, and EESL. Most support the CCS2 (DC fast charging) and Type 2 (AC) connector standards.",
        },
      },
      {
        "@type": "Question",
        name: "What connector type do Indian EVs use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most Indian electric cars (Tata, Mahindra, MG, Kia, Hyundai) use the CCS2 connector for DC fast charging and Type 2 for AC charging. Electric two-wheelers (Ola, Ather, TVS) typically use proprietary connectors with adapters for public AC charging.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take to charge an EV in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Charging time depends on the charger type: AC slow charging (3.3–7.2 kW) takes 6–12 hours for a full charge. DC fast chargers (25–100 kW) charge to 80% in 30–60 minutes. Ultra-fast chargers (100–150 kW) can charge to 80% in 20–35 minutes.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",              item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Charging Stations", item: `${SITE_URL}/charging-stations` },
    ],
  },
];

const CHARGING_NETWORKS = [
  { name: "Tata Power EZ Charge", connectors: "CCS2, AC Type 2", stations: "5,000+", href: "https://www.tatapower-ez.com" },
  { name: "ChargeZone",           connectors: "CCS2, CHAdeMO",   stations: "3,500+", href: "https://www.chargezone.in" },
  { name: "Ather Grid",           connectors: "Proprietary, AC", stations: "2,000+", href: "https://www.atherenergy.com" },
  { name: "Statiq",               connectors: "CCS2, AC Type 2", stations: "2,500+", href: "https://www.statiq.in" },
  { name: "Jio-BP Pulse",         connectors: "CCS2, AC Type 2", stations: "1,200+", href: "https://www.jio-bp.in" },
];

const TOP_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Pune", "Ahmedabad", "Kolkata", "Jaipur", "Lucknow",
  "Chandigarh", "Bhopal",
];

export default function ChargingStationsPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      {/* Static server-rendered intro for SEO / crawlers */}
      <div className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-black text-gray-900 mb-2">EV Charging Stations Near Me – India</h1>
          <p className="text-gray-500 mb-8 max-w-3xl">
            Find electric vehicle charging stations across India. Search by city, filter by connector type (CCS2, CHAdeMO, Type 2, AC), and browse all major networks including Tata Power, ChargeZone, Ather Grid, Statiq, and Jio-BP Pulse.
          </p>

          {/* Charging Networks */}
          <section className="mb-10">
            <h2 className="text-xl font-black text-gray-900 mb-4">Major EV Charging Networks in India</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CHARGING_NETWORKS.map((n) => (
                <div key={n.name} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="font-bold text-gray-900">{n.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Connectors: {n.connectors}</p>
                  <p className="text-sm text-green-700 font-semibold">{n.stations} stations across India</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cities */}
          <section className="mb-10">
            <h2 className="text-xl font-black text-gray-900 mb-4">Find Charging Stations by City</h2>
            <div className="flex flex-wrap gap-2">
              {TOP_CITIES.map((city) => (
                <span key={city} className="rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700">
                  EV Charging in {city}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      <ChargingStationFinder />
    </>
  );
}
