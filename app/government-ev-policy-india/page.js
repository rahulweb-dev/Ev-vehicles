import Link from "next/link";
import { ChevronRight, CheckCircle, IndianRupee, FileText, TrendingUp, Shield, Zap, ExternalLink } from "lucide-react";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "Government EV Policy India 2026 – FAME III, PM E-DRIVE, PLI & State Subsidies",
  description: "Complete guide to India's government EV policies in 2026 — PM E-DRIVE scheme, FAME III, PLI scheme for EVs, GST benefits, Section 80EEB tax deduction, and state subsidies.",
  keywords: "government ev policy india 2026, fame 3 india, pm e-drive scheme, ev subsidy india government, pli scheme ev, ev gst rate india, section 80eeb ev loan",
  alternates: { canonical: `${SITE_URL}/government-ev-policy-india` },
  openGraph: {
    title: "India Government EV Policy 2026 – Complete Guide",
    description: "FAME III, PM E-DRIVE, PLI, GST cuts, tax benefits and state policies — everything you need to know.",
    url: `${SITE_URL}/government-ev-policy-india`,
    type: "article",
    images: [{ url: `${SITE_URL}/api/og?title=India EV Policy 2026&subtitle=FAME III, PM E-DRIVE & Subsidies&tag=policy`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "India Government EV Policy 2026 – Complete Guide",
    description: "FAME III, PM E-DRIVE, PLI, GST cuts, tax benefits and state policies — everything you need to know.",
    images: [{ url: `${SITE_URL}/api/og?title=India EV Policy 2026&subtitle=FAME III, PM E-DRIVE & Subsidies&tag=policy`, alt: "India Government EV Policy 2026" }],
  },
  other: {
    "article:published_time": "2026-01-01T00:00:00Z",
    "article:modified_time":  "2026-07-08T00:00:00Z",
  },
};

const CENTRAL_SCHEMES = [
  {
    name: "PM E-DRIVE Scheme",
    amount: "₹10,900 Crore",
    period: "2024–2026",
    status: "Active",
    statusColor: "bg-green-100 text-green-700",
    description: "Replaces FAME II — the flagship central government EV subsidy scheme providing demand-side incentives for electric 2-wheelers, 3-wheelers, e-buses, and charging infrastructure.",
    benefits: [
      "₹10,000 per kWh subsidy for electric 2-wheelers (max ₹10,000 per vehicle)",
      "₹50,000 per vehicle for electric 3-wheelers",
      "₹1.9 crore per e-bus for state transport undertakings",
      "₹800 crore for installing 72,000+ fast chargers on highways",
      "₹500 crore for EV charging in apartments and workplaces",
    ],
    eligibility: "Vehicles must be manufactured in India with at least 50% localisation. Apply through dealer at point of sale.",
  },
  {
    name: "FAME II Scheme",
    amount: "₹11,500 Crore",
    period: "2019–2024",
    status: "Completed",
    statusColor: "bg-gray-100 text-gray-600",
    description: "Faster Adoption and Manufacturing of (Hybrid &) Electric Vehicles — the predecessor scheme that kickstarted India's EV revolution, subsidising 2-wheelers, 3-wheelers, 4-wheelers and buses.",
    benefits: [
      "Subsidised over 15 lakh electric 2-wheelers",
      "₹10,000 per kWh for 4-wheelers (discontinued 2023)",
      "Funded 7,432 public EV charging stations",
      "Supported BEST, DTC, BMTC e-bus fleets",
    ],
    eligibility: "Scheme ended March 2024 — new buyers covered under PM E-DRIVE.",
  },
  {
    name: "PLI Scheme for Automotive",
    amount: "₹25,938 Crore",
    period: "2022–2027",
    status: "Active",
    statusColor: "bg-green-100 text-green-700",
    description: "Production Linked Incentive scheme gives manufacturers 13–18% incentive on incremental sales of EV components and advanced chemistry batteries manufactured in India.",
    benefits: [
      "18% incentive on Champion OEM vehicles (first 3 years)",
      "13% incentive on Component Champion vehicles",
      "Covers EV motors, battery packs, power electronics",
      "Attracting global EV investment to India",
    ],
    eligibility: "Auto OEMs and tier-1 component makers can apply through DPIIT.",
  },
  {
    name: "PLI for Advanced Chemistry Cell Batteries",
    amount: "₹18,100 Crore",
    period: "2022–2030",
    status: "Active",
    statusColor: "bg-green-100 text-green-700",
    description: "India-specific battery manufacturing incentive to reduce EV battery import dependence and drive local battery gigafactory development.",
    benefits: [
      "Target: 50 GWh domestic battery manufacturing by 2030",
      "Incentive: ₹20/kWh to ₹45/kWh based on performance",
      "Maruti, Tata, Hyundai winning bids",
      "Expected to reduce battery cost by 30% by 2027",
    ],
    eligibility: "Battery manufacturers with minimum 5 GWh capacity plans.",
  },
];

const TAX_BENEFITS = [
  { benefit: "GST on Electric Vehicles", value: "5%", comparison: "28–50% for petrol/diesel vehicles", icon: IndianRupee },
  { benefit: "GST on EV Chargers", value: "5%", comparison: "18% for petrol fuel dispensers", icon: Zap },
  { benefit: "Section 80EEB Tax Deduction", value: "₹1.5 Lakh/year", comparison: "On EV loan interest paid", icon: FileText },
  { benefit: "Import Duty Reduction (Committed EVs)", value: "15%", comparison: "Down from 100% — for companies committing to local mfg", icon: Shield },
];

const STATE_HIGHLIGHTS = [
  { state: "Maharashtra", policy: "EV Policy 2021", highlights: ["₹25,000 subsidy on 4W EVs", "100% road tax waiver", "Free home charger install", "Priority registration"] },
  { state: "Gujarat", policy: "EV Policy 2021", highlights: ["₹1.5 lakh subsidy on 4W EVs", "100% road tax waiver", "100% registration waiver", "Best 4W EV subsidy in India"] },
  { state: "Delhi", policy: "EV Policy 2020 (extended)", highlights: ["₹5,000 on 2W EVs", "100% road tax waiver", "₹5,000 scrappage incentive", "EV priority lanes"] },
  { state: "Karnataka", policy: "EV Policy 2017 (revised 2023)", highlights: ["₹25,000 on 4W EVs", "Road tax exemption", "Bangalore EV hub status", "Priority permits"] },
  { state: "Tamil Nadu", policy: "EV Policy 2023", highlights: ["₹15,000 on 2W EVs", "Road tax exemption (5 yr)", "TIDCO EV cluster", "EV assembly zone"] },
  { state: "UP", policy: "EV Manufacturing Policy 2022", highlights: ["₹1 lakh on 4W EVs", "100% road tax (limited period)", "Lucknow EV zone", "EV tourism fleet"] },
];

const FAQS = [
  { q: "What is the PM E-DRIVE scheme?", a: "PM E-DRIVE (Electric Drive Revolution in Innovative Vehicle Enhancement) is India's ₹10,900 crore EV subsidy scheme launched in 2024 to replace FAME II. It provides demand incentives of ₹10,000 per kWh for electric 2-wheelers and ₹50,000 per vehicle for electric 3-wheelers, plus ₹800 crore for highway fast charger infrastructure." },
  { q: "What is Section 80EEB for electric vehicles?", a: "Section 80EEB of the Income Tax Act allows individuals to claim a deduction of up to ₹1.5 lakh per year on interest paid on loans taken for purchasing electric vehicles. This benefit is available for loans from banks and NBFCs. The vehicle must be an electric vehicle (battery-operated), and the benefit reduces your taxable income by up to ₹1.5 lakh annually." },
  { q: "Is there FAME III scheme in India?", a: "FAME III has not been announced as of June 2026. The PM E-DRIVE scheme (₹10,900 crore, 2024–2026) is the current replacement for FAME II. Industry expects a follow-on scheme — potentially branded as FAME III — after PM E-DRIVE ends, with a larger focus on 4-wheeler EVs and charging infrastructure." },
  { q: "What GST applies to electric vehicles in India?", a: "Electric vehicles in India attract only 5% GST — compared to 28% GST + 22% cess (total 50%) for large petrol cars. This 5% GST rate applies to all battery-operated vehicles including cars, 2-wheelers, 3-wheelers, buses, and electric commercial vehicles. EV chargers also attract 5% GST." },
];

export default function GovernmentEVPolicyPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "India EV Policy 2026", item: `${SITE_URL}/government-ev-policy-india` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Government EV Policy India 2026 – FAME III, PM E-DRIVE, PLI & State Subsidies",
    description: "Complete guide to India's government EV policies in 2026 — PM E-DRIVE scheme, FAME III, PLI scheme, GST benefits, Section 80EEB tax deduction, and state subsidies.",
    url: `${SITE_URL}/government-ev-policy-india`,
    inLanguage: "en-IN",
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", "[data-speakable]"],
    },
    about: [
      { "@type": "Thing", name: "FAME Scheme India" },
      { "@type": "Thing", name: "PM E-Drive Policy" },
      { "@type": "Thing", name: "EV Subsidy India" },
    ],
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/government-ev-policy-india` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-5xl px-4">
            <nav className="mb-4 flex items-center gap-1 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} /><span className="text-white">Government EV Policy India</span>
            </nav>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-900 px-3 py-1 text-xs font-bold text-blue-300"><FileText size={11} /> Policy Guide 2026</div>
            <h1 className="text-3xl font-black text-white md:text-5xl">Government EV Policy<br /><span className="text-green-400">India 2026</span></h1>
            <p className="mt-3 text-gray-400 text-lg max-w-2xl">Complete guide to India's EV incentive schemes — PM E-DRIVE, FAME III, PLI, GST benefits, and state subsidies. Last updated June 2026.</p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 space-y-12">

          {/* Central schemes */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-green-600" /> Central Government EV Schemes</h2>
            <div className="space-y-5">
              {CENTRAL_SCHEMES.map(s => (
                <div key={s.name} className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-50 border-b border-gray-100 px-6 py-4">
                    <div>
                      <h3 className="font-black text-gray-900">{s.name}</h3>
                      <p className="text-sm text-gray-500">{s.period} · Budget: <span className="font-bold text-gray-700">{s.amount}</span></p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.statusColor}`}>{s.status}</span>
                  </div>
                  <div className="p-6 grid md:grid-cols-3 gap-5">
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-4">{s.description}</p>
                      <ul className="space-y-1.5">
                        {s.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5" /> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                      <p className="text-xs font-bold text-blue-800 mb-2">Eligibility</p>
                      <p className="text-xs text-blue-700">{s.eligibility}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tax benefits */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-5 flex items-center gap-2"><IndianRupee size={20} className="text-green-600" /> Tax Benefits on EVs</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {TAX_BENEFITS.map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.benefit} className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50"><Icon size={16} className="text-green-600" /></div>
                      <h3 className="font-bold text-gray-800 text-sm">{t.benefit}</h3>
                    </div>
                    <p className="text-2xl font-black text-green-600 mb-1">{t.value}</p>
                    <p className="text-xs text-gray-500">{t.comparison}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-800"><span className="font-bold">Section 80EEB tip:</span> If you're in the 30% tax bracket and take a ₹10 lakh EV loan, you can save up to ₹45,000 in income tax per year on interest paid — on top of the ₹1–₹5 lakh state subsidy.</p>
            </div>
          </section>

          {/* State policies */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-5 flex items-center gap-2"><Shield size={20} className="text-green-600" /> Key State EV Policies</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {STATE_HIGHLIGHTS.map(s => (
                <div key={s.state} className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                  <h3 className="font-black text-gray-800 mb-0.5">{s.state}</h3>
                  <p className="text-xs text-gray-400 mb-3">{s.policy}</p>
                  <ul className="space-y-1.5">
                    {s.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <CheckCircle size={10} className="text-green-500 shrink-0 mt-0.5" />{h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/subsidy-calculator" className="flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 py-3 text-sm font-bold text-green-700 hover:bg-green-100 transition">
                <IndianRupee size={14} /> Calculate Your State Subsidy →
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-5">Policy FAQs</h2>
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
              { href: "/subsidy-calculator",       title: "Subsidy Calculator",    desc: "Calculate your savings" },
              { href: "/electric-cars-under-10-lakh", title: "Budget EVs Under ₹10L", desc: "Affordable EVs list" },
              { href: "/ev-savings-calculator",     title: "Total Cost Calculator", desc: "5-year EV vs Petrol" },
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
