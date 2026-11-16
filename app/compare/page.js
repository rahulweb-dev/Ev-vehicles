import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CompareClient from "./CompareClient";
import { SITE_URL } from "../layout";
import { COMPARISONS } from "@/lib/comparisons";

export const metadata = {
  title: "Compare Electric Vehicles – Cars & Bikes Side by Side",
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

// Curated comparison pages, grouped for the hub (names/prices live on each page)
const CAR_COMPARISONS = COMPARISONS.filter((c) => c.segment === "car");
const BIKE_COMPARISONS = COMPARISONS.filter((c) => c.segment !== "car");

export default async function ComparePage({ searchParams }) {
  const sp = await searchParams;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }} />

      {/* Server-rendered popular comparisons for SEO — Google indexes this content */}
      {!sp?.v0 && !sp?.v1 && (
        <div className="bg-gray-50 py-6 border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-4">
            {[["Electric Car Comparisons", CAR_COMPARISONS], ["Electric Scooter Comparisons", BIKE_COMPARISONS]].map(([heading, list]) => list.length > 0 && (
              <div key={heading} className="mb-5 last:mb-0">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{heading}</h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((c) => (
                    <Link key={c.slug} href={`/compare/${c.slug}`}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-green-400 hover:shadow-sm transition group">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition leading-snug">{c.nameA} vs {c.nameB}</p>
                      <ChevronRight size={14} className="text-gray-300 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CompareClient initialV0={sp?.v0 || null} initialV1={sp?.v1 || null} initialV2={sp?.v2 || null} />
    </>
  );
}
