"use client";
import Link from "next/link";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import BarChart from "@/components/ev-sales/BarChart";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SEG_COLOR = { car: "bg-blue-500", "two-wheeler": "bg-green-500", commercial: "bg-purple-500" };
const SEG_LABEL = { car: "Electric Car", "two-wheeler": "Electric Two-Wheeler", commercial: "Commercial EV" };

export default function BrandSalesPage({ records = [], brandSlug, brandMeta }) {
  const name = brandMeta?.name || brandSlug?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const segment = records[0]?.segment || "car";

  const monthly = records
    .filter((r) => r.isNational !== false || r.state === "National")
    .sort((a, b) => a.month - b.month)
    .map((r) => ({ month: MONTH_NAMES[(r.month || 1) - 1], totalUnits: r.unitsSold || 0 }));

  const total = monthly.reduce((s, m) => s + m.totalUnits, 0);
  const latest = monthly[monthly.length - 1]?.totalUnits || 0;
  const prev = monthly[monthly.length - 2]?.totalUnits || 0;
  const momGrowth = prev > 0 ? ((latest - prev) / prev) * 100 : 0;
  const avgMonthly = monthly.length > 0 ? Math.round(total / monthly.length) : 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <ChevronRight size={12} />
            <Link href="/ev-sales" className="hover:text-gray-600">EV Sales</Link>
            <ChevronRight size={12} />
            <span className="text-gray-700 dark:text-gray-300 font-medium">{name}</span>
          </nav>
          <div className="flex items-start gap-4 flex-wrap">
            <div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full text-white mb-2 inline-block ${SEG_COLOR[segment] || "bg-green-500"}`}>
                {SEG_LABEL[segment] || segment}
              </span>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">{name} EV Sales India 2025</h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Monthly electric vehicle sales data — units sold, growth trends for India.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Units 2025", value: total.toLocaleString("en-IN") },
            { label: "Latest Month", value: latest.toLocaleString("en-IN") },
            { label: "Monthly Avg", value: avgMonthly.toLocaleString("en-IN") },
            { label: "MoM Growth", value: `${momGrowth >= 0 ? "+" : ""}${momGrowth.toFixed(1)}%`, positive: momGrowth >= 0 },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <p className={`text-2xl font-black ${s.positive !== undefined ? (s.positive ? "text-green-600" : "text-red-500") : "text-gray-900 dark:text-white"}`}>{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Monthly Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 dark:text-white mb-4">{name} Monthly Sales Trend 2025</h2>
          <BarChart data={monthly} labelKey="month" valueKey="totalUnits" color={SEG_COLOR[segment] || "bg-green-500"} />
        </div>

        {/* Monthly Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm overflow-x-auto">
          <h2 className="text-sm font-black text-gray-900 dark:text-white mb-5">Month-by-Month Sales Data</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="text-left pb-3 pr-4">Month</th>
                <th className="text-right pb-3 pr-4">Units Sold</th>
                <th className="text-right pb-3">MoM Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {monthly.map((m, i) => {
                const prevUnits = i > 0 ? monthly[i - 1].totalUnits : null;
                const change = prevUnits !== null && prevUnits > 0 ? ((m.totalUnits - prevUnits) / prevUnits) * 100 : null;
                return (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="py-3 pr-4 font-semibold text-gray-700 dark:text-gray-300">{m.month} 2025</td>
                    <td className="py-3 pr-4 text-right font-bold text-gray-900 dark:text-white">{m.totalUnits.toLocaleString("en-IN")}</td>
                    <td className="py-3 text-right">
                      {change !== null ? (
                        <span className={`flex items-center justify-end gap-0.5 text-xs font-bold ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                        </span>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Back link */}
        <Link href="/ev-sales" className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700 hover:underline">
          ← Back to EV Sales Intelligence
        </Link>
      </div>
    </main>
  );
}
