"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BatteryCharging, Gauge, Zap, Clock3, Star, CheckCircle,
  ChevronRight, ArrowLeft, Share2, Shield, Award
} from "lucide-react";
import LeadForm from "./LeadForm";

export default function VehicleDetailPage({ vehicle, relatedVehicles, vehicleType }) {
  const [activeColor, setActiveColor] = useState(0);
  const [activeTab, setActiveTab] = useState("specs");
  const [activeImage, setActiveImage] = useState(0);

  const specIcons = {
    battery: <BatteryCharging size={16} className="text-green-600" />,
    range_certified: <Gauge size={16} className="text-blue-600" />,
    motor: <Zap size={16} className="text-yellow-600" />,
    top_speed: <Gauge size={16} className="text-red-500" />,
    charging_dc: <BatteryCharging size={16} className="text-purple-600" />,
    acceleration: <Zap size={16} className="text-orange-500" />,
  };

  const highlightSpecs = vehicle.vehicleType === "bike"
    ? [
        { key: "range_certified", label: "Range", value: vehicle.specs?.range_certified },
        { key: "motor", label: "Motor", value: vehicle.specs?.motor },
        { key: "top_speed", label: "Top Speed", value: vehicle.specs?.top_speed },
        { key: "charging_time", label: "Charging", value: vehicle.specs?.charging_time },
      ]
    : [
        { key: "range_certified", label: "Range (ARAI)", value: vehicle.specs?.range_certified },
        { key: "motor", label: "Motor Power", value: vehicle.specs?.motor },
        { key: "top_speed", label: "Top Speed", value: vehicle.specs?.top_speed },
        { key: "charging_dc", label: "DC Fast Charge", value: vehicle.specs?.charging_dc },
      ];

  const detailPath = vehicleType === "bike" ? "/bikes" : "/cars";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <ChevronRight size={14} />
            <Link href={detailPath} className="hover:text-green-600 capitalize">
              {vehicleType === "bike" ? "Electric Bikes" : "Electric Cars"}
            </Link>
            <ChevronRight size={14} />
            <span className="font-semibold text-gray-900">{vehicle.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Main Hero Card */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
              {/* Image Gallery */}
              <div className="relative h-[280px] sm:h-[380px] overflow-hidden bg-gray-100">
                <Image
                  src={vehicle.gallery?.[activeImage] || vehicle.image}
                  alt={vehicle.name}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Tag */}
                <div className="absolute left-4 top-4">
                  <span className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow">
                    {vehicle.tag}
                  </span>
                </div>
                {/* Share */}
                <button className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur">
                  <Share2 size={16} className="text-gray-600" />
                </button>
                {/* Thumbnails */}
                {vehicle.gallery && vehicle.gallery.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {vehicle.gallery.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`h-1.5 rounded-full transition-all ${i === activeImage ? "w-6 bg-green-500" : "w-1.5 bg-white/60"}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Title + Price */}
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-green-600">{vehicle.brand}</p>
                    <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">{vehicle.name}</h1>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700">
                        <Star size={11} className="fill-yellow-500 text-yellow-500" />
                        {vehicle.rating}
                      </span>
                      <span className="text-xs text-gray-400">{vehicle.reviewCount?.toLocaleString()} reviews</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${vehicle.availability === "Available" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {vehicle.availability}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] text-gray-400">Ex-showroom Delhi</p>
                    <p className="text-xl font-black text-green-600">{vehicle.priceDisplay}</p>
                    {vehicle.emiMin && (
                      <p className="text-xs text-gray-500">EMI from ₹{vehicle.emiMin.toLocaleString()}/mo</p>
                    )}
                  </div>
                </div>

                {/* Color Picker */}
                {vehicle.colors && (
                  <div className="mt-5">
                    <p className="mb-2.5 text-sm font-semibold text-gray-700">
                      Color: <span className="text-green-600">{vehicle.colors[activeColor]?.name}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.colors.map((color, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveColor(i)}
                          title={color.name}
                          className={`h-8 w-8 rounded-full border-2 transition-all ${i === activeColor ? "border-green-500 scale-110 shadow-lg" : "border-gray-200 hover:border-gray-400"}`}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Highlight Specs */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {highlightSpecs.map((s) => (
                    <div key={s.key} className="rounded-2xl bg-gray-50 p-3 text-center">
                      <div className="mb-1 flex justify-center">{specIcons[s.key] || <Zap size={16} className="text-green-600" />}</div>
                      <p className="text-[11px] font-semibold text-gray-500">{s.label}</p>
                      <p className="mt-0.5 text-xs font-black text-gray-900 leading-tight">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Variants */}
            {vehicle.variants && (
              <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100 p-5 sm:p-6">
                <h2 className="mb-4 text-lg font-black text-gray-900">Variants & Prices</h2>
                <div className="space-y-2">
                  {vehicle.variants.map((v, i) => (
                    <div key={i} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 hover:border-green-200 hover:bg-green-50 transition">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{v.name}</p>
                        {v.range && <p className="text-xs text-green-600">Range: {v.range}</p>}
                      </div>
                      <span className="text-base font-black text-green-600">{v.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs: Specs / Features / Pros&Cons */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
              <div className="flex border-b border-gray-100">
                {["specs", "features", "proscons"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-sm font-bold capitalize transition ${activeTab === tab ? "border-b-2 border-green-600 text-green-600" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    {tab === "proscons" ? "Pros & Cons" : tab === "specs" ? "Specifications" : "Features"}
                  </button>
                ))}
              </div>

              <div className="p-5 sm:p-6">
                {/* Specifications Tab */}
                {activeTab === "specs" && vehicle.specs && (
                  <div className="space-y-1">
                    {Object.entries(vehicle.specs).map(([key, value]) => {
                      const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                      return (
                        <div key={key} className="flex items-start justify-between border-b border-gray-50 py-2.5 last:border-0">
                          <span className="text-sm text-gray-500 capitalize">{label}</span>
                          <span className="ml-4 text-right text-sm font-semibold text-gray-900">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Features Tab */}
                {activeTab === "features" && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {vehicle.features?.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl bg-green-50 px-3 py-2">
                        <CheckCircle size={15} className="mt-0.5 flex-shrink-0 text-green-600" />
                        <span className="text-sm text-gray-700">{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pros & Cons Tab */}
                {activeTab === "proscons" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-green-700">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs">✓</span>
                        Pros
                      </h3>
                      <div className="space-y-2">
                        {vehicle.pros?.map((p, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-xl bg-green-50 px-3 py-2">
                            <span className="mt-0.5 text-green-600">+</span>
                            <span className="text-sm text-gray-700">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-red-600">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs">✗</span>
                        Cons
                      </h3>
                      <div className="space-y-2">
                        {vehicle.cons?.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2">
                            <span className="mt-0.5 text-red-500">–</span>
                            <span className="text-sm text-gray-700">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Safety */}
            {vehicle.safety && (
              <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100 p-5 sm:p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-900">
                  <Shield size={20} className="text-green-600" /> Safety Features
                </h2>
                <div className="flex flex-wrap gap-2">
                  {vehicle.safety.map((s, i) => (
                    <span key={i} className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Vehicles */}
            {relatedVehicles?.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-black text-gray-900">Similar {vehicleType === "bike" ? "Bikes" : "Cars"}</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {relatedVehicles.map((v) => (
                    <Link
                      key={v.slug}
                      href={`${detailPath}/${v.slug}`}
                      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-green-200 transition"
                    >
                      <div className="relative h-36 overflow-hidden bg-gray-100">
                        <Image src={v.image} alt={v.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
                      </div>
                      <div className="p-3">
                        <p className="text-[11px] font-semibold text-green-600">{v.brand}</p>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{v.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{v.priceDisplay}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Lead Form (sticky) */}
          <div className="lg:self-start lg:sticky lg:top-24">
            <LeadForm
              vehicleName={vehicle.name}
              vehicleSlug={vehicle.slug}
              vehicleType={vehicleType}
            />

            {/* Quick warranty card */}
            {vehicle.specs?.warranty_battery && (
              <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={18} className="text-green-600" />
                  <span className="text-sm font-black text-green-800">Warranty Coverage</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Vehicle Warranty</span>
                    <span className="font-bold text-gray-900">{vehicle.specs.warranty_vehicle}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Battery Warranty</span>
                    <span className="font-bold text-gray-900">{vehicle.specs.warranty_battery}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
