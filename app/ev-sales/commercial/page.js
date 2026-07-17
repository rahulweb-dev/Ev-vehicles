import { SITE_URL, SITE_NAME } from "@/app/layout";
import SegmentPage from "../SegmentPage";
import { FALLBACK_ANALYTICS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

export const metadata = {
  title: `EV Commercial Vehicle Sales India 2025 – Electric Bus, Truck & Fleet Data | ${SITE_NAME}`,
  description: "Monthly electric commercial vehicle sales India 2025. Tata EV, Ashok Leyland, Switch Mobility, EKA — fleet market data, rankings, growth.",
  alternates: { canonical: `${SITE_URL}/ev-sales/commercial` },
  openGraph: {
    title: "EV Commercial Vehicle Sales India 2025 – Fleet & Truck Market Data",
    description: "Electric bus, truck and fleet vehicle sales intelligence — brand rankings, monthly trend, market share.",
    url: `${SITE_URL}/ev-sales/commercial`,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "India Electric Commercial Vehicle Sales Data 2025",
  description: "Monthly electric commercial vehicle sales for India — buses, trucks, fleet vehicles.",
  url: `${SITE_URL}/ev-sales/commercial`,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  spatialCoverage: { "@type": "Country", name: "India" },
  temporalCoverage: "2025",
};

async function getData() {
  try {
    const res = await fetch(`${SITE_URL}/api/ev-sales/analytics?year=2025&segment=commercial`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const fb = FALLBACK_ANALYTICS(2025);
    return {
      ...fb,
      brandRankings: fb.brandRankings.filter((b) => b.segment === "commercial"),
      grandTotal: fb.totals.commercial?.totalUnits || 0,
    };
  }
}

export default async function EVCommercialSalesPage() {
  const data = await getData();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SegmentPage data={data} segment="commercial" title="EV Commercial Vehicle Sales India 2025" description="Monthly electric bus, truck and fleet sales data — brand rankings, market share, growth trends." breadcrumb={[{ label: "EV Sales", href: "/ev-sales" }, { label: "Commercial" }]} />
    </>
  );
}
