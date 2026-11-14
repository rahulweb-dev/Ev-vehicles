import { SITE_URL, SITE_NAME } from "@/app/layout";
import SegmentPage from "../SegmentPage";
import { SEGMENT_ANALYTICS, DATA_YEAR } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

const TITLE = `EV Car Sales India ${DATA_YEAR}`;

export const metadata = {
  title: `${TITLE} – Brand-wise Monthly Data & Market Share`,
  description: "Monthly electric car sales in India: Tata, Mahindra, MG, VinFast, Kia, Hyundai, BYD brand rankings and market share from Vahan data.",
  alternates: { canonical: `${SITE_URL}/ev-sales/cars` },
  openGraph: {
    title: `${TITLE} – Brand Rankings & Market Share`,
    description: "Monthly electric car sales — brand rankings, market share and growth from Vahan registration data.",
    url: `${SITE_URL}/ev-sales/cars`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(TITLE)}&subtitle=Brand Rankings %26 Market Share&tag=cars&type=page`, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} – Brand Rankings & Market Share`,
    images: [`${SITE_URL}/api/og?title=${encodeURIComponent(TITLE)}&subtitle=Brand Rankings %26 Market Share&tag=cars&type=page`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: `India electric car sales data ${DATA_YEAR}`,
  description: "Monthly electric car sales — brand rankings, market share and growth from Vahan registration data.",
  url: `${SITE_URL}/ev-sales/cars`,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  spatialCoverage: { "@type": "Country", name: "India" },
  temporalCoverage: String(DATA_YEAR),
};

export default function EVCarSalesPage() {
  const data = SEGMENT_ANALYTICS("car");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SegmentPage data={data} segment="car" title={TITLE} description={`Monthly electric car sales — brand rankings, market share and growth from Vahan registration data (${data.periodLabel}). Source: ${data.source}.`} breadcrumb={[{ label: "EV Sales", href: "/ev-sales" }, { label: "Cars" }]} />
    </>
  );
}
