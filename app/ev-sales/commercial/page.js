import { SITE_URL, SITE_NAME } from "@/app/layout";
import SegmentPage from "../SegmentPage";
import { SEGMENT_ANALYTICS, DATA_YEAR } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

const TITLE = `Electric Commercial Vehicle Sales India ${DATA_YEAR}`;

export const metadata = {
  title: `${TITLE} – Brand-wise Monthly Data & Market Share`,
  description: "Monthly electric commercial vehicle sales in India: e-trucks, e-SCVs and e-buses, brand rankings and growth from FADA and Vahan data.",
  alternates: { canonical: `${SITE_URL}/ev-sales/commercial` },
  openGraph: {
    title: `${TITLE} – Brand Rankings & Market Share`,
    description: "Monthly electric commercial vehicle sales — goods carriers and buses, brand rankings and growth.",
    url: `${SITE_URL}/ev-sales/commercial`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(TITLE)}&subtitle=Brand Rankings %26 Market Share&tag=commercial&type=page`, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} – Brand Rankings & Market Share`,
    images: [`${SITE_URL}/api/og?title=${encodeURIComponent(TITLE)}&subtitle=Brand Rankings %26 Market Share&tag=commercial&type=page`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: `India electric commercial vehicle sales data ${DATA_YEAR}`,
  description: "Monthly electric commercial vehicle sales — goods carriers and buses, brand rankings and growth.",
  url: `${SITE_URL}/ev-sales/commercial`,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  spatialCoverage: { "@type": "Country", name: "India" },
  temporalCoverage: String(DATA_YEAR),
};

export default function EVCommercialSalesPage() {
  const data = SEGMENT_ANALYTICS("commercial");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SegmentPage data={data} segment="commercial" title={TITLE} description={`Monthly electric commercial vehicle sales — goods carriers and buses, brand rankings and growth (${data.periodLabel}). Source: ${data.source}.`} breadcrumb={[{ label: "EV Sales", href: "/ev-sales" }, { label: "Commercial" }]} />
    </>
  );
}
