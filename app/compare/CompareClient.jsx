"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Plus,
  ArrowLeft,
  BatteryCharging,
  Gauge,
  Zap,
  Star,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { electricCars } from "@/data/vehiclesData";
import { electricBikes } from "@/data/vehiclesData";

const MAX = 3;

const CAR_SPECS = [
  { label: "Price Range", path: "priceDisplay" },
  { label: "Battery", path: "specs.battery" },
  { label: "Certified Range", path: "specs.range_certified" },
  { label: "Real World Range", path: "specs.real_range" },
  { label: "Motor Power", path: "specs.motor" },
  { label: "Torque", path: "specs.torque" },
  { label: "Top Speed", path: "specs.top_speed" },
  { label: "0–100 km/h", path: "specs.acceleration" },
  { label: "AC Charging", path: "specs.charging_ac" },
  { label: "DC Fast Charging", path: "specs.charging_dc" },
  { label: "Seating", path: "specs.seating" },
  { label: "Boot Space", path: "specs.boot_space" },
  { label: "Ground Clearance", path: "specs.ground_clearance" },
  { label: "Kerb Weight", path: "specs.kerb_weight" },
  { label: "Drive Type", path: "specs.drive_type" },
  { label: "Tyre Size", path: "specs.tyre_size" },
  { label: "Vehicle Warranty", path: "specs.warranty_vehicle" },
  { label: "Battery Warranty", path: "specs.warranty_battery" },
];

const BIKE_SPECS = [
  { label: "Price Range", path: "priceDisplay" },
  { label: "Battery", path: "specs.battery" },
  { label: "Certified Range", path: "specs.range_certified" },
  { label: "Real World Range", path: "specs.real_range" },
  { label: "Motor Power", path: "specs.motor" },
  { label: "Torque", path: "specs.torque" },
  { label: "Top Speed", path: "specs.top_speed" },
  { label: "Acceleration", path: "specs.acceleration" },
  { label: "Charging Time", path: "specs.charging_time" },
  { label: "Charger Type", path: "specs.charger_type" },
  { label: "Seating", path: "specs.seating" },
  { label: "Kerb Weight", path: "specs.kerb_weight" },
  { label: "Tyre Size", path: "specs.tyre_size" },
  { label: "Vehicle Warranty", path: "specs.warranty_vehicle" },
  { label: "Battery Warranty", path: "specs.warranty_battery" },
];

function getVal(obj, path) {
  const val = path.split(".").reduce((acc, k) => acc?.[k], obj);
  if (val === undefined || val === null || val === "") return "—";
  return String(val);
}

