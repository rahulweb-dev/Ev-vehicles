import ResaleClient from "./ResaleClient";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "EV Resale Value Calculator India 2026 – Check Depreciation",
  description: "Calculate your electric vehicle's resale value and depreciation in India. Find out how much your EV will be worth after 1, 2, 3, 5 years.",
  keywords: "ev resale value india, electric car depreciation india, tata nexon ev resale value, ev second hand price",
  alternates: { canonical: `${SITE_URL}/resale-calculator` },
  openGraph: {
    title: "EV Resale Value Calculator – India 2026",
    description: "Find out your EV's resale value and depreciation after any number of years.",
    images: [{ url: `${SITE_URL}/api/og?title=EV Resale Value Calculator&subtitle=Check your EV depreciation in India&tag=tools`, width: 1200, height: 630 }],
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EV Resale Value Calculator India",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/resale-calculator`,
    description: "Free online tool to calculate the resale value and depreciation of electric vehicles in India over 1–10 years.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    featureList: [
      "EV depreciation calculation for India",
      "Year-by-year resale value breakdown",
      "Supports all major EV brands: Tata, Mahindra, MG, Kia, Ola, Ather",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much do electric cars depreciate in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Electric cars in India depreciate at 15–25% in the first year and 10–15% per year after that. After 5 years, an EV typically retains 40–55% of its original value, depending on the brand and model.",
        },
      },
      {
        "@type": "Question",
        name: "Which EV has the best resale value in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tata Nexon EV and Tata Tiago EV tend to have the best resale values in India due to strong brand trust and wide service network. Premium EVs from MG and Kia also hold value well in metro cities.",
        },
      },
      {
        "@type": "Question",
        name: "Does battery health affect EV resale value?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, battery health is the single biggest factor in EV resale value. Most Indian EV manufacturers offer 8-year or 1.6 lakh km battery warranties, which helps sustain resale value compared to older or imported models.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",              item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Resale Calculator", item: `${SITE_URL}/resale-calculator` },
    ],
  },
];

export default function ResaleCalculatorPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <ResaleClient />
    </>
  );
}
