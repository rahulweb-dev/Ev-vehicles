"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, Eye, Search, Star,
  Car, Bike, Calendar, LayoutGrid, List,
  CheckCircle2, Clock, Filter, Sparkles, Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

const TYPE_STYLE = {
  car:  { label: "Car",  icon: Car,  badge: "bg-blue-50 text-blue-700 border-blue-200",   dot: "bg-blue-500" },
  bike: { label: "Bike", icon: Bike, badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
};
const CAT_STYLE = {
  upcoming: { badge: "bg-purple-50 text-purple-700 border-purple-200" },
  popular:  { badge: "bg-green-50 text-green-700 border-green-200" },
};
const STATUS_STYLE = {
  published: "bg-green-100 text-green-700 border border-green-200",
  draft:     "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

function VehicleGridCard({ vehicle, onDelete, deleting, onGenerate, generating }) {
  const type = TYPE_STYLE[vehicle.vehicleType] || TYPE_STYLE.car;
  const Icon = type.icon;
  const isGen = generating === vehicle._id;
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-green-200 hover:shadow-md transition">
      {/* Image */}
      <div className="relative h-44 w-full shrink-0 bg-gray-100">
        {vehicle.featuredImage ? (
          <Image src={vehicle.featuredImage} alt={vehicle.name} fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gray-50">
            <Icon size={32} className="text-gray-200" />
            <span className="text-xs text-gray-300">No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold capitalize ${type.badge}`}>
            {type.label}
          </span>
          <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold capitalize ${CAT_STYLE[vehicle.category]?.badge}`}>
            {vehicle.category}
          </span>
          {vehicle.featured && (
            <span className="flex items-center gap-0.5 rounded-lg bg-yellow-400/90 px-1.5 py-0.5 text-[9px] font-black text-yellow-900">
              <Star size={8} fill="currentColor" /> Featured
            </span>
          )}
        </div>
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${STATUS_STYLE[vehicle.status]}`}>
          {vehicle.status}
        </span>

        {/* Actions on hover */}
        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <button onClick={() => onGenerate(vehicle._id, vehicle.name)} disabled={isGen}
            title="Auto-generate article"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-gray-600 shadow hover:bg-purple-600 hover:text-white transition disabled:opacity-40">
            {isGen ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          </button>
          <Link href={`/admin/vehicles/${vehicle._id}/edit`}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-gray-600 shadow hover:bg-blue-600 hover:text-white transition">
            <Pencil size={14} />
          </Link>
          <button onClick={() => onDelete(vehicle._id, vehicle.name)} disabled={deleting === vehicle._id}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-gray-600 shadow hover:bg-red-600 hover:text-white transition disabled:opacity-40">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{vehicle.brand}</p>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-gray-900">{vehicle.name}</h3>
        {vehicle.variants?.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {vehicle.variants.length} variant{vehicle.variants.length > 1 ? "s" : ""} ·{" "}
            {vehicle.variants[0].exShowroomPrice}
          </p>
        )}
        {vehicle.launchDate && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={11} />
            {new Date(vehicle.launchDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        )}
      </div>
    </div>
  );
}

function VehicleListRow({ vehicle, onDelete, deleting, onGenerate, generating }) {
  const isGen = generating === vehicle._id;
  const type = TYPE_STYLE[vehicle.vehicleType] || TYPE_STYLE.car;
  const Icon = type.icon;
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-green-200 hover:shadow-md transition">
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {vehicle.featuredImage ? (
          <Image src={vehicle.featuredImage} alt={vehicle.name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="flex h-full items-center justify-center"><Icon size={16} className="text-gray-300" /></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{vehicle.brand}</p>
        <p className="truncate text-sm font-semibold text-gray-900">{vehicle.name}</p>
        <p className="text-xs text-gray-400 capitalize">{vehicle.vehicleType} · {vehicle.category}</p>
      </div>

      {vehicle.variants?.[0]?.exShowroomPrice && (
        <span className="hidden sm:block shrink-0 text-xs font-semibold text-gray-700">
          {vehicle.variants[0].exShowroomPrice}
        </span>
      )}

      <span className={`hidden sm:inline-block shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${STATUS_STYLE[vehicle.status]}`}>
        {vehicle.status}
      </span>

      {vehicle.launchDate && (
        <span className="hidden md:flex shrink-0 items-center gap-1 text-xs text-gray-400">
          <Calendar size={11} />
          {new Date(vehicle.launchDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
        </span>
      )}

      <div className="flex shrink-0 items-center gap-1">
        <button onClick={() => onGenerate(vehicle._id, vehicle.name)} disabled={isGen}
          title="Auto-generate article"
          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition disabled:opacity-40">
          {isGen ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        </button>
        <Link href={`/admin/vehicles/${vehicle._id}/edit`}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition">
          <Pencil size={14} />
        </Link>
        <button onClick={() => onDelete(vehicle._id, vehicle.name)} disabled={deleting === vehicle._id}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function AdminVehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [catFilter, setCatFilter]       = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy]             = useState("createdAt");
  const [view, setView]                 = useState("grid");
  const [deleting, setDeleting]         = useState(null);
  const [generating, setGenerating]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200", sort: sortBy });
      if (typeFilter !== "all")   params.set("vehicleType", typeFilter);
      if (catFilter !== "all")    params.set("category", catFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res  = await fetch(`/api/vehicles?${params}`);
      const data = await res.json();
      setVehicles(data.vehicles || []);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, catFilter, statusFilter, sortBy]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"?\nThis cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  async function handleGenerate(id, name) {
    if (!confirm(`Auto-generate a draft article for "${name}" using AI?\n\nThis will create a new draft in Articles.`)) return;
    setGenerating(id);
    try {
      const res  = await fetch("/api/admin/generate-article", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ vehicleId: id, style: "review" }),
      });
      const data = await res.json();
      if (data.success) {
        if (confirm(`Article drafted: "${data.article.title}"\n\nOpen the editor now?`)) {
          router.push(`/admin/articles/${data.article._id}/edit`);
        }
      } else {
        alert("Failed to generate: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Network error – please try again");
    } finally {
      setGenerating(null);
    }
  }

  const filtered = vehicles.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    "upcoming-car":  vehicles.filter((v) => v.category === "upcoming" && v.vehicleType === "car").length,
    "upcoming-bike": vehicles.filter((v) => v.category === "upcoming" && v.vehicleType === "bike").length,
    "popular-car":   vehicles.filter((v) => v.category === "popular"  && v.vehicleType === "car").length,
    "popular-bike":  vehicles.filter((v) => v.category === "popular"  && v.vehicleType === "bike").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Vehicles</h1>
          <p className="mt-0.5 text-sm text-gray-500">{vehicles.length} vehicles total</p>
        </div>
        <Link href="/admin/vehicles/new"
          className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 transition shadow-sm">
          <Plus size={16} /> Add Vehicle
        </Link>
      </div>

      {/* Section tiles */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { key: "upcoming-car",  label: "Upcoming Cars",  icon: Car,  color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
          { key: "upcoming-bike", label: "Upcoming Bikes", icon: Bike, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
          { key: "popular-car",   label: "Popular Cars",   icon: Car,  color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
          { key: "popular-bike",  label: "Popular Bikes",  icon: Bike, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
        ].map(({ key, label, icon: Icon, color, bg, border }) => (
          <button
            key={key}
            onClick={() => {
              const [cat, type] = key.split("-");
              setCatFilter(cat); setTypeFilter(type);
            }}
            className={`flex items-center gap-3 rounded-xl border ${border} ${bg} px-4 py-3 shadow-sm text-left hover:shadow-md transition`}
          >
            <Icon size={18} className={color} />
            <div>
              <p className="text-lg font-black text-gray-900">{counts[key]}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or brand…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition" />
        </div>

        {/* Type filter */}
        <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm p-0.5">
          {[["all","All"], ["car","Cars"], ["bike","Bikes"]].map(([v, l]) => (
            <button key={v} onClick={() => setTypeFilter(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${typeFilter === v ? "bg-green-700 text-white" : "text-gray-500 hover:text-gray-900"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm p-0.5">
          {[["all","All"], ["upcoming","Upcoming"], ["popular","Popular"]].map(([v, l]) => (
            <button key={v} onClick={() => setCatFilter(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${catFilter === v ? "bg-green-700 text-white" : "text-gray-500 hover:text-gray-900"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm p-0.5">
          {[["all","All"], ["published","Published"], ["draft","Draft"]].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === v ? "bg-green-700 text-white" : "text-gray-500 hover:text-gray-900"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-600 shadow-sm outline-none focus:border-green-500 transition">
          <option value="createdAt">Newest First</option>
          <option value="launchDate">Launch Date</option>
          <option value="brand">Brand A–Z</option>
          <option value="name">Name A–Z</option>
        </select>

        {/* View toggle */}
        <div className="ml-auto flex rounded-xl border border-gray-200 bg-white shadow-sm p-0.5">
          <button onClick={() => setView("grid")}
            className={`rounded-lg p-1.5 transition ${view === "grid" ? "bg-green-700 text-white" : "text-gray-400 hover:text-gray-700"}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setView("list")}
            className={`rounded-lg p-1.5 transition ${view === "list" ? "bg-green-700 text-white" : "text-gray-400 hover:text-gray-700"}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Active filter indicator */}
      {(typeFilter !== "all" || catFilter !== "all" || statusFilter !== "all" || search) && (
        <div className="mb-3 flex items-center gap-2">
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of {vehicles.length}
          </p>
          <button onClick={() => { setTypeFilter("all"); setCatFilter("all"); setStatusFilter("all"); setSearch(""); }}
            className="text-xs font-semibold text-green-700 hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {/* Grid / List */}
      {loading ? (
        view === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="h-44 rounded-t-2xl bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-gray-100" />
                  <div className="h-4 w-2/3 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">{Array(8).fill(0).map((_, i) => <div key={i} className="animate-pulse h-20 rounded-xl bg-white border border-gray-200 shadow-sm" />)}</div>
        )
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 shadow-sm">
          <Car size={40} className="mb-3 text-gray-200" />
          <p className="text-sm font-medium text-gray-400">
            {search || typeFilter !== "all" || catFilter !== "all" || statusFilter !== "all"
              ? "No vehicles match your filters"
              : "No vehicles yet"}
          </p>
          {!search && typeFilter === "all" && catFilter === "all" && statusFilter === "all" && (
            <Link href="/admin/vehicles/new"
              className="mt-4 flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800 transition">
              <Plus size={14} /> Add first vehicle
            </Link>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v) => (
            <VehicleGridCard key={v._id} vehicle={v} onDelete={handleDelete} deleting={deleting} onGenerate={handleGenerate} generating={generating} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => (
            <VehicleListRow key={v._id} vehicle={v} onDelete={handleDelete} deleting={deleting} onGenerate={handleGenerate} generating={generating} />
          ))}
        </div>
      )}
    </div>
  );
}
