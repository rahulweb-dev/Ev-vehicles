"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Car, Bike, ArrowRight, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SearchModal() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState([]);
  const [popular,  setPopular]  = useState([]);
  const [busy,     setBusy]     = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const open  = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => { setIsOpen(false); setQuery(""); setResults([]); }, []);

  // Focus on open
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 50); }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [close]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Fetch popular vehicles once on mount
  useEffect(() => {
    fetch("/api/vehicles?status=published&limit=6&sort=createdAt")
      .then(r => r.json())
      .then(data => setPopular(data.vehicles || []))
      .catch(() => {});
  }, []);

  // Debounced live search
  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setBusy(true);
      try {
        const enc = encodeURIComponent(val);
        const [vRes, aRes] = await Promise.all([
          fetch(`/api/vehicles?search=${enc}&status=published&limit=5`).then(r => r.json()),
          fetch(`/api/articles?search=${enc}&status=published&limit=3`).then(r => r.json()),
        ]);
        const vItems = (vRes.vehicles || []).map(v => ({
          kind: "vehicle",
          id:   v._id,
          slug: v.slug,
          type: v.vehicleType === "car" ? "cars" : "bikes",
          name:  v.name,
          brand: v.brand,
          image: v.featuredImage || "",
          price: v.variants?.[0]?.exShowroomPrice || "Price TBA",
        }));
        const aItems = (aRes.articles || []).map(a => ({
          kind:  "article",
          id:    a._id,
          slug:  a.slug,
          type:  "news",
          name:  a.title,
          brand: a.category,
          image: a.image || "",
          price: null,
        }));
        setResults([...vItems, ...aItems]);
      } catch { setResults([]); }
      setBusy(false);
    }, 300);
  }

  return (
    <>
      {/* Trigger */}
      <button onClick={open}
        className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200">
        <Search size={17} /> Search
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-200 flex items-start justify-center pt-16 px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Input row */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Search size={20} className="text-gray-400 shrink-0" />
              <input ref={inputRef} type="text" value={query} onChange={handleChange}
                placeholder="Search electric cars, bikes, news…"
                className="flex-1 text-base outline-none text-gray-800 placeholder:text-gray-400" />
              {query && (
                <button onClick={() => { setQuery(""); setResults([]); }}
                  className="shrink-0 rounded-full p-1 hover:bg-gray-100 text-gray-400">
                  <X size={16} />
                </button>
              )}
              <button onClick={close}
                className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-200">
                Esc
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {/* Live results */}
              {busy ? (
                <div className="py-10 text-center text-sm text-gray-400">Searching…</div>
              ) : results.length > 0 ? (
                <div className="p-3">
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Results</p>
                  {results.map(r => (
                    <Link key={`${r.kind}-${r.id}`}
                      href={r.kind === "article" ? `/news/${r.slug}` : `/${r.type}/${r.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 transition">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {r.image
                          ? <Image src={r.image} alt={r.name} fill className="object-cover" sizes="80px" />
                          : <div className="flex h-full items-center justify-center text-2xl text-gray-200">⚡</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold capitalize text-green-600">{r.brand}</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{r.name}</p>
                        {r.price && <p className="text-xs text-gray-500">{r.price}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          r.kind === "article"  ? "bg-yellow-50 text-yellow-700" :
                          r.type  === "cars"    ? "bg-blue-50 text-blue-600"     : "bg-orange-50 text-orange-600"
                        }`}>
                          {r.kind === "article" ? "News" : r.type === "cars" ? "Car" : "Bike"}
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
                  <p className="mt-1 text-sm">Try a brand name, model, or topic</p>
                </div>
              ) : (
                /* Popular vehicles when no query */
                <div className="p-4">
                  <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Popular Vehicles</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {popular.map(v => (
                      <Link key={v._id} onClick={close}
                        href={`/${v.vehicleType === "car" ? "cars" : "bikes"}/${v.slug}`}
                        className="flex items-center gap-2 rounded-xl p-2.5 hover:bg-gray-50 transition">
                        <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {v.featuredImage
                            ? <Image src={v.featuredImage} alt={v.name} fill className="object-cover" sizes="56px" />
                            : <div className="flex h-full items-center justify-center text-lg text-gray-200">⚡</div>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-gray-800 truncate">{v.name}</p>
                          <p className="text-[10px] text-green-600">{v.variants?.[0]?.exShowroomPrice || "—"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer quick links */}
              <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
                <div className="flex gap-4">
                  <Link href="/cars"  onClick={close} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-600">
                    <Car  size={13} /> All Cars
                  </Link>
                  <Link href="/bikes" onClick={close} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-600">
                    <Bike size={13} /> All Bikes
                  </Link>
                  <Link href="/news"  onClick={close} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-600">
                    <Newspaper size={13} /> News
                  </Link>
                </div>
                <Link href="/compare" onClick={close} className="text-xs font-semibold text-green-600 hover:underline">
                  Compare EVs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
