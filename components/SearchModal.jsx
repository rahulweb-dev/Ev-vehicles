"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Car, Bike, ArrowRight, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ArticleImage from "@/components/news/ArticleImage";

const FILTERS = [
  { id: "all",     label: "All" },
  { id: "cars",    label: "Cars",    icon: <Car  size={12} /> },
  { id: "bikes",   label: "Bikes",   icon: <Bike size={12} /> },
  { id: "news",    label: "News",    icon: <Newspaper size={12} /> },
];

function articleImageFallback(result) {
  const title = encodeURIComponent(result?.name || "EV News India");
  const tag = encodeURIComponent(result?.brand || "news");
  return `/api/og?title=${title}&tag=${tag}&type=article`;
}

export default function SearchModal() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [query,    setQuery]    = useState("");
  const [filter,   setFilter]   = useState("all");
  const [results,  setResults]  = useState([]);
  const [popular,  setPopular]  = useState([]);
  const [busy,     setBusy]     = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const open  = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => { setIsOpen(false); setQuery(""); setResults([]); setFilter("all"); }, []);

  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 50); }, [isOpen]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    fetch("/api/vehicles?status=published&limit=6&sort=createdAt")
      .then(r => r.json())
      .then(data => setPopular(data.vehicles || []))
      .catch(() => {});
  }, []);

  const runSearch = useCallback((val, activeFilter) => {
    clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setBusy(true);
      try {
        const enc = encodeURIComponent(val);
        const fetchCars  = (activeFilter === "all" || activeFilter === "cars")
          ? fetch(`/api/vehicles?search=${enc}&vehicleType=car&status=published&limit=5`).then(r => r.json())
          : Promise.resolve({ vehicles: [] });
        const fetchBikes = (activeFilter === "all" || activeFilter === "bikes")
          ? fetch(`/api/vehicles?search=${enc}&vehicleType=bike&status=published&limit=5`).then(r => r.json())
          : Promise.resolve({ vehicles: [] });
        const fetchNews  = (activeFilter === "all" || activeFilter === "news")
          ? fetch(`/api/articles?search=${enc}&status=published&limit=4`).then(r => r.json())
          : Promise.resolve({ articles: [] });

        const [carsData, bikesData, newsData] = await Promise.all([fetchCars, fetchBikes, fetchNews]);

        const vItems = [
          ...(carsData.vehicles  || []).map(v => ({ kind: "vehicle", id: v._id, slug: v.slug, type: "cars",  name: v.name, brand: v.brand, image: v.featuredImage || "", price: v.variants?.[0]?.exShowroomPrice || "Price TBA" })),
          ...(bikesData.vehicles || []).map(v => ({ kind: "vehicle", id: v._id, slug: v.slug, type: "bikes", name: v.name, brand: v.brand, image: v.featuredImage || "", price: v.variants?.[0]?.exShowroomPrice || "Price TBA" })),
        ];
        const aItems = (newsData.articles || []).map(a => ({
          kind: "article", id: a._id, slug: a.slug, type: "news",
          name: a.title, brand: a.category, image: a.image || "", price: null,
        }));
        setResults([...vItems, ...aItems]);
      } catch { setResults([]); }
      setBusy(false);
    }, 280);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    runSearch(val, filter);
  };

  const handleFilter = (f) => {
    setFilter(f);
    if (query.trim()) runSearch(query, f);
  };

  return (
    <>
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

            {/* Filter chips */}
            <div className="flex gap-2 px-5 py-2.5 border-b border-gray-50 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {FILTERS.map(f => (
                <button key={f.id} onClick={() => handleFilter(f.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    filter === f.id
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {f.icon}{f.label}
                </button>
              ))}
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {busy ? (
                <div className="py-10 text-center text-sm text-gray-400">Searching…</div>
              ) : results.length > 0 ? (
                <div className="p-3">
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                  {results.map(r => (
                    <Link key={`${r.kind}-${r.id}`}
                      href={r.kind === "article" ? `/news/${r.slug}` : `/${r.type}/${r.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 transition">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {r.kind === "article" ? (
                          <ArticleImage
                            src={r.image}
                            fallbackSrc={articleImageFallback(r)}
                            alt={r.name}
                            className="h-full w-full object-cover"
                          />
                        ) : r.image ? (
                          <Image src={r.image} alt={r.name} fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl text-gray-200">⚡</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold capitalize text-green-600">{r.brand}</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{r.name}</p>
                        {r.price && <p className="text-xs text-gray-500">{r.price}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          r.kind === "article" ? "bg-yellow-50 text-yellow-700" :
                          r.type === "cars"    ? "bg-blue-50 text-blue-600"     : "bg-orange-50 text-orange-600"
                        }`}>
                          {r.kind === "article" ? "News" : r.type === "cars" ? "Car" : "Bike"}
                        </span>
                        <ArrowRight size={14} className="text-gray-300" />
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={close}
                    className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-green-100 bg-green-50 py-2.5 text-sm font-bold text-green-700 hover:bg-green-100 transition"
                  >
                    See all results for &ldquo;{query}&rdquo; <ArrowRight size={14} />
                  </Link>
                </div>
              ) : query ? (
                <div className="py-10 text-center text-gray-400">
                  <Search size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No results for &quot;{query}&quot;</p>
                  <p className="mt-1 text-sm">Try a different keyword or filter</p>
                  <Link href={`/search?q=${encodeURIComponent(query)}`} onClick={close}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition">
                    Full search page <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
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
