"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BatteryCharging, Gauge, Zap, CheckCircle, XCircle,
  ChevronRight, Share2, Shield, Award, ThumbsUp, ThumbsDown,
  PlayCircle, Star, BarChart2,
} from "lucide-react";
import LeadForm from "./LeadForm";
import EMICalculator from "./EMICalculator";
import OnRoadPrice from "./OnRoadPrice";
import InsuranceQuoteWidget from "./InsuranceQuoteWidget";
import VehicleReviews from "./VehicleReviews";

/* ── helpers ─────────────────────────────────────────────────── */
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|[?&]v=)([^?&]{11})/);
  return m ? m[1] : null;
}

function normalizeColor(c) {
  if (!c) return { name: "", hexCode: "#888888", image: "" };
  if (typeof c === "string") return { name: c, hexCode: "#888888", image: "" };
  return { name: c.name || "", hexCode: c.hexCode || "#888888", image: c.image || "" };
}

const KEY_FEATURE_LABELS = {
  touchscreen:       "Touchscreen Display",
  instrumentCluster: "Digital Instrument Cluster",
  navigation:        "Navigation",
  bluetooth:         "Bluetooth",
  androidAuto:       "Android Auto",
  appleCarPlay:      "Apple CarPlay",
  otaUpdates:        "OTA Updates",
  cruiseControl:     "Cruise Control",
  keylessEntry:      "Keyless Entry",
  sunroof:           "Sunroof",
  ventilatedSeats:   "Ventilated Seats",
  wirelessCharging:  "Wireless Charging",
};

const SAFETY_LABELS = {
  abs:            "ABS",
  ebd:            "EBD",
  esc:            "ESC",
  tractionControl:"Traction Control",
  tpms:           "TPMS",
  hillHoldAssist: "Hill Hold Assist",
  reverseCamera:  "Reverse Camera",
  parkingSensors: "Parking Sensors",
};

