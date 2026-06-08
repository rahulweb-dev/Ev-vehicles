"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X, Plus, BatteryCharging, Gauge, Zap, Star,
  CheckCircle2, XCircle, ChevronRight, Search,
} from "lucide-react";

const MAX = 3;

/* ─── Spec row definitions ───────────────────────────────────────── */
const CAR_SPECS = [
  { label: "Ex-Showroom Price",  path: "priceDisplay"           },
  { label: "Battery Capacity",   path: "specs.battery"          },
  { label: "Certified Range",    path: "specs.range_certified"  },
  { label: "Motor Power",        path: "specs.motor"            },
  { label: "Torque",             path: "specs.torque"           },
  { label: "Top Speed",         path: "specs.top_speed"        },
  { label: "0–100 km/h",        path: "specs.acceleration"     },
  { label: "AC Charging",       path: "specs.charging_ac"      },
  { label: "DC Fast Charging",  path: "specs.charging_dc"      },
  { label: "Charging Port",     path: "specs.charger_type"     },
  { label: "Seating Capacity",  path: "specs.seating"          },
  { label: "Boot Space",        path: "specs.boot_space"       },
  { label: "Ground Clearance",  path: "specs.ground_clearance" },
  { label: "Kerb Weight",       path: "specs.kerb_weight"      },
  { label: "Drive Type",        path: "specs.drive_type"       },
  { label: "Vehicle Warranty",  path: "specs.warranty_vehicle" },
  { label: "Battery Warranty",  path: "specs.warranty_battery" },
];

const BIKE_SPECS = [
  { label: "Ex-Showroom Price",  path: "priceDisplay"           },
  { label: "Battery Capacity",   path: "specs.battery"          },
  { label: "Certified Range",    path: "specs.range_certified"  },
  { label: "Motor Power",        path: "specs.motor"            },
  { label: "Top Speed",         path: "specs.top_speed"        },
  { label: "Acceleration",      path: "specs.acceleration"     },
  { label: "Charging Time",     path: "specs.charging_ac"      },
  { label: "Charging Port",     path: "specs.charger_type"     },
  { label: "Kerb Weight",       path: "specs.kerb_weight"      },
  { label: "Vehicle Warranty",  path: "specs.warranty_vehicle" },
  { label: "Battery Warranty",  path: "specs.warranty_battery" },
];

/* ─── Map API vehicle → compare shape ───────────────────────────── */
function parsePriceLakh(str) {
  if (!str) return null;
  const first = str.split(/[-–]/)[0];
  let s = first.replace(/[₹\s]/g, "").toLowerCase().trim();
  const lm = s.match(/([\d,]+(?:\.\d+)?)\s*lakh/);
  if (lm) return parseFloat(lm[1].replace(/,/g, ""));
  const cm = s.match(/([\d,]+(?:\.\d+)?)\s*(?:cr|crore)/);
  if (cm) return parseFloat(cm[1].replace(/,/g, "")) * 100;
  const numStr = s.replace(/,/g, "");
  if (/^\d+(\.\d+)?$/.test(numStr)) {
    const n = parseFloat(numStr);
    return n > 100 ? n / 100000 : n;
  }
  return null;
}

