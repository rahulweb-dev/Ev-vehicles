import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/app/layout";
import {
  CALENDAR_YEARS, FINANCIAL_YEARS, MONTHLY_2025, MONTHLY_2025_SRC, THREE_WHEELER_2026, THREE_WHEELER_2025_SPLIT,
  SOURCES, CAVEATS, HISTORY_UPDATED,
} from "@/lib/ev-sales-history";
import { SEGMENT_TOTALS, MONTHS_COVERED, SOURCE as LIVE_SOURCE } from "@/lib/ev-sales-data";

export const revalidate = 86400;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (n) => (n == null ? "—" : Math.round(n).toLocaleString("en-IN"));
const lakh = (n) => `${(n / 100000).toFixed(1)} lakh`;
const sum = (a) => a.reduce((s, x) => s + (Number.isFinite(x) ? x : 0), 0);
const pct = (a, b) => (a && b ? `${a >= b ? "+" : ""}${(((a - b) / b) * 100).toFixed(0)}%` : "—");

const SEG = [
  { key: "twoW", label: "Two-wheelers", color: "#16a34a" },
  { key: "threeW", label: "Three-wheelers", color: "#f59e0b" },
  { key: "pv", label: "Cars (e-PV)", color: "#0ea5e9" },
  { key: "cv", label: "Buses & goods (e-CV)", color: "#8b5cf6" },
];

// 2026 so far: cars, two-wheelers, commercial from the live monthly dataset; three-wheelers from EVreporter.
const ytd = {
  months: MONTHS_COVERED,
  twoW: sum(SEGMENT_TOTALS["two-wheeler"].sales),
  pv: sum(SEGMENT_TOTALS.car.sales),
  cv: sum(SEGMENT_TOTALS.commercial.sales),
  threeW: sum(THREE_WHEELER_2026.slice(0, MONTHS_COVERED).map((r) => r.total)),
};
ytd.total = ytd.twoW + ytd.pv + ytd.cv + ytd.threeW;
const y25 = CALENDAR_YEARS.find((y) => y.year === 2025);
const y20 = CALENDAR_YEARS.find((y) => y.year === 2020);
const fy26 = FINANCIAL_YEARS.find((f) => f.fy === "FY26");
const ytd3W25 = sum(MONTHLY_2025.slice(0, MONTHS_COVERED).map((r) => r.threeW));
const periodLabel = `Jan–${MONTHS[MONTHS_COVERED - 1]} 2026`;

export const metadata = {
  title: "India EV Sales History 2020–2026: Year-wise Electric Vehicle Sales Data",
  description: `Year-wise and month-wise India EV sales from 2020 to 2026 for electric two-wheelers, three-wheelers, cars, buses and goods vehicles. ${lakh(y25.total)} EVs were registered in 2025. Sourced from Vahan via FADA, Autocar Pro and EVreporter.`,
  keywords: "EV sales history India, India EV sales 2020 to 2025, yearly EV sales India, electric three-wheeler sales India, EV sales FY26, Vahan EV registrations",
  alternates: { canonical: `${SITE_URL}/ev-sales/history` },
  openGraph: { title: "India EV Sales History 2020–2026 | EV Radar", description: "Every year of India EV sales by segment, with sources.", url: `${SITE_URL}/ev-sales/history`, type: "website" },
};

function SourceRef({ id }) {
  const s = SOURCES[id];
  if (!s) return null;
  return <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-[11px] text-green-700 underline decoration-dotted" title={`${s.name}: ${s.title}`}>{s.name}</a>;
}

