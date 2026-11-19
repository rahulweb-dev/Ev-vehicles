// Server component: "<vehicle> on-road price in <city>" for cars and two-wheelers.
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { SITE_URL } from "@/app/layout";
import LeadForm from "@/components/vehicles/LeadForm";
import { priceNum, fmtINR } from "@/lib/budgetGuides";
import { getCity, nearbyCities, onRoadEstimate, REGISTRATION_NOTE, TAX_AS_OF, TOP_CITY_SLUGS } from "@/lib/cityPricing";

const base = (type) => (type === "car" ? "cars" : "bikes");
const YEAR = 2026;

/** Variants with a numeric price, cheapest first. */
function pricedVariants(vehicle) {
  return (vehicle.variants || [])
    .map((v) => ({ ...v, price: priceNum(v.exShowroomPrice) }))
    .filter((v) => v.price)
    .sort((a, b) => a.price - b.price);
}

export function cityPriceSummary(vehicle, type, citySlug) {
  const city = getCity(citySlug);
  if (!city) return null;
  const variants = pricedVariants(vehicle);
  const first = variants[0] || null;
  const est = first ? onRoadEstimate(city, type, first.price) : null;
  return { city, variants, first, est };
}

export function cityPriceMetadata(vehicle, type, citySlug) {
  const s = cityPriceSummary(vehicle, type, citySlug);
  if (!s) return { title: "Page Not Found", robots: { index: false, follow: false } };
  const { city, first, est } = s;
  const url = `${SITE_URL}/${base(type)}/${vehicle.slug}/price-in-${citySlug}`;
  const title = `${vehicle.name} On-Road Price in ${city.name} ${YEAR} – Road Tax & Offers`;
  const description = first
    ? `${vehicle.name} price in ${city.name}: ex-showroom from ${fmtINR(first.price)}${est.total ? `, on-road about ${fmtINR(est.total)}` : ""}. ${est.tax.known ? (est.tax.pct === 0 ? `${city.state} charges no road tax on this EV.` : `Road tax in ${city.state}: ${est.tax.pct}%.`) : ""} Get the best offer from dealers in ${city.name}.`
    : `${vehicle.name} price in ${city.name}, ${city.state}. Get the best offer from dealers in ${city.name}.`;
  const img = vehicle.featuredImage || `${SITE_URL}/api/og?title=${encodeURIComponent(`${vehicle.name} Price in ${city.name}`)}&subtitle=On-Road Price&tag=${base(type)}&type=page`;
  return {
    title, description: description.slice(0, 300),
    alternates: { canonical: url },
    // Only priced pages in the 12 main cities are indexed; the rest stay useful for visitors but out of search,
    // so templated city pages don't dominate the site's index (AdSense "low value content").
    ...((!first || !TOP_CITY_SLUGS.includes(citySlug)) && { robots: { index: false, follow: true } }),
    openGraph: { title, description, url, type: "website", images: [{ url: img, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [img] },
  };
}

export default function CityPricePage({ vehicle, type, citySlug }) {
  const { city, variants, first, est } = cityPriceSummary(vehicle, type, citySlug);
  const noun = type === "car" ? "car" : "scooter";
  const url = `${SITE_URL}/${base(type)}/${vehicle.slug}/price-in-${citySlug}`;
  const tax = est?.tax;
  const asOf = new Date(TAX_AS_OF).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const faqs = [
    first && {
      q: `What is the on-road price of the ${vehicle.name} in ${city.name}?`,
      a: est.total
        ? `The ${vehicle.name} starts at ${fmtINR(first.price)} ex-showroom. In ${city.name}, the on-road price is about ${fmtINR(est.total)}, including ${tax.pct === 0 ? "no road tax" : `${tax.pct}% road tax (${fmtINR(tax.amount)})`} and approximate insurance of ${fmtINR(est.insurance)}. The registration fee is waived for EVs.`
        : `The ${vehicle.name} starts at ${fmtINR(first.price)} ex-showroom. The on-road price in ${city.name} adds ${city.state}'s road tax, insurance (about ${fmtINR(est.insurance)}) and small RTO charges; please confirm the current road-tax rate with the dealer or RTO.`,
    },
    {
      q: `Is there road tax on electric ${noun}s in ${city.name}?`,
      a: tax?.known
        ? (tax.pct === 0 ? `No. ${city.state} currently charges no road tax on this electric ${noun}${tax.validity ? ` (${tax.validity})` : ""}.` : `Yes. ${city.state} charges ${tax.pct}% road tax at this price${tax.validity ? ` (${tax.validity})` : ""}.`) + (tax.note ? ` ${tax.note}` : "")
        : `${city.state}'s current EV road-tax rate could not be confirmed from official sources, so please check with the dealer or your local RTO. ${tax?.note || ""}`.trim(),
    },
    { q: `Do I pay a registration fee for an EV in ${city.name}?`, a: REGISTRATION_NOTE },
    tax?.subsidy && !/^none/i.test(tax.subsidy) && { q: `Is there a state subsidy on EVs in ${city.state}?`, a: tax.subsidy },
    { q: `How can I get the best price on the ${vehicle.name} in ${city.name}?`, a: `Share your details in the form on this page and we will get you the current on-road price and offers from ${vehicle.brand} dealers in ${city.name}.` },
  ].filter(Boolean);

  const jsonLd = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: vehicle.name, item: `${SITE_URL}/${base(type)}/${vehicle.slug}` },
      { "@type": "ListItem", position: 3, name: `Price in ${city.name}`, item: url } ] },
    ...(first ? [{ "@context": "https://schema.org", "@type": "Product", name: vehicle.name, brand: { "@type": "Brand", name: vehicle.brand }, image: vehicle.featuredImage ? [vehicle.featuredImage] : [],
      offers: { "@type": "AggregateOffer", priceCurrency: "INR", lowPrice: first.price, highPrice: variants[variants.length - 1].price, offerCount: variants.length, areaServed: { "@type": "City", name: city.name } } }] : []),
  ];

  const rows = first ? [
    { label: "Ex-showroom price", value: fmtINR(first.price), note: `${first.name} (starting variant)` },
    { label: tax.known ? `Road tax (${tax.pct}%)` : "Road tax", value: tax.known ? (tax.pct === 0 ? "₹0 (exempt)" : fmtINR(tax.amount)) : "As applicable", note: tax.known ? `${city.state} rate for EVs` : `${city.state} rate not confirmed — check with RTO`, good: tax.known && tax.pct === 0, warn: !tax.known },
    { label: "Registration fee", value: "₹0 (waived)", note: "HSRP / smart-card charges extra", good: true },
    { label: "Insurance (1st year, approx.)", value: fmtINR(est.insurance), note: "Estimate — varies by insurer and add-ons" },
  ] : [];

  return (
    <>
      {jsonLd.map((j, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />)}
      <main className="min-h-screen bg-gray-50 pb-16">
        <div className="border-b border-gray-100 bg-white">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-4 py-3 text-xs text-gray-500">
            <Link href="/" className="hover:text-green-600">Home</Link><ChevronRight size={11} />
            <Link href={`/${base(type)}`} className="hover:text-green-600">{type === "car" ? "Electric Cars" : "Electric Bikes"}</Link><ChevronRight size={11} />
            <Link href={`/${base(type)}/${vehicle.slug}`} className="hover:text-green-600">{vehicle.name}</Link><ChevronRight size={11} />
            <span className="font-semibold text-gray-800">Price in {city.name}</span>
          </nav>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700"><MapPin size={12} />{city.name}, {city.state}</p>
            <h1 className="text-2xl font-black leading-tight text-gray-900 sm:text-3xl">{vehicle.name} On-Road Price in {city.name}</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {first ? <>The {vehicle.name} starts at <strong>{fmtINR(first.price)}</strong> ex-showroom{est.total ? <> and costs about <strong>{fmtINR(est.total)}</strong> on the road in {city.name}</> : null}. </> : null}
              Road-tax rules checked {asOf}.
            </p>

            {vehicle.featuredImage && (
              <div className="relative mt-5 h-52 overflow-hidden rounded-2xl bg-white sm:h-64">
                <Image src={vehicle.featuredImage} alt={`${vehicle.name}`} fill className="object-contain p-4" sizes="(max-width: 1024px) 100vw, 640px" priority />
              </div>
            )}

            {tax?.known && tax.pct === 0 && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                <CheckCircle size={15} className="mt-0.5 shrink-0 text-green-600" />
                <p><strong>No road tax in {city.state}</strong> on this electric {noun}{tax.validity ? ` (${tax.validity})` : ""}.</p>
              </div>
            )}
            {first && !tax?.known && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <p>We couldn&apos;t confirm {city.state}&apos;s current EV road-tax rate from official sources, so we show the ex-showroom price only. Ask for the exact on-road quote below.</p>
              </div>
            )}

            {first && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <h2 className="border-b border-gray-100 px-5 py-4 font-black text-gray-900">Price breakdown in {city.name}</h2>
                <table className="w-full text-sm"><tbody>
                  {rows.map((r) => (
                    <tr key={r.label} className="border-b border-gray-50">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 text-gray-700">{r.good && <CheckCircle size={13} className="text-green-500" />}{r.warn && <Info size={13} className="text-amber-500" />}{r.label}</span>
                        <span className="ml-5 block text-[11px] text-gray-400">{r.note}</span>
                      </td>
                      <td className={`whitespace-nowrap px-5 py-3 text-right font-bold ${r.good ? "text-green-700" : "text-gray-900"}`}>{r.value}</td>
                    </tr>
                  ))}
                  <tr className="bg-green-50">
                    <td className="px-5 py-4 font-black text-green-800">On-road price (approx.)</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-xl font-black text-green-800">{est.total ? fmtINR(est.total) : `${fmtINR(first.price)} + tax`}</td>
                  </tr>
                </tbody></table>
                <p className="flex items-start gap-1.5 bg-yellow-50 px-5 py-3 text-xs text-yellow-800"><Info size={12} className="mt-0.5 shrink-0" />Indicative only. Dealer charges, accessories and offers vary — get the exact quote from the form.</p>
              </div>
            )}

            {variants.length > 1 && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <h2 className="border-b border-gray-100 px-5 py-4 font-black text-gray-900">Variant-wise price in {city.name}</h2>
                <div className="divide-y divide-gray-50">
                  {variants.map((v) => {
                    const e = onRoadEstimate(city, type, v.price);
                    return (
                      <div key={v.name} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-gray-800">{v.name}</p><p className="text-xs text-gray-400">Ex-showroom {fmtINR(v.price)}{v.range ? ` · ${v.range}` : ""}</p></div>
                        <div className="shrink-0 text-right"><p className="font-black text-gray-900">{e.total ? fmtINR(e.total) : "—"}</p><p className="text-[10px] text-gray-400">{e.total ? `on-road${e.tax.pct ? ` · ${e.tax.pct}% tax` : ""}` : "tax not confirmed"}</p></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-2 font-black text-gray-900">{vehicle.name} price in {city.name}: FAQs</h2>
              {faqs.map((f, i) => (
                <details key={i} className="border-b border-gray-100 py-3 last:border-0" open={i === 0}>
                  <summary className="cursor-pointer text-sm font-semibold text-gray-800">{f.q}</summary>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.a}</p>
                </details>
              ))}
            </section>

            <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-black text-gray-900">{vehicle.name} price in other cities</h2>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {nearbyCities(citySlug, 12).map((c) => (
                  <Link key={c.slug} href={`/${base(type)}/${vehicle.slug}/price-in-${c.slug}`} className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700"><MapPin size={11} />{c.name}</Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <LeadForm vehicleName={vehicle.name} vehicleSlug={vehicle.slug} vehicleType={type} defaultCity={city.name} defaultState={city.state}
              source="city-page" headline={`Get the best price in ${city.name}`} />
            <Link href={`/${base(type)}/${vehicle.slug}`} className="block rounded-xl border border-gray-200 bg-white py-2.5 text-center text-sm font-bold text-gray-700 hover:border-green-400">Full {vehicle.name} specs →</Link>
            <Link href="/emi-calculator" className="block rounded-xl border border-gray-200 bg-white py-2.5 text-center text-sm font-bold text-gray-700 hover:border-green-400">EMI calculator</Link>
          </aside>
        </div>
      </main>
    </>
  );
}
