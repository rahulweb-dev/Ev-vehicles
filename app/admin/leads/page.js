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
  { key: "all",        label: "All Leads",  icon: Users },
  { key: "car",        label: "Cars",       icon: Car   },
  { key: "bike",       label: "Bikes",      icon: Bike  },
  { key: "commercial", label: "Commercial", icon: Truck },
];

const STATUS_OPTIONS = [
  { value: "new",       label: "New",       color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "contacted", label: "Contacted", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "converted", label: "Converted", color: "bg-green-50 text-green-700 border-green-200" },
  { value: "lost",      label: "Lost",      color: "bg-red-50 text-red-700 border-red-200" },
];

const INTENT_LABELS = {
  test_drive:  { label: "Test Drive",    color: "bg-indigo-50 text-indigo-700" },
  price_quote: { label: "Price Quote",   color: "bg-sky-50 text-sky-700" },
  finance:     { label: "EMI / Finance", color: "bg-amber-50 text-amber-700" },
  general:     { label: "General",       color: "bg-gray-100 text-gray-600" },
};

const TYPE_STYLE = {
  car:        "bg-blue-50 text-blue-700 border-blue-200",
  bike:       "bg-orange-50 text-orange-700 border-orange-200",
  commercial: "bg-purple-50 text-purple-700 border-purple-200",
};

function statusConfig(s) {
  return STATUS_OPTIONS.find((o) => o.value === s) || STATUS_OPTIONS[0];
}

/* ─── Stat Card ─────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, iconBg }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value ?? "—"}</p>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
    </div>
  );
}

/* ─── Lead Card ─────────────────────────────────────────────────────── */
function LeadCard({ lead, onStatusChange, onDelete }) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const sc = statusConfig(lead.status);
  const TypeIcon = lead.vehicleType === "car" ? Car : lead.vehicleType === "bike" ? Bike : Truck;

  async function handleStatus(newStatus) {
    setUpdating(true);
    try {
      await fetch(`/api/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onStatusChange(lead._id, newStatus);
    } finally { setUpdating(false); }
  }

  async function handleDelete() {
    if (!confirm(`Delete enquiry from ${lead.name}?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/leads/${lead._id}`, { method: "DELETE" });
      onDelete(lead._id);
    } finally { setDeleting(false); }
  }

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md">

      {/* Top row */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold ${TYPE_STYLE[lead.vehicleType] || TYPE_STYLE.car}`}>
            <TypeIcon size={13} />
            {lead.vehicleType === "car" ? "Car" : lead.vehicleType === "bike" ? "Bike" : "Commercial"}
          </span>
          <div>
            <p className="text-sm font-black text-gray-900 leading-tight">{lead.vehicleName}</p>
            <p className="text-[11px] text-gray-400">{lead.vehicleSlug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={lead.status}
              onChange={(e) => handleStatus(e.target.value)}
              disabled={updating}
              className={`appearance-none cursor-pointer rounded-xl border px-3 py-1.5 pr-7 text-xs font-bold outline-none transition bg-white ${sc.color}`}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Customer info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <Users size={13} className="text-gray-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">{lead.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-50">
              <Phone size={13} className="text-green-600" />
            </div>
            <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-green-700 hover:underline">
              {lead.phone}
            </a>
          </div>
          {lead.email && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Mail size={13} className="text-blue-600" />
              </div>
              <a href={`mailto:${lead.email}`} className="text-xs text-blue-700 hover:underline truncate">
                {lead.email}
              </a>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {(lead.city || lead.state) && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <MapPin size={13} className="text-gray-500" />
              </div>
              <p className="text-xs text-gray-600">{[lead.city, lead.state].filter(Boolean).join(", ")}</p>
            </div>
          )}
          {lead.intent && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <MessageSquare size={13} className="text-gray-500" />
              </div>
              <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${INTENT_LABELS[lead.intent]?.color || "bg-gray-100 text-gray-600"}`}>
                {INTENT_LABELS[lead.intent]?.label || lead.intent}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <Calendar size={13} className="text-gray-500" />
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

      {/* CTAs */}
      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
        <a
          href={`tel:${lead.phone}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-50 border border-green-200 py-2 text-xs font-bold text-green-700 hover:bg-green-100 transition"
        >
          <Phone size={13} /> Call Now
        </a>
        {lead.email && (
          <a
            href={`mailto:${lead.email}?subject=Enquiry for ${lead.vehicleName}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
          >
            <Mail size={13} /> Send Email
          </a>
        )}
        {lead.status === "new" && (
          <button
            onClick={() => handleStatus("contacted")}
            disabled={updating}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition disabled:opacity-50"
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
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <Icon size={28} className="text-gray-400" />
      </div>
      <p className="text-lg font-bold text-gray-500">No leads yet</p>
      <p className="mt-1 text-sm text-gray-400">Leads will appear here when customers submit enquiry forms</p>
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
      setCounts({
        all:        all.length,
        car:        all.filter((l) => l.vehicleType === "car").length,
        bike:       all.filter((l) => l.vehicleType === "bike").length,
        commercial: all.filter((l) => l.vehicleType === "commercial").length,
      });
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
    setAllLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l)));
  }
  function handleDelete(id) {
    setAllLeads((prev) => prev.filter((l) => l._id !== id));
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pt-20 lg:p-6 lg:pt-6">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Customer Leads</h1>
          <p className="mt-0.5 text-sm text-gray-500">All vehicle enquiries from across the website</p>
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Location banners */}
      {currentUser?.role === "dealer" ? (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <MapPin size={20} className="text-blue-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-blue-800">
              Showing leads for <span className="text-blue-900">{currentUser.city}, {currentUser.state}</span>
            </p>
            <p className="text-xs text-blue-500 mt-0.5">Dealer view — only your city's leads are shown</p>
          </div>
        </div>
      ) : currentUser?.role === "admin" ? (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
          <ShieldCheck size={20} className="text-green-600 shrink-0" />
          <p className="text-sm font-bold text-green-800">
            Super Admin — viewing <span className="text-green-900">all leads from all locations</span>
          </p>
        </div>
      ) : null}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Zap}          label="New Leads"  value={stats.new}       iconBg="bg-blue-600"   />
        <StatCard icon={Clock}        label="Contacted"  value={stats.contacted} iconBg="bg-amber-500"  />
        <StatCard icon={CheckCircle2} label="Converted"  value={stats.converted} iconBg="bg-green-600"  />
        <StatCard icon={XCircle}      label="Lost"       value={stats.lost}      iconBg="bg-red-500"    />
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                active
                  ? "bg-green-700 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-green-200 hover:text-green-700"
              }`}
            >
              <Icon size={15} />
              {tab.label}
              <span className={`rounded-lg px-2 py-0.5 text-xs font-black ${
                active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + filter */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-55 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
          <Search size={16} className="shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, vehicle, city…"
            className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none cursor-pointer rounded-xl border border-gray-200 bg-white pl-9 pr-8 py-2.5 text-sm font-semibold text-gray-700 shadow-sm outline-none hover:border-green-300 transition"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {!loading && (
        <p className="mb-4 text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-900">{leads.length}</span> {leads.length === 1 ? "lead" : "leads"}
          {statusFilter !== "all" && ` · Status: ${statusFilter}`}
          {search && ` · "${search}"`}
        </p>
      )}

      {/* Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white h-52 shadow-sm" />
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
