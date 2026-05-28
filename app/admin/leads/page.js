"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Car, Bike, Truck, Phone, Mail, MapPin,
  Calendar, ChevronDown, Search, RefreshCw,
  CheckCircle2, Clock, XCircle,
  Filter, Trash2, MessageSquare, Zap, ShieldCheck,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────────────── */
const TABS = [
  { key: "all",        label: "All Leads",    icon: Users,  color: "text-white",      bg: "bg-gray-700" },
  { key: "car",        label: "Cars",         icon: Car,    color: "text-blue-400",   bg: "bg-blue-900/50" },
  { key: "bike",       label: "Bikes",        icon: Bike,   color: "text-orange-400", bg: "bg-orange-900/50" },
  { key: "commercial", label: "Commercial",   icon: Truck,  color: "text-purple-400", bg: "bg-purple-900/50" },
];

const STATUS_OPTIONS = [
  { value: "new",       label: "New",       color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "converted", label: "Converted", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "lost",      label: "Lost",      color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

const INTENT_LABELS = {
  test_drive:  { label: "Test Drive",    color: "bg-indigo-500/20 text-indigo-300" },
  price_quote: { label: "Price Quote",   color: "bg-cyan-500/20 text-cyan-300" },
  finance:     { label: "EMI / Finance", color: "bg-amber-500/20 text-amber-300" },
  general:     { label: "General",       color: "bg-gray-500/20 text-gray-400" },
};

function statusConfig(s) {
  return STATUS_OPTIONS.find((o) => o.value === s) || STATUS_OPTIONS[0];
}

/* ─── Stat Card ─────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-black text-white">{value ?? "—"}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-400">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-600">{sub}</p>}
    </div>
  );
}

/* ─── Lead Card ─────────────────────────────────────────────────────── */
function LeadCard({ lead, onStatusChange, onDelete }) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const sc = statusConfig(lead.status);

  async function handleStatus(newStatus) {
    setUpdating(true);
    try {
      await fetch(`/api/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onStatusChange(lead._id, newStatus);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete enquiry from ${lead.name}?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/leads/${lead._id}`, { method: "DELETE" });
      onDelete(lead._id);
    } finally {
      setDeleting(false);
    }
  }

  const typeColors = {
    car:        "bg-blue-900/50 text-blue-400 border-blue-800",
    bike:       "bg-orange-900/50 text-orange-400 border-orange-800",
    commercial: "bg-purple-900/50 text-purple-400 border-purple-800",
  };
  const TypeIcon = lead.vehicleType === "car" ? Car : lead.vehicleType === "bike" ? Bike : Truck;

  return (
    <div className="group relative rounded-2xl border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-700">

      {/* Top row: vehicle info + status */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold ${typeColors[lead.vehicleType] || typeColors.car}`}>
            <TypeIcon size={13} />
            {lead.vehicleType === "car" ? "Car" : lead.vehicleType === "bike" ? "Bike" : "Commercial"}
          </span>
          <div>
            <p className="text-sm font-black text-white leading-tight">{lead.vehicleName}</p>
            <p className="text-[11px] text-gray-500">{lead.vehicleSlug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Selector */}
          <div className="relative">
            <select
              value={lead.status}
              onChange={(e) => handleStatus(e.target.value)}
              disabled={updating}
              className={`appearance-none cursor-pointer rounded-xl border px-3 py-1.5 pr-7 text-xs font-bold outline-none transition ${sc.color} bg-transparent`}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-gray-900 text-white">
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60" />
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl p-1.5 text-gray-600 hover:bg-red-900/30 hover:text-red-400 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Customer info grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Left: Contact details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-800">
              <Users size={13} className="text-gray-400" />
            </div>
            <p className="text-sm font-bold text-white">{lead.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-800">
              <Phone size={13} className="text-green-400" />
            </div>
            <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-green-400 hover:underline">
              {lead.phone}
            </a>
          </div>
          {lead.email && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-800">
                <Mail size={13} className="text-blue-400" />
              </div>
              <a href={`mailto:${lead.email}`} className="text-xs text-blue-400 hover:underline truncate">
                {lead.email}
              </a>
            </div>
          )}
        </div>

        {/* Right: Location + Intent + Date */}
        <div className="space-y-2">
          {(lead.city || lead.state) && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-800">
                <MapPin size={13} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-400">
                {[lead.city, lead.state].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-800">
              <MessageSquare size={13} className="text-gray-400" />
            </div>
            {lead.intent && (
              <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${INTENT_LABELS[lead.intent]?.color || "text-gray-400"}`}>
                {INTENT_LABELS[lead.intent]?.label || lead.intent}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-800">
              <Calendar size={13} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">
              {new Date(lead.createdAt).toLocaleString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick CTA */}
      <div className="mt-4 flex gap-2 border-t border-gray-800 pt-4">
        <a
          href={`tel:${lead.phone}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600/20 border border-green-600/30 py-2 text-xs font-bold text-green-400 hover:bg-green-600/30 transition"
        >
          <Phone size={13} /> Call Now
        </a>
        {lead.email && (
          <a
            href={`mailto:${lead.email}?subject=Enquiry for ${lead.vehicleName}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600/20 border border-blue-600/30 py-2 text-xs font-bold text-blue-400 hover:bg-blue-600/30 transition"
          >
            <Mail size={13} /> Send Email
          </a>
        )}
        {lead.status === "new" && (
          <button
            onClick={() => handleStatus("contacted")}
            disabled={updating}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-yellow-600/20 border border-yellow-600/30 py-2 text-xs font-bold text-yellow-400 hover:bg-yellow-600/30 transition disabled:opacity-50"
          >
            <CheckCircle2 size={13} /> Mark Contacted
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────── */
function EmptyState({ tab }) {
  const icons = { all: Users, car: Car, bike: Bike, commercial: Truck };
  const Icon = icons[tab] || Users;
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800">
        <Icon size={28} className="text-gray-600" />
      </div>
      <p className="text-lg font-bold text-gray-400">No leads yet</p>
      <p className="mt-1 text-sm text-gray-600">
        Leads will appear here when customers submit enquiry forms
      </p>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function LeadsPage() {
  const [activeTab, setActiveTab]   = useState("all");
  const [leads, setLeads]           = useState([]);
  const [allLeads, setAllLeads]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("all");
  const [counts, setCounts]         = useState({ all: 0, car: 0, bike: 0, commercial: 0 });
  const [stats, setStats]           = useState({ new: 0, contacted: 0, converted: 0, lost: 0 });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) setCurrentUser(d.user);
    }).catch(() => {});
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads?limit=200");
      const data = await res.json();
      const all = data.leads || [];
      setAllLeads(all);

      // Counts by type
      setCounts({
        all:        all.length,
        car:        all.filter((l) => l.vehicleType === "car").length,
        bike:       all.filter((l) => l.vehicleType === "bike").length,
        commercial: all.filter((l) => l.vehicleType === "commercial").length,
      });

      // Status stats
      setStats({
        new:       all.filter((l) => l.status === "new").length,
        contacted: all.filter((l) => l.status === "contacted").length,
        converted: all.filter((l) => l.status === "converted").length,
        lost:      all.filter((l) => l.status === "lost").length,
      });
    } catch {
      setAllLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Filter by tab, search, status
  useEffect(() => {
    let filtered = activeTab === "all" ? allLeads : allLeads.filter((l) => l.vehicleType === activeTab);
    if (statusFilter !== "all") filtered = filtered.filter((l) => l.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.vehicleName?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q)
      );
    }
    setLeads(filtered);
  }, [allLeads, activeTab, statusFilter, search]);

  function handleStatusChange(id, newStatus) {
    setAllLeads((prev) =>
      prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
    );
  }

  function handleDelete(id) {
    setAllLeads((prev) => prev.filter((l) => l._id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 pt-20 lg:p-8 lg:pt-8">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Customer Leads</h1>
          <p className="mt-1 text-sm text-gray-400">
            All vehicle enquiries from customers across the website
          </p>
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-gray-700 transition"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Location Banner */}
      {currentUser?.role === "dealer" ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-800/40 bg-blue-900/10 px-5 py-4">
          <MapPin size={20} className="text-blue-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-blue-300">
              Showing leads for <span className="text-white">{currentUser.city}, {currentUser.state}</span>
            </p>
            <p className="text-xs text-blue-400/70 mt-0.5">
              You are logged in as a location dealer — you can only view and manage leads from your assigned city
            </p>
          </div>
        </div>
      ) : currentUser?.role === "admin" ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-800/40 bg-green-900/10 px-5 py-4">
          <ShieldCheck size={20} className="text-green-400 shrink-0" />
          <p className="text-sm font-bold text-green-300">
            Super Admin — viewing <span className="text-white">all leads from all locations</span>
          </p>
        </div>
      ) : null}

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Zap}         label="New Leads"   value={stats.new}       color="bg-blue-600"    />
        <StatCard icon={Clock}       label="Contacted"   value={stats.contacted} color="bg-yellow-600"  />
        <StatCard icon={CheckCircle2}label="Converted"   value={stats.converted} color="bg-green-600"   />
        <StatCard icon={XCircle}     label="Lost"        value={stats.lost}      color="bg-red-600"     />
      </div>

      {/* Type Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                active
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                  : "border border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 hover:text-white"
              }`}
            >
              <Icon size={15} />
              {tab.label}
              <span className={`rounded-lg px-2 py-0.5 text-xs font-black ${
                active ? "bg-white/20 text-white" : "bg-gray-800 text-gray-500"
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Status Filter */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5">
          <Search size={16} className="shrink-0 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, vehicle, city…"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none cursor-pointer rounded-xl border border-gray-800 bg-gray-900 pl-9 pr-8 py-2.5 text-sm font-semibold text-gray-300 outline-none hover:border-gray-700 transition"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <p className="mb-4 text-xs text-gray-600">
          Showing {leads.length} {leads.length === 1 ? "lead" : "leads"}
          {statusFilter !== "all" && ` · Status: ${statusFilter}`}
          {search && ` · Search: "${search}"`}
        </p>
      )}

      {/* Lead Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-800 bg-gray-900 p-5 h-52" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
            <LeadCard
              key={lead._id}
              lead={lead}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
