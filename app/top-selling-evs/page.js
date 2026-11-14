import { SITE_URL, SITE_NAME } from "@/app/layout";
import TopSellingEVsDashboard from "./TopSellingEVsDashboard";
import { FALLBACK_ANALYTICS, DATA_YEAR, MONTHS_COVERED, SALES_FACTS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

export const metadata = {
  title: `Top Selling EVs India ${DATA_YEAR} – Best Selling Electric Vehicles`,
  description: `Best selling electric vehicles in India ${DATA_YEAR}. Top EV cars, electric scooters, commercial EVs ranked by monthly sales data.`,
  keywords: `top selling EV India ${DATA_YEAR}, best electric cars India, best electric scooter India ${DATA_YEAR}, EV sales ranking`,
  alternates: { canonical: `${SITE_URL}/top-selling-evs` },
  openGraph: {
    title: `Top Selling EVs India ${DATA_YEAR} – Best Electric Vehicles Ranked`,
    description: "India's best-selling electric vehicles ranked by actual monthly sales figures.",
    url: `${SITE_URL}/top-selling-evs`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=Top Selling EVs India ${DATA_YEAR}&subtitle=Best Electric Vehicles Ranked&tag=cars&type=page`, width: 1200, height: 630, alt: `Top Selling EVs India ${DATA_YEAR}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Top Selling EVs India ${DATA_YEAR} – Best Electric Vehicles Ranked`,
    images: [`${SITE_URL}/api/og?title=Top Selling EVs India ${DATA_YEAR}&subtitle=Best Electric Vehicles Ranked&tag=cars&type=page`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `Top Selling EVs India ${DATA_YEAR}`,
  description: "Best-selling electric vehicles in India ranked by sales figures.",
  url: `${SITE_URL}/top-selling-evs`,
  numberOfItems: 15,
};

export default async function TopSellingEVsPage() {
  const data = FALLBACK_ANALYTICS();
  const facts = SALES_FACTS();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Server-rendered editorial intro for AdSense quality and Googlebot visibility */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-3xl font-black text-gray-900 mb-3">Top Selling EVs in India {DATA_YEAR}</h1>
        <p className="text-gray-700 leading-relaxed mb-4">
          India&apos;s best-selling electric vehicle brands for {facts.periodLabel}, ranked by registrations compiled from Vahan data and FADA. In electric cars, <strong>{facts.topCar[0]?.brand}</strong> leads with {facts.topCar[0]?.marketShare}% share, followed by {facts.topCar[1]?.brand} and {facts.topCar[2]?.brand}. In electric two-wheelers, <strong>{facts.topTwoWheeler[0]?.brand}</strong> leads ahead of {facts.topTwoWheeler[1]?.brand}, {facts.topTwoWheeler[2]?.brand} and {facts.topTwoWheeler[3]?.brand}. Rankings are updated every month (source: {facts.source}).
        </p>
      </div>

      <TopSellingEVsDashboard data={data} />
    </>
  );
}