function SlotCard({ vehicle, type, onRemove, onAdd, isEmpty }) {
  if (isEmpty) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-4 transition hover:border-green-400">
        <button
          onClick={onAdd}
          className="flex flex-col items-center gap-2 text-gray-400 hover:text-green-600 transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 hover:bg-green-50 transition">
            <Plus size={22} />
          </div>
          <span className="text-sm font-semibold">Add Vehicle</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => onRemove(vehicle.id)}
        className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-1.5 text-red-400 shadow-sm hover:bg-red-50 transition"
      >
        <X size={15} />
      </button>

      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={vehicle.image}
          alt={vehicle.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute bottom-2 left-3 rounded-full bg-[#00a651] px-2.5 py-0.5 text-[10px] font-bold text-white">
          {vehicle.tag}
        </span>
      </div>

      <div className="p-4">
        <p className="text-[11px] font-semibold text-[#00a651]">{vehicle.brand}</p>
        <h3 className="mt-0.5 text-sm font-black text-gray-900 leading-tight">{vehicle.name}</h3>
        <p className="mt-1 text-base font-black text-[#111]">{vehicle.priceDisplay}</p>
        <div className="mt-2 flex items-center gap-1">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-700">{vehicle.rating}</span>
          <span className="text-[10px] text-gray-400">({vehicle.reviewCount?.toLocaleString()})</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <div className="rounded-xl bg-green-50 p-2 text-center">
            <BatteryCharging size={12} className="mx-auto mb-0.5 text-green-600" />
            <p className="text-[9px] text-gray-500">Range</p>
            <p className="text-[10px] font-black text-gray-800 leading-tight">
              {vehicle.specs?.range_certified?.split(" (")[0] || "—"}
            </p>
          </div>
          <div className="rounded-xl bg-blue-50 p-2 text-center">
            <Zap size={12} className="mx-auto mb-0.5 text-blue-600" />
            <p className="text-[9px] text-gray-500">Motor</p>
            <p className="text-[10px] font-black text-gray-800 leading-tight">
              {vehicle.specs?.motor?.split(" /")[0] || "—"}
            </p>
          </div>
          <div className="rounded-xl bg-purple-50 p-2 text-center">
            <Gauge size={12} className="mx-auto mb-0.5 text-purple-600" />
            <p className="text-[9px] text-gray-500">Speed</p>
            <p className="text-[10px] font-black text-gray-800 leading-tight">
              {vehicle.specs?.top_speed || "—"}
            </p>
          </div>
        </div>
        <Link
          href={`/${type}/${vehicle.slug}`}
          className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-[#00a651] py-2 text-xs font-bold text-white hover:bg-[#009245] transition"
        >
          View Full Details <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}

function PickerModal({ type, available, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = available.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-black text-gray-900">
            Select {type === "cars" ? "Electric Car" : "Electric Bike"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-gray-100 text-gray-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${type === "cars" ? "cars" : "bikes"}…`}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-green-400"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No vehicles found</p>
          ) : (
            filtered.map((v) => (
              <button
                key={v.id}
                onClick={() => onSelect(v)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-green-50 text-left transition"
              >
                <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={v.image}
                    alt={v.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#00a651]">{v.brand}</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{v.name}</p>
                  <p className="text-xs text-gray-500">{v.priceDisplay}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star size={11} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-gray-600">{v.rating}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompareClient() {
  const [type, setType] = useState("cars");
  const [selected, setSelected] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const allVehicles = type === "cars" ? electricCars : electricBikes;
  const specs = type === "cars" ? CAR_SPECS : BIKE_SPECS;
  const available = allVehicles.filter((v) => !selected.find((s) => s.id === v.id));

  const changeType = (t) => { setType(t); setSelected([]); };

  const addVehicle = (v) => {
    if (selected.length < MAX) setSelected((prev) => [...prev, v]);
    setPickerOpen(false);
  };

  const removeVehicle = (id) => setSelected((prev) => prev.filter((v) => v.id !== id));

  const emptySlots = MAX - selected.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-950 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-4 flex items-center gap-2 text-sm text-green-300">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Compare</span>
          </nav>
          <h1 className="text-3xl font-black text-white md:text-4xl">
            Compare Electric Vehicles
          </h1>
          <p className="mt-2 text-green-300">
            Compare up to {MAX} electric vehicles side by side — specs, range, price and more
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Type Toggle */}
        <div className="mb-6 flex gap-3">
          {[
            { key: "cars", label: "🚗 Electric Cars" },
            { key: "bikes", label: "🛵 Electric Bikes" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => changeType(key)}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
                type === key
                  ? "bg-[#00a651] text-white shadow-lg"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Vehicle Selector Slots */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {selected.map((v) => (
            <SlotCard
              key={v.id}
              vehicle={v}
              type={type}
              onRemove={removeVehicle}
            />
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <SlotCard
              key={`empty-${i}`}
              isEmpty
              onAdd={() => setPickerOpen(true)}
            />
          ))}
        </div>

        {/* Add Vehicle Button (when slots remain and some are filled) */}
        {selected.length > 0 && selected.length < MAX && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-2 rounded-full border-2 border-dashed border-green-300 px-6 py-2.5 text-sm font-bold text-green-600 hover:bg-green-50 transition"
            >
              <Plus size={16} /> Add Another Vehicle
            </button>
          </div>
        )}

        {/* Picker Modal */}
        {pickerOpen && (
          <PickerModal
            type={type}
            available={available}
            onSelect={addVehicle}
            onClose={() => setPickerOpen(false)}
          />
        )}

        {/* Comparison Table */}
        {selected.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="w-[180px] p-4 text-left">
                    <span className="text-sm font-bold text-gray-400">Specification</span>
                  </th>
                  {selected.map((v) => (
                    <th key={v.id} className="p-4 text-center">
                      <div className="relative mx-auto mb-2 h-20 w-full max-w-[160px] overflow-hidden rounded-xl bg-gray-100">
                        <Image
                          src={v.image}
                          alt={v.name}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      </div>
                      <p className="text-[11px] font-semibold text-[#00a651]">{v.brand}</p>
                      <p className="text-sm font-black text-gray-900">{v.name}</p>
                      <Link
                        href={`/${type}/${v.slug}`}
                        className="text-[11px] text-green-600 hover:underline"
                      >
                        View Details →
                      </Link>
                    </th>
                  ))}
                  {/* Empty filler columns */}
                  {Array.from({ length: MAX - selected.length }).map((_, i) => (
                    <th key={`filler-${i}`} className="p-4">
                      <button
                        onClick={() => setPickerOpen(true)}
                        className="mx-auto flex h-20 w-full max-w-[160px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-500 transition"
                      >
                        <Plus size={18} />
                        <span className="text-xs font-medium">Add</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specs.map((spec, idx) => {
                  const values = selected.map((v) => getVal(v, spec.path));
                  return (
                    <tr
                      key={spec.path}
                      className={`border-b border-gray-50 ${idx % 2 === 0 ? "bg-gray-50/60" : "bg-white"}`}
                    >
                      <td className="p-4 text-sm font-semibold text-gray-500">
                        {spec.label}
                      </td>
                      {values.map((val, vi) => (
                        <td key={vi} className="p-4 text-center text-sm font-medium text-gray-800">
                          {val}
                        </td>
                      ))}
                      {Array.from({ length: MAX - selected.length }).map((_, i) => (
                        <td key={i} className="p-4" />
                      ))}
                    </tr>
                  );
                })}

                {/* Features comparison */}
                {selected[0]?.features && (
                  <>
                    <tr className="bg-green-50 border-y border-green-100">
                      <td
                        colSpan={MAX + 1}
                        className="px-4 py-3 text-sm font-black text-green-800"
                      >
                        Key Features
                      </td>
                    </tr>
                    {(() => {
                      const allFeatures = [
                        ...new Set(selected.flatMap((v) => v.features || [])),
                      ].slice(0, 12);
                      return allFeatures.map((feature, fi) => (
                        <tr
                          key={fi}
                          className={`border-b border-gray-50 ${fi % 2 === 0 ? "bg-gray-50/60" : "bg-white"}`}
                        >
                          <td className="p-4 text-sm font-medium text-gray-500">{feature}</td>
                          {selected.map((v) => (
                            <td key={v.id} className="p-4 text-center">
                              {v.features?.includes(feature) ? (
                                <CheckCircle2 size={18} className="mx-auto text-green-500" />
                              ) : (
                                <XCircle size={18} className="mx-auto text-gray-200" />
                              )}
                            </td>
                          ))}
                          {Array.from({ length: MAX - selected.length }).map((_, i) => (
                            <td key={i} className="p-4" />
                          ))}
                        </tr>
                      ));
                    })()}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {selected.length === 0 && (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <Plus size={28} className="text-green-400" />
            </div>
            <p className="text-lg font-bold text-gray-500">Start by adding vehicles above</p>
            <p className="mt-1 text-sm text-gray-400">
              Click &quot;Add Vehicle&quot; to pick {type === "cars" ? "cars" : "bikes"} to compare
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
