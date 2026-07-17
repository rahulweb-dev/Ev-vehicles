import { SITE_URL, SITE_NAME } from "@/app/layout";
import SegmentPage from "../SegmentPage";
import { FALLBACK_ANALYTICS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

export const metadata = {
  title: `EV Car Sales India 2025 – Best Selling Electric Cars & Market Share | ${SITE_NAME}`,
  description: "Monthly electric car sales data India 2025. Top selling EV cars, brand rankings, market share — Tata, MG, Mahindra, BYD, Hyundai.",
  alternates: { canonical: `${SITE_URL}/ev-sales/cars` },
  openGraph: {
    title: "EV Car Sales India 2025 – Top Electric Cars Market Data",
    description: "Comprehensive electric car sales intelligence — brand rankings, monthly trend, market share breakdown.",
    url: `${SITE_URL}/ev-sales/cars`,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "India Electric Car Sales Data 2025",
  description: "Monthly electric car sales rankings, brand market share, and growth data for India.",
  url: `${SITE_URL}/ev-sales/cars`,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  spatialCoverage: { "@type": "Country", name: "India" },
  temporalCoverage: "2025",
};

async function getData() {
  try {
    const res = await fetch(`${SITE_URL}/api/ev-sales/analytics?year=2025&segment=car`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const fb = FALLBACK_ANALYTICS(2025);
    return {
      ...fb,
      brandRankings: fb.brandRankings.filter((b) => b.segment === "car"),
      grandTotal: fb.totals.car?.totalUnits || 0,
    };
  }
}

export default async function EVCarSalesPage() {
  const data = await getData();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SegmentPage data={data} segment="car" title="EV Car Sales India 2025" description="Monthly electric car sales data — brand rankings, market share, growth trends." breadcrumb={[{ label: "EV Sales", href: "/ev-sales" }, { label: "Cars" }]} />
    </>
  );
}
