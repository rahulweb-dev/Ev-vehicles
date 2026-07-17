"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BarChart from "@/components/ev-sales/BarChart";
import HBarChart from "@/components/ev-sales/HBarChart";
import StatCard from "@/components/ev-sales/StatCard";
import { TrendingUp, Zap } from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SEG_COLOR = { car: "bg-blue-500", "two-wheeler": "bg-green-500", commercial: "bg-purple-500" };
const SEG_LABEL = { car: "Cars", "two-wheeler": "Two-Wheelers", commercial: "Commercial" };

export default function SegmentPage({ data = {}, segment, title, description, breadcrumb = [] }) {
  const {
    grandTotal = 0,
    totals = {},
    brandRankings = [],
    monthlyTrend = [],
    isFallback,
  } = data;

  const segTotal = totals[segment]?.totalUnits || grandTotal;
  const segGrowth = totals[segment]?.avgGrowth;

  const monthlyData = monthlyTrend.map((m) => ({
    month: MONTH_NAMES[(m.month || 1) - 1],
    totalUnits: m.totalUnits || 0,
  }));

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight size={12} />
                {b.href ? <Link href={b.href} className="hover:text-gray-600">{b.label}</Link> : <span className="text-gray-700 dark:text-gray-300 font-medium">{b.label}</span>}
              </span>
            ))}
          </nav>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              {isFallback && (
                <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">Sample Data</span>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{title}</h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-lg">{description}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label={`${SEG_LABEL[segment]} Total`} value={segTotal} icon={Zap} color="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" index={0} />
          <StatCard label="Avg Growth" value={segGrowth || 0} icon={TrendingUp} color="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" index={1} suffix="%" />
          <StatCard label="Brands Tracked" value={brandRankings.length} icon={Zap} color="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" index={2} />
          <StatCard label="Months of Data" value={monthlyTrend.length} icon={Zap} color="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-600" index={3} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 dark:text-white mb-4">Monthly Sales Trend 2025</h2>
            <BarChart data={monthlyData} labelKey="month" valueKey="totalUnits" color={SEG_COLOR[segment] || "bg-green-500"} />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 dark:text-white mb-4">Top Brands — {SEG_LABEL[segment]}</h2>
            <HBarChart data={brandRankings} labelKey="brand" valueKey="totalUnits" segmentKey="segment" maxItems={8} />
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm overflow-x-auto">
          <h2 className="text-sm font-black text-gray-900 dark:text-white mb-5">Brand Rankings — {SEG_LABEL[segment]} 2025</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="text-left pb-3 pr-4">#</th>
                <th className="text-left pb-3 pr-4">Brand</th>
                <th className="text-right pb-3 pr-4">Units Sold</th>
                <th className="text-right pb-3 pr-4">Market Share</th>
                <th className="text-right pb-3">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {brandRankings.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="py-3 pr-4 text-xs font-bold text-gray-400">{i + 1}</td>
                  <td className="py-3 pr-4">
                    <span className="font-bold text-gray-900 dark:text-white">{b.brand}</span>
                  </td>
                  <td className="py-3 pr-4 text-right font-bold text-gray-900 dark:text-white">
                    {(b.totalUnits || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 pr-4 text-right text-gray-600 dark:text-gray-400 font-semibold">
                    {(b.marketShare || 0).toFixed(1)}%
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
    </main>
  );
}
