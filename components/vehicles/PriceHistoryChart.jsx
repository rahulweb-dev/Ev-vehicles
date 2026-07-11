"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

function parsePriceLakh(str) {
  if (!str) return null;
  const s = String(str).replace(/[₹,\s]/g, "").toLowerCase();
  const lm = s.match(/([\d.]+)\s*(?:lakh|l)/);
  if (lm) return parseFloat(lm[1]);
  const cr = s.match(/([\d.]+)\s*(?:cr|crore)/);
  if (cr) return parseFloat(cr[1]) * 100;
  const raw = parseFloat(s.replace(/[^0-9.]/g, ""));
  if (!isNaN(raw) && raw > 100) return raw / 100000;
  return isNaN(raw) ? null : raw;
}

export default function PriceHistoryChart({ priceHistory = [], currentPrice, vehicleName }) {
  const [showAll, setShowAll] = useState(false);

  if (!priceHistory?.length && !currentPrice) return null;

  // Build display entries — use history if available, else synthetic "launch" entry
  const entries = priceHistory?.length > 0
    ? priceHistory.map(h => ({
        date: new Date(h.date),
        price: h.price,
        note: h.note || "",
        priceNum: parsePriceLakh(h.price),
      }))
    : [];

  // Add current price as latest point if not already present
  if (currentPrice && (entries.length === 0 || entries[entries.length - 1]?.price !== currentPrice)) {
    entries.push({ date: new Date(), price: currentPrice, note: "Current price", priceNum: parsePriceLakh(currentPrice) });
  }

  if (entries.length === 0) return null;

  const prices = entries.map(e => e.priceNum).filter(Boolean);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  const visible = showAll ? entries : entries.slice(-6);
  const first = entries[0];
  const last = entries[entries.length - 1];
  const priceDiff = (last?.priceNum && first?.priceNum) ? last.priceNum - first.priceNum : 0;

  const TrendIcon = priceDiff > 0 ? TrendingUp : priceDiff < 0 ? TrendingDown : Minus;
  const trendColor = priceDiff > 0 ? "text-red-500" : priceDiff < 0 ? "text-green-600" : "text-gray-400";
  const trendLabel = priceDiff > 0
    ? `+₹${Math.abs(priceDiff).toFixed(2)}L since launch`
    : priceDiff < 0
    ? `-₹${Math.abs(priceDiff).toFixed(2)}L since launch`
    : "Price unchanged";

  return (
    <section className="border-t border-gray-100 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">{vehicleName} Price History</h2>
            <p className="mt-0.5 text-sm text-gray-500">Ex-showroom price trend over time</p>
          </div>
          {priceDiff !== 0 && (
            <div className={`flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 text-sm font-bold ${trendColor}`}>
              <TrendIcon size={16} />
              <span>{trendLabel}</span>
            </div>
          )}
        </div>

        {/* Bar chart */}
        {prices.length > 1 ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="flex items-end justify-between gap-2 h-28">
              {visible.map((entry, i) => {
                const pct = entry.priceNum
                  ? ((entry.priceNum - minPrice) / range) * 70 + 30
                  : 30;
                const isLatest = i === visible.length - 1;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-gray-900 px-2.5 py-1.5 text-[11px] text-white opacity-0 group-hover:opacity-100 transition z-10">
                      <p className="font-bold">{entry.price}</p>
                      <p className="text-gray-300">{entry.note}</p>
                    </div>
                    <div
                      className={`w-full rounded-t-xl transition-all ${isLatest ? "bg-green-600" : "bg-green-200"}`}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-[10px] text-gray-400 text-center leading-tight truncate w-full text-center">
                      {entry.date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
            {entries.length > 6 && (
              <button onClick={() => setShowAll(!showAll)}
                className="mt-3 text-xs font-semibold text-green-600 hover:text-green-800 transition">
                {showAll ? "Show less" : `Show all ${entries.length} entries`}
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Launch price</p>
                <p className="text-2xl font-black text-gray-900">{entries[0]?.price}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Current price</p>
                <p className="text-2xl font-black text-green-600">{currentPrice}</p>
              </div>
            </div>
          </div>
        )}

        {/* Price entries list */}
        {entries.length > 1 && (
          <div className="mt-4 space-y-2">
            {[...visible].reverse().map((entry, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">{entry.price}</p>
                  {entry.note && <p className="text-xs text-gray-500">{entry.note}</p>}
                </div>
                <p className="text-xs text-gray-400">
                  {entry.date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