function mapVehicle(v) {
  const first = v.variants?.[0];
  const last  = v.variants?.[v.variants?.length - 1];
  const priceDisplay =
    first?.exShowroomPrice
      ? first.exShowroomPrice !== last?.exShowroomPrice
        ? `${first.exShowroomPrice} – ${last.exShowroomPrice}`
        : first.exShowroomPrice
      : "Price TBA";

  // Flatten all feature arrays into one list
  const featureArr = [
    ...(v.features?.infotainment || []),
    ...(v.features?.connectivity || []),
    ...(v.features?.comfort      || []),
    ...(v.features?.technology   || []),
  ];
  const kf = v.keyFeatures || {};
  if (kf.touchscreen)   featureArr.push("Touchscreen");
  if (kf.navigation)    featureArr.push("Navigation");
  if (kf.androidAuto)   featureArr.push("Android Auto");
  if (kf.appleCarPlay)  featureArr.push("Apple CarPlay");
  if (kf.sunroof)       featureArr.push("Sunroof / Moonroof");
  if (kf.fastCharging)  featureArr.push("Fast Charging");

  return {
    id:    String(v._id),
    slug:  v.slug,
    name:  v.name,
    brand: v.brand,
    image: v.featuredImage || "",
    priceDisplay,
    priceRaw:    parsePriceLakh(first?.exShowroomPrice),
    rating:      0,
    reviewCount: 0,
    tag: v.featured ? "Featured" : v.category === "upcoming" ? "Coming Soon" : "Popular",
    features: [...new Set(featureArr)].filter(Boolean),
    pros:  v.pros  || [],
    cons:  v.cons  || [],
    specs: {
      battery:          v.performance?.batteryCapacity  || first?.batteryCapacity || "—",
      range_certified:  v.performance?.drivingRange     || first?.range           || "—",
      motor:            v.performance?.power            || "—",
      torque:           v.performance?.torque           || "—",
      top_speed:        v.performance?.topSpeed         || "—",
      acceleration:     v.performance?.acceleration     || "—",
      charging_ac:      v.charging?.acChargingTime      || "—",
      charging_dc:      v.charging?.dcChargingTime      || "—",
      charger_type:     v.charging?.chargingPort        || "—",
      seating:          v.specs?.seating                || "—",
      boot_space:       v.specs?.bootSpace              || "—",
      ground_clearance: v.specs?.groundClearance        || "—",
      kerb_weight:      v.specs?.weight                 || "—",
      drive_type:       v.performance?.driveType        || "—",
      warranty_vehicle: v.warranty?.vehicle             || "—",
      warranty_battery: v.warranty?.battery             || "—",
    },
  };
}

function getVal(obj, path) {
  const val = path.split(".").reduce((acc, k) => acc?.[k], obj);
  if (val === undefined || val === null || val === "") return "—";
  return String(val);
}

