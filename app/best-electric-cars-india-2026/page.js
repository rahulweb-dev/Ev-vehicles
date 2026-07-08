import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Star, Zap, BatteryCharging, IndianRupee, CheckCircle, Award, TrendingUp } from "lucide-react";
import { SITE_URL, SITE_NAME } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "Best Electric Cars in India 2026 – Top 10 EVs by Price, Range & Value",
  description: "The definitive guide to the best electric cars in India 2026. Compare top EVs by price, range, features, and value — from ₹7 lakh to ₹70 lakh. Updated July 2026.",
  keywords: "best electric cars india 2026, best ev india, top electric cars india, best electric suv india, best ev under 15 lakh india",
  alternates: { canonical: `${SITE_URL}/best-electric-cars-india-2026` },
  openGraph: {
    title: "Best Electric Cars in India 2026 – Expert Ranked Top 10",
    description: "Our expert-ranked guide to the best EVs you can buy in India right now. Every budget covered.",
    url: `${SITE_URL}/best-electric-cars-india-2026`,
    type: "article",
    publishedTime: "2026-01-01T00:00:00Z",
    modifiedTime:  "2026-07-08T00:00:00Z",
    images: [{ url: `${SITE_URL}/api/og?title=Best Electric Cars India 2026&subtitle=Top 10 Ranked by Experts&tag=cars&type=article`, width: 1200, height: 630, alt: "Best Electric Cars India 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Electric Cars in India 2026 – Expert Ranked Top 10",
    description: "Our expert-ranked guide to the best EVs you can buy in India right now. Every budget covered.",
    images: [{ url: `${SITE_URL}/api/og?title=Best Electric Cars India 2026&subtitle=Top 10 Ranked by Experts&tag=cars&type=article`, alt: "Best Electric Cars India 2026 – Top 10" }],
  },
  other: {
    "article:published_time": "2026-01-01T00:00:00Z",
    "article:modified_time":  "2026-07-08T00:00:00Z",
  },
};

const BEST_EVS = [
  {
    rank: 1,
    name: "Tata Punch EV",
    slug: "tata-punch-ev",
    badge: "Best Overall",
    badgeColor: "bg-yellow-400 text-yellow-900",
    price: "₹9.99 – ₹14.99 Lakh",
    range: "421 km",
    battery: "35 kWh",
    chargeTime: "56 min (DC)",
    rating: 4.8,
    pros: ["Best-in-class range at price", "5-star GNCAP safety", "Dual screen setup", "iRA connected features"],
    cons: ["No AWD option", "Rear AC vents only top trim"],
    verdict: "The Punch EV hits the sweet spot of price, range, and safety — making it the #1 choice for most Indian EV buyers in 2026.",
    tag: "cars",
  },
  {
    rank: 2,
    name: "Tata Nexon EV",
    slug: "tata-nexon-ev",
    badge: "Most Popular",
    badgeColor: "bg-blue-500 text-white",
    price: "₹14.49 – ₹19.49 Lakh",
    range: "465 km",
    battery: "45 kWh",
    chargeTime: "60 min (DC)",
    rating: 4.7,
    pros: ["Proven reliability", "5-star safety rating", "Pan-India service network", "Strong resale value"],
    cons: ["Cramped rear cabin", "Premium price over rivals"],
    verdict: "India's best-selling EV for good reason — rock-solid reliability, genuine range, and the widest service network.",
    tag: "cars",
  },
  {
    rank: 3,
    name: "Mahindra BE 6",
    slug: "mahindra-be-6",
    badge: "Best Performance",
    badgeColor: "bg-red-500 text-white",
    price: "₹18.90 – ₹26.90 Lakh",
    range: "682 km",
    battery: "79 kWh",
    chargeTime: "20 min (175kW DC)",
    rating: 4.7,
    pros: ["Longest range in segment", "Fastest charging (175 kW)", "Stunning design", "60G platform future-proof"],
    cons: ["Limited service network", "Higher insurance cost"],
    verdict: "If you want the most range and the fastest charging in India, the BE 6 is in a class of its own.",
    tag: "cars",
  },
  {
    rank: 4,
    name: "Hyundai Creta Electric",
    slug: "hyundai-creta-electric",
    badge: "Best Premium Value",
    badgeColor: "bg-purple-500 text-white",
    price: "₹17.99 – ₹23.50 Lakh",
    range: "473 km",
    battery: "51.4 kWh",
    chargeTime: "58 min (DC)",
    rating: 4.6,
    pros: ["Panoramic sunroof", "Level 2 ADAS", "Excellent ride quality", "V2L power export"],
    cons: ["Steep pricing", "Waiting period"],
    verdict: "The Creta Electric brings genuine premium features — panoramic sunroof, ADAS, V2L — at a competitive price point.",
    tag: "cars",
  },
  {
    rank: 5,
    name: "Tata Tiago EV",
    slug: "tata-tiago-ev",
    badge: "Best Budget EV",
    badgeColor: "bg-green-500 text-white",
    price: "₹7.99 – ₹11.89 Lakh",
    range: "315 km",
    battery: "24 kWh",
    chargeTime: "57 min (DC)",
    rating: 4.5,
    pros: ["Lowest price entry to EV", "Ideal city commuter", "DC fast charging standard", "Low running cost"],
    cons: ["Small boot space", "Basic features", "Limited highway comfort"],
    verdict: "The Tiago EV is the gateway drug to electric mobility — perfect for city commuters who want to go electric without breaking the bank.",
    tag: "cars",
  },
  {
    rank: 6,
    name: "MG Windsor EV",
    slug: "mg-windsor-ev",
    badge: "Best MPV EV",
    badgeColor: "bg-indigo-500 text-white",
    price: "₹13.50 – ₹15.50 Lakh",
    range: "331 km",
    battery: "38 kWh",
    chargeTime: "55 min (DC)",
    rating: 4.4,
    pros: ["Crossover-MPV body style", "Massive cabin space", "V2L feature", "ADAS suite"],
    cons: ["Battery-as-a-service model", "Range anxiety on highways"],
    verdict: "The Windsor EV offers MPV-like space at SUV price — unique, spacious, and practical for families.",
    tag: "cars",
  },
  {
    rank: 7,
    name: "Tata Harrier EV",
    slug: "tata-harrier-ev",
    badge: "Best Premium SUV",
    badgeColor: "bg-gray-800 text-white",
    price: "₹24.99 – ₹34.99 Lakh",
    range: "500 km",
    battery: "65 kWh",
    chargeTime: "40 min (DC)",
    rating: 4.6,
    pros: ["500 km real-world range", "AWD option", "Level 2 ADAS", "Panoramic glass roof"],
    cons: ["High price", "Software bugs in early batches"],
    verdict: "India's most capable premium electric SUV — combining Tata's proven reliability with a genuinely long 500 km range.",
    tag: "cars",
  },
  {
    rank: 8,
    name: "MG ZS EV",
    slug: "mg-zs-ev",
    badge: "Best Connected EV",
    badgeColor: "bg-cyan-500 text-white",
    price: "₹18.98 – ₹25.50 Lakh",
    range: "461 km",
    battery: "50.3 kWh",
    chargeTime: "60 min (DC)",
    rating: 4.3,
    pros: ["i-SMART connected suite", "Large touchscreen", "Comfortable ride", "Good highway range"],
    cons: ["Resale value lower than rivals", "Dated exterior styling"],
    verdict: "If connected tech and a premium cabin matter most, the ZS EV delivers — though resale value lags behind Tata and Hyundai.",
    tag: "cars",
  },
  {
    rank: 9,
    name: "BYD Atto 3",
    slug: "byd-atto-3",
    badge: "Best Import Value",
    badgeColor: "bg-orange-500 text-white",
    price: "₹33.99 – ₹36.50 Lakh",
    range: "521 km",
    battery: "60.5 kWh",
    chargeTime: "50 min (DC)",
    rating: 4.2,
    pros: ["Blade battery safety", "Unique interior design", "521 km range", "Smooth highway cruiser"],
    cons: ["Limited service centres", "High import duty pricing", "Resale uncertainty"],
    verdict: "BYD's Blade Battery tech offers unmatched safety and excellent range — but the limited service network remains a concern.",
    tag: "cars",
  },
  {
    rank: 10,
    name: "Kia EV6",
    slug: "kia-ev6",
    badge: "Best Luxury EV",
    badgeColor: "bg-emerald-600 text-white",
    price: "₹60.95 Lakh",
    range: "528 km",
    battery: "77.4 kWh",
    chargeTime: "18 min (800V DC)",
    rating: 4.8,
    pros: ["800V ultra-fast charging", "AWD available", "Head-turning design", "Flagship tech"],
    cons: ["Very high price", "CBU import costs"],
    verdict: "The EV6 is the aspirational EV for those who want the absolute best — 800V charging, AWD, and world-class build quality.",
    tag: "cars",
  },
];

const PRICE_SEGMENTS = [
  { label: "Under ₹10 Lakh",    evs: ["Tata Tiago EV", "MG Comet EV"],                                          link: "/electric-cars-under-10-lakh" },
  { label: "₹10–₹15 Lakh",     evs: ["Tata Punch EV", "Tata Nexon EV (base)", "MG Windsor EV"],                link: "/cars" },
  { label: "₹15–₹25 Lakh",     evs: ["Hyundai Creta Electric", "Tata Harrier EV (base)", "MG ZS EV"],          link: "/cars" },
  { label: "Above ₹25 Lakh",   evs: ["Mahindra BE 6", "BYD Atto 3", "Kia EV6"],                               link: "/cars" },
];

export default function BestElectricCars2026() {
  const faqItems = [
    { q: "Which is the best electric car in India in 2026?", a: "The Tata Punch EV is the best overall electric car in India in 2026, offering the best balance of price (₹9.99–14.99 lakh), range (421 km), safety (5-star GNCAP), and features for most buyers." },
    { q: "What is the cheapest electric car in India in 2026?", a: "The Tata Tiago EV is the cheapest practical electric car in India starting at ₹7.99 lakh, offering 315 km range and DC fast charging." },
    { q: "Which EV has the longest range in India?", a: "The Mahindra BE 6 has the longest range in India at 682 km (ARAI certified), followed by the Tata Harrier EV at 500 km." },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Electric Cars in India 2026",
    description: "Expert-ranked top 10 electric cars available in India in 2026",
    url: `${SITE_URL}/best-electric-cars-india-2026`,
    numberOfItems: BEST_EVS.length,
    itemListElement: BEST_EVS.map(ev => ({
      "@type": "ListItem",
      position: ev.rank,
      name: ev.name,
      url: `${SITE_URL}/cars/${ev.slug}`,
      description: ev.verdict,
    })),
  };

  const reviewJsonLds = BEST_EVS.map(ev => ({
    "@context": "https://schema.org",
    "@type": "Review",
    name: `${ev.name} Review – ${ev.badge}`,
    reviewBody: ev.verdict,
    reviewRating: {
      "@type": "Rating",
      ratingValue: ev.rating,
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    datePublished: "2026-06-01",
    url: `${SITE_URL}/best-electric-cars-india-2026#rank-${ev.rank}`,
    itemReviewed: {
      "@type": "Car",
      name: ev.name,
      url: `${SITE_URL}/cars/${ev.slug}`,
      fuelType: "Electric",
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        description: ev.price,
        availability: "https://schema.org/InStock",
      },
    },
  }));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Cars", item: `${SITE_URL}/cars` },
      { "@type": "ListItem", position: 3, name: "Best Electric Cars India 2026", item: `${SITE_URL}/best-electric-cars-india-2026` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best Electric Cars in India 2026 – Top 10 EVs by Price, Range & Value",
    description: "The definitive guide to the best electric cars in India 2026. Expert-ranked top EVs from ₹7 lakh to ₹70 lakh with pros, cons, and buying advice.",
    url: `${SITE_URL}/best-electric-cars-india-2026`,
    datePublished: "2026-01-01",
    dateModified: "2026-07-01",
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: "EV News India", url: SITE_URL },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "EV News India", logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` } },
    about: { "@type": "Thing", name: "Best Electric Cars India 2026" },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {reviewJsonLds.map((r, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(r) }} />
      ))}

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gray-950 py-14">
          <div className="mx-auto max-w-5xl px-4">
            <nav className="mb-4 flex items-center gap-1 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <Link href="/cars" className="hover:text-white">Cars</Link>
              <ChevronRight size={14} />
              <span className="text-white">Best Electric Cars 2026</span>
            </nav>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-yellow-900 flex items-center gap-1"><Award size={11} /> Expert Ranked</span>
                  <span className="text-xs text-gray-400">Updated June 2026</span>
                </div>
                <h1 className="text-3xl font-black text-white md:text-5xl leading-tight">
                  Best Electric Cars<br /><span className="text-green-400">in India 2026</span>
                </h1>
                <p className="mt-4 text-gray-400 text-lg max-w-2xl">
                  Our experts tested and ranked India's top 10 electric cars — covering every budget from ₹8 lakh to ₹65 lakh. Find your perfect EV.
                </p>
                <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-500" /> 10 EVs ranked</span>
                  <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-500" /> Real-world range tested</span>
                  <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-500" /> All budgets covered</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Quick jump by budget */}
          <div className="mb-10 rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2"><IndianRupee size={15} className="text-green-600" /> Jump by Budget</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRICE_SEGMENTS.map(s => (
                <Link key={s.label} href={s.link}
                  className="rounded-xl border border-gray-200 p-3 hover:border-green-400 hover:bg-green-50 transition">
                  <p className="text-sm font-bold text-gray-800">{s.label}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{s.evs.join(", ")}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* EV list */}
          <div className="space-y-6">
            {BEST_EVS.map(ev => (
              <article key={ev.rank} id={`rank-${ev.rank}`} className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-6 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-black text-white shrink-0">#{ev.rank}</span>
                  <h2 className="text-lg font-black text-gray-900">{ev.name}</h2>
                  <span className={`ml-auto rounded-full px-3 py-1 text-xs font-black ${ev.badgeColor}`}>{ev.badge}</span>
                </div>

                <div className="p-6 grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    {/* Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { icon: IndianRupee, label: "Price",   value: ev.price },
                        { icon: BatteryCharging, label: "Range", value: ev.range },
                        { icon: Zap,         label: "Battery", value: ev.battery },
                        { icon: TrendingUp,  label: "Charge",  value: ev.chargeTime },
                      ].map(s => {
                        const Icon = s.icon;
                        return (
                          <div key={s.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                            <Icon size={14} className="text-green-600 mx-auto mb-1" />
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{s.label}</p>
                            <p className="text-sm font-black text-gray-900 mt-0.5 leading-tight">{s.value}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={14} className={i <= Math.round(ev.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{ev.rating}/5</span>
                      <span className="text-xs text-gray-400">Expert Score</span>
                    </div>

                    {/* Pros/Cons */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-green-700 mb-2">Pros</p>
                        <ul className="space-y-1">
                          {ev.pros.map((p, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600"><CheckCircle size={11} className="text-green-500 shrink-0 mt-0.5" />{p}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-500 mb-2">Cons</p>
                        <ul className="space-y-1">
                          {ev.cons.map((c, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600"><span className="shrink-0 text-red-400 font-bold mt-0.5">—</span>{c}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* Verdict */}
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                      <p className="text-xs font-bold text-blue-800 mb-1">Our Verdict</p>
                      <p className="text-sm text-blue-700">{ev.verdict}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 justify-between">
                    <Link href={`/cars/${ev.slug}`}
                      className="block w-full rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-green-700 transition">
                      View Full Specs & Price →
                    </Link>
                    <Link href={ev.slug === "tata-nexon-ev" ? `/compare/${ev.slug}-vs-tata-punch-ev` : `/compare/${ev.slug}-vs-tata-nexon-ev`}
                      className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-600 hover:border-green-400 hover:text-green-700 transition">
                      Compare This EV
                    </Link>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                      <p className="text-[10px] text-gray-400">Starts from</p>
                      <p className="text-lg font-black text-gray-900">{ev.price.split("–")[0]}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white overflow-hidden">
              {faqItems.map((f, i) => (
                <details key={i} className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-6 py-4 font-semibold text-gray-900 hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                    <span className="text-sm">{f.q}</span>
                    <span className="text-green-500 text-xl font-light shrink-0">+</span>
                  </summary>
                  <div className="px-6 pb-4 text-sm text-gray-600">{f.a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* Related links */}
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { href: "/electric-cars-under-10-lakh", title: "Best EVs Under ₹10 Lakh", desc: "Budget-friendly picks" },
              { href: "/upcoming-electric-cars-india", title: "Upcoming EVs 2026–27", desc: "What's coming next" },
              { href: "/ev-savings-calculator", title: "EV vs Petrol Calculator", desc: "Total cost comparison" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="rounded-2xl bg-white border border-gray-200 p-4 hover:border-green-400 transition shadow-sm">
                <p className="font-bold text-gray-800 text-sm">{l.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
