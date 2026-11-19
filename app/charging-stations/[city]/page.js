import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, Navigation } from "lucide-react";
import { SITE_URL } from "@/app/layout";
import ChargingFinder from "@/components/charging/ChargingFinder";
import { CITY_CENTERS, stationsNear } from "@/lib/chargingStations";
import { nearbyCities } from "@/lib/cityPricing";
import CITY_DATA from "@/lib/city-tax-data.json";

export const revalidate = 3600;

const getCityInfo = (slug) => CITY_DATA.cities.find((c) => c.slug === slug);

async function cityStations(slug) {
  const [lat, lng] = CITY_CENTERS[slug];
  try { return await stationsNear({ lat, lng, radiusKm: 30, limit: 300 }); } catch { return []; }
}

export async function generateMetadata({ params }) {
  const { city: slug } = await params;
  const city = getCityInfo(slug);
  if (!city) return { title: "Not found" };
  const list = await cityStations(slug);
  const dc = list.filter((s) => s.dcFast).length;
  const title = `EV Charging Stations in ${city.name} – ${list.length ? `${list.length} Locations, ` : ""}Map & Directions`;
  const description = `${list.length ? `${list.length} EV charging stations${dc ? ` (${dc} DC fast)` : ""} in and around ${city.name}` : `EV charging stations in ${city.name}`}, ${city.state}. Find chargers near you on the map, get directions and report missing stations.`;
  return {
    title, description, alternates: { canonical: `${SITE_URL}/charging-stations/${slug}` },
    ...(list.length < 3 && { robots: { index: false, follow: true } }), // too thin to index yet
    openGraph: { title, description, url: `${SITE_URL}/charging-stations/${slug}`, type: "website" },
  };
}

export default async function CityChargingPage({ params }) {
  const { city: slug } = await params;
  const city = getCityInfo(slug);
  if (!city || !CITY_CENTERS[slug]) notFound();
  const list = await cityStations(slug);
  const dc = list.filter((s) => s.dcFast).length;
  const networks = Object.entries(list.reduce((m, s) => { if (s.network) m[s.network] = (m[s.network] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const faqs = [
    { q: `How many EV charging stations are there in ${city.name}?`, a: list.length ? `EV Radar lists ${list.length} charging stations within 30 km of central ${city.name}${dc ? `, including ${dc} with DC fast charging` : ""}. Owners keep adding stations, so the count grows over time.` : `We don't have charging stations listed for ${city.name} yet. If you know one, add it using “Add missing station”.` },
    networks.length && { q: `Which charging networks operate in ${city.name}?`, a: `The most-listed networks around ${city.name} are ${networks.map(([n, c]) => `${n} (${c})`).join(", ")}.` },
    { q: `How do I find the nearest charger in ${city.name}?`, a: "Tap “Near me” on this page to sort stations by distance from where you are, then use Navigate for directions." },
  ].filter(Boolean);

  const jsonLd = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@context": "https://schema.org", "@type": "ItemList", name: `EV charging stations in ${city.name}`, itemListElement: list.slice(0, 30).map((s, i) => ({ "@type": "ListItem", position: i + 1,
      item: { "@type": "Place", name: s.name, address: s.address || `${city.name}, ${city.state}`, geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng } } })) },
  ];

  return (
    <>
      {jsonLd.map((j, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />)}
      <main className="min-h-screen bg-gray-50 pb-16">
        <div className="border-b border-gray-100 bg-white">
          <nav className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-3 text-xs text-gray-500">
            <Link href="/" className="hover:text-green-600">Home</Link><ChevronRight size={11} />
            <Link href="/charging-stations" className="hover:text-green-600">Charging Stations</Link><ChevronRight size={11} />
            <span className="font-semibold text-gray-800">{city.name}</span>
          </nav>
        </div>
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 md:text-3xl">EV Charging Stations in {city.name}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {list.length ? <><strong>{list.length}</strong> charging stations within 30 km of {city.name}{dc ? <>, <strong>{dc}</strong> with DC fast charging</> : null}. </> : null}
              Search near you, filter by charger type and get directions.
            </p>
          </div>

          <ChargingFinder cities={CITY_DATA.cities} centers={CITY_CENTERS} initialCity={slug} />

          {list.length > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-lg font-black text-gray-900">All charging stations in {city.name}</h2>
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {list.slice(0, 120).map((s) => (
                  <li key={s.id} className="flex items-start justify-between gap-3 border-b border-gray-50 pb-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{s.name}</p>
                      <p className="truncate text-xs text-gray-500">{[s.network !== s.name && s.network, s.dcFast && "DC fast", s.maxPowerKw && `${s.maxPowerKw} kW`, s.address].filter(Boolean).join(" · ")}</p>
                    </div>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1 text-xs font-bold text-green-700"><Navigation size={11} />{s.distanceKm} km</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-black text-gray-900">FAQs</h2>
            {faqs.map((f, i) => (
              <details key={i} className="border-b border-gray-100 py-3 last:border-0" open={i === 0}>
                <summary className="cursor-pointer text-sm font-bold text-gray-900">{f.q}</summary>
                <p className="mt-2 text-sm text-gray-600">{f.a}</p>
              </details>
            ))}
          </section>

          <section>
            <h2 className="mb-3 text-base font-black text-gray-900">Charging stations in nearby cities</h2>
            <div className="flex flex-wrap gap-2">
              {nearbyCities(slug, 12).map((c) => (
                <Link key={c.slug} href={`/charging-stations/${c.slug}`} className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-green-400"><MapPin size={11} />{c.name}</Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
