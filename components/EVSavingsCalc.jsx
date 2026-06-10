"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Zap, Fuel, TrendingDown, IndianRupee, Leaf } from "lucide-react";

const FUEL_TYPES = [
  { id: "petrol", label: "Petrol",  priceDefault: 103, effDefault: 15 },
  { id: "diesel", label: "Diesel",  priceDefault: 90,  effDefault: 18 },
  { id: "cng",    label: "CNG",     priceDefault: 80,  effDefault: 25 },
];

export default function EVSavingsCalc() {
  const [fuelType,    setFuelType]    = useState("petrol");
  const [fuelPrice,   setFuelPrice]   = useState(103);
  const [fuelEff,     setFuelEff]     = useState(15);
  const [kmPerMonth,  setKmPerMonth]  = useState(1500);
  const [evEfficiency,setEvEfficiency]= useState(6);
  const [elecRate,    setElecRate]    = useState(8);
  const [maintenanceSaving, setMaintenance] = useState(3000);

  const fuel = FUEL_TYPES.find(f => f.id === fuelType);

  const handleFuelChange = (id) => {
    const f = FUEL_TYPES.find(x => x.id === id);
    setFuelType(id);
    setFuelPrice(f.priceDefault);
    setFuelEff(f.effDefault);
  };

  const { monthlySaving, yearlySaving, fuelCostMonthly, evCostMonthly, breakEvenMonths, co2Saved } = useMemo(() => {
    const fuelCostMonthly = (kmPerMonth / fuelEff) * fuelPrice;
    const evCostMonthly   = (kmPerMonth / evEfficiency) * elecRate;
    const monthlySaving   = fuelCostMonthly - evCostMonthly + maintenanceSaving / 12;
    const yearlySaving    = monthlySaving * 12;
    const avgEvPrice      = 1200000;
    const breakEvenMonths = monthlySaving > 0 ? Math.ceil(avgEvPrice / monthlySaving) : null;
    const co2PerLitre     = fuelType === "diesel" ? 2.68 : 2.31;
    const litresPerMonth  = kmPerMonth / fuelEff;
    const co2Saved        = Math.round(litresPerMonth * co2PerLitre * 12);
    return { monthlySaving, yearlySaving, fuelCostMonthly, evCostMonthly, breakEvenMonths, co2Saved };
  }, [fuelType, fuelPrice, fuelEff, kmPerMonth, evEfficiency, elecRate, maintenanceSaving]);

  const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-green-600">EV Savings Calculator</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">EV Savings Calculator</h1>
          <p className="mt-2 text-gray-500">Find out exactly how much you save monthly by switching to an electric vehicle in India.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Inputs */}
          <div className="space-y-6">
            {/* Current vehicle */}
            <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
              <h2 className="flex items-center gap-2 font-black text-gray-900">
                <Fuel size={18} className="text-orange-500" /> Your Current Vehicle
              </h2>

              <div className="flex gap-2">
                {FUEL_TYPES.map(f => (
                  <button key={f.id} onClick={() => handleFuelChange(f.id)}
                    className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                      fuelType === f.id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>

              <Slider label={`Fuel Price (₹/litre)`} value={fuelPrice} min={60} max={150} step={1}
                onChange={setFuelPrice} display={`₹${fuelPrice}/L`} />
              <Slider label={`Fuel Efficiency`} value={fuelEff} min={8} max={30} step={0.5}
                onChange={setFuelEff} display={`${fuelEff} km/L`} />
            </div>

            {/* Usage */}
            <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
              <h2 className="font-black text-gray-900">Monthly Usage</h2>
              <Slider label="Distance Driven" value={kmPerMonth} min={500} max={5000} step={100}
                onChange={setKmPerMonth} display={`${kmPerMonth.toLocaleString("en-IN")} km/mo`} />
            </div>

            {/* EV inputs */}
            <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
              <h2 className="flex items-center gap-2 font-black text-gray-900">
                <Zap size={18} className="text-green-500" /> Electric Vehicle
              </h2>
              <Slider label="EV Efficiency" value={evEfficiency} min={3} max={12} step={0.5}
                onChange={setEvEfficiency} display={`${evEfficiency} km/kWh`} />
              <Slider label="Electricity Rate" value={elecRate} min={4} max={15} step={0.5}
                onChange={setElecRate} display={`₹${elecRate}/kWh`} />
              <Slider label="Annual Maintenance Savings" value={maintenanceSaving} min={0} max={20000} step={500}
                onChange={setMaintenance} display={`₹${maintenanceSaving.toLocaleString("en-IN")}/yr`} />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4 lg:self-start lg:sticky lg:top-24">
            <div className="rounded-2xl bg-green-600 p-5 text-white">
              <p className="text-sm font-semibold text-green-100 mb-1">Monthly Savings</p>
              <p className="text-4xl font-black">{fmt(monthlySaving)}</p>
              <p className="mt-1 text-sm text-green-200">= {fmt(yearlySaving)} per year</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Petrol cost/month</span>
                <span className="font-bold text-red-600">{fmt(fuelCostMonthly)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">EV charging cost/month</span>
                <span className="font-bold text-green-700">{fmt(evCostMonthly)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Maintenance savings/month</span>
                <span className="font-bold text-green-700">+{fmt(maintenanceSaving / 12)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-bold">
                <span className="text-gray-700">Net monthly saving</span>
                <span className={monthlySaving >= 0 ? "text-green-700" : "text-red-600"}>{fmt(monthlySaving)}</span>
              </div>
            </div>

            {breakEvenMonths && (
              <div className="rounded-2xl bg-blue-50 p-4 text-sm">
                <p className="font-bold text-blue-800 flex items-center gap-2">
                  <TrendingDown size={16} /> Break-even in ~{breakEvenMonths} months
                </p>
                <p className="mt-1 text-blue-600 text-xs">Based on avg. EV price of ₹12 Lakh</p>
              </div>
            )}

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="font-bold text-emerald-800 flex items-center gap-2 text-sm">
                <Leaf size={16} /> {co2Saved} kg CO₂ saved/year
              </p>
              <p className="mt-1 text-emerald-600 text-xs">By switching to EV you reduce your carbon footprint</p>
            </div>

            <Link href="/cars"
              className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 text-sm font-bold text-white transition hover:bg-green-700">
              Browse Electric Cars <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, display }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
        <span>{label}</span>
        <span className="text-green-600">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full accent-green-600" />
    </div>
  );
}
