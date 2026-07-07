import Link from "next/link";
import { ChevronRight, CheckCircle, Star, Zap, BatteryCharging, IndianRupee, TrendingDown } from "lucide-react";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "Best Electric Cars Under ₹10 Lakh in India 2026 – Top Budget EVs",
  description: "Find the best electric cars under 10 lakh in India 2026. Compare Tata Tiago EV, MG Comet EV and more. Prices, range, features and EMI details included.",
  keywords: "electric cars under 10 lakh india, cheapest electric car india 2026, budget ev india, tata tiago ev price, mg comet ev, electric car under 10 lakh",
  alternates: { canonical: `${SITE_URL}/electric-cars-under-10-lakh` },
  openGraph: {
    title: "Best Electric Cars Under ₹10 Lakh in India 2026",
    description: "The most affordable EVs you can buy in India — with real range, DC fast charging, and low running costs.",
    url: `${SITE_URL}/electric-cars-under-10-lakh`,
    type: "article",
    images: [{ url: `${SITE_URL}/api/og?title=Electric Cars Under 10 Lakh India&subtitle=Budget EV Guide 2026&tag=cars`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Electric Cars Under ₹10 Lakh in India 2026",
    description: "The most affordable EVs you can buy in India — with real range, DC fast charging, and low running costs.",
    images: [`${SITE_URL}/api/og?title=Electric Cars Under 10 Lakh India&subtitle=Budget EV Guide 2026&tag=cars`],
  },
};

const UNDER_10_EVS = [
  {
    rank: 1,
    name: "Tata Tiago EV",
    slug: "tata-tiago-ev",
    price: 799000,
    priceMax: 1189000,
    range: 315,
    battery: "24 kWh",
    emi: "~₹12,800/mo",
    chargeTime: "57 min (DC)",
    rating: 4.5,
    pros: ["DC fast charging from ₹7.99L", "5-star GNCAP safety", "Trusted Tata after-sales", "Ideal city commuter"],
    cons: ["Small boot (242L)", "Basic features in base trim", "No rear AC vents in base"],
    runningCost: "₹1.2/km",
    verdict: "The best value EV under ₹10 lakh — DC fast charging and 315 km range make it far more practical than it looks.",
  },
  {
    rank: 2,
    name: "MG Comet EV",
    slug: "mg-comet-ev",
    price: 699000,
    priceMax: 999000,
    range: 230,
    battery: "17.3 kWh",
    emi: "~₹11,200/mo",
    chargeTime: "5h (AC only)",
    rating: 3.8,
    pros: ["Cheapest EV in India", "Ultra-compact city mover", "Dual screens", "Auto-park assist"],
    cons: ["No DC fast charging", "Not suitable for highways", "Very cramped interior"],
    runningCost: "₹0.9/km",
    verdict: "The cheapest EV in India — perfect for short city commutes and tight parking, but not a highway car.",
  },
  {
    rank: 3,
    name: "Tata Punch EV (base)",
    slug: "tata-punch-ev",
    price: 999000,
    priceMax: 1499000,
    range: 421,
    battery: "35 kWh",
    emi: "~₹16,000/mo",
    chargeTime: "56 min (DC)",
    rating: 4.8,
    pros: ["421 km range — best in class", "5-star GNCAP", "Large 26.03 cm infotainment", "SUV stance"],
    cons: ["Base trim just touches ₹10L", "Higher EMI than others"],
    runningCost: "₹1.1/km",
    verdict: "At ₹9.99L, the base Punch EV squeezes into this list — and it absolutely dominates with 421 km range and 5-star safety.",
  },
];

const COMPARISON = [
  { label: "Cheapest Price",   winner: "MG Comet EV",    value: "₹6.99L" },
  { label: "Best Range",       winner: "Tata Punch EV",  value: "421 km" },
  { label: "Best Safety",      winner: "Tata Tiago EV",  value: "5-Star GNCAP" },
  { label: "Lowest Running Cost", winner: "MG Comet EV", value: "₹0.9/km" },
  { label: "Best Overall",     winner: "Tata Tiago EV",  value: "Best balance" },
];

const FAQS = [
  { q: "Is ₹10 lakh enough to buy an electric car in India?", a: "Yes — in 2026, you can get the MG Comet EV from ₹6.99 lakh, Tata Tiago EV from ₹7.99 lakh, and the base Tata Punch EV at ₹9.99 lakh. All three have DC fast charging (except Comet) and real-world usable ranges." },
  { q: "Which electric car under 10 lakh has the best range?", a: "The Tata Punch EV at ₹9.99 lakh offers the best range at 421 km ARAI certified. The Tata Tiago EV comes second with 315 km at ₹7.99 lakh." },
  { q: "What is the monthly EMI for a Tata Tiago EV?", a: "The Tata Tiago EV base variant at ₹7.99 lakh (ex-showroom) has an approximate EMI of ₹12,800–₹14,000 per month for a 60-month loan with 20% down payment at 8.5% interest rate." },
  { q: "Can I charge an electric car under 10 lakh at home?", a: "Yes — all EVs in India come with a 3.3 kW portable home charger (15A socket). Charging from home overnight is the cheapest option at ₹1–2 per km. A full charge on 230V home socket takes 7–12 hours depending on battery size." },
];

export default function ElectricCarsUnder10Lakh() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Electric Cars Under 10 Lakh in India 2026",
    url: `${SITE_URL}/electric-cars-under-10-lakh`,
    itemListElement: UNDER_10_EVS.map(ev => ({
      "@type": "ListItem",
      position: ev.rank,
      name: ev.name,
      url: `${SITE_URL}/cars/${ev.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Cars", item: `${SITE_URL}/cars` },
      { "@type": "ListItem", position: 3, name: "Electric Cars Under ₹10 Lakh", item: `${SITE_URL}/electric-cars-under-10-lakh` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best Electric Cars Under ₹10 Lakh in India 2026 – Top Budget EVs",
    description: "Find the best electric cars under 10 lakh in India 2026. Compare Tata Tiago EV, MG Comet EV and more.",
    url: `${SITE_URL}/electric-cars-under-10-lakh`,
    datePublished: "2026-01-01",
    dateModified: "2026-07-01",
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: "EV News India", url: SITE_URL },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "EV News India", logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` } },
    about: { "@type": "Thing", name: "Budget Electric Cars India" },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-4xl px-4">
            <nav className="mb-4 flex items-center gap-1 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} /><Link href="/cars" className="hover:text-white">Cars</Link>
              <ChevronRight size={14} /><span className="text-white">Under ₹10 Lakh</span>
            </nav>
            <div className="flex items-center gap-3 mb-3">
              <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-black text-white flex items-center gap-1"><TrendingDown size={11} /> Budget Guide</span>
            </div>
            <h1 className="text-3xl font-black text-white md:text-5xl">Electric Cars<br /><span className="text-green-400">Under ₹10 Lakh</span> India 2026</h1>
            <p className="mt-3 text-gray-400 text-lg max-w-2xl">The cheapest way to go electric in India — with real-world range, low running costs, and government subsidies.</p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10">
          {/* Winner comparison table */}
          <div className="mb-8 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
              <h2 className="font-black text-gray-800">Quick Comparison</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {COMPARISON.map(c => (
                <div key={c.label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-gray-500">{c.label}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{c.winner}</p>
                    <p className="text-xs text-green-600 font-semibold">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EV list */}
          <div className="space-y-6 mb-10">
            {UNDER_10_EVS.map(ev => (
              <article key={ev.rank} className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 bg-gray-50 border-b border-gray-100 px-5 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-xs font-black text-white">#{ev.rank}</span>
                  <h2 className="text-lg font-black text-gray-900">{ev.name}</h2>
                  <div className="ml-auto flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i<=Math.round(ev.rating)?"fill-yellow-400 text-yellow-400":"text-gray-200"} />)}
                    <span className="text-xs font-bold text-gray-600 ml-1">{ev.rating}</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { icon: IndianRupee,    label: "From",     value: `₹${(ev.price/100000).toFixed(2)}L` },
                      { icon: BatteryCharging, label: "Range",   value: `${ev.range} km` },
                      { icon: Zap,            label: "Charge",   value: ev.chargeTime },
                      { icon: TrendingDown,   label: "Running",  value: ev.runningCost },
                      { icon: CheckCircle,    label: "EMI",      value: ev.emi },
                    ].map(s => {
                      const Icon = s.icon;
                      return (
                        <div key={s.label} className="rounded-xl bg-gray-50 p-2.5 text-center">
                          <Icon size={12} className="text-green-600 mx-auto mb-1" />
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide font-bold">{s.label}</p>
                          <p className="text-xs font-black text-gray-800 mt-0.5">{s.value}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-green-700 mb-1.5">Why buy it</p>
                      <ul className="space-y-1">{ev.pros.map((p,i)=><li key={i} className="flex items-start gap-1.5 text-xs text-gray-600"><CheckCircle size={10} className="text-green-500 mt-0.5 shrink-0"/>{p}</li>)}</ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-500 mb-1.5">Watch out for</p>
                      <ul className="space-y-1">{ev.cons.map((c,i)=><li key={i} className="flex items-start gap-1.5 text-xs text-gray-600"><span className="text-red-400 font-bold shrink-0">—</span>{c}</li>)}</ul>
                    </div>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                    <p className="text-xs text-blue-700">{ev.verdict}</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/cars/${ev.slug}`} className="flex-1 rounded-xl bg-green-600 py-2.5 text-center text-sm font-bold text-white hover:bg-green-700 transition">View Full Details →</Link>
                    <Link href={`/subsidy-calculator`} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-gray-600 hover:border-green-400 transition">Check Subsidies</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* FAQ */}
          <h2 className="text-2xl font-black text-gray-900 mb-5">FAQs About Budget EVs</h2>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white overflow-hidden mb-8">
            {FAQS.map((f, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-6 py-4 font-semibold text-gray-900 hover:bg-gray-50 [&::-webkit-details-marker]:hidden text-sm">
                  {f.q}<span className="text-green-500 shrink-0 text-xl font-light">+</span>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-600">{f.a}</div>
              </details>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { href: "/best-electric-cars-india-2026", title: "Best EVs Overall 2026", desc: "All budgets covered" },
              { href: "/subsidy-calculator",            title: "Subsidy Calculator",     desc: "Save more on your EV" },
              { href: "/ev-savings-calculator",         title: "EV vs Petrol Cost",       desc: "5-year savings calc" },
            ].map(l=>(
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
