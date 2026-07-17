import { SITE_URL, SITE_NAME } from "@/app/layout";
import SegmentPage from "../SegmentPage";
import { FALLBACK_ANALYTICS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

export const metadata = {
  title: `EV Two-Wheeler Sales India 2025 – Electric Scooter & Bike Data | ${SITE_NAME}`,
  description: "Monthly electric two-wheeler sales data India 2025. Ola Electric, TVS iQube, Ather, Bajaj Chetak, Hero Vida — rankings, market share, growth.",
  alternates: { canonical: `${SITE_URL}/ev-sales/two-wheelers` },
  openGraph: {
    title: "EV Two-Wheeler Sales India 2025 – Electric Scooter Market Data",
    description: "Electric scooter & bike sales intelligence — brand rankings, monthly trend, market share breakdown.",
    url: `${SITE_URL}/ev-sales/two-wheelers`,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "India Electric Two-Wheeler Sales Data 2025",
  description: "Monthly electric two-wheeler sales rankings, brand market share for India.",
  url: `${SITE_URL}/ev-sales/two-wheelers`,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  spatialCoverage: { "@type": "Country", name: "India" },
  temporalCoverage: "2025",
};

async function getData() {
  try {
    const res = await fetch(`${SITE_URL}/api/ev-sales/analytics?year=2025&segment=two-wheeler`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const fb = FALLBACK_ANALYTICS(2025);
    return {
      ...fb,
      brandRankings: fb.brandRankings.filter((b) => b.segment === "two-wheeler"),
      grandTotal: fb.totals["two-wheeler"]?.totalUnits || 0,
    };
  }
}

export default async function EVTwoWheelerSalesPage() {
  const data = await getData();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SegmentPage data={data} segment="two-wheeler" title="EV Two-Wheeler Sales India 2025" description="Monthly electric scooter & bike sales data — brand rankings, market share, growth trends." breadcrumb={[{ label: "EV Sales", href: "/ev-sales" }, { label: "Two-Wheelers" }]} />
    </>
  );
}
