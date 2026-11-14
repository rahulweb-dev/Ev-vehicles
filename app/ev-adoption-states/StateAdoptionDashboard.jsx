"use client";
import { useState } from "react";
import Link from "next/link";
import { DATA_YEAR } from "@/lib/ev-sales-fallback";
import { MapPin, TrendingUp, TrendingDown } from "lucide-react";

export default function StateAdoptionDashboard({ data = {} }) {
  const { stateSales = [], grandTotal = 0, isFallback } = data;
  const sorted = [...stateSales].sort((a, b) => (b.totalUnits || 0) - (a.totalUnits || 0));
  const max = sorted[0]?.totalUnits || 1;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <nav className="text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href="/ev-sales" className="hover:text-gray-600">EV Sales</Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">State Adoption</span>
          </nav>
          {isFallback && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">Sample Data</span>}
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">EV Adoption by State India {DATA_YEAR}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            State-wise electric vehicle adoption data — {sorted.length} states tracked, {(grandTotal).toLocaleString("en-IN")} total EVs in {DATA_YEAR}.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Top States */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.slice(0, 3).map((s, i) => {
            const pct = grandTotal > 0 ? ((s.totalUnits / grandTotal) * 100).toFixed(1) : "0";
            const colors = ["bg-green-600", "bg-blue-600", "bg-purple-600"];
            return (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                <div className={`h-10 w-10 ${colors[i]} rounded-xl flex items-center justify-center mb-3`}>
                  <MapPin size={20} className="text-white" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">#{i + 1} State</p>
                <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{s.state}</p>
                <p className="text-2xl font-black text-green-600 mt-2">{(s.totalUnits || 0).toLocaleString("en-IN")}</p>
                <p className="text-xs text-gray-400">units · {pct}% of national total</p>
                <div className="mt-3 flex items-center gap-1.5">
                  {(s.avgGrowth || 0) >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
                  <span className={`text-xs font-bold ${(s.avgGrowth || 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {Number.isFinite(s.avgGrowth) ? `${s.avgGrowth >= 0 ? "+" : ""}${s.avgGrowth.toFixed(1)}% growth` : "–"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bar Chart by State */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 dark:text-white mb-5">All States — EV Units Sold {DATA_YEAR}</h2>
          <div className="space-y-3">
            {sorted.map((s, i) => {
              const pct = (s.totalUnits / max) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 text-xs font-bold text-gray-400 text-right shrink-0">{i + 1}</span>
                  <span className="w-28 sm:w-36 shrink-0 text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{s.state}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-5 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.max(pct, 1)}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-xs font-bold text-gray-700 dark:text-gray-300 text-right">
                    {(s.totalUnits || 0).toLocaleString("en-IN")}
                  </span>
                  <span className={`w-14 shrink-0 text-xs font-bold text-right ${(s.avgGrowth || 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {Number.isFinite(s.avgGrowth) ? `${s.avgGrowth >= 0 ? "+" : ""}${s.avgGrowth.toFixed(1)}%` : "–"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm overflow-x-auto">
          <h2 className="text-sm font-black text-gray-900 dark:text-white mb-5">State-wise EV Adoption Data</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="text-left pb-3 pr-4">#</th>
                <th className="text-left pb-3 pr-4">State</th>
                <th className="text-right pb-3 pr-4">EV Units Sold</th>
                <th className="text-right pb-3 pr-4">% of National</th>
                <th className="text-right pb-3">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {sorted.map((s, i) => {
                const pct = grandTotal > 0 ? ((s.totalUnits / grandTotal) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="py-3 pr-4 text-xs font-bold text-gray-400">{i + 1}</td>
                    <td className="py-3 pr-4 font-bold text-gray-900 dark:text-white">{s.state}</td>
                    <td className="py-3 pr-4 text-right font-bold text-gray-900 dark:text-white">{(s.totalUnits || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 pr-4 text-right text-gray-500 dark:text-gray-400 font-semibold">{pct}%</td>
                    <td className="py-3 text-right">
                      <span className={`text-xs font-bold ${(s.avgGrowth || 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {Number.isFinite(s.avgGrowth) ? `${s.avgGrowth >= 0 ? "+" : ""}${s.avgGrowth.toFixed(1)}%` : "–"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
