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
      <EVMarketShareDashboard data={data} />
    </>
  );
}