/* ─── Slot card ──────────────────────────────────────────────────── */
function SlotCard({ vehicle, type, onRemove, onAdd, isEmpty }) {
  if (isEmpty) {
    return (
      <div
        onClick={onAdd}
        className="flex min-h-50 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white transition hover:border-green-400 hover:bg-green-50/30"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Plus size={22} className="text-gray-400" />
        </div>
        <span className="mt-2 text-sm font-semibold text-gray-400">Add Vehicle</span>
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
      <div className="relative h-40 w-full overflow-hidden bg-gray-100">
        {vehicle.image ? (
          <Image src={vehicle.image} alt={vehicle.name} fill className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-gray-200">⚡</div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        <span className="absolute bottom-2 left-3 rounded-full bg-[#00a651] px-2.5 py-0.5 text-[10px] font-bold text-white">
          {vehicle.tag}
        </span>
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold text-[#00a651]">{vehicle.brand}</p>
        <h3 className="mt-0.5 text-sm font-black text-gray-900 leading-tight line-clamp-1">{vehicle.name}</h3>
        <p className="mt-1 text-base font-black text-gray-900">{vehicle.priceDisplay}</p>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <MiniSpec icon={<BatteryCharging size={11} className="text-green-600" />}
            label="Range" value={vehicle.specs.range_certified?.split(" (")[0] || "—"} bg="bg-green-50" />
          <MiniSpec icon={<Zap  size={11} className="text-blue-600"   />}
            label="Motor" value={vehicle.specs.motor?.split(" /")[0] || "—"} bg="bg-blue-50" />
          <MiniSpec icon={<Gauge size={11} className="text-purple-600" />}
            label="Speed" value={vehicle.specs.top_speed || "—"} bg="bg-purple-50" />
        </div>
        <Link href={`/${type}/${vehicle.slug}`}
          className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-[#00a651] py-2 text-xs font-bold text-white hover:bg-[#009245] transition">
          Full Details <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}

function MiniSpec({ icon, label, value, bg }) {
  return (
    <div className={`rounded-xl ${bg} p-2 text-center`}>
      <div className="flex justify-center mb-0.5">{icon}</div>
      <p className="text-[9px] text-gray-500">{label}</p>
      <p className="text-[10px] font-black text-gray-800 leading-tight">{value}</p>
    </div>
  );
}

/* ─── Picker modal ───────────────────────────────────────────────── */
function PickerModal({ type, available, loading, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search.trim()) return available;
    const q = search.toLowerCase();
    return available.filter(v =>
      v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q)
    );
  }, [available, search]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
          <h3 className="text-base font-black text-gray-900">
            Select {type === "cars" ? "Electric Car" : "Electric Bike"}
          </h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100 text-gray-400 transition">
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 focus-within:border-green-400 transition">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${type === "cars" ? "cars" : "bikes"}…`}
              className="flex-1 text-sm outline-none placeholder:text-gray-400"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 rounded-xl px-3 py-3">
                <div className="h-14 w-20 rounded-lg bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No vehicles found</p>
          ) : (
            filtered.map(v => (
              <button
                key={v.id}
                onClick={() => onSelect(v)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-green-50 text-left transition"
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {v.image ? (
                    <Image src={v.image} alt={v.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl text-gray-300">⚡</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#00a651]">{v.brand}</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{v.name}</p>
                  <p className="text-xs text-gray-500">{v.priceDisplay}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-gray-400">{v.specs.range_certified}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function CompareClient({ initialV0 = null, initialV1 = null }) {
  const [type,        setType]        = useState("cars");
  const [selected,    setSelected]    = useState([]);
  const [pickerOpen,  setPickerOpen]  = useState(false);
  const [allVehicles, setAllVehicles] = useState({ cars: [], bikes: [] });
  const [loading,     setLoading]     = useState({ cars: true, bikes: true });
  const preApplied                    = useRef(false);

  /* Fetch cars + bikes in parallel on mount */
  useEffect(() => {
    const fetchType = (vehicleType) =>
      fetch(`/api/vehicles?vehicleType=${vehicleType}&status=published&limit=200`)
        .then(r => r.json())
        .then(data => {
          const mapped = (data.vehicles || []).map(mapVehicle);
          setAllVehicles(prev => ({ ...prev, [vehicleType === "car" ? "cars" : "bikes"]: mapped }));
        })
        .catch(() => {})
        .finally(() => setLoading(prev => ({ ...prev, [vehicleType === "car" ? "cars" : "bikes"]: false })));

    fetchType("car");
    fetchType("bike");
  }, []);

  /* Pre-populate selected vehicles from URL params (v0, v1) once both lists load */
  useEffect(() => {
    if (preApplied.current) return;
    if (loading.cars || loading.bikes) return;

    const slugs = [initialV0, initialV1].filter(Boolean);
    if (slugs.length === 0) { preApplied.current = true; return; }

    const all = [...allVehicles.cars, ...allVehicles.bikes];
    const toSelect = slugs.map((slug) => all.find((v) => v.slug === slug)).filter(Boolean);

    if (toSelect.length > 0) {
      setSelected(toSelect);
      /* switch to "bikes" tab if the first vehicle is a bike */
      const firstInCars = allVehicles.cars.some((v) => v.slug === slugs[0]);
      setType(firstInCars ? "cars" : "bikes");
    }

    preApplied.current = true;
  }, [loading.cars, loading.bikes, allVehicles, initialV0, initialV1]);

  const specs     = type === "cars" ? CAR_SPECS : BIKE_SPECS;
  const isLoading = type === "cars" ? loading.cars : loading.bikes;

  /* vehicles not yet in the compare slots */
  const available = useMemo(
    () => allVehicles[type].filter(v => !selected.find(s => s.id === v.id)),
    [allVehicles, type, selected]
  );

  function changeType(t) { setType(t); setSelected([]); }
  function addVehicle(v) { if (selected.length < MAX) setSelected(p => [...p, v]); setPickerOpen(false); }
  function removeVehicle(id) { setSelected(p => p.filter(v => v.id !== id)); }

  const emptySlots = MAX - selected.length;

  /* collect all unique features from selected vehicles for comparison */
  const allFeatures = useMemo(
    () => [...new Set(selected.flatMap(v => v.features || []))].slice(0, 14),
    [selected]
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-linear-to-br from-green-900 via-green-800 to-green-950 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-4 flex items-center gap-2 text-sm text-green-300">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Compare</span>
          </nav>
          <h1 className="text-3xl font-black text-white md:text-4xl">Compare Electric Vehicles</h1>
          <p className="mt-2 text-green-300">Compare up to {MAX} EVs side by side — specs, range, price and features</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* Type toggle */}
        <div className="mb-6 flex gap-3">
          {[
            { key: "cars",  label: "🚗 Electric Cars"  },
            { key: "bikes", label: "🛵 Electric Bikes" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => changeType(key)}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
                type === key
                  ? "bg-[#00a651] text-white shadow-lg"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-600"
              }`}>
              {label}
              {!loading[key] && allVehicles[key].length > 0 && (
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  type === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {allVehicles[key].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Slot cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {selected.map(v => (
            <SlotCard key={v.id} vehicle={v} type={type} onRemove={removeVehicle} />
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <SlotCard key={`empty-${i}`} isEmpty onAdd={() => setPickerOpen(true)} />
          ))}
        </div>

        {/* Add more button */}
        {selected.length > 0 && selected.length < MAX && (
          <div className="mb-6 flex justify-center">
            <button onClick={() => setPickerOpen(true)}
              className="flex items-center gap-2 rounded-full border-2 border-dashed border-green-300 px-6 py-2.5 text-sm font-bold text-green-600 hover:bg-green-50 transition">
              <Plus size={16} /> Add Another Vehicle
            </button>
          </div>
        )}

        {/* Picker modal */}
        {pickerOpen && (
          <PickerModal
            type={type}
            available={available}
            loading={isLoading}
            onSelect={addVehicle}
            onClose={() => setPickerOpen(false)}
          />
        )}

        {/* Comparison table */}
        {selected.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="w-[180px] p-4 text-left">
                    <span className="text-sm font-bold text-gray-400">Specification</span>
                  </th>
                  {selected.map(v => (
                    <th key={v.id} className="p-4 text-center">
                      <div className="relative mx-auto mb-2 h-20 w-full max-w-[160px] overflow-hidden rounded-xl bg-gray-100">
                        {v.image ? (
                          <Image src={v.image} alt={v.name} fill className="object-cover" sizes="160px" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl text-gray-200">⚡</div>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-[#00a651]">{v.brand}</p>
                      <p className="text-sm font-black text-gray-900 leading-tight">{v.name}</p>
                      <Link href={`/${type}/${v.slug}`} className="text-[11px] text-green-600 hover:underline">
                        View Details →
                      </Link>
                    </th>
                  ))}
                  {Array.from({ length: MAX - selected.length }).map((_, i) => (
                    <th key={`filler-${i}`} className="p-4">
                      <button onClick={() => setPickerOpen(true)}
                        className="mx-auto flex h-20 w-full max-w-[160px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-500 transition">
                        <Plus size={18} />
                        <span className="text-xs font-medium">Add</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Spec rows */}
                {specs.map((spec, idx) => {
                  const values = selected.map(v => getVal(v, spec.path));
                  return (
                    <tr key={spec.path}
                      className={`border-b border-gray-50 ${idx % 2 === 0 ? "bg-gray-50/60" : "bg-white"}`}>
                      <td className="p-4 text-sm font-semibold text-gray-500">{spec.label}</td>
                      {values.map((val, vi) => (
                        <td key={vi} className={`p-4 text-center text-sm font-medium ${val === "—" ? "text-gray-300" : "text-gray-800"}`}>
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
                {allFeatures.length > 0 && (
                  <>
                    <tr className="bg-green-50 border-y border-green-100">
                      <td colSpan={MAX + 1} className="px-4 py-3 text-sm font-black text-green-800">
                        Key Features
                      </td>
                    </tr>
                    {allFeatures.map((feature, fi) => (
                      <tr key={fi}
                        className={`border-b border-gray-50 ${fi % 2 === 0 ? "bg-gray-50/60" : "bg-white"}`}>
                        <td className="p-4 text-sm font-medium text-gray-500">{feature}</td>
                        {selected.map(v => (
                          <td key={v.id} className="p-4 text-center">
                            {v.features?.includes(feature)
                              ? <CheckCircle2 size={18} className="mx-auto text-green-500" />
                              : <XCircle      size={18} className="mx-auto text-gray-200"  />}
                          </td>
                        ))}
                        {Array.from({ length: MAX - selected.length }).map((_, i) => (
                          <td key={i} className="p-4" />
                        ))}
                      </tr>
                    ))}
                  </>
                )}

                {/* Pros / Cons (only if any vehicle has them) */}
                {selected.some(v => v.pros?.length > 0 || v.cons?.length > 0) && (
                  <>
                    <tr className="bg-blue-50 border-y border-blue-100">
                      <td colSpan={MAX + 1} className="px-4 py-3 text-sm font-black text-blue-800">
                        Pros &amp; Cons
                      </td>
                    </tr>
                    <tr className="border-b border-gray-50 bg-white">
                      <td className="p-4 text-sm font-semibold text-gray-500">Pros</td>
                      {selected.map(v => (
                        <td key={v.id} className="p-4 align-top">
                          <ul className="space-y-1 text-left">
                            {(v.pros || []).slice(0, 4).map((p, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                                <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-green-500" />
                                {p}
                              </li>
                            ))}
                            {v.pros?.length === 0 && <li className="text-xs text-gray-300">—</li>}
                          </ul>
                        </td>
                      ))}
                      {Array.from({ length: MAX - selected.length }).map((_, i) => <td key={i} className="p-4" />)}
                    </tr>
                    <tr className="border-b border-gray-50 bg-gray-50/60">
                      <td className="p-4 text-sm font-semibold text-gray-500">Cons</td>
                      {selected.map(v => (
                        <td key={v.id} className="p-4 align-top">
                          <ul className="space-y-1 text-left">
                            {(v.cons || []).slice(0, 4).map((c, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                                <XCircle size={12} className="mt-0.5 shrink-0 text-red-400" />
                                {c}
                              </li>
                            ))}
                            {v.cons?.length === 0 && <li className="text-xs text-gray-300">—</li>}
                          </ul>
                        </td>
                      ))}
                      {Array.from({ length: MAX - selected.length }).map((_, i) => <td key={i} className="p-4" />)}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {selected.length === 0 && (
          <div className="py-24 text-center">
            {isLoading ? (
              <>
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-200 animate-pulse mb-4" />
                <p className="text-sm text-gray-400">Loading vehicles from database…</p>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <Plus size={28} className="text-green-400" />
                </div>
                <p className="text-lg font-bold text-gray-700">
                  Start comparing {type === "cars" ? "cars" : "bikes"}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Click &quot;Add Vehicle&quot; to pick from {allVehicles[type].length} available {type}
                </p>
                <button onClick={() => setPickerOpen(true)}
                  className="mt-5 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition shadow-lg">
                  + Add First Vehicle
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
