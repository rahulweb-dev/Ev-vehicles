import Link from "next/link";
import { ChevronRight, CheckCircle, Star, Zap, BatteryCharging, IndianRupee, TrendingDown } from "lucide-react";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "Best Electric Scooters Under ₹50,000 in India 2026 – Cheapest EVs",
  description: "Find the best electric scooters under 50000 in India 2026. Compare Hero Electric Optima, Ampere Nexus, Okinawa Ridge by range, price & features. Lowest cost EV options.",
  keywords: "electric scooter under 50000 india, cheapest electric scooter india, electric bike under 50000, electric two wheeler under 50000 india 2026, budget electric scooter, hero electric optima price",
  alternates: { canonical: `${SITE_URL}/electric-bikes-under-50000` },
  openGraph: {
    title: "Best Electric Scooters Under ₹50,000 in India 2026",
    description: "The cheapest electric scooters available in India under ₹50,000 — with range, charging time, and running costs.",
    url: `${SITE_URL}/electric-bikes-under-50000`,
    type: "article",
    images: [{ url: `${SITE_URL}/api/og?title=Electric Scooters Under 50000 India&subtitle=Cheapest EV Scooters 2026&tag=bikes`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Electric Scooters Under ₹50,000 in India 2026",
    description: "Cheapest electric scooters in India under ₹50,000 — range, charging & features compared.",
    images: [`${SITE_URL}/api/og?title=Electric Scooters Under 50000 India&subtitle=Cheapest EV Scooters 2026&tag=bikes`],
  },
};

const UNDER_50K_BIKES = [
  {
    rank: 1,
    name: "Hero Electric Optima ER",
    slug: "hero-electric-optima",
    price: 45990,
    priceMax: 49990,
    range: 82,
    battery: "26 Ah",
    emi: "~₹950/mo",
    chargeTime: "~4.5 hrs (home)",
    rating: 3.8,
    pros: ["Hero Electric's widest service network", "Lead-acid + optional Li-ion battery", "Low maintenance cost", "FAME II subsidy eligible"],
    cons: ["Lead-acid variant is heavy", "Basic features, no app connectivity", "Shorter range than premium scooters"],
    runningCost: "₹0.15/km",
    verdict: "The Hero Electric Optima ER is the most affordable hero brand scooter — reliable for short city commutes under 50 km per day.",
  },
  {
    rank: 2,
    name: "Ampere Nexus",
    slug: "ampere-nexus",
    price: 44400,
    priceMax: 47900,
    range: 60,
    battery: "26 Ah (Li-ion)",
    emi: "~₹920/mo",
    chargeTime: "~4 hrs (home)",
    rating: 3.6,
    pros: ["Affordable Li-ion battery", "Greaves Finance easy EMI", "Lightweight 95 kg", "LED headlamp"],
    cons: ["60 km range is limited", "No reverse mode", "Basic instrument cluster"],
    runningCost: "₹0.18/km",
    verdict: "The Ampere Nexus is a practical city commuter for daily distances under 40 km — affordable, light, and easy to maintain.",
  },
  {
    rank: 3,
    name: "Okinawa Ridge+",
    slug: "okinawa-ridge-plus",
    price: 47990,
    priceMax: 49990,
    range: 88,
    battery: "28.8 Ah",
    emi: "~₹990/mo",
    chargeTime: "~5 hrs (home)",
    rating: 3.5,
    pros: ["Best range in sub-50K segment (88 km)", "Portable charger included", "Multiple colour options", "Decent boot space"],
    cons: ["Limited service network outside major cities", "Heavy compared to peers", "No smart features"],
    runningCost: "₹0.16/km",
    verdict: "The Okinawa Ridge+ leads the sub-₹50,000 segment on range — 88 km is excellent value. Best if you have a dealer in your city.",
  },
  {
    rank: 4,
    name: "BGauss B8",
    slug: "bgauss-b8",
    price: 47500,
    priceMax: 49500,
    range: 75,
    battery: "26 Ah (Li-ion)",
    emi: "~₹980/mo",
    chargeTime: "~4.5 hrs (home)",
    rating: 3.6,
    pros: ["Good range for price", "Attractive retro design", "Dual-tone colours", "Light body weight"],
    cons: ["Very limited service centres", "No OTA updates", "Basic technology"],
    runningCost: "₹0.17/km",
    verdict: "The BGauss B8 impresses with its styling and range — a good option if a BGauss dealer is convenient for you.",
  },
];

const COMPARISON = [
  { label: "Cheapest Price",       winner: "Ampere Nexus",          value: "₹44,400" },
  { label: "Best Range",           winner: "Okinawa Ridge+",         value: "88 km" },
  { label: "Lowest Running Cost",  winner: "Hero Electric Optima",   value: "₹0.15/km" },
  { label: "Best Service Network", winner: "Hero Electric Optima",   value: "Nationwide" },
  { label: "Best Overall",         winner: "Okinawa Ridge+",         value: "Range + Value" },
];

const FAQS = [
  { q: "Which is the cheapest electric scooter in India in 2026?", a: "The most affordable electric scooters in India in 2026 are the Ampere Nexus starting at ₹44,400, followed by the Hero Electric Optima ER at ₹45,990, the BGauss B8 at ₹47,500, and the Okinawa Ridge+ at ₹47,990. All are available across India with government subsidies further reducing the effective price." },
  { q: "What is the range of electric scooters under ₹50,000?", a: "Electric scooters under ₹50,000 in India offer a range of 60–88 km per charge. The Okinawa Ridge+ leads with 88 km, followed by Hero Electric Optima ER (82 km), BGauss B8 (75 km), and Ampere Nexus (60 km). Real-world range is typically 10–20% lower than stated figures." },
  { q: "Are electric scooters under ₹50,000 eligible for government subsidy?", a: "Yes — electric two-wheelers priced under ₹50,000 are eligible for PM E-Drive subsidies. The central government offers up to ₹10,000–₹20,000 subsidy per vehicle. State governments in Delhi, Maharashtra, and Rajasthan offer additional subsidies, making the effective purchase price even lower. Check your state transport department for the latest subsidy rates." },
  { q: "Can electric scooters under 50000 be charged at home?", a: "Yes — all electric scooters include a portable home charger. A full charge using the home charger costs just ₹8–15 depending on your city's electricity rate. Charging time is 4–6 hours overnight, making home charging the most cost-effective option at roughly ₹0.15–₹0.20 per km." },
  { q: "Which electric scooter under 50000 is best for daily office commute?", a: "For a daily office commute of 30–40 km, the Okinawa Ridge+ (88 km range, ₹47,990) is the best choice under ₹50,000 in India 2026. The Hero Electric Optima ER is a close second with strong after-sales support nationwide, ideal for those in Tier-2 and Tier-3 cities." },
];

export default function ElectricBikesUnder50000() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Electric Scooters Under ₹50,000 in India 2026",
    url: `${SITE_URL}/electric-bikes-under-50000`,
    itemListElement: UNDER_50K_BIKES.map(ev => ({
      "@type": "ListItem",
      position: ev.rank,
      name: ev.name,
      url: `${SITE_URL}/bikes/${ev.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",           item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Electric Bikes", item: `${SITE_URL}/bikes` },
      { "@type": "ListItem", position: 3, name: "Under ₹50,000", item: `${SITE_URL}/electric-bikes-under-50000` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best Electric Scooters Under ₹50,000 in India 2026 – Cheapest EVs",
    description: "Find the best electric scooters under 50000 in India 2026. Compare Hero Electric Optima, Ampere Nexus, Okinawa Ridge by range, price & features.",
    url: `${SITE_URL}/electric-bikes-under-50000`,
    datePublished: "2026-01-01",
    dateModified: "2026-07-10",
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: "EV News India", url: SITE_URL },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "EV News India", logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` } },
    about: { "@type": "Thing", name: "Cheapest Electric Scooters India" },
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
              <ChevronRight size={14} />
              <Link href="/bikes" className="hover:text-white">Electric Bikes</Link>
              <ChevronRight size={14} />
              <span className="text-white">Under ₹50,000</span>
            </nav>
            <div className="flex items-center gap-3 mb-3">
              <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-black text-white flex items-center gap-1"><TrendingDown size={11} /> Ultra Budget Guide</span>
            </div>
            <h1 className="text-3xl font-black text-white md:text-5xl">Electric Scooters<br /><span className="text-green-400">Under ₹50,000</span> India 2026</h1>
            <p className="mt-3 text-gray-400 text-lg max-w-2xl">The cheapest electric scooters you can buy in India — perfect for short city commutes with near-zero running costs.</p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10">
          {/* Quick comparison */}
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
            {UNDER_50K_BIKES.map(ev => (
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
                      { icon: IndianRupee,     label: "From",    value: `₹${(ev.price/1000).toFixed(1)}K` },
                      { icon: BatteryCharging, label: "Range",   value: `${ev.range} km` },
                      { icon: Zap,             label: "Charge",  value: ev.chargeTime },
                      { icon: TrendingDown,    label: "Running", value: ev.runningCost },
                      { icon: CheckCircle,     label: "EMI",     value: ev.emi },
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
                    <Link href={`/bikes/${ev.slug}`} className="flex-1 rounded-xl bg-green-600 py-2.5 text-center text-sm font-bold text-white hover:bg-green-700 transition">View Full Details →</Link>
                    <Link href="/subsidy-calculator" className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-gray-600 hover:border-green-400 transition">Check Subsidies</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* FAQ */}
          <h2 className="text-2xl font-black text-gray-900 mb-5">FAQs – Electric Scooters Under ₹50,000</h2>
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
              { href: "/electric-bikes-under-1-lakh",      title: "Scooters Under ₹1 Lakh",  desc: "More options, more features" },
              { href: "/best-electric-bikes-india-2026",   title: "Best Electric Bikes 2026", desc: "Expert ranked top 10" },
              { href: "/subsidy-calculator",                title: "Subsidy Calculator",        desc: "See how much you can save" },
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
