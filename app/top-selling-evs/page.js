import { SITE_URL, SITE_NAME } from "@/app/layout";
import TopSellingEVsDashboard from "./TopSellingEVsDashboard";
import { FALLBACK_ANALYTICS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

export const metadata = {
  title: `Top Selling EVs India 2025 – Best Selling Electric Vehicles | ${SITE_NAME}`,
  description: "Best selling electric vehicles in India 2025. Top EV cars, electric scooters, commercial EVs ranked by monthly sales data.",
  keywords: "top selling EV India 2025, best electric cars India, best electric scooter India 2025, EV sales ranking",
  alternates: { canonical: `${SITE_URL}/top-selling-evs` },
  openGraph: {
    title: "Top Selling EVs India 2025 – Best Electric Vehicles Ranked",
    description: "India's best-selling electric vehicles ranked by actual monthly sales figures.",
    url: `${SITE_URL}/top-selling-evs`,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Top Selling EVs India 2025",
  description: "Best-selling electric vehicles in India ranked by sales figures.",
  url: `${SITE_URL}/top-selling-evs`,
  numberOfItems: 15,
};

async function getData() {
  try {
    const res = await fetch(`${SITE_URL}/api/ev-sales/analytics?year=2025`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return FALLBACK_ANALYTICS(2025);
  }
}

export default async function TopSellingEVsPage() {
  const data = await getData();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Server-rendered editorial intro for AdSense quality and Googlebot visibility */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-3xl font-black text-gray-900 mb-3">Top Selling EVs in India 2025</h1>
        <p className="text-gray-700 leading-relaxed mb-4">
          India&apos;s best-selling electric vehicles ranked by actual monthly VAHAN registration data. The <strong>Tata Nexon EV</strong> consistently tops the electric car segment, while <strong>Ola S1 Pro</strong> and <strong>TVS iQube</strong> lead the electric scooter rankings. This list covers the top 15 best-selling EVs across all segments — cars, two-wheelers, and commercial vehicles — updated monthly with verified government sales figures. The rankings reflect real buyer preference, not manufacturer claims, and are a reliable guide for anyone researching which EV to buy in India in 2025.
        </p>
      </div>

      <TopSellingEVsDashboard data={data} />
    </>
  );
}
