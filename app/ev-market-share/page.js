import { SITE_URL, SITE_NAME } from "@/app/layout";
import EVMarketShareDashboard from "./EVMarketShareDashboard";
import { FALLBACK_ANALYTICS, DATA_YEAR, MONTHS_COVERED, SALES_FACTS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

export const metadata = {
  title: `EV Market Share India ${DATA_YEAR} – Brand-wise Electric Vehicle Market Share`,
  description: `Electric vehicle market share in India ${DATA_YEAR}. Tata, Mahindra, MG, TVS, Bajaj, Ather — brand-wise EV market share data for cars, two-wheelers, commercial.`,
  keywords: `EV market share India ${DATA_YEAR}, electric car market share, EV brand rankings India, Tata EV market share`,
  alternates: { canonical: `${SITE_URL}/ev-market-share` },
  openGraph: {
    title: `EV Market Share India ${DATA_YEAR} – Brand Rankings & Segment Analysis`,
    description: "Comprehensive EV market share data for India — all brands, all segments.",
    url: `${SITE_URL}/ev-market-share`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Market Share India ${DATA_YEAR}&subtitle=Brand Rankings %26 Segment Analysis&tag=analytics&type=page`, width: 1200, height: 630, alt: `EV Market Share India ${DATA_YEAR}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `EV Market Share India ${DATA_YEAR} – Brand Rankings & Segment Analysis`,
    images: [`${SITE_URL}/api/og?title=EV Market Share India ${DATA_YEAR}&subtitle=Brand Rankings %26 Segment Analysis&tag=analytics&type=page`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: `India EV Market Share Data ${DATA_YEAR}`,
  description: "Brand-wise electric vehicle market share data for India, covering cars, two-wheelers and commercial vehicles.",
  url: `${SITE_URL}/ev-market-share`,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  spatialCoverage: { "@type": "Country", name: "India" },
  temporalCoverage: String(DATA_YEAR),
};

export default async function EVMarketSharePage() {
  const data = FALLBACK_ANALYTICS();
  const facts = SALES_FACTS();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Server-rendered editorial intro for AdSense quality and Googlebot visibility */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-3xl font-black text-gray-900 mb-3">EV Market Share India {DATA_YEAR}</h1>
        <p className="text-gray-700 leading-relaxed mb-4">
          This page tracks <strong>brand-wise electric vehicle market share</strong> in India for {facts.periodLabel}, covering cars, two-wheelers and commercial vehicles.
          {" "}<strong>{facts.topCar[0]?.brand}</strong> leads electric cars with a {facts.topCar[0]?.marketShare}% share, and
          {" "}<strong>{facts.topTwoWheeler[0]?.brand}</strong> leads electric two-wheelers with {facts.topTwoWheeler[0]?.marketShare}%.
          {" "}Figures are compiled from Vahan registration data and FADA ({facts.source}) and updated monthly.
        </p>
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          {[
            { label: "Cars leader", value: `${facts.topCar[0]?.brand} — ${facts.topCar[0]?.marketShare}%` },
            { label: "2-Wheeler leader", value: `${facts.topTwoWheeler[0]?.brand} — ${facts.topTwoWheeler[0]?.marketShare}%` },
            { label: "Commercial leader", value: facts.topCommercial[0] ? `${facts.topCommercial[0].brand} — ${facts.topCommercial[0].marketShare}%` : "–" },
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
