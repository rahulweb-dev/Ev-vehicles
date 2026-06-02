"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus, Trash2, Pencil, Eye, EyeOff, Save, X,
  ArrowUp, ArrowDown, Upload, ImageIcon,
  LayoutTemplate, CheckCircle2, Monitor, Smartphone,
} from "lucide-react";

const TAG_COLORS = [
  { label: "Green",  value: "bg-green-500"  },
  { label: "Blue",   value: "bg-blue-500"   },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Red",    value: "bg-red-500"    },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Yellow", value: "bg-yellow-500" },
];

const EMPTY = {
  title: "", subtitle: "", image: "", tag: "",
  tagColor: "bg-green-500", ctaLabel: "Explore", ctaHref: "/", status: "active",
};

/* ── Preview ─────────────────────────────────────────────────────── */
function BannerPreview({ banner, platform }) {
  const isMobile = platform === "mobile";
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gray-900 ${isMobile ? "h-44 max-w-50" : "h-32 sm:h-40"}`}>
      {banner.image ? (
        <Image src={banner.image} alt={banner.title} fill className="object-cover opacity-70" sizes="400px" />
      ) : (
        <div className="flex h-full items-center justify-center bg-linear-to-br from-gray-800 to-gray-900">
          <ImageIcon size={28} className="text-gray-600" />
        </div>
      )}
      <div className={`absolute inset-0 ${isMobile ? "bg-linear-to-b from-black/40 via-black/50 to-black/80" : "bg-linear-to-t from-black/70 via-black/20 to-transparent"}`} />
      <div className={`absolute inset-0 flex flex-col ${isMobile ? "items-center justify-center text-center px-3" : "justify-end items-start p-3"}`}>
        {banner.tag && (
          <span className={`mb-1 block w-fit rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${banner.tagColor} ${isMobile ? "mx-auto" : ""}`}>
            {banner.tag}
          </span>
        )}
        <p className={`line-clamp-2 font-black text-white ${isMobile ? "text-sm leading-snug" : "text-sm line-clamp-1"}`}>
          {banner.title || "Untitled Banner"}
        </p>
        {banner.subtitle && (
          <p className="line-clamp-1 text-[10px] text-gray-300 mt-0.5">{banner.subtitle}</p>
        )}
        {isMobile && banner.ctaLabel && (
          <span className="mt-2 rounded-full bg-[#00a651] px-3 py-1 text-[10px] font-bold text-white">
            {banner.ctaLabel}
          </span>
        )}
      </div>
      <div className="absolute right-2 top-2">
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${banner.status === "active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}>
          {banner.status}
        </span>
      </div>
    </div>
  );
}

/* ── Form ─────────────────────────────────────────────────────────── */
function BannerForm({ initial, platform, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, platform, ...(initial || {}) });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isMobile = platform === "mobile";

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) set("image", data.url);
    } catch {}
    setUploading(false);
  }

  async function handleSave() {
    if (!form.title || !form.image) return alert("Title and image are required.");
    setSaving(true);
    await onSave({ ...form, platform });
    setSaving(false);
  }

  const sizeHint = isMobile
    ? "Recommended: 750×1000 px (portrait) or 750×500 px (landscape)"
    : "Recommended: 1600×600 px (landscape 16:6 ratio)";

  return (
    <div className={`rounded-2xl border p-5 ${isMobile ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-gray-900">
          {isMobile ? <Smartphone size={16} className="text-orange-500" /> : <Monitor size={16} className="text-blue-600" />}
          {initial?._id ? "Edit Banner" : `New ${isMobile ? "Mobile" : "Desktop"} Banner`}
        </h3>
        <button onClick={onCancel} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 transition"><X size={16} /></button>
      </div>

      {/* Live preview */}
      <div className={`mb-4 ${isMobile ? "flex justify-center" : ""}`}>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-gray-600">Preview</p>
          <BannerPreview banner={form} platform={platform} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-gray-700">Headline *</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder={isMobile ? "e.g. Find Your Perfect EV" : "e.g. India's #1 Electric Vehicle Platform"}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition" />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-gray-700">Sub-heading</label>
          <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)}
            placeholder={isMobile ? "e.g. 50+ models · Live prices" : "e.g. Compare 50+ EV Cars & Bikes · Real Prices · Expert Reviews"}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition" />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-gray-700">Banner Image *</label>
          {form.image ? (
            <div className="flex items-center gap-3">
              <div className={`relative overflow-hidden rounded-xl border border-gray-200 ${isMobile ? "h-20 w-14" : "h-16 w-28"}`}>
                <Image src={form.image} alt="" fill className="object-cover" sizes="112px" />
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="max-w-xs truncate text-xs text-gray-500">{form.image}</p>
                <button onClick={() => set("image", "")} className="flex items-center gap-1 text-xs text-red-500 hover:underline"><X size={11} /> Remove</button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white py-5 hover:border-green-400 hover:bg-green-50 transition">
              {uploading
                ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                : <><Upload size={20} className="text-gray-400" /><span className="text-xs text-gray-400">{sizeHint}</span></>}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          )}
          <input value={form.image} onChange={(e) => set("image", e.target.value)}
            placeholder="…or paste an image URL"
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-green-500 transition" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Badge Label</label>
          <input value={form.tag} onChange={(e) => set("tag", e.target.value)}
            placeholder="e.g. New Launch"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-500 transition" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Badge Color</label>
          <div className="flex gap-2 pt-1">
            {TAG_COLORS.map((c) => (
              <button key={c.value} type="button" title={c.label} onClick={() => set("tagColor", c.value)}
                className={`h-7 w-7 rounded-full ${c.value} transition ${form.tagColor === c.value ? "ring-2 ring-offset-2 ring-gray-600 scale-110" : "opacity-70 hover:opacity-100"}`} />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Button Label</label>
          <input value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)}
            placeholder="e.g. Explore Cars"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-500 transition" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Button Link</label>
          <input value={form.ctaHref} onChange={(e) => set("ctaHref", e.target.value)}
            placeholder="e.g. /cars"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-500 transition" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Status</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-500 transition">
            <option value="active">Active (shown on site)</option>
            <option value="inactive">Inactive (hidden)</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2 text-sm font-bold text-white hover:bg-green-800 transition disabled:opacity-50">
          {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={14} />}
          {initial?._id ? "Update" : "Create"} Banner
        </button>
      </div>
    </div>
  );
}