/* ── sub-components ──────────────────────────────────────────── */
function SpecRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between border-b border-gray-50 py-2.5 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="ml-4 text-right text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function FeaturePill({ label, active }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border ${active ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
      {active
        ? <CheckCircle size={14} className="shrink-0 text-green-600" />
        : <XCircle   size={14} className="shrink-0 text-gray-300" />
      }
      <span className={`text-xs font-medium ${active ? "text-gray-800" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function VehicleDetailPage({ vehicle, relatedVehicles = [], vehicleType }) {
  const [activeImage,   setActiveImage]   = useState(0);
  const [activeColor,   setActiveColor]   = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const [activeTab,     setActiveTab]     = useState("overview");

  const detailPath = vehicleType === "bike" ? "/bikes" : "/cars";
  const colors     = (vehicle.colors || []).map(normalizeColor);
  const gallery    = vehicle.gallery?.length ? vehicle.gallery : [vehicle.featuredImage].filter(Boolean);
  const videoId    = getYouTubeId(vehicle.videoUrl);
  const variant    = vehicle.variants?.[activeVariant];

  /* Which image to show — prefer color-specific image if available */
  const currentColorImg = colors[activeColor]?.image;
  const displayedImage  = currentColorImg || gallery[activeImage] || vehicle.featuredImage || "";

  /* Availability badge */
  const availBadge = {
    available:    { label: "Available",    cls: "bg-green-100 text-green-700" },
    upcoming:     { label: "Coming Soon",  cls: "bg-orange-100 text-orange-700" },
    discontinued: { label: "Discontinued", cls: "bg-gray-100 text-gray-500" },
  }[vehicle.availability] || { label: vehicle.category === "upcoming" ? "Coming Soon" : "Available", cls: "bg-green-100 text-green-700" };

  /* Quick highlights */
  const highlights = [
    { icon: <BatteryCharging size={16} className="text-green-600" />,  label: "Range",     value: variant?.range || vehicle.performance?.drivingRange },
    { icon: <Zap            size={16} className="text-blue-600" />,   label: "Power",     value: vehicle.performance?.power },
    { icon: <Gauge          size={16} className="text-purple-600" />, label: "Top Speed", value: vehicle.performance?.topSpeed },
    { icon: <BatteryCharging size={16} className="text-orange-500" />, label: "0–100 km/h", value: vehicle.performance?.acceleration },
  ].filter((h) => h.value);

  /* Tabs */
  const TABS = [
    { id: "overview",  label: "Overview" },
    { id: "specs",     label: "Specifications" },
    { id: "features",  label: "Features" },
    { id: "safety",    label: "Safety" },
    { id: "warranty",  label: "Warranty" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <ChevronRight size={14} />
            <Link href={detailPath} className="hover:text-green-600 capitalize">
              {vehicleType === "bike" ? "Electric Bikes" : "Electric Cars"}
            </Link>
            <ChevronRight size={14} />
            <span className="font-semibold text-gray-900 truncate max-w-48">{vehicle.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* ── LEFT COLUMN ──────────────────────────────── */}
          <div className="space-y-6">

            {/* Hero card */}
            <SectionCard>
              {/* Image + gallery */}
              <div className="relative overflow-hidden bg-gray-100" style={{ minHeight: "300px" }}>
                {displayedImage ? (
                  <Image
                    src={displayedImage}
                    alt={`${vehicle.name}${colors[activeColor]?.name ? ` in ${colors[activeColor].name}` : ""}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 65vw"
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center text-gray-300">No image</div>
                )}

                {/* Availability badge */}
                <div className="absolute left-4 top-4">
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold shadow ${availBadge.cls}`}>
                    {availBadge.label}
                  </span>
                </div>

                {/* Share */}
                <button
                  onClick={() => navigator.share?.({ title: vehicle.name, url: window.location.href })}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur"
                >
                  <Share2 size={16} className="text-gray-600" />
                </button>

                {/* Gallery dots — only when not showing color-specific image */}
                {!currentColorImg && gallery.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {gallery.map((_, i) => (
                      <button key={i} onClick={() => setActiveImage(i)}
                        className={`h-1.5 rounded-full transition-all ${i === activeImage ? "w-6 bg-green-500" : "w-1.5 bg-white/60"}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Gallery thumbnails */}
              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto px-5 py-3 border-b border-gray-100">
                  {gallery.map((img, i) => (
                    <button key={i} onClick={() => { setActiveImage(i); setActiveColor(-1); }}
                      className={`relative shrink-0 h-14 w-20 overflow-hidden rounded-xl border-2 transition ${i === activeImage && !currentColorImg ? "border-green-500" : "border-gray-200"}`}>
                      <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}

              {/* Vehicle header */}
              <div className="p-5 sm:p-6">
                <p className="text-sm font-semibold text-green-600">{vehicle.brand}</p>
                <h1 className="mt-0.5 text-2xl font-black text-gray-900 sm:text-3xl">{vehicle.name}</h1>

                {vehicle.shortDescription && (
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{vehicle.shortDescription}</p>
                )}

                {/* Price from active variant */}
                {variant && (
                  <div className="mt-3">
                    <p className="text-[11px] text-gray-400">Starting Ex-showroom</p>
                    <p className="text-xl font-black text-green-600">{variant.exShowroomPrice || "Price TBA"}</p>
                    {variant.onRoadPrice && (
                      <p className="text-xs text-gray-500">On-road: {variant.onRoadPrice}</p>
                    )}
                  </div>
                )}

                {/* Color picker */}
                {colors.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2.5 text-sm font-semibold text-gray-700">
                      Color:{" "}
                      <span className="text-green-600">{colors[activeColor]?.name || "—"}</span>
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {colors.map((color, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveColor(i)}
                          title={color.name}
                          className={`relative h-9 w-9 rounded-full transition-all ${
                            i === activeColor
                              ? "ring-2 ring-green-500 ring-offset-2 scale-110 shadow-lg"
                              : "ring-1 ring-gray-200 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.hexCode }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick highlight specs */}
                {highlights.length > 0 && (
                  <div className={`mt-5 grid gap-3 ${highlights.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
                    {highlights.map((h) => (
                      <div key={h.label} className="rounded-2xl bg-gray-50 p-3 text-center">
                        <div className="mb-1 flex justify-center">{h.icon}</div>
                        <p className="text-[11px] font-semibold text-gray-500">{h.label}</p>
                        <p className="mt-0.5 text-xs font-black text-gray-900 leading-tight">{h.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Variants */}
            {vehicle.variants?.length > 0 && (
              <SectionCard className="p-5 sm:p-6">
                <h2 className="mb-4 text-lg font-black text-gray-900">Variants & Prices</h2>
                <div className="space-y-2">
                  {vehicle.variants.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveVariant(i)}
                      className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                        i === activeVariant
                          ? "border-green-400 bg-green-50"
                          : "border-gray-100 bg-gray-50 hover:border-green-200 hover:bg-green-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{v.name}</p>
                          <div className="flex flex-wrap gap-3 mt-0.5">
                            {v.range         && <p className="text-xs text-green-600">Range: {v.range}</p>}
                            {v.batteryCapacity && <p className="text-xs text-gray-500">Battery: {v.batteryCapacity}</p>}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-base font-black text-green-600">{v.exShowroomPrice || "TBA"}</p>
                          {v.availabilityStatus && v.availabilityStatus !== "Available" && (
                            <span className="text-[10px] font-bold text-orange-600">{v.availabilityStatus}</span>
                          )}
                        </div>
                      </div>
                      {v.features?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {v.features.map((f, j) => (
                            <span key={j} className="rounded-lg bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">{f}</span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Detail Tabs */}
            <SectionCard>
              {/* Tab nav */}
              <div className="flex overflow-x-auto border-b border-gray-100">
                {TABS.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 px-4 py-3.5 text-sm font-bold transition ${
                      activeTab === tab.id
                        ? "border-b-2 border-green-600 text-green-600"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5 sm:p-6">

                {/* ── OVERVIEW TAB ──────────────────────── */}
                {activeTab === "overview" && (
                  <div className="space-y-6">

                    {/* Performance */}
                    {vehicle.performance && Object.values(vehicle.performance).some(Boolean) && (
                      <div>
                        <h3 className="mb-3 text-sm font-black text-gray-800 uppercase tracking-wide">Performance</h3>
                        <div className="space-y-0">
                          {[
                            ["Battery Capacity",  vehicle.performance.batteryCapacity],
                            ["Driving Range (ARAI)", vehicle.performance.drivingRange],
                            ["Motor Power",       vehicle.performance.power],
                            ["Peak Power",        vehicle.performance.peakPower],
                            ["Torque",            vehicle.performance.torque],
                            ["Top Speed",         vehicle.performance.topSpeed],
                            ["0–100 km/h",        vehicle.performance.acceleration],
                            ["Drive Type",        vehicle.performance.driveType],
                            ["Battery Type",      vehicle.performance.batteryType],
                          ].map(([label, value]) => <SpecRow key={label} label={label} value={value} />)}
                        </div>
                      </div>
                    )}

                    {/* Charging */}
                    {vehicle.charging && Object.values(vehicle.charging).some((v) => v !== "" && v !== false) && (
                      <div>
                        <h3 className="mb-3 text-sm font-black text-gray-800 uppercase tracking-wide">Charging</h3>
                        <div className="space-y-0">
                          {[
                            ["AC Charging Time",     vehicle.charging.acChargingTime],
                            ["DC Fast Charging Time",vehicle.charging.dcChargingTime],
                            ["Fast Charging",        vehicle.charging.fastCharging ? "Yes" : vehicle.charging.fastCharging === false ? "No" : null],
                            ["Charging Port",        vehicle.charging.chargingPort],
                          ].map(([label, value]) => <SpecRow key={label} label={label} value={value} />)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SPECIFICATIONS TAB ────────────────── */}
                {activeTab === "specs" && vehicle.specs && (
                  <div className="space-y-0">
                    {[
                      ["Length",          vehicle.specs.length],
                      ["Width",           vehicle.specs.width],
                      ["Height",          vehicle.specs.height],
                      ["Wheelbase",       vehicle.specs.wheelbase],
                      ["Ground Clearance",vehicle.specs.groundClearance],
                      ["Kerb Weight",     vehicle.specs.kerbWeight],
                      ["Seating Capacity",vehicle.specs.seatingCapacity],
                      ["Boot Space",      vehicle.specs.bootSpace],
                      ["Tyre Type",       vehicle.specs.tyreType],
                      ["Wheel Size",      vehicle.specs.wheelSize],
                    ].map(([label, value]) => <SpecRow key={label} label={label} value={value} />)}
                  </div>
                )}

                {/* ── FEATURES TAB ──────────────────────── */}
                {activeTab === "features" && (
                  <div className="space-y-6">

                    {/* Key feature checkboxes */}
                    {vehicle.keyFeatures && Object.values(vehicle.keyFeatures).some(Boolean) && (
                      <div>
                        <h3 className="mb-3 text-sm font-black text-gray-800 uppercase tracking-wide">Key Features</h3>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {Object.entries(KEY_FEATURE_LABELS).map(([key, label]) => (
                            <FeaturePill key={key} label={label} active={!!vehicle.keyFeatures?.[key]} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feature text lists */}
                    {vehicle.features && (
                      <>
                        {[
                          { key: "infotainment", label: "Infotainment" },
                          { key: "connectivity",  label: "Connectivity" },
                          { key: "comfort",       label: "Comfort" },
                          { key: "technology",    label: "Technology" },
                        ]
                          .filter(({ key }) => vehicle.features[key]?.length > 0)
                          .map(({ key, label }) => (
                            <div key={key}>
                              <h3 className="mb-2.5 text-sm font-black text-gray-800 uppercase tracking-wide">{label}</h3>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {vehicle.features[key].map((f, i) => (
                                  <div key={i} className="flex items-start gap-2.5 rounded-xl bg-green-50 px-3 py-2">
                                    <CheckCircle size={14} className="mt-0.5 shrink-0 text-green-600" />
                                    <span className="text-sm text-gray-700">{f}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        }
                      </>
                    )}
                  </div>
                )}

                {/* ── SAFETY TAB ────────────────────────── */}
                {activeTab === "safety" && vehicle.safety && (
                  <div className="space-y-6">

                    {vehicle.safety.airbags && (
                      <div className="flex items-center justify-between rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Shield size={16} className="text-green-600" />
                          <span className="text-sm font-semibold text-gray-800">Airbags</span>
                        </div>
                        <span className="text-sm font-black text-green-700">{vehicle.safety.airbags}</span>
                      </div>
                    )}

                    {vehicle.safety.safetyRating && (
                      <div className="flex items-center justify-between rounded-2xl border border-yellow-100 bg-yellow-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Star size={16} className="text-yellow-600 fill-yellow-500" />
                          <span className="text-sm font-semibold text-gray-800">Safety Rating</span>
                        </div>
                        <span className="text-sm font-black text-yellow-700">{vehicle.safety.safetyRating}</span>
                      </div>
                    )}

                    {/* Safety toggles */}
                    {Object.entries(SAFETY_LABELS).some(([key]) => vehicle.safety[key] !== undefined) && (
                      <div>
                        <h3 className="mb-3 text-sm font-black text-gray-800 uppercase tracking-wide">Safety Systems</h3>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {Object.entries(SAFETY_LABELS).map(([key, label]) => (
                            <FeaturePill key={key} label={label} active={!!vehicle.safety[key]} />
                          ))}
                        </div>
                      </div>
                    )}

                    {vehicle.safety.adasFeatures?.length > 0 && (
                      <div>
                        <h3 className="mb-2.5 text-sm font-black text-gray-800 uppercase tracking-wide">ADAS Features</h3>
                        <div className="flex flex-wrap gap-2">
                          {vehicle.safety.adasFeatures.map((f, i) => (
                            <span key={i} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {vehicle.safety.additionalEquipment?.length > 0 && (
                      <div>
                        <h3 className="mb-2.5 text-sm font-black text-gray-800 uppercase tracking-wide">Additional Safety Equipment</h3>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {vehicle.safety.additionalEquipment.map((f, i) => (
                            <div key={i} className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2">
                              <CheckCircle size={13} className="mt-0.5 shrink-0 text-green-600" />
                              <span className="text-sm text-gray-700">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── WARRANTY TAB ──────────────────────── */}
                {activeTab === "warranty" && vehicle.warranty && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Award size={18} className="text-green-600" />
                      <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">Warranty Coverage</h3>
                    </div>
                    <div className="space-y-0">
                      {[
                        ["Vehicle Warranty",      vehicle.warranty.vehicle],
                        ["Battery Warranty",      vehicle.warranty.battery],
                        ["Motor Warranty",        vehicle.warranty.motor],
                        ["Roadside Assistance",   vehicle.warranty.roadsideAssistance],
                      ].map(([label, value]) => <SpecRow key={label} label={label} value={value} />)}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Full description */}
            {vehicle.description && (
              <SectionCard className="p-5 sm:p-6">
                <h2 className="mb-4 text-lg font-black text-gray-900">About {vehicle.name}</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: vehicle.description }}
                />
              </SectionCard>
            )}

            {/* Pros & Cons */}
            {(vehicle.pros?.length > 0 || vehicle.cons?.length > 0) && (
              <SectionCard className="p-5 sm:p-6">
                <h2 className="mb-4 text-lg font-black text-gray-900">Pros &amp; Cons</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {vehicle.pros?.length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-green-700">
                        <ThumbsUp size={15} className="text-green-600" /> Pros
                      </h3>
                      <div className="space-y-2">
                        {vehicle.pros.map((p, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-xl bg-green-50 px-3 py-2">
                            <span className="mt-0.5 font-bold text-green-600">+</span>
                            <span className="text-sm text-gray-700">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {vehicle.cons?.length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-red-600">
                        <ThumbsDown size={15} className="text-red-500" /> Cons
                      </h3>
                      <div className="space-y-2">
                        {vehicle.cons.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2">
                            <span className="mt-0.5 font-bold text-red-500">–</span>
                            <span className="text-sm text-gray-700">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* YouTube video */}
            {videoId && (
              <SectionCard className="overflow-hidden">
                <div className="flex items-center gap-2 p-5 pb-3">
                  <PlayCircle size={18} className="text-red-600" />
                  <h2 className="text-lg font-black text-gray-900">{vehicle.name} — Official Video</h2>
                </div>
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={`${vehicle.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </SectionCard>
            )}

            {/* Related vehicles */}
            {relatedVehicles.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-black text-gray-900">
                  Similar {vehicleType === "bike" ? "Bikes" : "Cars"}
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {relatedVehicles.map((v) => {
                    const img  = v.featuredImage || v.image || "";
                    const slug = v.slug;
                    const name = v.name;
                    const brand = v.brand;
                    const price = v.variants?.[0]?.exShowroomPrice || v.priceDisplay || "";
                    return (
                      <Link key={slug} href={`${detailPath}/${slug}`}
                        className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-green-200 transition">
                        <div className="relative h-36 overflow-hidden bg-gray-100">
                          {img && <Image src={img} alt={name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="250px" />}
                        </div>
                        <div className="p-3">
                          <p className="text-[11px] font-semibold text-green-600">{brand}</p>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-green-600 transition">{name}</p>
                          {price && <p className="text-xs text-gray-500 mt-0.5">{price}</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (sticky sidebar) ──────────── */}
          <div className="lg:self-start lg:sticky lg:top-24 space-y-4">
            <LeadForm
              vehicleName={vehicle.name}
              vehicleSlug={vehicle.slug}
              vehicleType={vehicleType}
            />

            <EMICalculator basePrice={variant?.exShowroomPrice || ""} />
            <OnRoadPrice   exShowroom={variant?.exShowroomPrice || ""} />
            <InsuranceQuoteWidget vehicleName={vehicle.name} exShowroom={variant?.exShowroomPrice || ""} />

            {/* Compare CTA */}
            <Link
              href={`/compare?v0=${vehicle.slug}`}
              className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-green-600 py-3 text-sm font-bold text-green-700 hover:bg-green-50 transition"
            >
              <BarChart2 size={16} /> Compare with another EV
            </Link>

            {/* Price in city links */}
            {vehicleType === "car" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-gray-500">On-Road Price by City</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { city: "mumbai",    label: "Mumbai"    },
                    { city: "delhi",     label: "Delhi"     },
                    { city: "bangalore", label: "Bangalore" },
                    { city: "hyderabad", label: "Hyderabad" },
                    { city: "pune",      label: "Pune"      },
                  ].map(({ city, label }) => (
                    <Link
                      key={city}
                      href={`/cars/${vehicle.slug}/price-in-${city}`}
                      className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700 transition"
                    >
                      {label}
                    </Link>
                  ))}
                  <Link
                    href={`/cars/${vehicle.slug}`}
                    className="rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-center text-xs font-bold text-green-700 hover:bg-green-100 transition"
                  >
                    All Cities →
                  </Link>
                </div>
              </div>
            )}

            {/* Share buttons */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-black uppercase tracking-wide text-gray-500">Share This EV</p>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out the ${vehicle.name} on EV News India!\n${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white hover:opacity-90 transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out the ${vehicle.name} on EV News India!`)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-xs font-bold text-white hover:opacity-80 transition"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X
                </a>
              </div>
            </div>

            {/* Warranty quick card */}
            {(vehicle.warranty?.battery || vehicle.warranty?.vehicle) && (
              <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={16} className="text-green-600" />
                  <span className="text-sm font-black text-green-800">Warranty Coverage</span>
                </div>
                <div className="space-y-2">
                  {vehicle.warranty.vehicle && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Vehicle</span>
                      <span className="font-bold text-gray-900">{vehicle.warranty.vehicle}</span>
                    </div>
                  )}
                  {vehicle.warranty.battery && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Battery</span>
                      <span className="font-bold text-gray-900">{vehicle.warranty.battery}</span>
                    </div>
                  )}
                  {vehicle.warranty.motor && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Motor</span>
                      <span className="font-bold text-gray-900">{vehicle.warranty.motor}</span>
                    </div>
                  )}
                  {vehicle.warranty.roadsideAssistance && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Roadside Assistance</span>
                      <span className="font-bold text-gray-900">{vehicle.warranty.roadsideAssistance}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Launch date notice */}
            {vehicle.launchDate && vehicle.availability === "upcoming" && (
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-center">
                <p className="text-xs text-orange-700 font-semibold">Expected Launch</p>
                <p className="text-base font-black text-orange-800 mt-1">
                  {new Date(vehicle.launchDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── User Reviews ──────────────────────────────── */}
        <div className="border-t border-gray-100 pt-8 mt-2">
          <VehicleReviews
            vehicleSlug={vehicle.slug}
            vehicleName={vehicle.name}
            vehicleType={vehicleType}
          />
        </div>
      </div>
    </div>
  );
}
