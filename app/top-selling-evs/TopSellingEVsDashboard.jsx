"use client";
import { useState } from "react";
import Link from "next/link";
import { DATA_YEAR } from "@/lib/ev-sales-fallback";
import { TrendingUp, TrendingDown } from "lucide-react";

const SEG_COLOR = { car: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", "two-wheeler": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", commercial: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" };
const SEG_LABEL = { car: "Car", "two-wheeler": "2-Wheeler", commercial: "Commercial" };
const MEDAL = ["🥇", "🥈", "🥉"];

export default function TopSellingEVsDashboard({ data = {} }) {
  const { brandRankings = [], grandTotal = 0, isFallback } = data;
  const [activeSegment, setActiveSegment] = useState("all");

  const filtered = activeSegment === "all" ? brandRankings : brandRankings.filter((b) => b.segment === activeSegment);
  const sorted = [...filtered].sort((a, b) => (b.totalUnits || 0) - (a.totalUnits || 0));

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <nav className="text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Top Selling EVs</span>
          </nav>
          {isFallback && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">Sample Data</span>}
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Top Selling EVs India {DATA_YEAR}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Best-selling electric vehicles ranked by total units sold — {(grandTotal).toLocaleString("en-IN")} total EVs in {DATA_YEAR}.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Segment Filter */}
        <div className="flex gap-2 flex-wrap">
          {[["all", "All EVs"], ["car", "Electric Cars"], ["two-wheeler", "Electric 2W"], ["commercial", "Commercial"]].map(([seg, label]) => (
            <button key={seg} onClick={() => setActiveSegment(seg)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${activeSegment === seg ? "bg-green-600 text-white shadow-sm" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-green-300"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {sorted.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {sorted.slice(0, 3).map((b, i) => (
              <div key={i} className={`relative bg-white dark:bg-gray-900 rounded-2xl border ${i === 0 ? "border-amber-300 dark:border-amber-700 shadow-md" : "border-gray-100 dark:border-gray-800"} p-5 text-center`}>
                <div className="text-2xl mb-1">{MEDAL[i]}</div>
                <p className="font-black text-gray-900 dark:text-white text-sm sm:text-base">{b.brand}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${SEG_COLOR[b.segment] || ""}`}>{SEG_LABEL[b.segment] || b.segment}</span>
                <p className="text-xl font-black text-green-600 mt-2">{(b.totalUnits || 0).toLocaleString("en-IN")}</p>
                <p className="text-xs text-gray-400 mt-0.5">units sold</p>
                {Number.isFinite(b.avgGrowth) && (
                  <p className={`flex items-center justify-center gap-0.5 text-xs font-bold mt-1 ${b.avgGrowth >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {b.avgGrowth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(b.avgGrowth).toFixed(1)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Full List */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-black text-gray-900 dark:text-white text-sm">Complete Rankings</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {sorted.map((b, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <span className="w-8 text-center text-xs font-black text-gray-400">{i < 3 ? MEDAL[i] : `#${i + 1}`}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{b.brand}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SEG_COLOR[b.segment] || ""}`}>{SEG_LABEL[b.segment] || b.segment}</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 dark:text-white">{(b.totalUnits || 0).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-400">units</p>
                </div>
                <div className="text-right w-16">
                  <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm">{(b.marketShare || 0).toFixed(1)}%</p>
                  <p className="text-xs text-gray-400">share</p>
                </div>
                {Number.isFinite(b.avgGrowth) && (
                  <span className={`w-14 text-right text-xs font-bold ${b.avgGrowth >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {b.avgGrowth >= 0 ? "+" : ""}{b.avgGrowth.toFixed(1)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