/* Stacked bars for calendar years (2020 shows total only) */
function YearChart() {
  const rows = [...CALENDAR_YEARS.map((y) => ({ ...y, label: String(y.year) })), { ...ytd, label: "2026*", year: 2026 }];
  const max = Math.max(...rows.map((r) => r.total));
  const W = 720, H = 300, top = 24, bottom = 36, bw = 64, gap = (W - rows.length * bw) / (rows.length + 1);
  const y = (v) => ((v / max) * (H - top - bottom));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="India EV registrations by calendar year and segment">
      {[0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1="0" x2={W} y1={H - bottom - f * (H - top - bottom)} y2={H - bottom - f * (H - top - bottom)} stroke="#e5e7eb" strokeDasharray="3 5" />)}
      {rows.map((r, i) => {
        const x = gap + i * (bw + gap);
        const segs = SEG.filter((s) => Number.isFinite(r[s.key])).map((s) => ({ key: s.key, color: s.color, v: r[s.key] }));
        const rest = r.total - sum(segs.map((s) => s.v));
        if (rest > r.total * 0.02) segs.push({ key: "rest", color: "#cbd5e1", v: rest });
        const parts = segs.map((s, k) => {
          const below = sum(segs.slice(0, k).map((p) => p.v));
          return <rect key={s.key} x={x} y={H - bottom - y(below + s.v)} width={bw} height={y(s.v)} fill={s.color} rx="2" />;
        });
        return (
          <g key={r.label}>
            {parts}
            <text x={x + bw / 2} y={H - bottom - y(r.total) - 7} textAnchor="middle" fontSize="12" fontWeight="700" fill="#111827">{(r.total / 100000).toFixed(1)}L</text>
            <text x={x + bw / 2} y={H - 12} textAnchor="middle" fontSize="12" fill="#6b7280">{r.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* 2025 vs 2026 line chart for three-wheelers (same source both years) */
function ThreeWheelerChart() {
  const a = MONTHLY_2025.map((r) => r.threeW), b = THREE_WHEELER_2026.map((r) => r.total);
  const max = Math.max(...a, ...b) * 1.1, W = 720, H = 240, L = 8, R = 8, T = 14, B = 28;
  const x = (i) => L + (i / 11) * (W - L - R), y = (v) => T + (1 - v / max) * (H - T - B);
  const path = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Electric three-wheeler registrations, 2025 vs 2026">
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={L} x2={W - R} y1={T + f * (H - T - B)} y2={T + f * (H - T - B)} stroke="#e5e7eb" strokeDasharray="3 5" />)}
      <path d={path(a)} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="6 5" />
      <path d={path(b)} fill="none" stroke="#f59e0b" strokeWidth="3" />
      {b.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#f59e0b" />)}
      {MONTHS.map((m, i) => <text key={m} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#6b7280">{m}</text>)}
    </svg>
  );
}

export default function EVSalesHistoryPage() {
  const growth5 = (y25.total / y20.total).toFixed(1);
  const faqs = [
    { q: "How many electric vehicles were sold in India in 2025?", a: `${fmt(y25.total)} EVs were registered in India in calendar year 2025 (Vahan): ${fmt(y25.twoW)} two-wheelers, ${fmt(y25.threeW)} three-wheelers, ${fmt(y25.pv)} cars and ${fmt(y25.cv)} buses and goods vehicles. Source: Autocar Pro.` },
    { q: "How have EV sales in India grown since 2020?", a: `EV registrations grew from ${fmt(y20.total)} in 2020 to ${fmt(y25.total)} in 2025, about ${growth5} times in five years. Electric car sales rose from ${fmt(y20.pv)} to ${fmt(y25.pv)} over the same period.` },
    { q: "How many EVs were sold in India in FY26?", a: `${fmt(fy26.total)} EVs were registered in FY2025-26 (April 2025–March 2026), including ${fmt(fy26.twoW)} two-wheelers, ${fmt(fy26.threeW)} three-wheelers and ${fmt(fy26.pv)} cars. Source: Autocar Pro (Vahan).` },
    { q: "How many electric three-wheelers are sold in India?", a: `${fmt(y25.threeW)} electric three-wheelers (e-rickshaws, e-carts and L5 autos) were registered in 2025. In ${periodLabel}, ${fmt(ytd.threeW)} were registered, ${pct(ytd.threeW, ytd3W25)} versus the same months of 2025 (EVreporter, Vahan).` },
  ];
  const ld = [
    { "@context": "https://schema.org", "@type": "Dataset", name: "India EV Sales History 2020–2026", description: "Calendar-year, financial-year and monthly electric vehicle registrations in India by segment.", url: `${SITE_URL}/ev-sales/history`,
      temporalCoverage: "2020/2026", spatialCoverage: { "@type": "Country", name: "India" }, dateModified: HISTORY_UPDATED, publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      isBasedOn: Object.values(SOURCES).map((s) => s.url) },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "EV Sales", item: `${SITE_URL}/ev-sales` },
      { "@type": "ListItem", position: 3, name: "History", item: `${SITE_URL}/ev-sales/history` }] },
  ];

  const card = "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm";
  const th = "px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 first:text-left";
  const td = "px-3 py-2.5 text-right tabular-nums text-gray-800 first:text-left";

  return (
    <main className="min-h-screen bg-gray-50">
      {ld.map((x, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />)}

      <section className="border-b border-gray-100 bg-gradient-to-br from-white via-white to-green-50">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <nav className="mb-3 text-xs text-gray-500"><Link href="/" className="hover:text-green-700">Home</Link> / <Link href="/ev-sales" className="hover:text-green-700">EV Sales</Link> / <span className="text-gray-800">History</span></nav>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">India EV Sales History: 2020 to 2026</h1>
          <p className="mt-3 max-w-3xl leading-relaxed text-gray-700">
            India registered <strong>{fmt(y25.total)} electric vehicles in 2025</strong>, {growth5} times the {fmt(y20.total)} of 2020.
            This page tracks every year of EV sales across <strong>two-wheelers, three-wheelers, cars, buses and goods vehicles</strong>,
            by calendar year, financial year and month, using Vahan registration data. Every number links to its source.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[["EVs sold in 2025", lakh(y25.total), `${pct(y25.total, CALENDAR_YEARS.find((y) => y.year === 2024).total)} vs 2024`],
              [`EVs sold, ${periodLabel}`, lakh(ytd.total), "all segments incl. three-wheelers"],
              ["EVs sold in FY26", lakh(fy26.total), "April 2025 – March 2026"],
              ["Growth since 2020", `${growth5}×`, `${fmt(y20.total)} → ${fmt(y25.total)}`]].map(([l, v, s]) => (
              <div key={l} className="rounded-2xl border border-green-100 bg-white/80 p-4 shadow-sm">
                <p className="text-xs text-gray-500">{l}</p><p className="mt-1 text-2xl font-black text-green-700">{v}</p><p className="mt-0.5 text-[11px] text-gray-400">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        {/* Calendar years */}
        <section className={card}>
          <h2 className="text-xl font-black text-gray-900">EV sales by calendar year</h2>
          <p className="mt-1 text-sm text-gray-500">Registrations from January to December. *2026 is {periodLabel}.</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">{[...SEG, { key: "x", label: "Not split by source", color: "#cbd5e1" }].map((s) => <span key={s.key} className="flex items-center gap-1.5 text-gray-600"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />{s.label}</span>)}</div>
          <div className="mt-4"><YearChart /></div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-gray-200"><tr><th className={th}>Year</th>{SEG.map((s) => <th key={s.key} className={th}>{s.label}</th>)}<th className={th}>Total EVs</th><th className={th}>Growth</th><th className={th}>Source</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {CALENDAR_YEARS.map((r, i) => (
                  <tr key={r.year} className="hover:bg-gray-50">
                    <td className={`${td} font-bold`}>{r.year}</td>
                    {SEG.map((s) => <td key={s.key} className={td}>{fmt(r[s.key])}</td>)}
                    <td className={`${td} font-bold text-green-700`}>{fmt(r.total)}</td>
                    <td className={td}>{i ? pct(r.total, CALENDAR_YEARS[i - 1].total) : "—"}</td>
                    <td className={td}><SourceRef id={r.src} /></td>
                  </tr>
                ))}
                <tr className="bg-green-50/50">
                  <td className={`${td} font-bold`}>2026*</td>
                  {SEG.map((s) => <td key={s.key} className={td}>{fmt(ytd[s.key])}</td>)}
                  <td className={`${td} font-bold text-green-700`}>{fmt(ytd.total)}</td><td className={td}>—</td>
                  <td className={td}><span className="text-[11px] text-gray-500">{periodLabel}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-gray-500">
            {CALENDAR_YEARS.filter((r) => r.note).map((r) => <li key={r.year}><b>{r.year}:</b> {r.note}</li>)}
            {CALENDAR_YEARS.filter((r) => r.bus).map((r) => <li key={`b${r.year}`}><b>{r.year} e-CV split:</b> {fmt(r.bus)} buses{r.goods ? `, ${fmt(r.goods)} goods carriers` : ""}.</li>)}
            <li><b>2026*:</b> two-wheelers, cars and e-CV from our <Link href="/ev-sales" className="text-green-700 underline">monthly dataset</Link> ({LIVE_SOURCE}); three-wheelers from <SourceRef id="EVRM" />. Total is the sum of the four segments.</li>
          </ul>
        </section>

        {/* Financial years */}
        <section className={card}>
          <h2 className="text-xl font-black text-gray-900">EV sales by financial year</h2>
          <p className="mt-1 text-sm text-gray-500">April to March. The last column is the official total from the Ministry of Heavy Industries (Vahan), in lakh units.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-gray-200"><tr><th className={th}>Year</th>{SEG.map((s) => <th key={s.key} className={th}>{s.label}</th>)}<th className={th}>Total EVs</th><th className={th}>Govt total</th><th className={th}>Source</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {FINANCIAL_YEARS.map((r) => (
                  <tr key={r.fy} className="hover:bg-gray-50">
                    <td className={`${td} font-bold`}>{r.fy}</td>
                    {SEG.map((s) => <td key={s.key} className={td}>{fmt(r[s.key])}</td>)}
                    <td className={`${td} font-bold text-green-700`}>{fmt(r.total)}</td>
                    <td className={td}>{r.mhiLakh ? `${r.mhiLakh} lakh` : "—"}</td>
                    <td className={td}><SourceRef id={r.src} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-gray-500">
            {FINANCIAL_YEARS.filter((r) => r.note).map((r) => <li key={r.fy}><b>{r.fy}:</b> {r.note}</li>)}
            <li><b>FY23 total</b> from <SourceRef id="APFY23" />; <b>FY24 e-CV</b> from <SourceRef id="APFY24CV" />; <b>FY25 cars</b> from <SourceRef id="APFY25" />; <b>FY25 buses</b> ({fmt(3570)}) from <SourceRef id="JMKFY25" />; <b>FY26 e-CV split:</b> {fmt(fy26.bus)} buses, {fmt(fy26.goods)} goods carriers. Government totals: <SourceRef id="MHI" />.</li>
          </ul>
        </section>

        {/* Monthly 2025 */}
        <section className={card}>
          <h2 className="text-xl font-black text-gray-900">Month-by-month EV sales in 2025</h2>
          <p className="mt-1 text-sm text-gray-500">All segments from one source (<SourceRef id={MONTHLY_2025_SRC} />, Vahan; excludes Telangana). Goods carriers are reported separately from June 2025.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-gray-200"><tr><th className={th}>Month</th><th className={th}>Two-wheelers</th><th className={th}>Three-wheelers</th><th className={th}>Cars</th><th className={th}>Buses</th><th className={th}>Goods carriers</th><th className={th}>Total EVs</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {MONTHLY_2025.map((r) => (
                  <tr key={r.m} className="hover:bg-gray-50">
                    <td className={`${td} font-semibold`}>{MONTHS[r.m - 1]} 2025</td><td className={td}>{fmt(r.twoW)}</td><td className={td}>{fmt(r.threeW)}</td><td className={td}>{fmt(r.pv)}</td><td className={td}>{fmt(r.bus)}</td><td className={td}>{fmt(r.goods)}</td><td className={`${td} font-bold text-green-700`}>{fmt(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Three-wheelers 2026 */}
        <section className={card}>
          <h2 className="text-xl font-black text-gray-900">Electric three-wheelers: 2026 vs 2025</h2>
          <p className="mt-1 text-sm text-gray-500">E-rickshaws, e-carts and L5 autos (passenger and cargo). {periodLabel}: <b>{fmt(ytd.threeW)}</b> registered, {pct(ytd.threeW, ytd3W25)} on the same months of 2025. Source: <SourceRef id="EVRM" />.</p>
          <div className="mt-3 flex gap-4 text-xs text-gray-600"><span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-amber-500" />2026</span><span className="flex items-center gap-1.5"><span className="h-0.5 w-5 border-t-2 border-dashed border-slate-400" />2025</span></div>
          <div className="mt-3"><ThreeWheelerChart /></div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-gray-200"><tr><th className={th}>Month</th><th className={th}>Total 2026</th><th className={th}>Total 2025</th><th className={th}>Change</th><th className={th}>L5 passenger</th><th className={th}>L5 cargo</th><th className={th}>E-rickshaw</th><th className={th}>E-cart</th><th className={th}>E-buses</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {THREE_WHEELER_2026.map((r) => {
                  const p = MONTHLY_2025[r.m - 1];
                  return (
                    <tr key={r.m} className="hover:bg-gray-50">
                      <td className={`${td} font-semibold`}>{MONTHS[r.m - 1]} 2026</td><td className={`${td} font-bold text-amber-700`}>{fmt(r.total)}</td><td className={td}>{fmt(p.threeW)}</td>
                      <td className={`${td} ${r.total >= p.threeW ? "text-green-700" : "text-red-600"}`}>{pct(r.total, p.threeW)}</td>
                      <td className={td}>{fmt(r.l5p)}</td><td className={td}>{fmt(r.l5c)}</td><td className={td}>{fmt(r.erick)}</td><td className={td}>{fmt(r.ecart)}</td><td className={td}>{fmt(r.bus)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            L5 autos are growing fast ({fmt(sum(THREE_WHEELER_2026.map((r) => r.l5p)))} passenger L5 in {periodLabel} vs {fmt(sum(THREE_WHEELER_2025_SPLIT.slice(0, MONTHS_COVERED).map((r) => r.l5p)))} a year earlier),
            while e-rickshaw registrations have fallen ({fmt(sum(THREE_WHEELER_2026.map((r) => r.erick)))} vs {fmt(sum(THREE_WHEELER_2025_SPLIT.slice(0, MONTHS_COVERED).map((r) => r.erick)))}).
          </p>
        </section>

        {/* FAQ */}
        <section className={card}>
          <h2 className="mb-3 text-xl font-black text-gray-900">Frequently asked questions</h2>
          {faqs.map(({ q, a }) => (
            <details key={q} className="group border-b border-gray-100 py-3 last:border-0">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-gray-900">{q}<span className="ml-4 text-green-600 transition-transform group-open:rotate-45">＋</span></summary>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{a}</p>
            </details>
          ))}
        </section>

        {/* Sources */}
        <section className={card}>
          <h2 className="text-xl font-black text-gray-900">Sources and notes</h2>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {Object.entries(SOURCES).map(([k, s]) => (
              <li key={k} className="text-gray-600"><a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-green-700 hover:underline">{s.name}</a> — {s.title} <span className="text-gray-400">({s.date})</span></li>
            ))}
          </ul>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-gray-500">{CAVEATS.map((c) => <li key={c}>{c}</li>)}</ul>
          <p className="mt-4 text-xs text-gray-400">Last updated {HISTORY_UPDATED}. “—” means the figure wasn&apos;t reported by a source we could verify; we never estimate missing numbers.</p>
        </section>

        <div className="flex flex-wrap gap-3 text-sm">
          {[["/ev-sales", "EV sales 2026 (brand-wise)"], ["/ev-sales/cars", "Electric car sales"], ["/ev-sales/two-wheelers", "Electric two-wheeler sales"], ["/ev-sales/commercial", "Commercial EV sales"], ["/ev-market-share", "EV market share"], ["/ev-adoption-states", "EV adoption by state"]].map(([h, l]) => (
            <Link key={h} href={h} className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 hover:border-green-300 hover:text-green-700">{l} →</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
