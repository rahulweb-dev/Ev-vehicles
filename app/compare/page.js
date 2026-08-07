import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CompareClient from "./CompareClient";
import { SITE_URL } from "../layout";

export const metadata = {
  title: "Compare Electric Vehicles – Cars & Bikes Side by Side | EV Radar",
  description:
    "Compare electric cars and bikes side by side. Check specs, range, motor, price and features of top EVs in India.",
  keywords: "compare electric cars india, ev comparison india, nexon ev vs punch ev, tata vs mahindra ev, electric car comparison 2026, best ev comparison india",
  alternates: { canonical: `${SITE_URL}/compare` },
  openGraph: {
    title: "Compare Electric Vehicles Side by Side | EV Radar",
    description: "Compare specs, range, motor, price and features of top electric cars and bikes in India side by side.",
    url: `${SITE_URL}/compare`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=Compare Electric Vehicles&subtitle=Side-by-side specs, range %26 price comparison&tag=cars&type=page`, width: 1200, height: 630, alt: "Compare Electric Vehicles" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Electric Vehicles Side by Side",
    description: "Compare EV specs, range, motor, price and features of top electric cars and bikes in India.",
    images: [`${SITE_URL}/api/og?title=Compare Electric Vehicles&subtitle=Side-by-side specs, range %26 price comparison&tag=cars&type=page`],
  },
};

const compareJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "EV Comparison Tool – EV Radar",
  url: `${SITE_URL}/compare`,
  description: "Compare electric cars and bikes side by side. Check specs, range, motor, price and features of top EVs in India.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  publisher: { "@type": "Organization", name: "EV Radar", url: SITE_URL },
};

const compareFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which electric car has the longest range in India?",
      acceptedAnswer: { "@type": "Answer", text: "The Tata Harrier EV offers the longest real-world range among mainstream EVs in India at around 500 km. The Hyundai Ioniq 5 and BYD Atto 3 also offer 450–480 km of range. Premium imports like the BMW iX offer 600+ km." },
    },
    {
      "@type": "Question",
      name: "Which electric car is best under 15 lakh in India?",
      acceptedAnswer: { "@type": "Answer", text: "The Tata Nexon EV (₹14.49 lakh onwards) is the best electric car under ₹15 lakh in India offering 325 km of range, a 5-star safety rating, and a well-established service network. The Tata Tiago EV (₹8.69 lakh) is the most affordable option with 250 km of range." },
    },
    {
      "@type": "Question",
      name: "What is the difference between Tata Nexon EV and Punch EV?",
      acceptedAnswer: { "@type": "Answer", text: "The Tata Nexon EV is a compact SUV with a 325 km range and 45 kWh battery, while the Punch EV is a micro-SUV with a 315–421 km range and a 35–45 kWh battery. The Punch EV is slightly more affordable and has a higher seating position, while the Nexon EV has a larger boot space." },
    },
  ],
};

const POPULAR_COMPARISONS = [
  { label: "Tata Nexon EV vs Punch EV",         slug: "tata-nexon-ev-vs-tata-punch-ev",         desc: "Range 465 km vs 421 km · ₹14.49L vs ₹9.99L" },
  { label: "Hyundai Creta Electric vs Nexon EV", slug: "hyundai-creta-electric-vs-tata-nexon-ev", desc: "473 km vs 465 km · ₹17.99L vs ₹14.49L" },
  { label: "Mahindra BE 6 vs Tata Nexon EV",     slug: "mahindra-be-6-vs-tata-nexon-ev",         desc: "682 km vs 465 km · ₹18.90L vs ₹14.49L" },
  { label: "Ola S1 Pro vs Ather 450X",           slug: "ola-s1-pro-vs-ather-450x",               desc: "195 km vs 146 km · ₹1.47L vs ₹1.50L" },
  { label: "Tata Punch EV vs MG Windsor EV",     slug: "tata-punch-ev-vs-mg-windsor-ev",         desc: "421 km vs 331 km · ₹9.99L vs ₹13.50L" },
  { label: "TVS iQube vs Bajaj Chetak",          slug: "tvs-iqube-vs-bajaj-chetak",              desc: "145 km vs 126 km · ₹1.02L vs ₹1.05L" },
];

export default async function ComparePage({ searchParams }) {
  const sp = await searchParams;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(compareFaqJsonLd) }} />

      {/* Server-rendered popular comparisons for SEO — Google indexes this content */}
      {!sp?.v0 && !sp?.v1 && (
        <div className="bg-gray-50 py-6 border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Popular EV Comparisons</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {POPULAR_COMPARISONS.map((c) => (
                <Link key={c.slug} href={`/compare/${c.slug}`}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-green-400 hover:shadow-sm transition group">
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition leading-snug">{c.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <CompareClient initialV0={sp?.v0 || null} initialV1={sp?.v1 || null} />
    </>
  );
}
