"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, ChevronRight, BatteryCharging, Info,
  Building2, FileText, Shield, Car,
} from "lucide-react";

function parsePrice(str) {
  if (!str) return 0;
  const n = str.replace(/[^0-9.]/g, "");
  return parseFloat(n) || 0;
}

function fmt(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

const INSURANCE_BASE = 0.028;
const EV_INS_DISC    = 0.12;

export default function CityPriceClient({ vehicle, cityData, allCities }) {
  const [activeVariant, setActiveVariant] = useState(0);
  const variant  = vehicle.variants?.[activeVariant];
  const year     = new Date().getFullYear();

  const prices = useMemo(() => {
    const ex    = parsePrice(variant?.exShowroomPrice);
    if (!ex) return null;

    const reg   = Math.round(ex * cityData.regPct);
    const ins   = Math.round(ex * INSURANCE_BASE * (1 - EV_INS_DISC));
    const smart = 1500;
    const fast  = ex > 1500000 ? 8500 : 5500;
    const misc  = 3500;
    const total = ex + reg + ins + smart + fast + misc;

    return { ex, reg, ins, smart, fast, misc, total };
  }, [variant, cityData]);

  const rows = prices ? [
    { label: "Ex-Showroom Price",        value: fmt(prices.ex),    icon: Car,      note: "Base price before taxes" },
    { label: `RTO & Registration (${Math.round(cityData.regPct * 100)}%)`, value: fmt(prices.reg), icon: FileText, note: `${cityData.state} road tax` },
    { label: "Insurance (1 yr)",         value: fmt(prices.ins),   icon: Shield,   note: "12% EV discount applied" },
    { label: "Smart Card / HP Charges",  value: fmt(prices.smart), icon: FileText, note: "" },
    { label: "Fast Charging Accessories",value: fmt(prices.fast),  icon: BatteryCharging, note: "Home charger installation" },
    { label: "Handling / Logistics",     value: fmt(prices.misc),  icon: Building2, note: "Dealer logistics charges" },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <ChevronRight size={12} />
          <Link href="/cars" className="hover:text-gray-600">Electric Cars</Link>
          <ChevronRight size={12} />
          <Link href={`/cars/${vehicle.slug}`} className="hover:text-gray-600">{vehicle.name}</Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-medium">Price in {cityData.name}</span>
        </nav>

        {/* Hero */}
        <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-green-300" />
                  <span className="text-sm text-green-200 font-semibold">{cityData.name}, {cityData.state}</span>
                </div>
                <h1 className="text-2xl font-black">{vehicle.name}</h1>
                <p className="text-green-200 text-sm mt-1">On-Road Price {year}</p>
              </div>
              {vehicle.featuredImage && (
                <div className="relative h-24 w-40 shrink-0 hidden sm:block">
                  <Image src={vehicle.featuredImage} alt={vehicle.name} fill className="object-contain" />
                </div>
              )}
            </div>
            {prices && (
              <div className="mt-4 pt-4 border-t border-green-500">
                <p className="text-green-300 text-xs mb-1">Total On-Road Price</p>
                <p className="text-4xl font-black">{fmt(prices.total)}</p>
              </div>
            )}
          </div>

          {/* Variant selector */}
          {vehicle.variants?.length > 1 && (
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">Select Variant</p>
              <div className="flex flex-wrap gap-2">
                {vehicle.variants.map((v, i) => (
                  <button key={i} onClick={() => setActiveVariant(i)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      activeVariant === i
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-gray-200 text-gray-600 hover:border-green-400"
                    }`}>
                    {v.name || `Variant ${i + 1}`}
                    {v.exShowroomPrice && <span className="ml-1 text-gray-400">{v.exShowroomPrice}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price breakdown */}
          {prices ? (
            <div className="p-4">
              <p className="text-sm font-bold text-gray-700 mb-3">Price Breakdown in {cityData.name}</p>
              <div className="space-y-2">
                {rows.map(row => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Icon size={14} className="text-gray-400 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{row.label}</p>
                          {row.note && <p className="text-[10px] text-gray-400">{row.note}</p>}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{row.value}</p>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between rounded-xl bg-green-600 px-4 py-3 text-white mt-1">
                  <p className="font-bold">Total On-Road Price</p>
                  <p className="text-lg font-black">{fmt(prices.total)}</p>
                </div>
              </div>
              <p className="mt-3 flex items-start gap-1 text-[10px] text-gray-400">
                <Info size={10} className="shrink-0 mt-0.5" />
                Prices are indicative. Actual charges may vary by dealer. Check with your nearest authorized dealer for exact on-road pricing.
              </p>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm">Price data not available for this variant.</div>
          )}
        </div>

        {/* Key specs */}
        {vehicle.performance && (
          <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-5 mb-6">
            <p className="text-sm font-bold text-gray-800 mb-3">Key Specifications</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "ARAI Range",  value: vehicle.performance?.drivingRange },
                { label: "Power",       value: vehicle.performance?.power },
                { label: "Top Speed",   value: vehicle.performance?.topSpeed },
                { label: "0-100 km/h",  value: vehicle.performance?.acceleration },
              ].filter(s => s.value).map(spec => (
                <div key={spec.label} className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-400">{spec.label}</p>
                  <p className="font-black text-gray-900 text-sm mt-0.5">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other cities */}
        <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-3">{vehicle.name} Price in Other Cities</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allCities
              .filter(c => c.slug !== cityData.slug)
              .map(c => {
                const ex   = parsePrice(variant?.exShowroomPrice);
                const onrd = ex ? Math.round(ex * (1 + c.regPct + INSURANCE_BASE * (1 - EV_INS_DISC) / ex + 0.03)) : null;
                return (
                  <Link key={c.slug}
                    href={`/cars/${vehicle.slug}/price-in-${c.slug}`}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5 hover:border-green-400 transition">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-xs font-semibold text-gray-800">{c.name}</span>
                    </div>
                    <ChevronRight size={12} className="text-gray-300" />
                  </Link>
                );
              })}
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href={`/cars/${vehicle.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700">
            View Full {vehicle.name} Details <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
