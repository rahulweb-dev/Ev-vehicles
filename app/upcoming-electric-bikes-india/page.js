import Link from "next/link";
import { ChevronRight, Calendar, Zap, BatteryCharging, IndianRupee, Clock, Bell } from "lucide-react";
import { SITE_URL } from "@/app/layout";

export const revalidate = 86400;

export const metadata = {
  title: "Upcoming Electric Bikes & Scooters in India 2026–2027 – Launch Date & Price",
  description: "Complete list of upcoming electric scooters and bikes launching in India 2026 and 2027. Royal Enfield EV, Ola Roadster, Bajaj Chetak, Suzuki eAccess, Yamaha EV — expected price, range & launch date.",
  keywords: "upcoming electric scooter india 2026, upcoming electric bike india 2027, new electric two wheeler india, royal enfield electric launch, ola roadster launch date, suzuki eaccess india",
  alternates: { canonical: `${SITE_URL}/upcoming-electric-bikes-india` },
  openGraph: {
    title: "Upcoming Electric Bikes & Scooters in India 2026–2027",
    description: "Every upcoming electric two-wheeler launch in India — expected price, range, battery, and launch date.",
    url: `${SITE_URL}/upcoming-electric-bikes-india`,
    type: "article",
    images: [{ url: `${SITE_URL}/api/og?title=Upcoming Electric Bikes India 2026-2027&subtitle=Launch Dates, Prices & Specs&tag=bikes`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Upcoming Electric Bikes & Scooters India 2026–2027",
    description: "Every upcoming electric two-wheeler launch in India — expected price, range, battery, and launch date.",
    images: [`${SITE_URL}/api/og?title=Upcoming Electric Bikes India 2026-2027&subtitle=Launch Dates, Prices & Specs&tag=bikes`],
  },
};

const UPCOMING = [
  {
    name: "Ola Roadster",
    brand: "Ola Electric",
    expectedLaunch: "Q3 2026",
    expectedPrice: "₹74,999 – ₹1.05 Lakh",
    range: "~200 km (est.)",
    battery: "4 kWh / 6 kWh",
    highlight: "India's first mass-market electric motorcycle by Ola Electric",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700",
    features: ["Ola Network charging", "OTA updates", "Reverse mode", "Regenerative braking"],
  },
  {
    name: "Royal Enfield Electric",
    brand: "Royal Enfield",
    expectedLaunch: "Q4 2026",
    expectedPrice: "₹2.5 – ₹3.5 Lakh",
    range: "~150 km (est.)",
    battery: "~7 kWh",
    highlight: "Royal Enfield's first electric motorcycle — retro style meets electric performance",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700",
    features: ["Classic RE design", "Swappable battery option", "Tripper navigation", "Low-speed torque"],
  },
  {
    name: "Bajaj Chetak 2901",
    brand: "Bajaj Auto",
    expectedLaunch: "Q3 2026",
    expectedPrice: "₹1.05 – ₹1.25 Lakh",
    range: "~140 km (est.)",
    battery: "3.2 kWh",
    highlight: "Next-gen Chetak with enhanced range and faster charging",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700",
    features: ["IP67 water resistance", "Bluetooth connectivity", "Reverse mode", "Anti-theft alert"],
  },
  {
    name: "Hero Vida Z",
    brand: "Hero MotoCorp",
    expectedLaunch: "Q2 2026",
    expectedPrice: "₹70,000 – ₹90,000",
    range: "~120 km (est.)",
    battery: "2 kWh",
    highlight: "Entry-level electric scooter from Hero to take on Ola S1 Air",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700",
    features: ["Removable battery", "Bluetooth", "Digital display", "Anti-lock braking"],
  },
  {
    name: "Suzuki eAccess",
    brand: "Suzuki",
    expectedLaunch: "H1 2027",
    expectedPrice: "₹85,000 – ₹1.05 Lakh",
    range: "~120 km (est.)",
    battery: "~2.5 kWh",
    highlight: "Suzuki's electric version of the popular Access 125 scooter",
    status: "likely",
    statusColor: "bg-yellow-100 text-yellow-700",
    features: ["Under-seat charging", "LED lighting", "Smart key", "Dual battery option"],
  },
  {
    name: "Yamaha Grand Filano EV",
    brand: "Yamaha",
    expectedLaunch: "H1 2027",
    expectedPrice: "₹95,000 – ₹1.15 Lakh",
    range: "~110 km (est.)",
    battery: "~2.5 kWh",
    highlight: "Yamaha's premium electric scooter with Japanese reliability",
    status: "likely",
    statusColor: "bg-yellow-100 text-yellow-700",
    features: ["Premium build quality", "Smart connectivity", "Dual-tone colours", "Smart motor control"],
  },
  {
    name: "Honda Dio EV",
    brand: "Honda",
    expectedLaunch: "H2 2027",
    expectedPrice: "₹75,000 – ₹95,000",
    range: "~100 km (est.)",
    battery: "~1.8 kWh",
    highlight: "Electric version of India's most popular scooter for the youth",
    status: "rumored",
    statusColor: "bg-gray-100 text-gray-600",
    features: ["Honda reliability", "Light weight", "Youth-focused design", "Portable charger"],
  },
  {
    name: "TVS iQube Sport",
    brand: "TVS Motor",
    expectedLaunch: "Q4 2026",
    expectedPrice: "₹1.30 – ₹1.55 Lakh",
    range: "~150 km (est.)",
    battery: "4.56 kWh",
    highlight: "Sporty performance variant of the TVS iQube with faster charging",
    status: "likely",
    statusColor: "bg-yellow-100 text-yellow-700",
    features: ["Sport riding mode", "Fast charger compatible", "Extended range", "Performance tuning"],
  },
];

const TIMELINE = [
  { period: "Q2 2026",  evs: ["Hero Vida Z"] },
  { period: "Q3 2026",  evs: ["Ola Roadster", "Bajaj Chetak 2901"] },
  { period: "Q4 2026",  evs: ["Royal Enfield Electric", "TVS iQube Sport"] },
  { period: "2027",     evs: ["Suzuki eAccess", "Yamaha Grand Filano EV", "Honda Dio EV"] },
];

export default function UpcomingElectricBikesPage() {
  const vehicleJsonLd = UPCOMING.map(ev => ({
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: ev.name,
    brand: { "@type": "Brand", name: ev.brand },
    description: ev.highlight,
    fuelType: "Electric",
    offers: {
      "@type": "Offer",
      priceSpecification: { "@type": "PriceSpecification", priceCurrency: "INR", description: ev.expectedPrice },
      availability: "https://schema.org/PreOrder",
      areaServed: { "@type": "Country", name: "India" },
    },
  }));

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Upcoming Electric Bikes & Scooters in India 2026–2027",
    description: `${UPCOMING.length} new electric two-wheelers launching in India in 2026 and 2027 with expected price, range, and launch date.`,
    url: `${SITE_URL}/upcoming-electric-bikes-india`,
    numberOfItems: UPCOMING.length,
    itemListElement: UPCOMING.map((ev, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${ev.name} (${ev.expectedLaunch}) – ${ev.expectedPrice}`,
      description: ev.highlight,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which electric bikes are launching in India in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Confirmed electric two-wheelers launching in India in 2026 include: ${UPCOMING.filter(e => e.status === "confirmed" && !e.expectedLaunch.includes("2027")).map(e => `${e.name} (${e.expectedLaunch}, ${e.expectedPrice})`).join("; ")}.`,
        },
      },
      {
        "@type": "Question",
        name: "When is the Ola Roadster launching in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Ola Roadster electric motorcycle is confirmed for launch in Q3 2026. It is expected to be priced between ₹74,999 and ₹1.05 Lakh and offer a range of approximately 200 km, making it one of the most affordable electric motorcycles in India.",
        },
      },
      {
        "@type": "Question",
        name: "When is Royal Enfield's electric bike launching in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Royal Enfield's electric motorcycle is confirmed for launch in Q4 2026 in India. It is expected to be priced between ₹2.5 and ₹3.5 Lakh with a range of approximately 150 km on a 7 kWh battery, combining Royal Enfield's iconic retro styling with electric performance.",
        },
      },
      {
        "@type": "Question",
        name: "What is the expected price of Hero Vida Z?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Hero Vida Z is expected to be priced between ₹70,000 and ₹90,000 ex-showroom. It is confirmed for launch in Q2 2026 with a range of approximately 120 km and a removable battery for home charging.",
        },
      },
      {
        "@type": "Question",
        name: "Is the Suzuki eAccess launching in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Suzuki eAccess electric scooter is likely to launch in India in the first half of 2027. It will be the electric version of the popular Suzuki Access 125 and is expected to be priced between ₹85,000 and ₹1.05 Lakh with a range of approximately 120 km. Suzuki has not officially confirmed the India launch date yet.",
        },
      },
      {
        "@type": "Question",
        name: "What is the cheapest upcoming electric scooter in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Hero Vida Z is expected to be the most affordable upcoming electric scooter in India, with an expected price starting from ₹70,000. The Ola Roadster electric motorcycle is also expected to start from ₹74,999. Currently, the cheapest electric scooters available include the Ola S1 Air and Hero Vida V1 Lite.",
        },
      },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",          item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Electric Bikes", item: `${SITE_URL}/bikes` },
      { "@type": "ListItem", position: 3, name: "Upcoming Electric Bikes India", item: `${SITE_URL}/upcoming-electric-bikes-india` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Upcoming Electric Bikes & Scooters in India 2026–2027 – Launch Date & Price",
    description: "Complete list of upcoming electric scooters and bikes in India 2026 and 2027 with expected launch date, price, range and features.",
    url: `${SITE_URL}/upcoming-electric-bikes-india`,
    datePublished: "2026-01-01",
    dateModified: "2026-07-10",
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: "EV News India", url: SITE_URL },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "EV News India", logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` } },
    about: { "@type": "Thing", name: "Upcoming Electric Bikes India 2026" },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {vehicleJsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-5xl px-4">
            <nav className="mb-4 flex items-center gap-1 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <Link href="/bikes" className="hover:text-white">Bikes</Link>
              <ChevronRight size={14} />
              <span className="text-white">Upcoming Electric Bikes India</span>
            </nav>
            <h1 className="text-3xl font-black text-white md:text-5xl">
              Upcoming Electric Bikes<br /><span className="text-green-400">&amp; Scooters in India 2026–2027</span>
            </h1>
            <p className="mt-3 text-gray-400 text-lg max-w-2xl">
              {UPCOMING.length} new electric two-wheelers launching soon — with expected prices, range, battery specs, and launch dates. Updated regularly.
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
                        { icon: Calendar,        label: "Launch",  value: ev.expectedLaunch },
                        { icon: IndianRupee,     label: "Price",   value: ev.expectedPrice },
                        { icon: BatteryCharging, label: "Range",   value: ev.range },
                        { icon: Zap,             label: "Battery", value: ev.battery },
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
                    <Link href="/news?category=bikes" className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:border-green-400 hover:text-green-700 transition">
                      <Bell size={12} /> Get Launch Alert
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-black text-gray-900">FAQs – Upcoming Electric Two-Wheelers India</h2>
            {faqJsonLd.mainEntity.map((item, i) => (
              <details key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <summary className="cursor-pointer font-bold text-gray-900 list-none flex items-center justify-between gap-3 text-sm">
                  {item.name}
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                </summary>
                <p className="mt-3 text-sm text-gray-600">{item.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-2xl bg-green-600 p-8 text-white text-center">
            <h2 className="text-xl font-black">Don&apos;t miss any EV launch</h2>
            <p className="mt-2 text-green-100">Follow our news section for instant alerts when a new bike is confirmed for India.</p>
            <Link href="/news?category=bikes" className="mt-5 inline-block rounded-full bg-white px-6 py-3 text-sm font-black text-green-700 hover:bg-green-50 transition">
              Follow EV Bike Launches →
            </Link>
          </div>

          {/* Related links */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { href: "/bikes",                          label: "All Electric Bikes & Scooters" },
              { href: "/best-electric-bikes-india-2026", label: "Best Electric Bikes 2026" },
              { href: "/electric-bikes-under-1-lakh",    label: "Electric Bikes Under ₹1 Lakh" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="rounded-2xl bg-white border border-gray-200 p-4 hover:border-green-400 transition shadow-sm">
                <p className="font-bold text-gray-800 text-sm">{l.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
