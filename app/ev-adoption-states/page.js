import { SITE_URL, SITE_NAME } from "@/app/layout";
import StateAdoptionDashboard from "./StateAdoptionDashboard";
import { FALLBACK_ANALYTICS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

export const metadata = {
  title: `EV Adoption by State India 2025 – State-wise Electric Vehicle Data | ${SITE_NAME}`,
  description: "State-wise EV adoption data India 2025. Top states for electric vehicles — Maharashtra, Delhi, Karnataka, Gujarat, Rajasthan EV sales numbers.",
  keywords: "EV adoption India state-wise, state EV sales India, electric vehicle adoption states India 2025",
  alternates: { canonical: `${SITE_URL}/ev-adoption-states` },
  openGraph: {
    title: "EV Adoption by State India 2025 – City & State Level EV Data",
    description: "Which Indian states are leading the EV revolution? State-wise sales data, growth rates, and adoption trends.",
    url: `${SITE_URL}/ev-adoption-states`,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "India State-wise EV Adoption Data 2025",
  description: "Electric vehicle adoption data broken down by Indian state, including sales volumes, growth rates.",
  url: `${SITE_URL}/ev-adoption-states`,
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

export default async function EVAdoptionStatesPage() {
  const data = await getData();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StateAdoptionDashboard data={data} />
    </>
  );
}
