import SubsidyClient from "./SubsidyClient";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "EV Subsidy Calculator India 2026 – State + FAME II Benefits",
  description: "Calculate total EV subsidy in your state including FAME II, state incentives, road tax waiver, and registration discount. Check exact benefits for your city.",
  keywords: "ev subsidy india 2026, fame 2 subsidy calculator, electric car subsidy state wise, ev subsidy maharashtra delhi karnataka",
  alternates: { canonical: `${SITE_URL}/subsidy-calculator` },
  openGraph: {
    title: "EV Subsidy Calculator India 2026",
    description: "Calculate FAME II + state subsidies for your electric vehicle purchase.",
    url: `${SITE_URL}/subsidy-calculator`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Subsidy Calculator India 2026&subtitle=FAME II + State Incentives&tag=tools`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Subsidy Calculator India 2026",
    images: [`${SITE_URL}/api/og?title=EV Subsidy Calculator India 2026&subtitle=FAME II + State Incentives&tag=tools`],
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EV Subsidy Calculator India 2026",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/subsidy-calculator`,
    description: "Calculate total government subsidies for buying an electric vehicle in India — including FAME II, PM E-Drive, and state-level incentives.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    featureList: [
      "FAME II subsidy calculation",
      "PM E-Drive scheme benefits",
      "State-wise EV incentives for all 28 states",
      "Road tax and registration fee waivers",
      "Income tax (Section 80EEB) benefit",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the FAME II subsidy for electric cars in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Under the FAME II scheme, electric cars priced under ₹15 lakh (ex-showroom) are eligible for a subsidy of ₹10,000 per kWh of battery capacity, up to ₹1.5 lakh. Two-wheelers get up to ₹15,000 subsidy.",
        },
      },
      {
        "@type": "Question",
        name: "Which state gives the highest EV subsidy in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Delhi offers the highest combined EV subsidy in India — up to ₹1.5 lakh for electric cars, plus 100% road tax waiver, zero registration fee, and additional scrappage incentive. Maharashtra and Gujarat also offer significant state subsidies.",
        },
      },
      {
        "@type": "Question",
        name: "Can I claim income tax benefit on EV loan in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Under Section 80EEB of the Income Tax Act, individuals can claim a deduction of up to ₹1.5 lakh on interest paid on EV loans taken between April 2019 and March 2023. This benefit applies to both two-wheelers and four-wheelers.",
        },
      },
      {
        "@type": "Question",
        name: "What is the PM E-Drive scheme for EVs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PM E-Drive (Electric Drive Revolution in Innovative Vehicle Enhancement) replaced FAME II in 2024 with a ₹10,900 crore outlay. It supports electric two-wheelers, three-wheelers, e-buses, and charging infrastructure across India.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",                item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Subsidy Calculator",  item: `${SITE_URL}/subsidy-calculator` },
    ],
  },
];

const FAQS = [
  {
    q: "What is the FAME II subsidy for electric cars in India?",
    a: "Under the FAME II scheme, electric cars priced under ₹15 lakh (ex-showroom) are eligible for a subsidy of ₹10,000 per kWh of battery capacity, up to ₹1.5 lakh. Two-wheelers get up to ₹15,000 subsidy.",
  },
  {
    q: "Which state gives the highest EV subsidy in India?",
    a: "Delhi offers the highest combined EV subsidy in India — up to ₹1.5 lakh for electric cars, plus 100% road tax waiver, zero registration fee, and additional scrappage incentive. Maharashtra and Gujarat also offer significant state subsidies.",
  },
  {
    q: "Can I claim income tax benefit on EV loan in India?",
    a: "Yes. Under Section 80EEB of the Income Tax Act, individuals can claim a deduction of up to ₹1.5 lakh on interest paid on EV loans taken between April 2019 and March 2023. This benefit applies to both two-wheelers and four-wheelers.",
  },
  {
    q: "What is the PM E-Drive scheme for EVs?",
    a: "PM E-Drive (Electric Drive Revolution in Innovative Vehicle Enhancement) replaced FAME II in 2024 with a ₹10,900 crore outlay. It supports electric two-wheelers, three-wheelers, e-buses, and charging infrastructure across India.",
  },
];

export default function SubsidyCalculatorPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-2xl font-black text-gray-900 mb-2">EV Subsidy Calculator — India 2026</h1>
        <p className="text-gray-600 leading-relaxed mb-6">
          Select your state and the type of electric vehicle you plan to buy to instantly calculate your total EV subsidy in India — including PM E-Drive central benefits, state-level incentives, road tax waivers, registration fee exemptions, and income tax deductions under Section 80EEB. The calculator covers all 28 states and union territories and is updated with the latest subsidy rates for 2026.
        </p>
      </div>
      <SubsidyClient />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border border-gray-200 bg-white">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-semibold text-gray-900 marker:hidden list-none">
                {q}
                <span className="ml-4 shrink-0 text-green-600 group-open:rotate-45 transition-transform duration-200">＋</span>
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
