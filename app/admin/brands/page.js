"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Upload, Plus, Pencil, Trash2, Check, X,
  Globe, ImageIcon, Car, Bike, Loader2, Building2,
} from "lucide-react";

const CATEGORY_OPTS = [
  { value: "all",        label: "All",        color: "bg-gray-100 text-gray-700" },
  { value: "car",        label: "Cars",        color: "bg-blue-100 text-blue-700" },
  { value: "bike",       label: "Bikes",       color: "bg-orange-100 text-orange-700" },
  { value: "commercial", label: "Commercial",  color: "bg-purple-100 text-purple-700" },
];

function categoryBadge(cat) {
  return CATEGORY_OPTS.find(c => c.value === cat) || CATEGORY_OPTS[0];
}

/* ── Logo Upload Box ───────────────────────────────────────────── */
function LogoUploader({ current, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(current || "");
  const inputRef = useRef();

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    /* instant preview */
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "/brand-logos");

      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (data.url) {
        setPreview(data.url);
        onUploaded(data.url);
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
        setPreview(current || "");
      }
    } catch {
      alert("Network error during upload");
      setPreview(current || "");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-green-400 hover:bg-green-50"
    >
      {preview ? (
        <>
          <Image src={preview} alt="Logo" fill className="object-contain p-2" sizes="96px" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-2xl">
            {uploading
              ? <Loader2 size={20} className="text-white animate-spin" />
              : <Upload size={16} className="text-white" />
            }
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1 text-gray-300">
          {uploading
            ? <Loader2 size={22} className="animate-spin text-green-500" />
            : <><ImageIcon size={22} /><span className="text-[10px]">Upload</span></>
          }
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
        className="hidden" onChange={handleFile} />
    </div>
  );
}

/* ── Brand Card ────────────────────────────────────────────────── */
function BrandCard({ brand, onSave, onDelete }) {
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    logo:        brand.logo        || "",
    website:     brand.website     || "",
    description: brand.description || "",
    category:    brand.category    || "all",
  });

  const cat = categoryBadge(form.category);

  async function save() {
    setSaving(true);
    try {
      if (brand.virtual || !brand._id) {
        /* brand only exists in Vehicle collection — create a Brand doc first */
        const res  = await fetch("/api/admin/brands", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: brand.name, slug: brand.slug, ...form }),
        });
        const data = await res.json();
        if (!data.success) { alert(data.error || "Save failed"); return; }
        onSave(data.brand);
      } else {
        const res  = await fetch(`/api/admin/brands/${brand._id}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!data.success) { alert(data.error || "Save failed"); return; }
        onSave(data.brand);
      }
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!brand._id) return;
    if (!confirm(`Remove "${brand.name}" brand? The vehicles won't be deleted.`)) return;
    setDeleting(true);
    await fetch(`/api/admin/brands/${brand._id}`, { method: "DELETE" });
    onDelete(brand._id || brand.slug);
    setDeleting(false);
  }

  return (
    <div className={`rounded-2xl border bg-white shadow-sm transition ${editing ? "border-green-400 ring-1 ring-green-300" : "border-gray-200 hover:border-gray-300 hover:shadow-md"}`}>
      {/* Logo + name row */}
      <div className="flex items-center gap-4 p-4">
        {editing ? (
          <LogoUploader current={form.logo} onUploaded={url => setForm(f => ({ ...f, logo: url }))} />
        ) : (
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            {brand.logo || form.logo ? (
              <Image src={form.logo || brand.logo} alt={brand.name} fill className="object-contain p-1.5" sizes="64px" />
            ) : (
              <Building2 size={24} className="text-gray-200" />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 truncate">{brand.name}</p>
          <p className="text-[11px] text-gray-400 font-mono">{brand.slug}</p>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {editing ? (
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="rounded-lg border border-gray-200 bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 outline-none focus:border-green-500">
                {CATEGORY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cat.color}`}>{cat.label}</span>
            )}
            {brand.virtual && (
              <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-700 border border-yellow-200">From Vehicles</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {editing ? (
            <>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 transition disabled:opacity-50">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
              </button>
              <button onClick={() => setEditing(false)}
                className="rounded-xl border border-gray-200 p-1.5 text-gray-400 hover:text-gray-700 transition">
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}
                className="rounded-xl border border-gray-200 p-1.5 text-gray-400 hover:border-blue-400 hover:text-blue-600 transition">
                <Pencil size={14} />
              </button>
              {brand._id && (
                <button onClick={remove} disabled={deleting}
                  className="rounded-xl border border-gray-200 p-1.5 text-gray-400 hover:border-red-400 hover:text-red-600 transition disabled:opacity-40">
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit fields */}
      {editing && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Logo URL (auto-filled after upload)</label>
            <input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))}
              placeholder="https://ik.imagekit.io/..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Brand Website</label>
            <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              placeholder="https://tata.com"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Short Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description about the brand…"
              className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 transition" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Add New Brand Modal ───────────────────────────────────────── */
function AddBrandModal({ onClose, onCreate }) {
  const [form, setForm]     = useState({ name: "", slug: "", logo: "", website: "", description: "", category: "all" });
  const [saving, setSaving] = useState(false);

  function handleNameChange(val) {
    setForm(f => ({
      ...f,
      name: val,
      slug: val.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/brands", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        onCreate(data.brand);
        onClose();
      } else {
        alert(data.error || "Failed to create brand");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-black text-gray-900">Add New Brand</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Brand Name *</label>
            <input value={form.name} onChange={e => handleNameChange(e.target.value)} required
              placeholder="e.g. Tata Motors"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Slug *</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} required
              placeholder="tata-motors"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-mono outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500">
              {CATEGORY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Logo URL (optional)</label>
            <input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Website</label>
            <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              placeholder="https://brand.com"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
          </div>
        </div>
        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Brand
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function AdminBrandsPage() {
  const [brands, setBrands]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [catFilter, setCat]   = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/brands");
      const data = await res.json();
      setBrands(data.brands || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleSave(updated) {
    setBrands(prev => {
      const idx = prev.findIndex(b => b._id === updated._id || b.slug === updated.slug);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
  }

  function handleDelete(idOrSlug) {
    setBrands(prev => prev.filter(b => b._id !== idOrSlug && b.slug !== idOrSlug));
  }

  function handleCreate(brand) {
    setBrands(prev => [brand, ...prev]);
  }

  const filtered = brands
    .filter(b => catFilter === "all" || b.category === catFilter || b.category === "all")
    .filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  const withLogo    = brands.filter(b => b.logo).length;
  const withoutLogo = brands.filter(b => !b.logo).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Brand Logos</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {brands.length} brands · <span className="text-green-600 font-semibold">{withLogo} with logo</span>
            {withoutLogo > 0 && <span className="text-orange-500 font-semibold"> · {withoutLogo} missing</span>}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 transition shadow-sm">
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Brands",   value: brands.length,    color: "text-gray-900",   bg: "bg-gray-50",    border: "border-gray-200"   },
          { label: "Logos Uploaded", value: withLogo,         color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200"  },
          { label: "Missing Logos",  value: withoutLogo,      color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200" },
          { label: "Car Brands",     value: brands.filter(b => b.category === "car" || b.category === "all").length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} px-4 py-3 shadow-sm`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search brands…"
          className="min-w-44 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition" />

        <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm p-0.5">
          {[["all","All"],["car","Cars"],["bike","Bikes"],["commercial","Commercial"]].map(([v, l]) => (
            <button key={v} onClick={() => setCat(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${catFilter === v ? "bg-green-700 text-white" : "text-gray-500 hover:text-gray-900"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Missing logo filter */}
        <button onClick={() => setBrands(prev => [...prev.filter(b => !b.logo), ...prev.filter(b => b.logo)])}
          className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition">
          Show missing first
        </button>
      </div>

      {/* Info Banner */}
      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> Brands from your vehicle database appear automatically. Click <strong>Pencil</strong> to edit, then click the logo box to upload an image. Logos are stored on ImageKit and display on brand pages and vehicle cards.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4 h-28">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 rounded bg-gray-100" />
                  <div className="h-3 w-16 rounded bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20">
          <Building2 size={40} className="mb-3 text-gray-200" />
          <p className="text-sm font-medium text-gray-400">
            {search ? "No brands match your search" : "No brands yet — add vehicles first"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(brand => (
            <BrandCard
              key={brand._id || brand.slug}
              brand={brand}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showAdd && <AddBrandModal onClose={() => setShowAdd(false)} onCreate={handleCreate} />}
    </div>
  );
}