/* ── Banner card ─────────────────────────────────────────────────── */
function BannerCard({ banner, platform, onToggle, onEdit, onDelete, onMove, deleting }) {
  return (
    <div className={`group rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
      banner.status === "active" ? "border-green-200" : "border-gray-200 opacity-70"
    }`}>
      <BannerPreview banner={banner} platform={platform} />

      <div className="p-4">
        <p className="truncate text-sm font-bold text-gray-900">{banner.title}</p>
        {banner.subtitle && <p className="mt-0.5 truncate text-xs text-gray-400">{banner.subtitle}</p>}
        <p className="mt-1 text-[11px] text-gray-400">
          <span className="font-medium text-gray-600">"{banner.ctaLabel}"</span> → <span className="font-mono">{banner.ctaHref}</span>
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button onClick={() => onMove(banner, -1)} title="Move up"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
              <ArrowUp size={14} />
            </button>
            <button onClick={() => onMove(banner, 1)} title="Move down"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
              <ArrowDown size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onToggle(banner)} title={banner.status === "active" ? "Deactivate" : "Activate"}
              className={`rounded-lg p-1.5 transition ${banner.status === "active" ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100 hover:text-green-600"}`}>
              {banner.status === "active" ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button onClick={() => onEdit(banner)} title="Edit"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition">
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(banner._id, banner.title)} disabled={deleting === banner._id}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function AdminBannersPage() {
  const [tab, setTab]         = useState("desktop");
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // banner | "new" | null
  const [deleting, setDeleting] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/banners?platform=${tab}`);
      const data = await res.json();
      setBanners(data.banners || []);
    } catch { setBanners([]); }
    setLoading(false);
    setEditing(null);
  }

  useEffect(() => { load(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(form) {
    if (editing?._id) {
      await fetch(`/api/banners/${editing._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/banners", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
    }
    load();
  }

  async function handleToggle(banner) {
    await fetch(`/api/banners/${banner._id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: banner.status === "active" ? "inactive" : "active" }),
    });
    load();
  }

  async function handleDelete(id, title) {
    if (!confirm(`Delete banner "${title}"?`)) return;
    setDeleting(id);
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  async function handleMove(banner, dir) {
    await fetch(`/api/banners/${banner._id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: (banner.order || 0) + dir }),
    });
    load();
  }

  const active   = banners.filter((b) => b.status === "active").length;
  const inactive = banners.filter((b) => b.status === "inactive").length;
  const isMobile = tab === "mobile";

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Banners</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage hero carousel banners for desktop and mobile</p>
        </div>
        {editing !== "new" && (
          <button onClick={() => setEditing("new")}
            className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 transition shadow-sm">
            <Plus size={16} /> Add Banner
          </button>
        )}
      </div>

      {/* Platform tabs */}
      <div className="mb-5 flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm w-fit">
        {[
          { id: "desktop", label: "Desktop Banners",    icon: Monitor,     color: "text-blue-600",   activeBg: "bg-blue-600" },
          { id: "mobile",  label: "Mobile Banners",     icon: Smartphone,  color: "text-orange-500", activeBg: "bg-orange-500" },
        ].map(({ id, label, icon: Icon, color, activeBg }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              tab === id ? `${activeBg} text-white shadow-sm` : `${color} hover:bg-gray-50`
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Info strip */}
      <div className={`mb-5 rounded-xl border px-4 py-3 text-xs font-medium ${
        isMobile
          ? "border-orange-200 bg-orange-50 text-orange-700"
          : "border-blue-200 bg-blue-50 text-blue-700"
      }`}>
        {isMobile
          ? "📱 Mobile banners show in the hero swiper on phones & small tablets (below 768px). Recommended image size: 750×1000 px (portrait)."
          : "🖥️ Desktop banners show in the full-width hero slider on laptops & desktops (768px+). Recommended image size: 1600×600 px (landscape)."}
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Total",    value: banners.length, icon: LayoutTemplate, color: "text-gray-900",   bg: "bg-white",       border: "border-gray-200" },
          { label: "Active",   value: active,         icon: CheckCircle2,   color: "text-green-700",  bg: "bg-green-50",    border: "border-green-200" },
          { label: "Inactive", value: inactive,       icon: EyeOff,         color: "text-yellow-600", bg: "bg-yellow-50",   border: "border-yellow-200" },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl border ${border} ${bg} px-4 py-3 shadow-sm`}>
            <Icon size={18} className={color} />
            <div>
              <p className={`text-xl font-black ${color}`}>{loading ? "—" : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New banner form */}
      {editing === "new" && (
        <div className="mb-6">
          <BannerForm platform={tab} onSave={handleSave} onCancel={() => setEditing(null)} />
        </div>
      )}

      {/* Banner grid */}
      {loading ? (
        <div className={`grid gap-4 ${isMobile ? "sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className={`mb-3 rounded-xl bg-gray-100 ${isMobile ? "h-44" : "h-32"}`} />
              <div className="h-3 w-3/4 rounded bg-gray-100 mb-2" />
              <div className="h-2.5 w-1/2 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : banners.length === 0 && editing !== "new" ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 shadow-sm">
          {isMobile ? <Smartphone size={40} className="mb-3 text-gray-200" /> : <Monitor size={40} className="mb-3 text-gray-200" />}
          <p className="text-sm font-medium text-gray-400">No {isMobile ? "mobile" : "desktop"} banners yet</p>
          <button onClick={() => setEditing("new")}
            className="mt-4 flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800 transition">
            <Plus size={14} /> Create first banner
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 ${isMobile ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {banners.map((banner) => (
            <div key={banner._id}>
              {editing?._id === banner._id ? (
                <BannerForm initial={editing} platform={tab} onSave={handleSave} onCancel={() => setEditing(null)} />
              ) : (
                <BannerCard
                  banner={banner}
                  platform={tab}
                  onToggle={handleToggle}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  deleting={deleting}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {banners.length > 0 && (
        <p className="mt-6 text-center text-xs text-gray-400">
          Only <strong>Active</strong> banners show on the home page · Use ↑↓ to reorder
        </p>
      )}
    </div>
  );
}
