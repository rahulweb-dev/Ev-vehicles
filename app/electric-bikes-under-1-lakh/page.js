import Link from "next/link";
import { ChevronRight, CheckCircle, Star, Zap, BatteryCharging, IndianRupee, TrendingDown } from "lucide-react";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "Best Electric Scooters Under ₹1 Lakh in India 2026 – Top Budget EVs",
  description: "Find the best electric scooters and bikes under 1 lakh in India 2026. Compare Ola S1 Air, Hero Vida V1 Lite, Ampere Magnus Pro by range, price & features.",
  keywords: "electric scooter under 1 lakh india, electric bike under 1 lakh 2026, best electric scooter under 1 lakh, ola s1 air price, hero vida v1 lite, cheap electric scooter india, electric two wheeler under 1 lakh",
  alternates: { canonical: `${SITE_URL}/electric-bikes-under-1-lakh` },
  openGraph: {
    title: "Best Electric Scooters Under ₹1 Lakh in India 2026",
    description: "The most affordable electric scooters you can buy in India under ₹1 lakh — with real range, charging time, and running costs.",
    url: `${SITE_URL}/electric-bikes-under-1-lakh`,
    type: "article",
    images: [{ url: `${SITE_URL}/api/og?title=Electric Scooters Under 1 Lakh India&subtitle=Budget EV Scooter Guide 2026&tag=bikes`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Electric Scooters Under ₹1 Lakh in India 2026",
    description: "Best budget electric scooters in India under ₹1 lakh — range, charging & running cost compared.",
    images: [`${SITE_URL}/api/og?title=Electric Scooters Under 1 Lakh India&subtitle=Budget EV Scooter Guide 2026&tag=bikes`],
  },
};

const UNDER_1L_BIKES = [
  {
    rank: 1,
    name: "Ola S1 Air",
    slug: "ola-s1-air",
    price: 84999,
    priceMax: 89999,
    range: 101,
    battery: "2 kWh",
    emi: "~₹1,750/mo",
    chargeTime: "~5 hrs (home)",
    rating: 4.2,
    pros: ["Lowest price in its class", "MoveOS software with OTA updates", "Ola Hypercharger compatible", "Bold design"],
    cons: ["Lower range than higher variants", "Service centres mainly in cities", "App can be slow at times"],
    runningCost: "₹0.25/km",
    verdict: "The Ola S1 Air is the most feature-packed electric scooter under ₹1 lakh — if you live near an Ola service centre, it's hard to beat.",
  },
  {
    rank: 2,
    name: "Hero Vida V1 Lite",
    slug: "hero-vida-v1-lite",
    price: 89994,
    priceMax: 94999,
    range: 94,
    battery: "2.2 kWh",
    emi: "~₹1,850/mo",
    chargeTime: "~4.5 hrs (home)",
    rating: 4.3,
    pros: ["Hero's widest service network in India", "Removable battery for home charging", "Solid build quality", "Reliable warranty support"],
    cons: ["Range slightly lower than Ola", "No fast charging option", "Fewer software features"],
    runningCost: "₹0.28/km",
    verdict: "The Hero Vida V1 Lite wins on reliability — Hero's 6,000+ service centres mean you'll never be stranded. Best pick for Tier-2 and Tier-3 cities.",
  },
  {
    rank: 3,
    name: "Ampere Magnus Pro",
    slug: "ampere-magnus-pro",
    price: 74990,
    priceMax: 79990,
    range: 120,
    battery: "3.5 kWh",
    emi: "~₹1,550/mo",
    chargeTime: "~7 hrs (home)",
    rating: 3.9,
    pros: ["Best range in class (120 km)", "Lowest price per km of range", "Greaves Finance easy EMI", "Lightweight frame"],
    cons: ["No app connectivity", "Basic instrument cluster", "Fewer features than competition"],
    runningCost: "₹0.22/km",
    verdict: "The Ampere Magnus Pro offers the best range-per-rupee under ₹1 lakh. No-frills but practical — ideal for long daily commutes.",
  },
  {
    rank: 4,
    name: "Okinawa Okhi 90",
    slug: "okinawa-okhi-90",
    price: 79000,
    priceMax: 84000,
    range: 100,
    battery: "2.8 kWh",
    emi: "~₹1,640/mo",
    chargeTime: "~6 hrs (home)",
    rating: 3.7,
    pros: ["Good range for price", "Retro styling", "Under-seat storage", "Available in multiple colours"],
    cons: ["Limited service network", "Build quality could be better", "No OTA updates"],
    runningCost: "₹0.26/km",
    verdict: "The Okinawa Okhi 90 is a solid budget pick with decent range — choose it if you prefer its retro styling and have a dealer nearby.",
  },
];

const COMPARISON = [
  { label: "Cheapest Price",     winner: "Ampere Magnus Pro", value: "₹74,990" },
  { label: "Best Range",         winner: "Ampere Magnus Pro", value: "120 km" },
  { label: "Best Software",      winner: "Ola S1 Air",        value: "MoveOS OTA" },
  { label: "Best Service Network", winner: "Hero Vida V1 Lite", value: "6,000+ centres" },
  { label: "Lowest Running Cost", winner: "Ampere Magnus Pro", value: "₹0.22/km" },
  { label: "Best Overall",       winner: "Ola S1 Air",        value: "Features + Price" },
];

const FAQS = [
  { q: "Which is the best electric scooter under ₹1 lakh in India in 2026?", a: "The best electric scooters under ₹1 lakh in India in 2026 are the Ola S1 Air (₹84,999) for its features and software, the Hero Vida V1 Lite (₹89,994) for its wide service network, and the Ampere Magnus Pro (₹74,990) for the best range at 120 km. The Ola S1 Air offers the best value overall for city commuters." },
  { q: "What is the range of electric scooters under 1 lakh?", a: "Electric scooters under ₹1 lakh in India typically offer a range of 90–120 km per charge. The Ampere Magnus Pro leads with 120 km, followed by the Ola S1 Air (101 km), Okinawa Okhi 90 (100 km), and Hero Vida V1 Lite (94 km). Real-world range is typically 15–20% lower than certified figures." },
  { q: "Can I charge an electric scooter at home?", a: "Yes — all electric scooters in India come with a portable home charger that plugs into any standard 5A or 15A socket. Charging an electric scooter at home costs ₹10–20 for a full charge, depending on your city's electricity rate. Full charging time is 4–8 hours overnight using the home charger." },
  { q: "What is the monthly EMI for an electric scooter under ₹1 lakh?", a: "The monthly EMI for an electric scooter under ₹1 lakh in India starts from approximately ₹1,550 per month (Ampere Magnus Pro at ₹74,990, 60-month loan, 20% down payment, 8.5% interest rate). Most NBFCs and banks offer easy EV loans with minimal documentation." },
  { q: "Are electric scooters under 1 lakh eligible for government subsidy?", a: "Yes — electric two-wheelers in India are eligible for subsidies under the PM E-Drive scheme and some state governments. The central subsidy under PM E-Drive can reduce the effective price by ₹10,000–₹25,000. States like Maharashtra, Delhi, and Gujarat offer additional subsidies and road tax exemptions, potentially saving ₹15,000–₹50,000 on purchase." },
];

export default function ElectricBikesUnder1Lakh() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Electric Scooters Under ₹1 Lakh in India 2026",
    url: `${SITE_URL}/electric-bikes-under-1-lakh`,
    itemListElement: UNDER_1L_BIKES.map(ev => ({
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
      { "@type": "ListItem", position: 3, name: "Under ₹1 Lakh", item: `${SITE_URL}/electric-bikes-under-1-lakh` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best Electric Scooters Under ₹1 Lakh in India 2026 – Top Budget EVs",
    description: "Find the best electric scooters under 1 lakh in India 2026. Compare Ola S1 Air, Hero Vida V1 Lite, Ampere Magnus Pro by range, price & features.",
    url: `${SITE_URL}/electric-bikes-under-1-lakh`,
    datePublished: "2026-01-01",
    dateModified: "2026-07-10",
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: "EV Radar", url: SITE_URL },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "EV Radar", logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` } },
    about: { "@type": "Thing", name: "Budget Electric Scooters India" },
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
              <span className="text-white">Under ₹1 Lakh</span>
            </nav>
            <div className="flex items-center gap-3 mb-3">
              <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-black text-white flex items-center gap-1"><TrendingDown size={11} /> Budget Guide</span>
            </div>
            <h1 className="text-3xl font-black text-white md:text-5xl">Electric Scooters<br /><span className="text-green-400">Under ₹1 Lakh</span> India 2026</h1>
            <p className="mt-3 text-gray-400 text-lg max-w-2xl">The most affordable way to go electric — with real-world range, low running costs, and government subsidies that make these even cheaper.</p>
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
            {UNDER_1L_BIKES.map(ev => (
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
                      { icon: IndianRupee,     label: "From",    value: `₹${(ev.price/1000).toFixed(0)}K` },
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
          <h2 className="text-2xl font-black text-gray-900 mb-5">FAQs – Budget Electric Scooters India</h2>
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
              { href: "/best-electric-bikes-india-2026",   title: "Best Electric Bikes 2026",      desc: "Expert ranked top 10" },
              { href: "/upcoming-electric-bikes-india",     title: "Upcoming Electric Bikes",       desc: "Launching soon in India" },
              { href: "/subsidy-calculator",                title: "Subsidy Calculator",             desc: "Save more on your EV" },
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
