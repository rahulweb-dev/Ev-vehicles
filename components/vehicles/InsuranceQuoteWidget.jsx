"use client";

import { useState } from "react";
import { Shield, ChevronDown, ChevronUp, ExternalLink, CheckCircle, Info } from "lucide-react";

const INSURERS = [
  { name: "Tata AIG",      logo: "TA", evDiscount: "15%", cashless: "5000+", claim: "98.5%", color: "bg-blue-600"   },
  { name: "HDFC ERGO",     logo: "HE", evDiscount: "12%", cashless: "7000+", claim: "97.8%", color: "bg-red-600"    },
  { name: "Bajaj Allianz", logo: "BA", evDiscount: "10%", cashless: "6500+", claim: "98.0%", color: "bg-orange-500" },
  { name: "ICICI Lombard", logo: "IL", evDiscount: "8%",  cashless: "5500+", claim: "97.2%", color: "bg-purple-600" },
];

function estimatePremium(priceStr, coverage) {
  if (!priceStr) return null;
  const numStr = priceStr.replace(/[^0-9.]/g, "");
  const price  = parseFloat(numStr);
  if (!price || price < 1000) return null;
  const base   = price * (coverage === "comprehensive" ? 0.028 : 0.014);
  const evDisc = base * 0.12;
  return Math.round(base - evDisc);
}

export default function InsuranceQuoteWidget({ vehicleName = "", exShowroom = "" }) {
  const [open,     setOpen]     = useState(false);
  const [coverage, setCoverage] = useState("comprehensive");
  const [ncb,      setNcb]      = useState("0");

  const base     = estimatePremium(exShowroom, coverage);
  const ncbPct   = parseInt(ncb) / 100;
  const premium  = base ? Math.round(base * (1 - ncbPct)) : null;

  return (
    <div className="rounded-2xl border border-blue-100 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Shield size={18} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">Insurance Quote</p>
            {premium
              ? <p className="text-xs text-blue-600 font-semibold">Est. ₹{premium.toLocaleString("en-IN")}/yr</p>
              : <p className="text-xs text-gray-400">Get instant estimate</p>
            }
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Coverage type */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Coverage Type</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "comprehensive", label: "Comprehensive", desc: "Full coverage" },
                { id: "third-party",   label: "Third Party",   desc: "Mandatory only" },
              ].map(opt => (
                <button key={opt.id} onClick={() => setCoverage(opt.id)}
                  className={`rounded-xl border p-2.5 text-left transition ${
                    coverage === opt.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}>
                  <p className="text-xs font-bold text-gray-800">{opt.label}</p>
                  <p className="text-[10px] text-gray-400">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* NCB */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">No Claim Bonus (NCB)</p>
            <div className="flex flex-wrap gap-1.5">
              {[["0","New"], ["20","1 yr"], ["25","2 yr"], ["35","3 yr"], ["45","4 yr"], ["50","5 yr+"]].map(([val, lbl]) => (
                <button key={val} onClick={() => setNcb(val)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                    ncb === val
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-blue-400"
                  }`}>
                  {lbl} {val !== "0" && <span className="opacity-75">-{val}%</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Estimate banner */}
          {premium ? (
            <div className="rounded-xl bg-blue-600 p-3 text-white">
              <p className="text-xs text-blue-200">Estimated Annual Premium</p>
              <p className="text-2xl font-black">₹{premium.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-blue-300 mt-0.5 flex items-center gap-1">
                <Info size={10} /> 12% EV discount applied · Indicative only
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">Add vehicle price to see estimate</p>
          )}

          {/* Insurer cards */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Top Insurers for EVs</p>
            <div className="space-y-2">
              {INSURERS.map(ins => (
                <div key={ins.name} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`${ins.color} flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black text-white`}>
                      {ins.logo}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{ins.name}</p>
                      <p className="text-[10px] text-gray-400">{ins.cashless} cashless garages</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-green-600">{ins.evDiscount} off</p>
                    <p className="text-[10px] text-gray-400">{ins.claim} claim</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="rounded-xl bg-green-50 border border-green-100 p-3">
            <p className="text-[10px] font-bold text-green-800 mb-1.5">Why insure your EV separately?</p>
            <ul className="space-y-1">
              {[
                "Battery pack coverage (theft/damage)",
                "Charging equipment protection",
                "Zero depreciation on EV parts",
                "Roadside assistance for charge-outs",
              ].map(item => (
                <li key={item} className="flex items-center gap-1.5 text-[10px] text-green-700">
                  <CheckCircle size={9} className="shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <a
            href={`https://www.policybazaar.com/motor-insurance/car-insurance/?utm_source=evradar&q=${encodeURIComponent(vehicleName)}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition"
          >
            Get Free Quotes <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
