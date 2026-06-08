"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, ChevronLeft, Car, Bike } from "lucide-react";

function makePairs(vehicles) {
  const out = [];
  for (let i = 0; i + 1 < vehicles.length; i += 2) {
    out.push([vehicles[i], vehicles[i + 1]]);
  }
  return out.slice(0, 8);
}

function displayPrice(vehicle) {
  const first = vehicle.variants?.[0]?.exShowroomPrice;
  const last  = vehicle.variants?.[vehicle.variants?.length - 1]?.exShowroomPrice;
  if (!first) return "Price TBA";
  return last && last !== first ? `${first} – ${last}` : first;
}

export default function HomeCompareWidget() {
  const [activeTab, setActiveTab] = useState("cars");
  const [carPairs,  setCarPairs]  = useState([]);
  const [bikePairs, setBikePairs] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const scrollRef                 = useRef(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/vehicles?status=published&vehicleType=car&limit=20").then((r) => r.json()),
      fetch("/api/vehicles?status=published&vehicleType=bike&limit=20").then((r) => r.json()),
    ])
      .then(([carsData, bikesData]) => {
        setCarPairs(makePairs(carsData.vehicles  || []));
        setBikePairs(makePairs(bikesData.vehicles || []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 310, behavior: "smooth" });
  };

  /* reset scroll position when tab changes */
  const handleTab = (tab) => {
    setActiveTab(tab);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  };

  const pairs = activeTab === "cars" ? carPairs : bikePairs;

  if (loading || (carPairs.length === 0 && bikePairs.length === 0)) return null;

  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 shadow-sm">

          {/* Header */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-gray-900 sm:text-xl">
              Compare to buy the right EV
            </h2>

            <div className="flex items-center gap-3">
              {/* Tabs */}
              <div className="flex overflow-hidden rounded-xl border border-gray-200">
                <button
                  onClick={() => handleTab("cars")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold transition ${
                    activeTab === "cars"
                      ? "bg-green-600 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Car size={13} /> Cars
                </button>
                <button
                  onClick={() => handleTab("bikes")}
                  className={`flex items-center gap-1.5 border-l border-gray-200 px-4 py-1.5 text-xs font-bold transition ${
                    activeTab === "bikes"
                      ? "bg-green-600 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Bike size={13} /> Bikes
                </button>
              </div>

              {/* Scroll arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scroll(-1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-green-500 hover:text-green-600"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => scroll(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-green-500 hover:text-green-600"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Pairs row */}
          {pairs.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              No {activeTab} available to compare yet.
            </p>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {pairs.map(([vA, vB], i) => (
                <div
                  key={i}
                  className="flex min-w-67.5 shrink-0 flex-col rounded-xl border border-gray-100 bg-gray-50 p-4 sm:min-w-75"
                >
                  {/* Images + VS */}
                  <div className="flex items-center">
                    <div className="relative h-28 flex-1 overflow-hidden">
                      {vA.featuredImage ? (
                        <Image src={vA.featuredImage} alt={vA.name} fill className="object-contain" sizes="130px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-300">No image</div>
                      )}
                    </div>

                    <div className="mx-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800 text-[10px] font-black text-white shadow">
                      VS
                    </div>

                    <div className="relative h-28 flex-1 overflow-hidden">
                      {vB.featuredImage ? (
                        <Image src={vB.featuredImage} alt={vB.name} fill className="object-contain" sizes="130px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-300">No image</div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                    <div>
                      <p className="text-[10px] text-gray-400">{vA.brand}</p>
                      <p className="line-clamp-1 text-sm font-bold leading-tight text-gray-900">{vA.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-500">
                        {displayPrice(vA)}{vA.variants?.[0]?.exShowroomPrice && <span className="text-gray-400"> *</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">{vB.brand}</p>
                      <p className="line-clamp-1 text-sm font-bold leading-tight text-gray-900">{vB.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-500">
                        {displayPrice(vB)}{vB.variants?.[0]?.exShowroomPrice && <span className="text-gray-400"> *</span>}
                      </p>
                    </div>
                  </div>

                  {/* Compare button */}
                  <Link
                    href={`/compare/${vA.slug}-vs-${vB.slug}`}
                    className="mt-4 block w-full truncate rounded-lg border border-green-500 px-2 py-2 text-center text-xs font-bold text-green-600 transition hover:bg-green-50"
                  >
                    {vA.name} vs {vB.name}
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-5 border-t border-gray-100 pt-4">
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700"
            >
              View All {activeTab === "cars" ? "Car" : "Bike"} Comparisons
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
