"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BatteryCharging, Thermometer, Wind, Gauge, Car, Zap, ChevronRight, Info } from "lucide-react";

const POPULAR_EVS = [
  { name: "Tata Nexon EV",        battery: 40.5, certifiedRange: 465 },
  { name: "Tata Tiago EV",        battery: 24,   certifiedRange: 315 },
  { name: "Tata Punch EV",        battery: 35,   certifiedRange: 421 },
  { name: "Tata Curvv EV",        battery: 55,   certifiedRange: 585 },
  { name: "MG Windsor EV",        battery: 38,   certifiedRange: 331 },
  { name: "MG Comet EV",          battery: 17.3, certifiedRange: 230 },
  { name: "Mahindra BE 6",        battery: 79,   certifiedRange: 682 },
  { name: "Hyundai Creta EV",     battery: 51.4, certifiedRange: 473 },
  { name: "Ola S1 Pro",           battery: 4,    certifiedRange: 195 },
  { name: "Ather 450X",           battery: 3.7,  certifiedRange: 150 },
  { name: "TVS iQube ST",         battery: 5.1,  certifiedRange: 145 },
  { name: "Bajaj Chetak",         battery: 3.2,  certifiedRange: 113 },
];

const SPEED_FACTORS   = { city: 1.0,  highway: 0.78, mixed: 0.90 };
const AC_FACTORS      = { off: 1.0,   low: 0.93,     high: 0.82  };
const WEATHER_FACTORS = { optimal: 1.0, hot: 0.88,   cold: 0.80  };
const LOAD_FACTORS    = { solo: 1.0,  two: 0.97,     full: 0.90  };

