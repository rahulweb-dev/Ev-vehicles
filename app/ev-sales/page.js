import { SITE_URL, SITE_NAME } from "@/app/layout";
import EVSalesDashboard from "./EVSalesDashboard";
import { FALLBACK_ANALYTICS } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

const DATA_YEAR = new Date().getFullYear();

export const metadata = {
  title: `EV Sales Intelligence India ${DATA_YEAR} – Monthly EV Market Data | ${SITE_NAME}`,
  description: "India EV sales data, market share, brand rankings, state-wise EV adoption and monthly trends for electric cars, two-wheelers and commercial vehicles.",
  keywords: `EV sales India ${DATA_YEAR}, electric vehicle sales data India, EV market share India, top selling EV India, EV monthly sales`,
  alternates: { canonical: `${SITE_URL}/ev-sales` },
  openGraph: {
    title: `EV Sales Intelligence India ${DATA_YEAR} – Market Data & Insights`,
    description: "Comprehensive EV sales analytics — brand rankings, segment breakdown, state adoption, monthly growth trends.",
    url: `${SITE_URL}/ev-sales`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Sales Intelligence&subtitle=India Monthly EV Market Data ${DATA_YEAR}&tag=analytics&type=page`, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: `India EV Sales Data ${DATA_YEAR} | EV News India` },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: `India EV Sales Intelligence ${DATA_YEAR}`,
  description: "Monthly electric vehicle sales data for India including cars, two-wheelers, commercial vehicles — brand rankings, market share, state-wise adoption.",
  url: `${SITE_URL}/ev-sales`,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  temporalCoverage: String(DATA_YEAR),
  spatialCoverage: { "@type": "Country", name: "India" },
  keywords: ["EV sales", "Electric vehicles", "India market data", "EV market share"],
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How many EVs were sold in India in 2025?", acceptedAnswer: { "@type": "Answer", text: "India sold over 17 lakh (1.7 million) electric vehicles in 2025 across all segments — cars, two-wheelers, and commercial vehicles — making it one of the fastest-growing EV markets globally." } },
    { "@type": "Question", name: "Which is the best-selling electric car in India in 2025?", acceptedAnswer: { "@type": "Answer", text: "Tata EV leads the electric car segment in India with a market share exceeding 50%, followed by MG EV, Mahindra EV, BYD, and Hyundai Creta Electric." } },
    { "@type": "Question", name: "Which electric scooter sells the most in India?", acceptedAnswer: { "@type": "Answer", text: "Ola Electric is the best-selling electric two-wheeler brand in India in 2025, followed by TVS iQube, Ather Energy, Bajaj Chetak, and Hero Vida." } },
    { "@type": "Question", name: "Which state has the highest EV adoption in India?", acceptedAnswer: { "@type": "Answer", text: "Uttar Pradesh leads in total EV registrations. Maharashtra, Karnataka, Tamil Nadu, and Rajasthan follow closely. Delhi leads in EV adoption rate relative to total vehicle registrations." } },
    { "@type": "Question", name: "Is India's EV market growing?", acceptedAnswer: { "@type": "Answer", text: "Yes, India's EV market grew over 30% year-over-year in 2025, driven by government incentives under the PM E-Drive scheme, falling battery prices, wider model availability, and growing consumer awareness." } },
    { "@type": "Question", name: "Which EV brand has the highest market share in India?", acceptedAnswer: { "@type": "Answer", text: "In the electric car segment, Tata EV holds over 50% market share. In electric two-wheelers, Ola Electric leads with approximately 35% share. The Tata Group is the largest EV seller in India overall." } },
  ],
};

async function getAnalytics() {
  try {
    const res = await fetch(`${SITE_URL}/api/ev-sales/analytics?year=2025`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return FALLBACK_ANALYTICS(2025);
  }
}

export default async function EVSalesPage() {
  const data = await getAnalytics();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <EVSalesDashboard data={data} />
    </>
  );
}
