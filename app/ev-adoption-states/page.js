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

      {/* Server-rendered editorial intro for AdSense quality and Googlebot visibility */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-3xl font-black text-gray-900 mb-3">EV Adoption by State — India 2025</h1>
        <p className="text-gray-700 leading-relaxed mb-4">
          Which Indian states are leading the electric vehicle revolution? This dashboard tracks <strong>state-wise EV registrations</strong> across India using official VAHAN data for 2025. <strong>Uttar Pradesh</strong> leads in total EV registrations followed by Maharashtra, Karnataka, Tamil Nadu, and Rajasthan. <strong>Delhi</strong> leads in EV adoption rate relative to total vehicle registrations, powered by aggressive state subsidies including complete road tax waiver, purchase incentives up to ₹30,000, and a dense public charging network. Explore state-level trends, year-over-year growth rates, and segment breakdowns below.
        </p>
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          {[
            { label: "Most registrations", value: "Uttar Pradesh" },
            { label: "Highest adoption rate", value: "Delhi" },
            { label: "Fastest growing", value: "Karnataka" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 min-w-40">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-black text-orange-700">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <StateAdoptionDashboard data={data} />
    </>
  );
}
