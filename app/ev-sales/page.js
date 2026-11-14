import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/app/layout";
import EVSalesDashboard from "./EVSalesDashboard";
import { FALLBACK_ANALYTICS, SALES_FACTS, DATA_YEAR } from "@/lib/ev-sales-fallback";

export const revalidate = 3600;

const fmt = (n) => Math.round(n || 0).toLocaleString("en-IN");
const lakh = (n) => `${((n || 0) / 100000).toFixed(1)} lakh`;

export const metadata = {
  title: `EV Sales India ${DATA_YEAR} – Monthly Brand-wise EV Sales Data`,
  description: "India EV sales data: monthly brand-wise sales and market share for electric cars, two-wheelers and commercial vehicles, compiled from Vahan registrations and FADA.",
  keywords: `EV sales India ${DATA_YEAR}, electric vehicle sales data India, EV market share India, top selling EV India, EV monthly sales`,
  alternates: { canonical: `${SITE_URL}/ev-sales` },
  openGraph: {
    title: `India EV Sales Data ${DATA_YEAR} | EV Radar`,
    description: "Monthly brand-wise EV sales, market share and growth for India — cars, two-wheelers and commercial vehicles.",
    url: `${SITE_URL}/ev-sales`,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: `India EV Sales Data ${DATA_YEAR} | EV Radar` },
};

export default function EVSalesPage() {
  const data = FALLBACK_ANALYTICS();
  const f = SALES_FACTS();
  const car1 = f.topCar[0], car2 = f.topCar[1], tw1 = f.topTwoWheeler[0], tw2 = f.topTwoWheeler[1];
  const state1 = f.topStates[0];

  const faqs = [
    {
      q: `How many EVs were sold in India in ${f.year}?`,
      a: `India sold about ${lakh(f.grandTotal)} electric cars, two-wheelers and commercial vehicles in ${f.periodLabel} (excluding three-wheelers), including ${fmt(f.totals.car.totalUnits)} electric cars and ${lakh(f.totals["two-wheeler"].totalUnits)} electric two-wheelers. Source: ${f.source}.`,
    },
    {
      q: `Which company sells the most electric cars in India in ${f.year}?`,
      a: `${car1?.brand} leads electric car sales in ${f.periodLabel} with ${fmt(car1?.totalUnits)} units (${car1?.marketShare}% share), followed by ${f.topCar.slice(1, 4).map((b) => `${b.brand} (${fmt(b.totalUnits)})`).join(", ")}.`,
    },
    {
      q: `Which is the best-selling electric scooter brand in India in ${f.year}?`,
      a: `${tw1?.brand} is the top electric two-wheeler brand in ${f.periodLabel} with ${fmt(tw1?.totalUnits)} units (${tw1?.marketShare}% share), followed by ${f.topTwoWheeler.slice(1, 5).map((b) => `${b.brand} (${fmt(b.totalUnits)})`).join(", ")}.`,
    },
    {
      q: "Which state has the most EV registrations in India?",
      a: state1 ? `${state1.state} recorded the most EV registrations (${fmt(state1.totalUnits)}) in ${f.statesPeriod}, followed by ${f.topStates.slice(1, 4).map((s) => s.state).join(", ")}.` : "State-wise figures are being updated.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `India EV Sales Data ${DATA_YEAR}`,
    description: `Monthly brand-wise electric vehicle sales in India (${f.periodLabel}) for cars, two-wheelers and commercial vehicles. Source: ${f.source}.`,
    url: `${SITE_URL}/ev-sales`,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    temporalCoverage: String(DATA_YEAR),
    dateModified: f.lastUpdated,
    spatialCoverage: { "@type": "Country", name: "India" },
    keywords: ["EV sales", "Electric vehicles", "India market data", "EV market share"],
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Server-rendered intro and FAQ — Googlebot reads this; the dashboard charts below are client-side */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-3xl font-black text-gray-900 mb-3">EV Sales in India — {DATA_YEAR}</h1>
        <p className="text-gray-700 leading-relaxed mb-2">
          India sold about <strong>{lakh(f.grandTotal)} electric cars, two-wheelers and commercial vehicles</strong> in {f.periodLabel}.
          {" "}<strong>{car1?.brand}</strong> leads electric cars with a {car1?.marketShare}% share ahead of {car2?.brand}, while
          {" "}<strong>{tw1?.brand}</strong> leads electric two-wheelers ahead of {tw2?.brand}. This page tracks brand-wise monthly sales,
          market share and growth, compiled from Vahan registration data and FADA, and is updated every month.
        </p>
        <p className="text-xs text-gray-500 mb-6">
          Data: {f.periodLabel} · Source: {f.source} · Last updated: {f.lastUpdated} ·{" "}
          <Link href="/news/ev-sales-october-2026-india-electric-cars-two-wheelers-brand-wise" className="text-green-700 underline">Latest monthly report</Link>
        </p>
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[
            { label: `EVs sold (${f.periodLabel})`, value: lakh(f.grandTotal) },
            { label: "Electric cars", value: fmt(f.totals.car.totalUnits) },
            { label: "Top car brand", value: car1?.brand || "–" },
            { label: "Top 2W brand", value: tw1?.brand || "–" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-green-50 border border-green-100 px-4 py-3">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-black text-green-700">{value}</p>
            </div>
          ))}
        </div>

        {/* Visible FAQ matching FAQPage JSON-LD */}
        {faqs.map(({ q, a }, i) => (
          <details key={q} className={`group rounded-2xl border border-gray-200 bg-white ${i === faqs.length - 1 ? "mb-6" : "mb-2"}`}>
            <summary className="flex cursor-pointer items-center justify-between px-5 py-3 font-semibold text-gray-900 marker:hidden list-none text-sm">
              {q}
              <span className="ml-4 shrink-0 text-green-600 group-open:rotate-45 transition-transform duration-200">＋</span>
            </summary>
            <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      <EVSalesDashboard data={data} />
    </>
  );
}