function Slider({ label, value, min, max, step = 1, unit, onChange, icon: Icon, color = "green" }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          {Icon && <Icon size={14} className={`text-${color}-600`} />} {label}
        </span>
        <span className={`text-sm font-bold text-${color}-600`}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #16a34a ${pct}%, #e5e7eb ${pct}%)` }} />
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function OptionGroup({ label, value, onChange, options }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
              value === opt.value
                ? "bg-green-600 text-white border-green-600"
                : "border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
            }`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RangeCalculatorClient() {
  const [selectedEV,  setSelectedEV]  = useState(POPULAR_EVS[0]);
  const [customBat,   setCustomBat]   = useState(false);
  const [battery,     setBattery]     = useState(40.5);
  const [certified,   setCertified]   = useState(465);
  const [soc,         setSoc]         = useState(90);
  const [speed,       setSpeed]       = useState("mixed");
  const [ac,          setAc]          = useState("low");
  const [weather,     setWeather]     = useState("hot");
  const [load,        setLoad]        = useState("solo");

  function pickEV(ev) {
    setSelectedEV(ev);
    setBattery(ev.battery);
    setCertified(ev.certifiedRange);
    setCustomBat(false);
  }

  const result = useMemo(() => {
    const usableSoc  = soc / 100;
    const speedF     = SPEED_FACTORS[speed];
    const acF        = AC_FACTORS[ac];
    const weatherF   = WEATHER_FACTORS[weather];
    const loadF      = LOAD_FACTORS[load];
    const realWorld  = Math.round(certified * 0.78 * speedF * acF * weatherF * loadF * usableSoc);
    const perKwh     = (certified / battery).toFixed(1);
    const cost100km  = ((100 / (certified / battery)) * 8).toFixed(0);
    const minRange   = Math.round(realWorld * 0.90);
    const maxRange   = Math.round(realWorld * 1.08);
    return { realWorld, perKwh, cost100km, minRange, maxRange };
  }, [battery, certified, soc, speed, ac, weather, load]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 mb-4">
            <BatteryCharging size={14} /> EV Range Calculator
          </div>
          <h1 className="text-3xl font-black text-gray-900">How Far Will Your EV Go?</h1>
          <p className="mt-2 text-gray-500 max-w-xl mx-auto">
            Get real-world range estimate based on driving conditions, AC usage, weather and passenger load in Indian conditions.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Controls */}
          <div className="lg:col-span-3 space-y-5">

            {/* EV Selector */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-bold text-gray-800 flex items-center gap-2"><Car size={15} className="text-green-600" /> Select Your EV</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {POPULAR_EVS.map(ev => (
                  <button key={ev.name} onClick={() => pickEV(ev)}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      selectedEV.name === ev.name && !customBat
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-gray-200 text-gray-700 hover:border-green-300"
                    }`}>
                    <p className="text-xs font-semibold leading-tight">{ev.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{ev.battery} kWh · {ev.certifiedRange} km</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setCustomBat(true)}
                className={`w-full rounded-xl border-2 border-dashed py-2.5 text-sm font-semibold transition ${
                  customBat ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-400"
                }`}>
                + Enter custom specs
              </button>
              {customBat && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Battery (kWh)</label>
                    <input type="number" min={5} max={150} step={0.5} value={battery}
                      onChange={e => setBattery(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">ARAI Range (km)</label>
                    <input type="number" min={50} max={900} step={5} value={certified}
                      onChange={e => setCertified(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Sliders */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm space-y-5">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Gauge size={15} className="text-green-600" /> Driving Conditions</h2>
              <Slider label="Battery charge level" value={soc} min={10} max={100} unit="%" icon={BatteryCharging} onChange={setSoc} />
              <OptionGroup label="🚗 Drive type" value={speed} onChange={setSpeed} options={[
                { value: "city", label: "City" },
                { value: "mixed", label: "Mixed" },
                { value: "highway", label: "Highway" },
              ]} />
              <OptionGroup label="❄️ AC usage" value={ac} onChange={setAc} options={[
                { value: "off", label: "AC Off" },
                { value: "low", label: "Low" },
                { value: "high", label: "Full Blast" },
              ]} />
              <OptionGroup label="🌡️ Weather" value={weather} onChange={setWeather} options={[
                { value: "optimal", label: "Mild (22°C)" },
                { value: "hot", label: "Hot (40°C)" },
                { value: "cold", label: "Cold (10°C)" },
              ]} />
              <OptionGroup label="👥 Passenger load" value={load} onChange={setLoad} options={[
                { value: "solo", label: "Solo" },
                { value: "two", label: "2 People" },
                { value: "full", label: "Full (4-5)" },
              ]} />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-5">
            {/* Main result */}
            <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white shadow-lg">
              <p className="text-sm font-semibold text-green-200 mb-1">Estimated Real-World Range</p>
              <p className="text-6xl font-black">{result.realWorld}</p>
              <p className="text-green-200 text-lg">km</p>
              <p className="mt-2 text-xs text-green-300">Range: {result.minRange}–{result.maxRange} km depending on traffic</p>
              <div className="mt-4 border-t border-green-500 pt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-green-300">ARAI Certified</p>
                  <p className="text-xl font-black">{certified} km</p>
                </div>
                <div>
                  <p className="text-[10px] text-green-300">Efficiency</p>
                  <p className="text-xl font-black">{result.perKwh} km/kWh</p>
                </div>
              </div>
            </div>

            {/* Cost card */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Zap size={15} className="text-yellow-500" /> Running Cost</h3>
              <div className="space-y-3">
                {[
                  { label: "Cost per 100 km", value: `₹${result.cost100km}`, sub: "@ ₹8/unit avg." },
                  { label: "Cost per km",     value: `₹${(result.cost100km / 100).toFixed(2)}`, sub: "vs ₹7–10 petrol" },
                  { label: "Monthly (1500 km)", value: `₹${Math.round(result.cost100km / 100 * 1500)}`, sub: "petrol would be ₹12,000+" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      <p className="text-[10px] text-gray-400">{item.sub}</p>
                    </div>
                    <p className="text-lg font-black text-green-600">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
              <p className="text-xs font-bold text-blue-800 flex items-center gap-1 mb-2"><Info size={12} /> Tips to maximise range</p>
              <ul className="space-y-1 text-xs text-blue-700">
                <li>• Pre-cool car while plugged in</li>
                <li>• Drive at 60–80 km/h on highways</li>
                <li>• Use regenerative braking mode</li>
                <li>• Keep tyres at recommended pressure</li>
                <li>• Charge to 80% for daily use</li>
              </ul>
            </div>

            <Link href="/compare" className="flex items-center justify-between rounded-2xl bg-white border border-gray-200 p-4 hover:border-green-400 transition shadow-sm">
              <div>
                <p className="font-bold text-gray-800">Compare EVs</p>
                <p className="text-xs text-gray-500">Side-by-side range comparison</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
