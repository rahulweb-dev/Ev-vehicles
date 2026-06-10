"use client";

import { useState } from "react";
import { MapPin, ChevronDown, ChevronUp, Info } from "lucide-react";

const STATES = [
  { name: "Maharashtra",      rto: 11, green: 0    },
  { name: "Delhi",            rto: 4,  green: 0    },
  { name: "Karnataka",        rto: 13, green: 0    },
  { name: "Tamil Nadu",       rto: 10, green: 0    },
  { name: "Gujarat",          rto: 6,  green: 0    },
  { name: "Telangana",        rto: 9,  green: 0    },
  { name: "Rajasthan",        rto: 6,  green: 0    },
  { name: "Uttar Pradesh",    rto: 8,  green: 0    },
  { name: "West Bengal",      rto: 7,  green: 0    },
  { name: "Madhya Pradesh",   rto: 8,  green: 0    },
  { name: "Kerala",           rto: 6,  green: 0    },
  { name: "Punjab",           rto: 3,  green: 0    },
  { name: "Haryana",          rto: 4,  green: 0    },
  { name: "Andhra Pradesh",   rto: 2,  green: 0    },
  { name: "Odisha",           rto: 6,  green: 0    },
  { name: "Bihar",            rto: 5,  green: 0    },
  { name: "Jharkhand",        rto: 7,  green: 0    },
  { name: "Uttarakhand",      rto: 4,  green: 0    },
  { name: "Himachal Pradesh", rto: 3,  green: 0    },
  { name: "Chhattisgarh",     rto: 6,  green: 0    },
  { name: "Assam",            rto: 4,  green: 0    },
  { name: "Goa",              rto: 3,  green: 0    },
  { name: "Chandigarh (UT)",  rto: 2,  green: 0    },
];

function parsePriceToNumber(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[₹,\s]/g, "").toLowerCase();
  const match = cleaned.match(/([\d.]+)\s*(lakh|l|cr|crore)?/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2] || "";
  if (unit.startsWith("cr")) return num * 10000000;
  if (unit === "lakh" || unit === "l") return num * 100000;
  return num;
}

const INSURANCE_RATE = 0.025;
const HANDLING_CHARGES = 8000;
const FAST_TAG = 500;

export default function OnRoadPrice({ exShowroom = "" }) {
  const [open, setOpen]     = useState(false);
  const [state, setState]   = useState("Maharashtra");

  const exShowroomNum = parsePriceToNumber(exShowroom);
  const selectedState = STATES.find(s => s.name === state) || STATES[0];
  const rto           = Math.round(exShowroomNum * selectedState.rto / 100);
  const insurance     = Math.round(exShowroomNum * INSURANCE_RATE);
  const onRoad        = exShowroomNum + rto + insurance + HANDLING_CHARGES + FAST_TAG;

  const fmt = (n) => "₹" + n.toLocaleString("en-IN");

  if (!exShowroomNum) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
      >
        <div className="flex items-center gap-2.5">
          <MapPin size={18} className="text-blue-600" />
          <span className="font-bold text-gray-900">On-Road Price</span>
          {!open && (
            <span className="text-sm font-semibold text-blue-600">{fmt(onRoad)} ({state})</span>
          )}
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-gray-600">Select State</span>
            <select value={state} onChange={e => setState(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500">
              {STATES.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </label>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-600">Ex-Showroom Price</span>
              <span className="font-semibold text-gray-900">{fmt(exShowroomNum)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-600">RTO ({selectedState.rto}%)</span>
              <span className="font-semibold text-gray-900">{fmt(rto)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-600">Insurance (est.)</span>
              <span className="font-semibold text-gray-900">{fmt(insurance)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-600">Handling Charges</span>
              <span className="font-semibold text-gray-900">{fmt(HANDLING_CHARGES)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-600">FASTag</span>
              <span className="font-semibold text-gray-900">{fmt(FAST_TAG)}</span>
            </div>
            <div className="flex justify-between py-2 rounded-xl bg-blue-50 px-3">
              <span className="font-bold text-gray-900">On-Road Price</span>
              <span className="text-lg font-black text-blue-700">{fmt(onRoad)}</span>
            </div>
          </div>

          <div className="flex gap-1.5 rounded-xl bg-amber-50 px-3 py-2.5">
            <Info size={14} className="shrink-0 mt-0.5 text-amber-500" />
            <p className="text-[11px] text-amber-700">EV registration fee is waived / reduced in most states. RTO shown is indicative — confirm with your dealer for exact charges.</p>
          </div>
        </div>
      )}
    </div>
  );
}
