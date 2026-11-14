import { SITE_URL, SITE_NAME } from "@/app/layout";
import StateAdoptionDashboard from "./StateAdoptionDashboard";
import { FALLBACK_ANALYTICS, DATA_YEAR, MONTHS_COVERED, SALES_FACTS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

export const metadata = {
  title: `EV Adoption by State India ${DATA_YEAR} – State-wise Electric Vehicle Data`,
  description: `State-wise EV adoption data India ${DATA_YEAR}. Top states for electric vehicles — Maharashtra, Delhi, Karnataka, Gujarat, Rajasthan EV sales numbers.`,
  keywords: `EV adoption India state-wise, state EV sales India, electric vehicle adoption states India ${DATA_YEAR}`,
  alternates: { canonical: `${SITE_URL}/ev-adoption-states` },
  openGraph: {
    title: `EV Adoption by State India ${DATA_YEAR} – City & State Level EV Data`,
    description: "Which Indian states are leading the EV revolution? State-wise sales data, growth rates, and adoption trends.",
    url: `${SITE_URL}/ev-adoption-states`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Adoption by State ${DATA_YEAR}&subtitle=State-wise EV Registrations India&tag=analytics&type=page`, width: 1200, height: 630, alt: `EV Adoption by State India ${DATA_YEAR}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `EV Adoption by State India ${DATA_YEAR} – City & State Level EV Data`,
    images: [`${SITE_URL}/api/og?title=EV Adoption by State ${DATA_YEAR}&subtitle=State-wise EV Registrations India&tag=analytics&type=page`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: `India State-wise EV Adoption Data ${DATA_YEAR}`,
  description: "Electric vehicle adoption data broken down by Indian state, including sales volumes, growth rates.",
  url: `${SITE_URL}/ev-adoption-states`,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  spatialCoverage: { "@type": "Country", name: "India" },
  temporalCoverage: String(DATA_YEAR),
};

export default async function EVAdoptionStatesPage() {
  const data = FALLBACK_ANALYTICS();
  const facts = SALES_FACTS();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Server-rendered editorial intro for AdSense quality and Googlebot visibility */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-3xl font-black text-gray-900 mb-3">EV Adoption by State — India {DATA_YEAR}</h1>
        <p className="text-gray-700 leading-relaxed mb-4">
          Which Indian states are leading the electric vehicle revolution? This page tracks <strong>state-wise EV registrations</strong> across India. In {facts.statesPeriod}, <strong>{facts.topStates[0]?.state}</strong> recorded the most EV registrations, followed by {facts.topStates.slice(1, 4).map((s) => s.state).join(", ")}. Figures are compiled from Vahan registration data (source: {facts.source}) and updated monthly.
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
