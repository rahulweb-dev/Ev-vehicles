import Link from "next/link";
import { MapPin, Zap, Plus } from "lucide-react";
import { SITE_URL } from "@/app/layout";
import ChargingFinder from "@/components/charging/ChargingFinder";
import { CITY_CENTERS, stationStats } from "@/lib/chargingStations";
import CITY_DATA from "@/lib/city-tax-data.json";

export const revalidate = 3600;

export const metadata = {
  title: "EV Charging Stations Near Me – Map of Charging Points in India",
  description: "Find EV charging stations near you on an India map. Search by city or your location, filter DC fast chargers, two-wheeler chargers and battery swap, get directions, and report missing stations.",
  alternates: { canonical: `${SITE_URL}/charging-stations` },
  openGraph: {
    title: "EV Charging Stations Near Me – India Map",
    description: "Search EV charging stations across India by city or your location, with directions and fast-charger filters.",
    url: `${SITE_URL}/charging-stations`, type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=EV Charging Stations India&subtitle=Find chargers near you&tag=map`, width: 1200, height: 630 }],
  },
};

const FAQS = [
  { q: "How do I find an EV charging station near me?", a: "Tap “Near me” and allow location access. The map and list show the closest charging stations with distance, charger type and power, and a Navigate button for directions." },
  { q: "Can I find chargers for electric scooters and bikes?", a: "Yes. Use the Two-wheeler and Battery swap filters to show stations that support electric two-wheelers or battery swapping." },
  { q: "A charging station is missing or not working. What can I do?", a: "Use “Add missing station” to send us its location, or “Report problem” on a listed station. Our team checks every report before updating the map." },
  { q: "Where does the charging station data come from?", a: "Stations come from OpenStreetMap and Open Charge Map, plus reports from EV owners verified by EV Radar. Details can change, so confirm availability with the operator before a long trip." },
];

export default async function ChargingStationsPage() {
  let stats = { total: 0, dc: 0, byCity: {} };
  try { stats = await stationStats(); } catch { /* render without counts */ }
  const cities = CITY_DATA.cities;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "EV Charging Station Finder India", url: `${SITE_URL}/charging-stations`, applicationCategory: "TravelApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];

  return (
    <>
      {jsonLd.map((j, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />)}
      <main className="min-h-screen bg-gray-50 pb-16">
        <section className="bg-gray-950 py-10">
          <div className="mx-auto max-w-7xl px-4">
            <h1 className="text-3xl font-black text-white md:text-4xl">EV Charging Stations Near You</h1>
            <p className="mt-2 max-w-2xl text-gray-400">Find electric car and scooter charging points across India, get directions, and help other EV owners by reporting missing or broken chargers.</p>
            {stats.total > 0 && (
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 font-bold text-white"><MapPin size={14} className="text-green-400" />{stats.total.toLocaleString("en-IN")} stations mapped</span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 font-bold text-white"><Zap size={14} className="text-green-400" />{stats.dc.toLocaleString("en-IN")} DC fast</span>
              </div>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
          <ChargingFinder cities={cities} centers={CITY_CENTERS} initialCity="delhi" />

          <section>
            <h2 className="mb-4 text-xl font-black text-gray-900">EV charging stations by city</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {cities.map((c) => (
                <Link key={c.slug} href={`/charging-stations/${c.slug}`} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 hover:border-green-400 hover:text-green-700">
                  <span>{c.name}</span>{stats.byCity[c.slug] ? <span className="text-xs text-gray-400">{stats.byCity[c.slug]}</span> : null}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-2 text-xl font-black text-gray-900">Frequently asked questions</h2>
            {FAQS.map((f, i) => (
              <details key={i} className="border-b border-gray-100 py-3 last:border-0" open={i === 0}>
                <summary className="cursor-pointer text-sm font-bold text-gray-900">{f.q}</summary>
                <p className="mt-2 text-sm text-gray-600">{f.a}</p>
              </details>
            ))}
            <p className="mt-4 flex items-center gap-1.5 text-sm text-gray-600"><Plus size={14} className="text-green-600" />Know a station that isn&apos;t listed? Use “Add missing station” above.
              {" "}Read our <Link href="/ev-charging-guide" className="font-semibold text-green-700 hover:underline">EV charging guide</Link>.</p>
          </section>
        </div>
      </main>
    </>
  );
}
