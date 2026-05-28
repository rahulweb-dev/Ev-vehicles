"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Car, Bike, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { electricCars } from "@/data/vehiclesData";
import { electricBikes } from "@/data/vehiclesData";

const ALL_VEHICLES = [
  ...electricCars.map((v) => ({ ...v, vehicleType: "cars" })),
  ...electricBikes.map((v) => ({ ...v, vehicleType: "bikes" })),
];

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); return; }
    const filtered = ALL_VEHICLES.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q)
    ).slice(0, 7);
    setResults(filtered);
  }, [query]);

  const popular = ALL_VEHICLES.slice(0, 6);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={open}
        className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
      >
        <Search size={17} />
        Search
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-16 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Modal */}
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Search size={20} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search electric cars, bikes, brands…"
                className="flex-1 text-base outline-none text-gray-800 placeholder:text-gray-400"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="flex-shrink-0 rounded-full p-1 hover:bg-gray-100 text-gray-400"
                >
                  <X size={16} />
                </button>
              )}
              <button
                onClick={close}
                className="flex-shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-200"
              >
                Esc
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length > 0 ? (
                <div className="p-3">
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Results
                  </p>
                  {results.map((v) => (
                    <Link
                      key={`${v.vehicleType}-${v.id}`}
                      href={`/${v.vehicleType}/${v.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 transition"
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
                        <p className="text-[11px] font-semibold text-green-600">{v.brand}</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{v.name}</p>
                        <p className="text-xs text-gray-500">{v.priceDisplay}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            v.vehicleType === "cars"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {v.vehicleType === "cars" ? "Car" : "Bike"}
                        </span>
                        <ArrowRight size={14} className="text-gray-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : query ? (
                <div className="py-14 text-center text-gray-400">
                  <Search size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No results for &quot;{query}&quot;</p>
                  <p className="mt-1 text-sm">Try searching for a brand or model name</p>
                </div>
              ) : (
                <div className="p-4">
                  <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Popular Vehicles
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {popular.map((v) => (
                      <Link
                        key={`pop-${v.vehicleType}-${v.id}`}
                        href={`/${v.vehicleType}/${v.slug}`}
                        onClick={close}
                        className="flex items-center gap-2 rounded-xl p-2.5 hover:bg-gray-50 transition"
                      >
                        <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={v.image}
                            alt={v.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-gray-800 truncate">{v.name}</p>
                          <p className="text-[10px] text-green-600">{v.priceDisplay}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
                <div className="flex gap-4">
                  <Link
                    href="/cars"
                    onClick={close}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-600"
                  >
                    <Car size={13} /> Browse All Cars
                  </Link>
                  <Link
                    href="/bikes"
                    onClick={close}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-600"
                  >
                    <Bike size={13} /> Browse All Bikes
                  </Link>
                </div>
                <Link
                  href="/compare"
                  onClick={close}
                  className="text-xs font-semibold text-green-600 hover:underline"
                >
                  Compare →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
