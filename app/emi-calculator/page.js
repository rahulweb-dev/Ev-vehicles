import { SITE_URL } from "@/app/layout";
import EMICalculatorApp from "./EMICalculatorApp";

export const metadata = {
  title: "EV EMI Calculator India 2026 – Electric Vehicle Loan Calculator | EV News India",
  description: "Calculate your electric vehicle EMI instantly. Enter EV price, down payment, loan tenure and interest rate to get monthly EMI, total interest and amortization schedule. Free EV loan calculator India.",
  keywords: "ev emi calculator india, electric vehicle loan calculator, ev loan emi 2026, car emi calculator india, ev finance calculator",
  alternates: { canonical: `${SITE_URL}/emi-calculator` },
  openGraph: {
    title: "EV EMI Calculator India 2026 – Free Electric Vehicle Loan Calculator",
    description: "Calculate your monthly EV loan EMI, total interest and repayment schedule instantly. Supports all electric cars and bikes in India.",
    url: `${SITE_URL}/emi-calculator`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV+EMI+Calculator+India+2026&subtitle=Monthly+EMI+%7C+Interest+%7C+Amortization&tag=tool&type=page`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV EMI Calculator India 2026",
    description: "Free EV loan EMI calculator. Calculate monthly payment, total interest and full amortization schedule.",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EV EMI Calculator India 2026",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/emi-calculator`,
    description: "Free calculator to compute monthly EV loan EMI, total interest paid, and full amortization schedule for any electric vehicle in India.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the EMI for a ₹15 lakh EV in India?",
        acceptedAnswer: { "@type": "Answer", text: "For a ₹15 lakh electric car with ₹3 lakh down payment (₹12 lakh loan), at 8.5% interest rate for 5 years, the monthly EMI is approximately ₹24,700. Total interest paid over 5 years would be about ₹2.82 lakh." },
      },
      {
        "@type": "Question",
        name: "What is the interest rate for EV loans in India in 2026?",
        acceptedAnswer: { "@type": "Answer", text: "EV loan interest rates in India range from 7.5% to 10.5% per annum depending on the lender, your credit score, and loan tenure. SBI, HDFC, and Tata Capital offer competitive EV loan rates. Some states also offer interest subvention for EV purchases." },
      },
      {
        "@type": "Question",
        name: "What is the minimum down payment for an EV loan?",
        acceptedAnswer: { "@type": "Answer", text: "Most banks in India require a minimum 10–20% down payment for EV loans. For a ₹15 lakh car, that means ₹1.5–3 lakh upfront. Higher down payments reduce your EMI and total interest paid significantly." },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",           item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "EMI Calculator", item: `${SITE_URL}/emi-calculator` },
    ],
  },
];

const FAQS = [
  {
    q: "What is the EMI for a ₹15 lakh EV in India?",
    a: "For a ₹15 lakh electric car with ₹3 lakh down payment (₹12 lakh loan), at 8.5% interest rate for 5 years, the monthly EMI is approximately ₹24,700. Total interest paid over 5 years would be about ₹2.82 lakh.",
  },
  {
    q: "What is the interest rate for EV loans in India in 2026?",
    a: "EV loan interest rates in India range from 7.5% to 10.5% per annum depending on the lender, your credit score, and loan tenure. SBI, HDFC, and Tata Capital offer competitive EV loan rates. Some states also offer interest subvention for EV purchases.",
  },
  {
    q: "What is the minimum down payment for an EV loan?",
    a: "Most banks in India require a minimum 10–20% down payment for EV loans. For a ₹15 lakh car, that means ₹1.5–3 lakh upfront. Higher down payments reduce your EMI and total interest paid significantly.",
  },
];

export default function EMICalculatorPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-2xl font-black text-gray-900 mb-2">EV EMI Calculator — Electric Vehicle Loan India 2026</h1>
        <p className="text-gray-600 leading-relaxed mb-6">
          Calculate your monthly EMI for any electric car, scooter, or bike loan in India. Enter the vehicle price, down payment amount, loan tenure (12–84 months), and interest rate to instantly get your exact EMI, total interest payable, and a full month-by-month amortization schedule. Use this calculator to compare different loan tenures and down payment amounts before finalising your EV purchase.
        </p>
      </div>
      <EMICalculatorApp />
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
