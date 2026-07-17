"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import DonutChart from "@/components/ev-sales/DonutChart";
import HBarChart from "@/components/ev-sales/HBarChart";

const MS_FAQS = [
  { q: "What is the EV market share of Tata in India?", a: "Tata Motors holds over 50% market share in the Indian electric car segment as of 2025. The Tata Nexon EV and Tata Tiago EV are the two best-selling electric cars in India, making Tata the dominant player in the EV four-wheeler market." },
  { q: "Who leads India's electric two-wheeler market?", a: "Ola Electric leads the Indian electric two-wheeler market with approximately 34-36% market share. TVS iQube holds around 19-20%, followed by Ather Energy at 15-17%, Bajaj Chetak at 12-14%, and Hero Vida at 8-10%." },
  { q: "What percentage of vehicles sold in India are EVs?", a: "Electric vehicles account for approximately 5-6% of total vehicle registrations in India in 2025. The penetration is highest in the two-wheeler segment at around 5-7%, while electric cars represent about 2-3% of total car sales." },
  { q: "Is Mahindra gaining EV market share in India?", a: "Yes, Mahindra has significantly increased its EV market share in 2025 following the launch of the XEV 9e and BE 6e. Mahindra now holds approximately 15-20% of the premium electric car segment and is the fastest-growing mainstream EV brand." },
];

function FAQ({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.q}</span>
            <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-4">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}

const SEG_LABEL = { car: "Cars", "two-wheeler": "Two-Wheelers", commercial: "Commercial" };

export default function EVMarketShareDashboard({ data = {} }) {
  const { brandRankings = [], segmentBreakdown = [], grandTotal = 0, isFallback } = data;
  const [activeSegment, setActiveSegment] = useState("all");

  const filtered = activeSegment === "all" ? brandRankings : brandRankings.filter((b) => b.segment === activeSegment);
  const total = filtered.reduce((s, b) => s + (b.totalUnits || 0), 0) || 1;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <nav className="text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href="/ev-sales" className="hover:text-gray-600">EV Sales</Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Market Share</span>
          </nav>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              {isFallback && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">Sample Data</span>}
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">EV Market Share India 2025</h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Brand-wise electric vehicle market share — cars, two-wheelers, commercial vehicles.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Segment Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 dark:text-white mb-4">EV Segment Distribution</h2>
            <DonutChart data={segmentBreakdown} labelKey="segment" valueKey="totalUnits" />
          </div>

          {/* Total summary cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 content-start">
            {segmentBreakdown.map((seg, i) => {
              const share = grandTotal > 0 ? ((seg.totalUnits / grandTotal) * 100).toFixed(1) : "0.0";
              const colors = ["bg-green-50 border-green-200 text-green-700", "bg-blue-50 border-blue-200 text-blue-700", "bg-purple-50 border-purple-200 text-purple-700"];
              return (
                <div key={i} className={`rounded-2xl border p-5 ${colors[i] || colors[0]} dark:bg-gray-900 dark:border-gray-800 dark:text-white`}>
                  <p className="text-3xl font-black">{share}%</p>
                  <p className="text-sm font-semibold mt-1">{SEG_LABEL[seg.segment] || seg.segment}</p>
                  <p className="text-xs opacity-70 mt-0.5">{(seg.totalUnits || 0).toLocaleString("en-IN")} units</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Market Share */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h2 className="text-base font-black text-gray-900 dark:text-white">Brand Market Share 2025</h2>
            <div className="flex gap-2 flex-wrap">
              {[["all", "All Segments"], ["car", "Cars"], ["two-wheeler", "Two-Wheelers"], ["commercial", "Commercial"]].map(([seg, label]) => (
                <button key={seg} onClick={() => setActiveSegment(seg)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${activeSegment === seg ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <HBarChart data={filtered} labelKey="brand" valueKey="totalUnits" segmentKey="segment" maxItems={12} />
        </div>

        {/* Detailed Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm overflow-x-auto">
          <h2 className="text-base font-black text-gray-900 dark:text-white mb-5">Detailed Market Share Table</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="text-left pb-3 pr-3">#</th>
                <th className="text-left pb-3 pr-3">Brand</th>
                <th className="text-left pb-3 pr-3">Segment</th>
                <th className="text-right pb-3 pr-3">Units</th>
                <th className="text-right pb-3 pr-3">Market Share</th>
                <th className="text-right pb-3">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="py-3 pr-3 text-xs font-bold text-gray-400">{i + 1}</td>
                  <td className="py-3 pr-3 font-bold text-gray-900 dark:text-white">{b.brand}</td>
                  <td className="py-3 pr-3 text-xs text-gray-500 dark:text-gray-400">{SEG_LABEL[b.segment] || b.segment}</td>
                  <td className="py-3 pr-3 text-right font-bold text-gray-900 dark:text-white">{(b.totalUnits || 0).toLocaleString("en-IN")}</td>
                  <td className="py-3 pr-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 hidden sm:block">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(((b.totalUnits || 0) / total) * 100 * 3, 100)}%` }} />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{(b.marketShare || ((b.totalUnits || 0) / total * 100)).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`text-xs font-bold ${(b.avgGrowth || 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {(b.avgGrowth || 0) >= 0 ? "+" : ""}{(b.avgGrowth || 0).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editorial */}
      <div className="max-w-7xl mx-auto px-4 pb-10 space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Understanding India&apos;s EV Market Share in 2025</h2>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>India&apos;s electric vehicle market in 2025 is characterised by a clear concentration at the top — a handful of brands dominate each segment, while challengers are steadily carving out niches. In the electric car space, Tata Motors commands over half the market, a dominance built through early mover advantage, competitive pricing of the Nexon EV and Tiago EV, and an extensive service network. MG Motor and Mahindra are the most credible challengers, with Mahindra&apos;s new BE and XEV series attracting a premium buyer who was previously not considering EVs.</p>
            <p>The electric two-wheeler market tells a different story — it is far more competitive, with five brands all holding significant share. Ola Electric&apos;s manufacturing scale gives it a cost advantage, but TVS iQube&apos;s dealer network and Ather Energy&apos;s brand loyalty among tech-savvy urban buyers mean the top three are separated by razor-thin margins in some cities. Bajaj Chetak, with its retro design and brand heritage, appeals to a distinct demographic, while Hero Vida is leveraging India&apos;s largest two-wheeler dealership network to expand rapidly.</p>
            <p>Market share data on this page is computed from monthly wholesale dispatch figures and registration data. It represents share within each segment (electric cars vs total electric cars, not vs all vehicles), and is updated monthly.</p>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">FAQs — EV Market Share India</h2>
          <FAQ items={MS_FAQS} />
        </div>
      </div>
    </main>
  );
}
