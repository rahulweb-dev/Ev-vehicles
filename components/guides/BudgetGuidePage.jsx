// Server component: data-driven buying guide (budget bracket or longest range).
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, BatteryCharging, IndianRupee, Shield, Gauge, Trophy } from "lucide-react";
import { SITE_URL } from "@/app/layout";
import { GUIDES, getGuideData, fmtINR, budgetLabel } from "@/lib/budgetGuides";
import { comparisonsFor } from "@/lib/comparisons";
import LeadButton from "@/components/LeadButton";

const YEAR = 2026;

function copyFor(key, g, d) {
  const isCar = g.type === "car";
  const noun = isCar ? "electric cars" : "electric two-wheelers";
  const nounOne = isCar ? "electric car" : "electric two-wheeler";
  const n = d.list.length;
  const { cheapest, longestRange, longestRealWorld, fiveStar } = d.highlights;

  if (g.sort === "range") {
    return {
      h1: `Longest-Range Electric Cars in India ${YEAR}`,
      intro: `These are the electric cars on sale in India with the highest claimed range, ranked by their longest-range variant. ${longestRange ? `The ${longestRange.name} leads with ${longestRange.bestRange.km} km claimed.` : ""} Claimed figures (ARAI/MIDC for most cars, WLTP for some imports) are measured in lab conditions, so we also show real-world range from road tests where one exists.`,
      faqs: [
        longestRange && { question: "Which electric car has the longest range in India?", answer: `The ${longestRange.name} has the highest claimed range at ${longestRange.bestRange.km} km (${longestRange.bestRange.name}), priced at ${fmtINR(longestRange.bestRange.price)} ex-showroom.` },
        longestRealWorld && { question: "Which electric car goes furthest in real-world driving?", answer: `Among cars with a published road test, the ${longestRealWorld.name} recorded the highest figure: ${longestRealWorld.realWorld}.` },
        { question: "How much lower is real-world range than the claimed range?", answer: "Claimed MIDC/ARAI figures come from a lab cycle. In road tests, real-world range is typically 20–35% lower, depending on speed, air-conditioning use and temperature." },
      ].filter(Boolean),
    };
  }

  const b = budgetLabel(g.budget);
  if (d.overBudget) {
    return {
      h1: `${g.label} in India ${YEAR}`,
      intro: `None of the ${noun} listed on EV Radar currently has an ex-showroom price under ${b}. These are the most affordable ones you can buy today.`,
      faqs: [
        cheapest && { question: `Can you buy an ${nounOne} under ${b}?`, answer: `Not among the models we track. The cheapest is the ${cheapest.name} at ${fmtINR(cheapest.minPrice)} (ex-showroom). Some low-speed scooters that don't need registration cost less, but they are limited to 25 km/h.` },
      ].filter(Boolean),
    };
  }

  const faqs = [
    cheapest && { question: `Which is the cheapest ${nounOne} in India right now?`, answer: `Among the ${noun} on sale that we track, the ${cheapest.name} is the cheapest at ${fmtINR(cheapest.minPrice)} (ex-showroom).` },
    longestRange && { question: `Which ${nounOne} under ${b} has the longest range?`, answer: `The ${longestRange.name} ${longestRange.bestRange.name} has the longest claimed range under ${b}: ${longestRange.bestRange.km} km, at ${fmtINR(longestRange.bestRange.price)} ex-showroom.` },
    { question: `How many ${noun} can you buy under ${b}?`, answer: `${n} ${n === 1 ? "model has" : "models have"} at least one variant priced under ${b} ex-showroom: ${d.list.map((x) => x.name).join(", ")}.` },
    isCar && { question: `Which electric cars under ${b} have a 5-star safety rating?`, answer: fiveStar.length
      ? `${fiveStar.map((x) => `${x.name} (${x.safety})`).join("; ")}.`
      : `None of the electric cars under ${b} has a 5-star crash-test rating yet.` },
    !isCar && { question: "Do electric scooters get a government subsidy?", answer: "Yes. Electric two-wheelers are covered by the PM E-Drive scheme until March 2028. The incentive is applied at the time of purchase, and the ex-showroom prices listed here generally already include it." },
    longestRealWorld && { question: `What real-world range can you expect?`, answer: `Real-world range is lower than the claimed figure. The best tested result in this list is the ${longestRealWorld.name}: ${longestRealWorld.realWorld}.` },
  ].filter(Boolean);

  return {
    h1: `Best ${g.label} in India ${YEAR}`,
    intro: `${n} ${n === 1 ? noun.replace(/s$/, "") : noun} ${n === 1 ? "has" : "have"} at least one variant under ${b} (ex-showroom), starting with the ${cheapest.name} at ${fmtINR(cheapest.minPrice)}.${longestRange ? ` For the most range within budget, the ${longestRange.name} ${longestRange.bestRange.name} claims ${longestRange.bestRange.km} km.` : ""} Prices and specs below update automatically when manufacturers change them.`,
    faqs,
  };
}

