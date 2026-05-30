"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Plus, MapPin, Phone, Mail, Edit2, Trash2,
  CheckCircle2, XCircle, Eye, EyeOff, X, Save,
  Building2, ShieldCheck, AlertCircle, RefreshCw,
} from "lucide-react";

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Chandigarh","Puducherry",
];

const EMPTY_FORM = { name: "", email: "", password: "", city: "", state: "", phone: "", dealerCode: "" };

const inputCls = "w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-white";

/* ─── Dealer Form Modal ──────────────────────────────────────────── */
function DealerModal({ mode, dealer, onSave, onClose }) {
  const [form, setForm]     = useState(mode === "edit" ? { ...dealer, password: "" } : { ...EMPTY_FORM });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); setError(""); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.city || !form.state) {
      setError("Name, email, city and state are required"); return;
    }
    if (mode === "create" && !form.password) {
      setError("Password is required"); return;
    }
    setLoading(true);
    try {
      const url    = mode === "edit" ? `/api/users/${dealer._id}` : "/api/users";
      const method = mode === "edit" ? "PATCH" : "POST";
      const body   = { ...form };
      if (mode === "edit" && !body.password) delete body.password;
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onSave(data.user, mode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
              {mode === "create" ? <Plus size={18} className="text-green-700" /> : <Edit2 size={18} className="text-green-700" />}
            </div>
            <h2 className="text-base font-black text-gray-900">
              {mode === "create" ? "Add New Dealer" : "Edit Dealer"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Full Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Dealer name" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Dealer Code</label>
              <input value={form.dealerCode} onChange={(e) => set("dealerCode", e.target.value)} placeholder="e.g. MUM-001" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Email Address *</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="dealer@example.com" className={inputCls} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              {mode === "edit" ? "New Password (leave blank to keep current)" : "Password *"}
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={mode === "edit" ? "Leave blank to keep" : "Min 6 characters"}
                className={`${inputCls} pr-10`}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Phone Number</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="10-digit mobile" maxLength={10} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">City * (leads filtered by this)</label>
              <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Mumbai" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">State *</label>
              <select value={form.state} onChange={(e) => set("state", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 focus:bg-white">
                <option value="">Select state</option>
                {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
            <strong>📍 Location scope:</strong> This dealer will only see leads where the customer's city matches{" "}
            <strong>{form.city || "their assigned city"}</strong>.
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 py-2.5 text-sm font-bold text-white hover:bg-green-600 transition disabled:opacity-50">
              <Save size={15} /> {loading ? "Saving…" : mode === "create" ? "Create Dealer" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Dealer Card ────────────────────────────────────────────────── */
function DealerCard({ dealer, onEdit, onToggle, onDelete, leadCount }) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function toggle() {
    setToggling(true);
    try {
      await fetch(`/api/users/${dealer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !dealer.isActive }),
      });
      onToggle(dealer._id, !dealer.isActive);
    } finally { setToggling(false); }
  }

  async function remove() {
    if (!confirm(`Delete dealer "${dealer.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/users/${dealer._id}`, { method: "DELETE" });
      onDelete(dealer._id);
    } finally { setDeleting(false); }
  }

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
      dealer.isActive ? "border-gray-200" : "border-red-200 opacity-75"
    }`}>

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black ${
            dealer.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
          }`}>
            {dealer.name[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-gray-900">{dealer.name}</p>
              {dealer.dealerCode && (
                <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                  {dealer.dealerCode}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{dealer.email}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-xl border px-2.5 py-1 text-[11px] font-bold ${
          dealer.isActive
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-600"
        }`}>
          {dealer.isActive ? "Active" : "Disabled"}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-green-600 shrink-0" />
          <span className="text-sm font-semibold text-gray-800">{dealer.city}, {dealer.state}</span>
        </div>
        {dealer.phone && (
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-gray-400 shrink-0" />
            <a href={`tel:${dealer.phone}`} className="text-xs text-gray-500 hover:text-gray-800 transition">{dealer.phone}</a>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Mail size={13} className="text-gray-400 shrink-0" />
          <a href={`mailto:${dealer.email}`} className="text-xs text-gray-500 hover:text-gray-800 truncate transition">{dealer.email}</a>
        </div>
      </div>

      {/* Stats mini */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
        <div className="text-center">
          <p className="text-xl font-black text-gray-900">{leadCount ?? "—"}</p>
          <p className="text-[10px] text-gray-400">Leads in {dealer.city}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-500">Last Login</p>
          <p className="text-[11px] text-gray-400">
            {dealer.lastLogin ? new Date(dealer.lastLogin).toLocaleDateString("en-IN") : "Never"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => onEdit(dealer)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
          <Edit2 size={13} /> Edit
        </button>
        <button onClick={toggle} disabled={toggling}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition disabled:opacity-50 ${
            dealer.isActive
              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
              : "border-green-200 text-green-700 hover:bg-green-50"
          }`}>
          {dealer.isActive
            ? <><XCircle size={13} /> Disable</>
            : <><CheckCircle2 size={13} /> Enable</>}
        </button>
        <button onClick={remove} disabled={deleting}
          className="flex items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function DealersPage() {
  const [dealers, setDealers]       = useState([]);
  const [leadCounts, setLeadCounts] = useState({});
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null);

  const fetchDealers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/users");
      const data = await res.json();
      const list = data.users || [];
      setDealers(list);

      const leadsRes  = await fetch("/api/leads?limit=500");
      const leadsData = await leadsRes.json();
      const allLeads  = leadsData.leads || [];
      const counts = {};
      list.forEach((d) => {
        counts[d._id] = allLeads.filter(
          (l) => l.city?.toLowerCase() === d.city?.toLowerCase()
        ).length;
      });
      setLeadCounts(counts);
    } catch {
      setDealers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDealers(); }, [fetchDealers]);

  function handleSave(savedUser, mode) {
    if (mode === "create") setDealers((prev) => [savedUser, ...prev]);
    else setDealers((prev) => prev.map((d) => (d._id === savedUser._id ? savedUser : d)));
    setModal(null);
  }
  function handleToggle(id, isActive) {
    setDealers((prev) => prev.map((d) => (d._id === id ? { ...d, isActive } : d)));
  }
  function handleDelete(id) {
    setDealers((prev) => prev.filter((d) => d._id !== id));
  }

  const active   = dealers.filter((d) => d.isActive).length;
  const disabled = dealers.filter((d) => !d.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 pt-20 lg:p-6 lg:pt-6">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Location Dealers</h1>
          <p className="mt-0.5 text-sm text-gray-500">Each dealer sees only leads from their assigned city</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchDealers}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={() => setModal({ mode: "create" })}
            className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-600 transition shadow-sm">
            <Plus size={16} /> Add Dealer
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Dealers",  value: dealers.length,                         icon: Users,        bg: "bg-blue-600"   },
          { label: "Active Dealers", value: active,                                 icon: CheckCircle2, bg: "bg-green-600"  },
          { label: "Disabled",       value: disabled,                               icon: XCircle,      bg: "bg-red-500"    },
          { label: "Cities Covered", value: new Set(dealers.map((d) => d.city)).size, icon: MapPin,     bg: "bg-purple-600" },
        ].map(({ label, value, icon: Icon, bg }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-800 text-sm">How Location-Based Access Works</p>
            <p className="mt-1 text-xs text-blue-600 leading-relaxed">
              Each dealer logs in at <strong>/admin/login</strong> with their own credentials.
              They are redirected to Leads where they <strong>only see leads from their assigned city</strong>.
              Admins see all leads from all cities.
            </p>
          </div>
        </div>
      </div>

      {/* Dealers grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white h-64 shadow-sm" />
          ))}
        </div>
      ) : dealers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <Building2 size={28} className="text-gray-400" />
          </div>
          <p className="text-lg font-bold text-gray-500">No dealers yet</p>
          <p className="mt-1 text-sm text-gray-400 mb-6">Create your first dealer account to get started</p>
          <button onClick={() => setModal({ mode: "create" })}
            className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-600 transition">
            <Plus size={16} /> Add First Dealer
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dealers.map((dealer) => (
            <DealerCard
              key={dealer._id}
              dealer={dealer}
              leadCount={leadCounts[dealer._id] ?? 0}
              onEdit={(d) => setModal({ mode: "edit", dealer: d })}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modal && (
        <DealerModal
          mode={modal.mode}
          dealer={modal.dealer}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
