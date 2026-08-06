import EVSavingsCalc from "@/components/EVSavingsCalc";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "EV Savings Calculator – How Much Will You Save by Switching to Electric?",
  description: "Calculate your monthly and yearly savings by switching from a petrol/diesel car to an electric vehicle. Compare fuel costs vs charging costs in India.",
  keywords: "ev savings calculator india, ev vs petrol cost comparison, electric car running cost india, ev cost per km india",
  alternates: { canonical: `${SITE_URL}/ev-savings-calculator` },
  openGraph: {
    title: "EV Savings Calculator India – Petrol vs Electric Cost",
    description: "Find out how much you save monthly by switching to an EV. Compare fuel costs vs electricity charging costs.",
    url: `${SITE_URL}/ev-savings-calculator`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Savings Calculator&subtitle=How much will you save switching to electric?&tag=tools`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Savings Calculator India – Petrol vs Electric Cost",
    images: [`${SITE_URL}/api/og?title=EV Savings Calculator&subtitle=How much will you save switching to electric?&tag=tools`],
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EV vs Petrol Savings Calculator India",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/ev-savings-calculator`,
    description: "Free calculator to compare running costs of electric vehicles vs petrol/diesel cars in India. Calculate monthly fuel savings, ROI, and break-even point.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    featureList: [
      "Monthly fuel savings calculation",
      "EV vs petrol/diesel cost per km",
      "Total cost of ownership comparison",
      "Break-even point estimation",
      "Maintenance savings analysis",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does it cost to charge an electric car in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Home charging in India costs ₹6–9 per kWh on average. A typical electric car with a 40 kWh battery costs ₹240–360 for a full charge, giving a cost of ₹0.80–1.20 per km. This compares to ₹7–9 per km for a petrol car at current fuel prices.",
        },
      },
      {
        "@type": "Question",
        name: "How much can I save per month by switching to an EV in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A typical Indian driver covering 1,500 km/month saves ₹6,000–9,000/month in fuel costs by switching to an EV. Over 5 years, total savings of ₹3.6–5.4 lakh can offset the premium price of an electric car.",
        },
      },
      {
        "@type": "Question",
        name: "Is EV maintenance cheaper than petrol cars in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. EVs have fewer moving parts — no engine oil changes, no timing belt, no clutch plate. Annual maintenance for a typical EV in India is ₹3,000–6,000 vs ₹12,000–20,000 for a petrol car, saving ₹8,000–14,000 per year.",
        },
      },
      {
        "@type": "Question",
        name: "What is the break-even point for buying an EV in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For a driver covering 1,500 km/month, the break-even on an EV's higher upfront cost (vs equivalent petrol model) is typically 3–5 years when factoring in fuel savings, lower maintenance, and applicable government subsidies.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",                   item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "EV Savings Calculator",  item: `${SITE_URL}/ev-savings-calculator` },
    ],
  },
];

const FAQS = [
  {
    q: "How much does it cost to charge an electric car in India?",
    a: "Home charging in India costs ₹6–9 per kWh on average. A typical electric car with a 40 kWh battery costs ₹240–360 for a full charge, giving a cost of ₹0.80–1.20 per km. This compares to ₹7–9 per km for a petrol car at current fuel prices.",
  },
  {
    q: "How much can I save per month by switching to an EV in India?",
    a: "A typical Indian driver covering 1,500 km/month saves ₹6,000–9,000/month in fuel costs by switching to an EV. Over 5 years, total savings of ₹3.6–5.4 lakh can offset the premium price of an electric car.",
  },
  {
    q: "Is EV maintenance cheaper than petrol cars in India?",
    a: "Yes. EVs have fewer moving parts — no engine oil changes, no timing belt, no clutch plate. Annual maintenance for a typical EV in India is ₹3,000–6,000 vs ₹12,000–20,000 for a petrol car, saving ₹8,000–14,000 per year.",
  },
  {
    q: "What is the break-even point for buying an EV in India?",
    a: "For a driver covering 1,500 km/month, the break-even on an EV's higher upfront cost (vs equivalent petrol model) is typically 3–5 years when factoring in fuel savings, lower maintenance, and applicable government subsidies.",
  },
];

export default function EVSavingsPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-2xl font-black text-gray-900 mb-2">EV Savings Calculator — Petrol vs Electric Cost</h1>
        <p className="text-gray-600 leading-relaxed mb-6">
          Enter your current fuel consumption, monthly mileage, and electricity tariff to instantly calculate how much you will save by switching from a petrol or diesel vehicle to an electric car in India. The calculator accounts for fuel costs, electricity costs, maintenance savings, and government subsidies to show your monthly savings, annual savings, and break-even timeline.
        </p>
      </div>
      <EVSavingsCalc />
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
