import Link from "next/link";
import { ChevronRight, Calendar, Zap, BatteryCharging, IndianRupee, Clock, TrendingUp, Bell } from "lucide-react";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "Upcoming Electric Cars in India 2026–2027 – Launch Date, Price & Specs",
  description: "Complete list of upcoming electric cars in India 2026 and 2027 with expected launch date, price, range and features. Mahindra, Tata, Maruti, Hyundai, Skoda EVs.",
  keywords: "upcoming electric cars india 2026, upcoming ev india 2027, new ev launch india, upcoming electric suv india, maruti ev india launch",
  alternates: { canonical: `${SITE_URL}/upcoming-electric-cars-india` },
  openGraph: {
    title: "Upcoming Electric Cars in India 2026–2027",
    description: "Every upcoming EV launch in India — expected price, range, battery, and launch date.",
    images: [{ url: `${SITE_URL}/api/og?title=Upcoming EVs India 2026-2027&subtitle=Launch Dates, Prices & Specs&tag=cars`, width: 1200, height: 630 }],
  },
};

const UPCOMING = [
  {
    name: "Maruti e Vitara",
    brand: "Maruti Suzuki",
    expectedLaunch: "Q3 2026",
    expectedPrice: "₹17–₹22 Lakh",
    range: "~500 km (est.)",
    battery: "49 / 61 kWh",
    highlight: "First EV from India's #1 automaker",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700",
    features: ["V2L support", "Level 2 ADAS", "All-wheel drive option", "SUZUKI CONNECT"],
  },
  {
    name: "Hyundai Creta Electric N Line",
    brand: "Hyundai",
    expectedLaunch: "Q4 2026",
    expectedPrice: "₹22–₹26 Lakh",
    range: "~460 km (est.)",
    battery: "51.4 kWh",
    highlight: "Sporty N Line trim of the popular Creta EV",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700",
    features: ["N-tuned suspension", "Red accents", "Sport drive mode", "Brembo brakes"],
  },
  {
    name: "Tata Sierra EV",
    brand: "Tata Motors",
    expectedLaunch: "Q2 2026",
    expectedPrice: "₹25–₹32 Lakh",
    range: "~450 km (est.)",
    battery: "~60 kWh",
    highlight: "Revival of iconic Sierra nameplate as a 5-door EV SUV",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700",
    features: ["3-row seating option", "Glass roof", "ADAS suite", "Acti.ev platform"],
  },
  {
    name: "Mahindra XEV 9e",
    brand: "Mahindra",
    expectedLaunch: "Q2 2026",
    expectedPrice: "₹35–₹55 Lakh",
    range: "~656 km (est.)",
    battery: "79 kWh",
    highlight: "Flagship electric SUV on 60G platform",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700",
    features: ["3-screen cabin", "360 camera", "AWD", "175 kW DC fast charge"],
  },
  {
    name: "Skoda Elroq",
    brand: "Skoda",
    expectedLaunch: "Q3 2026",
    expectedPrice: "₹25–₹35 Lakh",
    range: "~560 km (est.)",
    battery: "82 kWh",
    highlight: "First Made-in-India Skoda EV on MEB platform",
    status: "likely",
    statusColor: "bg-yellow-100 text-yellow-700",
    features: ["MEB platform", "V2L", "HV charging", "Large infotainment"],
  },
  {
    name: "Volkswagen ID.3",
    brand: "Volkswagen",
    expectedLaunch: "Q4 2026",
    expectedPrice: "₹28–₹35 Lakh",
    range: "~570 km (est.)",
    battery: "77 kWh",
    highlight: "VW's global EV hatchback coming to India",
    status: "likely",
    statusColor: "bg-yellow-100 text-yellow-700",
    features: ["Fun-to-drive tuning", "Heat pump", "V2L", "OTA updates"],
  },
  {
    name: "Kia EV5",
    brand: "Kia",
    expectedLaunch: "H1 2027",
    expectedPrice: "₹30–₹40 Lakh",
    range: "~600 km (est.)",
    battery: "88 kWh",
    highlight: "Mid-size electric SUV below EV6",
    status: "likely",
    statusColor: "bg-yellow-100 text-yellow-700",
    features: ["800V architecture", "Quad charger", "6-seat option", "Advanced ADAS"],
  },
  {
    name: "Toyota Urban Cruiser EV",
    brand: "Toyota",
    expectedLaunch: "Q4 2026",
    expectedPrice: "₹18–₹24 Lakh",
    range: "~450 km (est.)",
    battery: "~49 kWh",
    highlight: "Toyota's rebadged e Vitara for Indian market",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700",
    features: ["Toyota Safety Sense", "Co-developed with Suzuki", "Strong hybrid option"],
  },
  {
    name: "Renault Kwid EV",
    brand: "Renault",
    expectedLaunch: "Q1 2027",
    expectedPrice: "₹8–₹12 Lakh",
    range: "~250 km (est.)",
    battery: "~30 kWh",
    highlight: "Ultra-affordable entry EV to challenge Tiago EV",
    status: "rumored",
    statusColor: "bg-gray-100 text-gray-600",
    features: ["Sub-₹10L target", "Small city EV", "French engineering"],
  },
  {
    name: "Honda Elevate EV",
    brand: "Honda",
    expectedLaunch: "H1 2027",
    expectedPrice: "₹20–₹28 Lakh",
    range: "~450 km (est.)",
    battery: "~50 kWh",
    highlight: "Honda's India EV debut on popular Elevate SUV platform",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700",
    features: ["Honda SENSING ADAS", "LFP battery", "V2G capable", "Smart charging"],
  },
];