export async function guideMetadata(key) {
  const g = GUIDES[key];
  const d = await getGuideData(key);
  const c = copyFor(key, g, d);
  const title = g.sort === "range" ? `Longest-Range Electric Cars in India ${YEAR} – Claimed vs Real-World` : `${c.h1} – Prices, Range & Specs`;
  const description = c.intro.slice(0, 160);
  const og = `${SITE_URL}/api/og?title=${encodeURIComponent(g.label)}&subtitle=${encodeURIComponent(`India ${YEAR} · Updated prices`)}&tag=${g.type === "car" ? "cars" : "bikes"}`;
  return {
    title, description,
    alternates: { canonical: `${SITE_URL}/${key}` },
    openGraph: { title, description, url: `${SITE_URL}/${key}`, type: "article", images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function BudgetGuidePage({ guideKey }) {
  const g = GUIDES[guideKey];
  const d = await getGuideData(guideKey);
  const c = copyFor(guideKey, g, d);
  const isCar = g.type === "car";
  const url = `${SITE_URL}/${guideKey}`;
  const updated = d.lastUpdated.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  const { cheapest, longestRange, longestRealWorld, fiveStar } = d.highlights;

  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: c.h1, description: c.intro.slice(0, 200), url, dateModified: d.lastUpdated.toISOString(), inLanguage: "en-IN",
      author: { "@type": "Organization", name: "EV Radar", url: SITE_URL }, publisher: { "@type": "Organization", name: "EV Radar", logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` } } },
    { "@context": "https://schema.org", "@type": "ItemList", name: c.h1, url, itemListElement: d.list.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, url: `${SITE_URL}${x.href}` })) },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: isCar ? "Cars" : "Bikes", item: `${SITE_URL}/${isCar ? "cars" : "bikes"}` },
      { "@type": "ListItem", position: 3, name: g.label, item: url } ] },
  ];

  const tiles = [
    cheapest && { icon: IndianRupee, label: "Most affordable", name: cheapest.name, value: fmtINR(cheapest.minPrice), href: cheapest.href },
    longestRange && { icon: BatteryCharging, label: g.budget ? "Most range in budget" : "Longest claimed range", name: longestRange.name, value: `${longestRange.bestRange.km} km claimed`, href: longestRange.href },
    longestRealWorld && { icon: Gauge, label: "Best real-world range", name: longestRealWorld.name, value: `~${longestRealWorld.realWorldKm} km tested`, href: longestRealWorld.href },
    isCar && fiveStar[0] && { icon: Shield, label: "5-star safety", name: fiveStar.map((x) => x.name).slice(0, 3).join(", "), value: fiveStar.length > 3 ? `+${fiveStar.length - 3} more` : "Crash-tested", href: fiveStar[0].href },
  ].filter(Boolean);

  const related = Object.entries(GUIDES).filter(([k]) => k !== guideKey);

  return (
    <>
      {jsonLd.map((j, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />)}
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-5xl px-4">
            <nav className="mb-4 flex items-center gap-1 text-sm text-gray-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} /><Link href={isCar ? "/cars" : "/bikes"} className="hover:text-white">{isCar ? "Cars" : "Bikes"}</Link>
              <ChevronRight size={14} /><span className="text-white">{g.label}</span>
            </nav>
            <h1 className="text-3xl font-black text-white md:text-5xl">{c.h1}</h1>
            <p className="mt-4 max-w-3xl text-base text-gray-300 md:text-lg">{c.intro}</p>
            <p className="mt-3 text-xs text-gray-500">Ex-showroom prices · Last updated {updated}</p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
          {tiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {tiles.map((t) => { const Icon = t.icon; return (
                <Link key={t.label} href={t.href} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-green-400 transition">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-green-700"><Icon size={13} />{t.label}</p>
                  <p className="mt-2 text-sm font-black text-gray-900 leading-snug">{t.name}</p>
                  <p className="text-xs font-semibold text-gray-500">{t.value}</p>
                </Link>
              ); })}
            </div>
          )}

          <div className="space-y-4">
            {d.list.map((x, i) => {
              const cmp = comparisonsFor(x.slug)[0];
              return (
                <article key={x.slug} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:flex">
                  <Link href={x.href} className="relative block h-44 shrink-0 bg-gray-100 sm:h-auto sm:w-64">
                    {x.image && <Image src={x.image} alt={x.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 256px" />}
                    <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-xs font-black text-white">{i + 1}</span>
                  </Link>
                  <div className="flex-1 p-5">
                    <p className="text-xs font-bold text-green-600">{x.brand}</p>
                    <h2 className="text-lg font-black text-gray-900"><Link href={x.href} className="hover:text-green-700">{x.name}</Link></h2>
                    <p className="mt-1 text-sm font-bold text-gray-800">
                      {fmtINR(x.minPrice)}{x.maxPrice !== x.minPrice ? ` – ${fmtINR(x.maxPrice)}` : ""}
                      {g.budget && !d.overBudget && x.variantsWithin < x.variantsTotal && (
                        <span className="ml-2 text-xs font-semibold text-gray-500">({x.variantsWithin} of {x.variantsTotal} variants under {budgetLabel(g.budget)})</span>
                      )}
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
                      {x.bestRange && <div><dt className="text-gray-400">{g.budget && !d.overBudget ? "Best range in budget" : "Claimed range"}</dt><dd className="font-bold text-gray-800">{x.bestRange.km} km <span className="font-normal text-gray-500">({x.bestRange.name})</span></dd></div>}
                      {x.battery && <div><dt className="text-gray-400">Battery</dt><dd className="font-bold text-gray-800">{x.battery}</dd></div>}
                      {x.realWorld && <div><dt className="text-gray-400">Real-world range</dt><dd className="font-bold text-gray-800">{x.realWorld}</dd></div>}
                      {isCar && x.safety && <div><dt className="text-gray-400">Safety</dt><dd className="font-bold text-gray-800">{x.safety}</dd></div>}
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <LeadButton vehicleName={x.name} vehicleSlug={x.slug} vehicleType={g.type} source={`guide:${guideKey}`} />
                      <Link href={x.href} className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-700 transition">Prices & specs →</Link>
                      {cmp && <Link href={`/compare/${cmp.slug}`} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:border-green-400 transition">{cmp.nameA} vs {cmp.nameB}</Link>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {c.faqs.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-black text-gray-900">Frequently Asked Questions</h2>
              <div className="divide-y divide-gray-100">
                {c.faqs.map((f, i) => (
                  <details key={i} className="group py-3" open={i === 0}>
                    <summary className="cursor-pointer list-none text-sm font-bold text-gray-900 group-open:text-green-700">{f.question}</summary>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-3 flex items-center gap-2 text-base font-black text-gray-900"><Trophy size={16} className="text-green-600" />More EV buying guides</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(([k, r]) => (
                <Link key={k} href={`/${k}`} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-400 hover:text-green-700 transition">
                  {r.label}<ChevronRight size={14} className="text-gray-300" />
                </Link>
              ))}
              <Link href="/compare" className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-400 hover:text-green-700 transition">
                Compare EVs side by side<ChevronRight size={14} className="text-gray-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
