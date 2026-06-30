"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TrendingDown, BatteryCharging, IndianRupee, ChevronRight, Info, Calendar } from "lucide-react";

const POPULAR_EVS = [
  { name: "Tata Nexon EV",         price: 1399000, badge: "Popular" },
  { name: "Tata Tiago EV",         price: 799000,  badge: "Budget" },
  { name: "Tata Punch EV",         price: 999000,  badge: "Popular" },
  { name: "Tata Curvv EV",         price: 1749000, badge: "New" },
  { name: "MG Windsor EV",         price: 1350000, badge: "Popular" },
  { name: "Hyundai Creta EV",      price: 1799000, badge: "Premium" },
  { name: "Mahindra BE 6",         price: 2690000, badge: "New" },
  { name: "MG ZS EV",              price: 1898000, badge: "Popular" },
  { name: "Kia EV6",               price: 6095000, badge: "Luxury" },
  { name: "Ather 450X",            price: 139000,  badge: "Scooter" },
  { name: "Ola S1 Pro",            price: 149999,  badge: "Scooter" },
  { name: "TVS iQube ST",          price: 158000,  badge: "Scooter" },
];

const CONDITION_FACTORS = {
  excellent: 1.0,
  good:      0.93,
  fair:      0.83,
  poor:      0.70,
};

const BRAND_RETENTION = {
  "Tata":    0.72,
  "Hyundai": 0.68,
  "MG":      0.62,
  "Mahindra":0.70,
  "Kia":     0.65,
  "Ather":   0.60,
  "Ola":     0.52,
  "TVS":     0.65,
  default:   0.62,
};

function calcDepreciation(price, years, condition, brand) {
  const brandKey  = Object.keys(BRAND_RETENTION).find(b => brand?.startsWith(b)) || "default";
  const retention = BRAND_RETENTION[brandKey];
  const condF     = CONDITION_FACTORS[condition] || 1;
  const yearlyDecay = (1 - retention) / 5;

  const values = [];
  for (let y = 1; y <= Math.max(years, 5); y++) {
    const factor = Math.max(retention - (yearlyDecay * Math.max(0, y - 5)), 0.3);
    const val    = Math.round(price * factor * (y <= 5 ? 1 - (yearlyDecay * (y - 1)) : 1) * condF);
    values.push({ year: y, value: val, pct: Math.round((val / price) * 100) });
  }
  return values;
}

function fmt(n) { return "₹" + n.toLocaleString("en-IN"); }