const TIMELINE = [
  { period: "Q2 2026",   evs: ["Tata Sierra EV", "Mahindra XEV 9e"] },
  { period: "Q3 2026",   evs: ["Maruti e Vitara", "Skoda Elroq"] },
  { period: "Q4 2026",   evs: ["Hyundai Creta N Line", "Volkswagen ID.3", "Toyota Urban Cruiser EV"] },
  { period: "2027",      evs: ["Kia EV5", "Renault Kwid EV", "Honda Elevate EV"] },
];

export default function UpcomingEVsPage() {
  const eventJsonLd = UPCOMING.filter(e => e.status === "confirmed").map(ev => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: ev.name,
    brand: { "@type": "Brand", name: ev.brand },
    description: ev.highlight,
    offers: {
      "@type": "Offer",
      priceSpecification: { "@type": "PriceSpecification", priceCurrency: "INR", description: ev.expectedPrice },
      availability: "https://schema.org/PreOrder",
    },
  }));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Cars", item: `${SITE_URL}/cars` },
      { "@type": "ListItem", position: 3, name: "Upcoming Electric Cars India", item: `${SITE_URL}/upcoming-electric-cars-india` },
    ],
  };

  return (
    <>
      {eventJsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-5xl px-4">
            <nav className="mb-4 flex items-center gap-1 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <Link href="/cars" className="hover:text-white">Cars</Link>
              <ChevronRight size={14} />
              <span className="text-white">Upcoming EVs India</span>
            </nav>
            <h1 className="text-3xl font-black text-white md:text-5xl">
              Upcoming Electric Cars<br /><span className="text-green-400">in India 2026–2027</span>
            </h1>
            <p className="mt-3 text-gray-400 text-lg max-w-2xl">
              {UPCOMING.length} new EVs launching soon — with expected prices, range, battery specs, and launch dates. Updated regularly.
            </p>
            <div className="mt-4 flex gap-3 flex-wrap text-sm">
              <span className="flex items-center gap-1.5 text-green-400"><span className="h-2 w-2 rounded-full bg-green-400" /> {UPCOMING.filter(e=>e.status==="confirmed").length} Confirmed</span>
              <span className="flex items-center gap-1.5 text-yellow-400"><span className="h-2 w-2 rounded-full bg-yellow-400" /> {UPCOMING.filter(e=>e.status==="likely").length} Likely</span>
              <span className="flex items-center gap-1.5 text-gray-400"><span className="h-2 w-2 rounded-full bg-gray-400" /> {UPCOMING.filter(e=>e.status==="rumored").length} Rumored</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Timeline */}
          <div className="mb-10 rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2"><Calendar size={14} className="text-green-600" /> Launch Timeline</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TIMELINE.map(t => (
                <div key={t.period} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs font-black text-green-600 mb-2">{t.period}</p>
                  <ul className="space-y-1">
                    {t.evs.map(e => <li key={e} className="text-[11px] text-gray-600">• {e}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* EV cards */}
          <div className="space-y-5">
            {UPCOMING.map((ev, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-gray-900">{ev.name}</h2>
                    <span className="text-sm text-gray-500">by {ev.brand}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black capitalize ${ev.statusColor}`}>{ev.status}</span>
                </div>
                <div className="p-5 grid sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-2 space-y-3">
                    <p className="text-sm text-gray-600 font-semibold">{ev.highlight}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { icon: Calendar,       label: "Launch",   value: ev.expectedLaunch },
                        { icon: IndianRupee,    label: "Price",    value: ev.expectedPrice },
                        { icon: BatteryCharging, label: "Range",   value: ev.range },
                        { icon: Zap,            label: "Battery",  value: ev.battery },
                      ].map(s => {
                        const Icon = s.icon;
                        return (
                          <div key={s.label} className="rounded-xl bg-gray-50 border border-gray-100 p-2.5 text-center">
                            <Icon size={12} className="text-green-600 mx-auto mb-1" />
                            <p className="text-[9px] text-gray-400 uppercase tracking-wide font-bold">{s.label}</p>
                            <p className="text-xs font-black text-gray-800 mt-0.5 leading-tight">{s.value}</p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ev.features.map((f, j) => (
                        <span key={j} className="rounded-full bg-green-50 border border-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
                      <Clock size={14} className="text-amber-500 mx-auto mb-1" />
                      <p className="text-[10px] text-amber-600 font-semibold">Expected Launch</p>
                      <p className="text-sm font-black text-amber-800">{ev.expectedLaunch}</p>
                    </div>
                    <Link href="/news" className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:border-green-400 hover:text-green-700 transition">
                      <Bell size={12} /> Get Launch Alert
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-2xl bg-green-600 p-8 text-white text-center">
            <h2 className="text-xl font-black">Don&apos;t miss any EV launch</h2>
            <p className="mt-2 text-green-100">Subscribe to get instant alerts when a new EV is confirmed for India.</p>
            <Link href="/news" className="mt-5 inline-block rounded-full bg-white px-6 py-3 text-sm font-black text-green-700 hover:bg-green-50 transition">
              Follow EV Launches →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
