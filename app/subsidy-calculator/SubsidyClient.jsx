"use client";

import { useState, useMemo } from "react";
import { IndianRupee, MapPin, CheckCircle, Info, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

const STATES = [
  {
    name: "Delhi", code: "DL",
    ev2w: 5000,    ev4w: 0,     roadTaxWaiver: true,  regWaiver: true,
    extra: ["₹5,000 scrapping incentive for old vehicle", "Priority EV parking"],
    note: "Delhi offers ₹5,000 for 2W EVs. 4W EV subsidy via FAME II only.",
  },
  {
    name: "Maharashtra", code: "MH",
    ev2w: 10000,   ev4w: 25000, roadTaxWaiver: true,  regWaiver: true,
    extra: ["Free home charger installation subsidy", "₹5 off per unit on EV charging"],
    note: "Maharashtra has one of India's best EV policies.",
  },
  {
    name: "Karnataka", code: "KA",
    ev2w: 10000,   ev4w: 25000, roadTaxWaiver: true,  regWaiver: false,
    extra: ["Bangalore EV cluster support", "Priority permits for EVs"],
    note: "Karnataka waives road tax and offers state subsidy on EVs.",
  },
  {
    name: "Gujarat", code: "GJ",
    ev2w: 20000,   ev4w: 150000, roadTaxWaiver: true,  regWaiver: true,
    extra: ["₹1.5 Lakh subsidy on 4W EVs", "Best EV subsidy in India for 4-wheelers"],
    note: "Gujarat offers India's highest 4-wheeler EV subsidy.",
  },
  {
    name: "Tamil Nadu", code: "TN",
    ev2w: 15000,   ev4w: 0,     roadTaxWaiver: true,  regWaiver: false,
    extra: ["Road tax exemption for 5 years", "TIDCO EV cluster benefits"],
    note: "Tamil Nadu offers strong 2W subsidy and road tax waiver.",
  },
  {
    name: "Telangana", code: "TS",
    ev2w: 10000,   ev4w: 0,     roadTaxWaiver: true,  regWaiver: false,
    extra: ["Hyderabad EV city initiative", "Free permit for EV taxi operators"],
    note: "Telangana has road tax waiver and 2W subsidies.",
  },
  {
    name: "Rajasthan", code: "RJ",
    ev2w: 2500,    ev4w: 10000, roadTaxWaiver: true,  regWaiver: false,
    extra: ["EV charging network expansion"],
    note: "Rajasthan provides modest state subsidies.",
  },
  {
    name: "Uttar Pradesh", code: "UP",
    ev2w: 5000,    ev4w: 100000, roadTaxWaiver: false, regWaiver: false,
    extra: ["100% road tax exemption (limited period)", "Lucknow EV zone discounts"],
    note: "UP offers subsidy under EV Manufacturing & Mobility Policy 2022.",
  },
  {
    name: "Kerala", code: "KL",
    ev2w: 0,       ev4w: 0,     roadTaxWaiver: true,  regWaiver: true,
    extra: ["Green Kerala initiative", "100% road tax exemption"],
    note: "Kerala waives all road tax and registration fees for EVs.",
  },
  {
    name: "West Bengal", code: "WB",
    ev2w: 10000,   ev4w: 0,     roadTaxWaiver: true,  regWaiver: false,
    extra: ["State grid EV incentive"],
    note: "West Bengal offers 2W EV subsidy and road tax waiver.",
  },
  {
    name: "Madhya Pradesh", code: "MP",
    ev2w: 5000,    ev4w: 50000, roadTaxWaiver: true,  regWaiver: false,
    extra: ["MP EV policy 2022 incentives"],
    note: "MP offers state subsidies under its 2022 EV policy.",
  },
  {
    name: "Haryana", code: "HR",
    ev2w: 0,       ev4w: 0,     roadTaxWaiver: true,  regWaiver: true,
    extra: ["Road tax & registration waiver", "Gurugram EV charging hub"],
    note: "Haryana waives road tax and registration for EVs.",
  },
  {
    name: "Punjab", code: "PB",
    ev2w: 0,       ev4w: 0,     roadTaxWaiver: true,  regWaiver: false,
    extra: ["Road tax exemption", "EV Ride sharing incentives"],
    note: "Punjab provides road tax exemption for EVs.",
  },
  {
    name: "Andhra Pradesh", code: "AP",
    ev2w: 10000,   ev4w: 0,     roadTaxWaiver: true,  regWaiver: false,
    extra: ["AP EV policy subsidies"],
    note: "Andhra Pradesh offers 2W subsidy and road tax waiver.",
  },
  {
    name: "Chandigarh", code: "CH",
    ev2w: 0,       ev4w: 0,     roadTaxWaiver: true,  regWaiver: true,
    extra: ["UT-specific EV incentives"],
    note: "Chandigarh UT provides road tax and registration waiver.",
  },
];

const FAME2_4W_MAX = 150000;
const FAME2_2W_MAX = 10000;
const REG_COST_4W  = 25000;
const REG_COST_2W  = 3000;

function parsePrice(str) {
  if (!str) return 0;
  return parseInt(str.replace(/[^0-9]/g, "")) || 0;
}
function fmt(n) { return "₹" + Math.round(n).toLocaleString("en-IN"); }

export default function SubsidyClient() {
  const [state,    setState]    = useState("Maharashtra");
  const [vType,    setVType]    = useState("4w");
  const [exPrice,  setExPrice]  = useState("");
  const [battery,  setBattery]  = useState(40);

  const stateData = STATES.find(s => s.name === state) || STATES[0];

  const calc = useMemo(() => {
    const price  = parsePrice(exPrice);
    const fame2  = vType === "4w" ? Math.min(battery * 10000, FAME2_4W_MAX) : Math.min(battery * 500, FAME2_2W_MAX);
    const stSub  = vType === "4w" ? stateData.ev4w : stateData.ev2w;
    const regSave = stateData.regWaiver ? (vType === "4w" ? REG_COST_4W : REG_COST_2W) : 0;
    const rtPrice  = price || 1000000;
    const rtPct    = vType === "4w" ? 0.04 : 0.015;
    const roadTaxSave = stateData.roadTaxWaiver ? Math.round(rtPrice * rtPct) : 0;
    const total  = fame2 + stSub + regSave + roadTaxSave;
    const netPrice = price ? Math.max(0, price - total) : null;
    return { fame2, stSub, regSave, roadTaxSave, total, netPrice };
  }, [state, vType, exPrice, battery, stateData]);

  const breakdowns = [
    { label: "FAME II Central Subsidy",    value: calc.fame2,       note: `₹${vType === "4w" ? "10,000" : "500"}/kWh · ${battery} kWh battery`, show: calc.fame2 > 0 },
    { label: "State Government Subsidy",   value: calc.stSub,       note: `${stateData.name} EV policy`, show: true },
    { label: "Road Tax Waiver",            value: calc.roadTaxSave, note: "Based on ex-showroom price", show: stateData.roadTaxWaiver },
    { label: "Registration Fee Waiver",    value: calc.regSave,     note: "One-time registration saving", show: stateData.regWaiver },
  ].filter(b => b.show);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 mb-4">
            <IndianRupee size={14} /> Subsidy Calculator
          </div>
          <h1 className="text-3xl font-black text-gray-900">EV Subsidy Calculator India 2026</h1>
          <p className="mt-2 text-gray-500 max-w-xl mx-auto">Calculate FAME II + your state subsidy, road tax waiver, and registration savings.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Controls */}
          <div className="lg:col-span-3 space-y-5">

            {/* Vehicle type */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800 mb-3">Vehicle Type</h2>
              <div className="grid grid-cols-2 gap-3">
                {[["4w","🚗 Electric Car / SUV"], ["2w","🛵 Electric Scooter / Bike"]].map(([val, lbl]) => (
                  <button key={val} onClick={() => setVType(val)}
                    className={`rounded-xl border py-3 text-sm font-semibold transition ${
                      vType === val ? "border-blue-500 bg-blue-50 text-blue-800" : "border-gray-200 text-gray-600 hover:border-blue-300"
                    }`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* State selector */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><MapPin size={14} className="text-blue-600" /> Select Your State</h2>
              <div className="grid grid-cols-3 gap-2">
                {STATES.map(s => (
                  <button key={s.name} onClick={() => setState(s.name)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold text-left transition ${
                      state === s.name ? "border-blue-500 bg-blue-50 text-blue-800" : "border-gray-200 text-gray-600 hover:border-blue-300"
                    }`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Battery + price */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Zap size={13} className="text-blue-600" /> Battery Capacity</span>
                  <span className="text-sm font-bold text-blue-600">{battery} kWh</span>
                </div>
                <input type="range" min={2} max={100} value={battery} onChange={e => setBattery(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #2563eb ${(battery - 2) / 98 * 100}%, #e5e7eb ${(battery - 2) / 98 * 100}%)` }} />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>2 kWh</span><span>100 kWh</span></div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Ex-Showroom Price (optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input type="text" value={exPrice} onChange={e => setExPrice(e.target.value)}
                    placeholder="e.g. 1399000"
                    className="w-full rounded-xl border border-gray-200 pl-7 pr-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Needed for road tax calculation</p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
              <p className="text-sm text-blue-200 mb-1">Total EV Savings</p>
              <p className="text-5xl font-black">{fmt(calc.total)}</p>
              {calc.netPrice !== null && (
                <p className="text-blue-200 mt-2 text-sm">Net price: <span className="font-black text-white">{fmt(calc.netPrice)}</span></p>
              )}
            </div>

            {/* Breakdown */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <p className="text-sm font-bold text-gray-800 mb-3">Subsidy Breakdown</p>
              <div className="space-y-2">
                {breakdowns.map(b => (
                  <div key={b.label} className="flex items-start justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{b.label}</p>
                        <p className="text-[10px] text-gray-400">{b.note}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-green-600 shrink-0">+{fmt(b.value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* State extras */}
            {stateData.extra?.length > 0 && (
              <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-xs font-bold text-blue-800 mb-2">More benefits in {stateData.name}</p>
                <ul className="space-y-1">
                  {stateData.extra.map((e, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-blue-700">
                      <CheckCircle size={10} className="shrink-0 mt-0.5 text-blue-500" /> {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
              <Info size={13} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700">{stateData.note} Subsidies subject to annual policy updates — verify with dealer.</p>
            </div>

            <Link href="/range-calculator" className="flex items-center justify-between rounded-2xl bg-white border border-gray-200 p-4 hover:border-blue-400 transition shadow-sm">
              <div>
                <p className="font-bold text-gray-800">Check Real-World Range</p>
                <p className="text-xs text-gray-500">EV Range Calculator →</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