function Bar({ pct, year }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-28 w-8 bg-gray-100 rounded-full overflow-hidden flex items-end">
        <div className="w-full rounded-full bg-green-500 transition-all duration-700" style={{ height: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-gray-500 font-semibold">{year}yr</span>
    </div>
  );
}

export default function ResaleClient() {
  const [selected,  setSelected]  = useState(null);
  const [customEV,  setCustomEV]  = useState(false);
  const [price,     setPrice]     = useState(1399000);
  const [years,     setYears]     = useState(3);
  const [condition, setCondition] = useState("good");
  const [brand,     setBrand]     = useState("Tata");

  function pickEV(ev) {
    setSelected(ev);
    setPrice(ev.price);
    setBrand(ev.name.split(" ")[0]);
    setCustomEV(false);
  }

  const depreciation = useMemo(() => calcDepreciation(price, years, condition, brand), [price, years, condition, brand]);
  const targetYear   = depreciation[years - 1];
  const loss         = price - (targetYear?.value || 0);
  const lossPerYear  = Math.round(loss / years);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700 mb-4">
            <TrendingDown size={14} /> Resale Value Calculator
          </div>
          <h1 className="text-3xl font-black text-gray-900">EV Resale & Depreciation Calculator</h1>
          <p className="mt-2 text-gray-500 max-w-xl mx-auto">Find out how much your electric vehicle will be worth in the future — based on brand, condition, and market trends.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Controls */}
          <div className="lg:col-span-3 space-y-5">

            {/* EV selector */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800 mb-3">Select Your EV</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {POPULAR_EVS.map(ev => (
                  <button key={ev.name} onClick={() => pickEV(ev)}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      selected?.name === ev.name && !customEV
                        ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
                    }`}>
                    <p className="text-xs font-semibold text-gray-800 leading-tight">{ev.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{fmt(ev.price)}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setCustomEV(true)}
                className={`w-full rounded-xl border-2 border-dashed py-2.5 text-sm font-semibold transition ${
                  customEV ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-400"
                }`}>
                + Enter custom price
              </button>
              {customEV && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Purchase Price (₹)</label>
                    <input type="number" value={price} min={50000} max={20000000} step={10000}
                      onChange={e => setPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Brand</label>
                    <input value={brand} onChange={e => setBrand(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm space-y-5">
              {/* Years */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Calendar size={13} /> Years of ownership</span>
                  <span className="text-sm font-bold text-green-600">{years} year{years > 1 ? "s" : ""}</span>
                </div>
                <input type="range" min={1} max={10} value={years} onChange={e => setYears(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #16a34a ${(years - 1) / 9 * 100}%, #e5e7eb ${(years - 1) / 9 * 100}%)` }} />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>1 yr</span><span>10 yr</span></div>
              </div>

              {/* Condition */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Vehicle condition at sale</p>
                <div className="grid grid-cols-4 gap-2">
                  {[["excellent","Excellent","🌟"], ["good","Good","✅"], ["fair","Fair","⚠️"], ["poor","Poor","❌"]].map(([val, lbl, icon]) => (
                    <button key={val} onClick={() => setCondition(val)}
                      className={`rounded-xl border py-2.5 text-center text-xs font-semibold transition ${
                        condition === val ? "border-green-500 bg-green-50 text-green-800" : "border-gray-200 text-gray-600 hover:border-green-300"
                      }`}>
                      <div className="text-base mb-0.5">{icon}</div>{lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="lg:col-span-2 space-y-5">
            {/* Main result */}
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-lg">
              <p className="text-sm text-orange-200 mb-1">Estimated Resale Value after {years} year{years > 1 ? "s" : ""}</p>
              <p className="text-5xl font-black">{fmt(targetYear?.value || 0)}</p>
              <p className="text-orange-200 text-sm mt-1">{targetYear?.pct}% of original price</p>
              <div className="mt-4 border-t border-orange-400 pt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-orange-300">Purchase Price</p>
                  <p className="text-lg font-black">{fmt(price)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-orange-300">Total Loss</p>
                  <p className="text-lg font-black">{fmt(loss)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-orange-300">Avg Depreciation / Year</p>
                  <p className="text-lg font-black">{fmt(lossPerYear)}</p>
                </div>
              </div>
            </div>

            {/* Depreciation chart */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <p className="text-sm font-bold text-gray-800 mb-4">Value Over Time</p>
              <div className="flex items-end justify-between gap-1">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-500">Now</span>
                  <div className="h-28 w-8 bg-green-600 rounded-full" />
                  <span className="text-[10px] text-gray-400">0yr</span>
                </div>
                {depreciation.slice(0, 7).map((d, i) => (
                  <Bar key={i} pct={d.pct} year={d.year} />
                ))}
              </div>
              <div className="mt-3 space-y-1.5">
                {depreciation.slice(0, 5).map(d => (
                  <div key={d.year} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">After {d.year} year{d.year > 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{fmt(d.value)}</span>
                      <span className="text-orange-500 font-semibold">(-{100 - d.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
              <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1"><Info size={11} /> Tips to retain resale value</p>
              <ul className="space-y-1 text-xs text-blue-700">
                <li>• Keep battery health above 80%</li>
                <li>• Avoid frequent DC fast charging</li>
                <li>• Regular software updates via OTA</li>
                <li>• Maintain service records</li>
                <li>• Choose popular colors (white/grey)</li>
              </ul>
            </div>
            <Link href="/ev-quiz" className="flex items-center justify-between rounded-2xl bg-white border border-gray-200 p-4 hover:border-green-400 transition shadow-sm">
              <div>
                <p className="font-bold text-gray-800">Not sure which EV to buy?</p>
                <p className="text-xs text-gray-500">Take our free EV quiz</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
