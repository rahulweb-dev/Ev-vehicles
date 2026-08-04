import { SITE_URL, SITE_NAME } from "@/app/layout";
import EVMarketShareDashboard from "./EVMarketShareDashboard";
import { FALLBACK_ANALYTICS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

export const metadata = {
  title: `EV Market Share India 2025 – Brand-wise Electric Vehicle Market Share | ${SITE_NAME}`,
  description: "Electric vehicle market share in India 2025. Tata, Ola, MG, Mahindra, TVS, Ather — brand-wise EV market share data for cars, two-wheelers, commercial.",
  keywords: "EV market share India 2025, electric car market share, EV brand rankings India, Tata EV market share",
  alternates: { canonical: `${SITE_URL}/ev-market-share` },
  openGraph: {
    title: "EV Market Share India 2025 – Brand Rankings & Segment Analysis",
    description: "Comprehensive EV market share data for India — all brands, all segments.",
    url: `${SITE_URL}/ev-market-share`,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "India EV Market Share Data 2025",
  description: "Brand-wise electric vehicle market share data for India, covering cars, two-wheelers and commercial vehicles.",
  url: `${SITE_URL}/ev-market-share`,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  spatialCoverage: { "@type": "Country", name: "India" },
  temporalCoverage: "2025",
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

export default async function EVMarketSharePage() {
  const data = await getData();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Server-rendered editorial intro for AdSense quality and Googlebot visibility */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-3xl font-black text-gray-900 mb-3">EV Market Share India 2025</h1>
        <p className="text-gray-700 leading-relaxed mb-4">
          This page tracks <strong>brand-wise electric vehicle market share</strong> in India for 2025, covering the car, two-wheeler, and commercial vehicle segments. Tata EV dominates the electric car segment with over 50% market share, while Ola Electric leads two-wheelers with approximately 35% share. The data is sourced from official VAHAN registration records and updated monthly. Use the charts below to compare EV brands, segment growth trends, and state-level adoption patterns across India.
        </p>
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          {[
            { label: "Cars leader", value: "Tata EV — 50%+" },
            { label: "2-Wheeler leader", value: "Ola Electric — 35%+" },
            { label: "Commercial leader", value: "Tata / Mahindra" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 min-w-40">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-black text-blue-700">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <EVMarketShareDashboard data={data} />
    </>
  );
}
