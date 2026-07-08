import Link from "next/link";
import { ChevronRight, Zap, Home, Building2, MapPin, CheckCircle, AlertTriangle, Clock, IndianRupee } from "lucide-react";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "EV Charging Guide India 2026 – How to Charge Electric Car at Home & Public",
  description: "Complete EV charging guide for India 2026. Learn how to charge electric cars at home, find public chargers, understand AC vs DC charging, and calculate charging cost.",
  keywords: "ev charging guide india, how to charge electric car at home india, ev charging stations india, ac vs dc charging ev, home ev charger installation india, ev charging cost india",
  alternates: { canonical: `${SITE_URL}/ev-charging-guide` },
  openGraph: {
    title: "EV Charging Guide India 2026 – Complete How-To",
    description: "Everything you need to know about charging your EV in India — home charging, public networks, costs, and tips.",
    url: `${SITE_URL}/ev-charging-guide`,
    type: "article",
    images: [{ url: `${SITE_URL}/api/og?title=EV Charging Guide India 2026&subtitle=Home, Public & Fast Charging Explained&tag=charging`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Charging Guide India 2026 – Complete How-To",
    description: "Everything you need to know about charging your EV in India — home charging, public networks, costs, and tips.",
    images: [{ url: `${SITE_URL}/api/og?title=EV Charging Guide India 2026&subtitle=Home, Public & Fast Charging Explained&tag=charging`, alt: "EV Charging Guide India 2026" }],
  },
  other: {
    "article:published_time": "2026-01-01T00:00:00Z",
    "article:modified_time":  "2026-07-08T00:00:00Z",
  },
};

const CHARGER_TYPES = [
  {
    type: "Level 1 – Standard Home Socket",
    power: "1.5–2.3 kW",
    time: "12–20 hours",
    cost: "₹0",
    connector: "15A 3-pin plug",
    icon: "🏠",
    best: "Emergency top-up, scooters",
    color: "border-gray-200 bg-gray-50",
  },
  {
    type: "Level 2 – Home AC Charger",
    power: "3.3–7.4 kW",
    time: "4–10 hours",
    cost: "₹8,000–₹20,000 install",
    connector: "Type 2 / CCS",
    icon: "⚡",
    best: "Daily home charging — recommended",
    color: "border-green-200 bg-green-50",
  },
  {
    type: "DC Fast Charger (50 kW)",
    power: "50 kW",
    time: "45–60 min (10–80%)",
    cost: "₹18–₹30 per unit",
    connector: "CCS2 / CHAdeMO",
    icon: "🔋",
    best: "Highway stops, quick top-up",
    color: "border-blue-200 bg-blue-50",
  },
  {
    type: "Ultra-Fast DC (100+ kW)",
    power: "100–175 kW",
    time: "15–30 min (10–80%)",
    cost: "₹25–₹40 per unit",
    connector: "CCS2",
    icon: "🚀",
    best: "Long trips, premium EVs",
    color: "border-purple-200 bg-purple-50",
  },
];

const HOW_TO_STEPS = [
  { step: 1, title: "Get a home charger installed", desc: "Contact your EV dealer or a certified electrician to install a 7.2 kW AC wall charger. Cost is ₹8,000–₹20,000 including wiring. Most brands like Tata, Hyundai, and MG provide free installation with purchase." },
  { step: 2, title: "Ensure your electrical panel is ready", desc: "A 7.2 kW charger needs a dedicated 32A circuit breaker and earthing. Have your electrician check your panel capacity (minimum 60A main breaker recommended for home with EV charger)." },
  { step: 3, title: "Download your EV's app", desc: "Register your vehicle on the brand app (Tata iRA, Hyundai BlueLink, MG iSmart). This lets you schedule charging for off-peak hours (midnight–6 AM) when electricity rates are lowest." },
  { step: 4, title: "Set up scheduled charging", desc: "Avoid charging immediately after arriving home (peak hours). Schedule charging to start at 11 PM or later. This saves money and reduces grid load. Most EVs hold charge without degradation for 12+ hours." },
  { step: 5, title: "Keep battery between 20–80% daily", desc: "For daily use, keep the state of charge between 20% and 80%. This reduces battery degradation. Only charge to 100% when you need maximum range for a long trip." },
  { step: 6, title: "Register on public charging apps", desc: "Install TATA Power EV, ChargeZone, Statiq, and ATHER Grid apps. Top up your wallet before long trips. Enable roaming on apps that support multiple networks." },
];

const CHARGING_NETWORKS = [
  { name: "Tata Power EV",   stations: "8,000+", app: "Tata Power EV", coverage: "Pan-India", rate: "₹15–₹25/unit" },
  { name: "ChargeZone",      stations: "2,500+", app: "ChargeZone",    coverage: "25 states",  rate: "₹18–₹28/unit" },
  { name: "Statiq",          stations: "3,000+", app: "Statiq",        coverage: "Pan-India", rate: "₹15–₹22/unit" },
  { name: "ATHER Grid",      stations: "1,500+", app: "Ather",         coverage: "150+ cities", rate: "₹20–₹30/unit" },
  { name: "Ola Hypercharger",stations: "1,200+", app: "Ola Electric",  coverage: "400+ cities", rate: "₹18–₹25/unit" },
  { name: "BPCL Pulse",      stations: "1,000+", app: "BPCL",          coverage: "Highways",   rate: "₹20–₹28/unit" },
];

const COST_CALC = [
  { battery: "24 kWh (Tiago EV)",  homeKm: "₹320", publicDC: "₹600",  perKm: "₹1.2" },
  { battery: "35 kWh (Punch EV)",  homeKm: "₹467", publicDC: "₹875",  perKm: "₹1.3" },
  { battery: "51 kWh (Creta EV)",  homeKm: "₹680", publicDC: "₹1,275", perKm: "₹1.4" },
  { battery: "79 kWh (BE 6)",      homeKm: "₹1,053", publicDC: "₹1,975", perKm: "₹1.5" },
];

const FAQS = [
  { q: "Can I charge my electric car with a normal plug at home?", a: "Yes, all EVs come with a portable 15A charger that works with a standard home socket. However, it's very slow (12–20 hours for a full charge). A dedicated 7.2 kW wall charger is strongly recommended for daily use." },
  { q: "How much does it cost to install a home EV charger in India?", a: "Installing a home EV charger in India costs ₹8,000–₹20,000 including the charger unit and electrical work. Many EV brands (Tata, Hyundai, MG) offer free installation with purchase. ATHER provides free charging grid access." },
  { q: "What is the CCS2 connector in India?", a: "CCS2 (Combined Charging System 2) is the standard DC fast charging connector used in India for electric cars. It supports both AC and DC charging in one port. All major EVs in India (Tata, Hyundai, MG, Mahindra) use CCS2 for DC fast charging." },
  { q: "How do I find EV charging stations near me?", a: "Use apps like TATA Power EV, ChargeZone, Statiq, or simply search on Google Maps — it shows all verified EV charging points. PlugShare is also popular for finding both public and home (shared) chargers in India." },
];

export default function EVChargingGuide() {
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Charge an Electric Car at Home in India",
    description: "Step-by-step guide to setting up home EV charging in India — from installation to daily use tips.",
    totalTime: "PT2H",
    estimatedCost: { "@type": "MonetaryAmount", currency: "INR", value: "8000-20000" },
    step: HOW_TO_STEPS.map(s => ({
      "@type": "HowToStep",
      position: s.step,
      name: s.title,
      text: s.desc,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",  item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/blogs` },
      { "@type": "ListItem", position: 3, name: "EV Charging Guide India", item: `${SITE_URL}/ev-charging-guide` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "EV Charging Guide India 2026 – How to Charge Electric Car at Home & Public",
    description: "Complete EV charging guide for India 2026. Learn how to charge electric cars at home, find public chargers, understand AC vs DC charging, and calculate charging cost.",
    url: `${SITE_URL}/ev-charging-guide`,
    inLanguage: "en-IN",
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", "[data-speakable]"],
    },
    about: [
      { "@type": "Thing", name: "EV Charging" },
      { "@type": "Thing", name: "Electric Vehicle Charging India" },
    ],
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/ev-charging-guide` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-4xl px-4">
            <nav className="mb-4 flex items-center gap-1 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} /><span className="text-white">EV Charging Guide</span>
            </nav>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-900 px-3 py-1 text-xs font-bold text-green-300"><Zap size={11} /> Complete Guide</div>
            <h1 className="text-3xl font-black text-white md:text-5xl">EV Charging Guide India<br /><span className="text-green-400">2026</span></h1>
            <p className="mt-3 text-gray-400 text-lg max-w-2xl">Everything about charging your electric car in India — home setup, public networks, AC vs DC, costs, and expert tips.</p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">

          {/* Charger types */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-5 flex items-center gap-2"><Zap size={20} className="text-green-600" />Types of EV Chargers in India</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {CHARGER_TYPES.map(c => (
                <div key={c.type} className={`rounded-2xl border p-5 ${c.color}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{c.icon}</span>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{c.type}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div><p className="text-gray-400">Power</p><p className="font-bold text-gray-800">{c.power}</p></div>
                    <div><p className="text-gray-400">Time</p><p className="font-bold text-gray-800">{c.time}</p></div>
                    <div><p className="text-gray-400">Cost</p><p className="font-bold text-gray-800">{c.cost}</p></div>
                    <div><p className="text-gray-400">Connector</p><p className="font-bold text-gray-800">{c.connector}</p></div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <CheckCircle size={11} className="text-green-500 shrink-0" /> Best for: {c.best}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How to charge at home */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-5 flex items-center gap-2"><Home size={20} className="text-green-600" /> How to Set Up Home EV Charging</h2>
            <div className="space-y-3">
              {HOW_TO_STEPS.map(s => (
                <div key={s.step} className="flex gap-4 rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-black text-white">{s.step}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Charging cost table */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-5 flex items-center gap-2"><IndianRupee size={20} className="text-green-600" /> Charging Cost Calculator</h2>
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-100 px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                <span>EV Model</span><span className="text-center">Home Full Charge</span><span className="text-center">DC Fast (public)</span><span className="text-center">Cost per km</span>
              </div>
              {COST_CALC.map(r => (
                <div key={r.battery} className="grid grid-cols-4 px-5 py-3.5 border-b border-gray-50 last:border-0 text-sm">
                  <span className="font-semibold text-gray-800">{r.battery}</span>
                  <span className="text-center text-green-600 font-bold">{r.homeKm}</span>
                  <span className="text-center text-blue-600 font-bold">{r.publicDC}</span>
                  <span className="text-center font-bold text-gray-700">{r.perKm}</span>
                </div>
              ))}
              <div className="bg-amber-50 border-t border-amber-100 px-5 py-3">
                <p className="text-xs text-amber-700"><AlertTriangle size={11} className="inline mr-1" />Home rates based on ₹13.3/unit (avg. residential). Public DC rates are network averages and vary by location.</p>
              </div>
            </div>
          </section>

          {/* Public networks */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-5 flex items-center gap-2"><MapPin size={20} className="text-green-600" /> Top EV Charging Networks in India</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {CHARGING_NETWORKS.map(n => (
                <div key={n.name} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{n.name}</h3>
                    <span className="text-xs font-bold text-green-600">{n.stations} stations</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><p className="text-gray-400">App</p><p className="font-semibold text-gray-700">{n.app}</p></div>
                    <div><p className="text-gray-400">Coverage</p><p className="font-semibold text-gray-700">{n.coverage}</p></div>
                    <div><p className="text-gray-400">Rate</p><p className="font-semibold text-gray-700">{n.rate}</p></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/charging-stations" className="flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 py-3 text-sm font-bold text-green-700 hover:bg-green-100 transition">
                <MapPin size={14} /> Find Charging Stations Near You →
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-5">Charging FAQs</h2>
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white overflow-hidden">
              {FAQS.map((f, i) => (
                <details key={i} className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-6 py-4 font-semibold text-gray-900 hover:bg-gray-50 [&::-webkit-details-marker]:hidden text-sm">
                    {f.q}<span className="text-green-500 shrink-0 text-xl font-light">+</span>
                  </summary>
                  <div className="px-6 pb-4 text-sm text-gray-600">{f.a}</div>
                </details>
              ))}
            </div>
          </section>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { href: "/range-calculator",   title: "EV Range Calculator",     desc: "Real-world range estimator" },
              { href: "/charging-stations",  title: "Find Charging Stations",  desc: "Map of chargers near you" },
              { href: "/ev-savings-calculator", title: "EV vs Petrol Savings",    desc: "Calculate your savings" },
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
