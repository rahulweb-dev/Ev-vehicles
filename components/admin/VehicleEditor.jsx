"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Car, Bike, Save, Eye, EyeOff, Star, StarOff,
  Plus, Trash2, Upload, X, ChevronDown, ChevronUp,
  Zap, Settings, Shield, Award, ThumbsUp, ThumbsDown,
  Search, DollarSign, Gauge, Image as ImageIcon,
} from "lucide-react";

/* ── helpers ───────────────────────────────────────────────── */
function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const TABS = [
  { id: "basic",       label: "Basic Info",       icon: Car },
  { id: "variants",    label: "Variants & Price",  icon: DollarSign },
  { id: "performance", label: "Performance",       icon: Zap },
  { id: "specs",       label: "Specifications",    icon: Settings },
  { id: "features",    label: "Features",          icon: Award },
  { id: "safety",      label: "Safety",            icon: Shield },
  { id: "warranty",    label: "Warranty",          icon: Award },
  { id: "procons",     label: "Pros & Cons",       icon: ThumbsUp },
  { id: "seo",         label: "SEO",               icon: Search },
];

/* ── sub-components ────────────────────────────────────────── */
function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      rows={3}
      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition resize-none ${className}`}
      {...props}
    />
  );
}

function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-green-600" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

function TagInput({ label, values, onChange, placeholder }) {
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2.5 min-h-[44px]">
        {values.map((v, i) => (
          <span key={i} className="flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800">
            {v}
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}>
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={placeholder || "Type and press Enter"}
          className="flex-1 min-w-32 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
      </div>
    </div>
  );
}

function ListInput({ label, values, onChange, placeholder }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700">{label}</label>
        <button type="button"
          onClick={() => onChange([...values, ""])}
          className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700 hover:bg-green-100 transition">
          <Plus size={11} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={v}
              onChange={(e) => { const n = [...values]; n[i] = e.target.value; onChange(n); }}
              placeholder={placeholder}
            />
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="shrink-0 rounded-xl border border-gray-200 p-2.5 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {values.length === 0 && (
          <button type="button" onClick={() => onChange([""])}
            className="w-full rounded-xl border-2 border-dashed border-gray-200 py-3 text-xs text-gray-400 hover:border-green-300 hover:text-green-600 transition">
            + Add {label}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Image Upload helper (ImageKit) ────────────────────────── */
function ImageUpload({ label, value, onChange, hint }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } catch {}
    setUploading(false);
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</label>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 group">
          <Image src={value} alt="vehicle" width={600} height={300}
            className="h-40 w-full object-cover" />
          <button type="button" onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-lg bg-red-600 p-1.5 text-white opacity-0 group-hover:opacity-100 transition">
            <X size={12} />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 hover:border-green-400 hover:bg-green-50 transition">
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          ) : (
            <><Upload size={20} className="text-gray-400" /><span className="text-xs text-gray-400">Click to upload</span></>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      )}
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function GalleryUpload({ images, onChange }) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
      } catch {}
    }
    onChange([...images, ...uploaded]);
    setUploading(false);
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">Gallery Images</label>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-video overflow-hidden rounded-xl border border-gray-200 group">
            <Image src={img} alt="" fill className="object-cover" sizes="150px" />
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 rounded-lg bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition">
              <X size={11} />
            </button>
          </div>
        ))}
        <label className={`flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 transition ${uploading ? "opacity-60" : ""}`}>
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          ) : (
            <><ImageIcon size={16} className="text-gray-400" /><span className="text-[10px] text-gray-400">Add</span></>
          )}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}

/* ── Section wrapper ───────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="space-y-5">
      <h3 className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-black text-gray-800 uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ── Default state ─────────────────────────────────────────── */
const DEFAULT = {
  name: "", brand: "", vehicleType: "car", category: "upcoming",
  slug: "", status: "draft", featured: false,
  launchDate: "", featuredImage: "", gallery: [], colors: [],
  variants: [],
  performance: { batteryCapacity: "", drivingRange: "", power: "", torque: "", topSpeed: "", acceleration: "", dcFastChargingTime: "", acChargingTime: "" },
  specs: { length: "", width: "", height: "", wheelbase: "", groundClearance: "", kerbWeight: "", seatingCapacity: "", bootSpace: "" },
  features: { infotainment: [], connectivity: [], comfort: [], technology: [] },
  safety: { airbags: "", abs: false, esc: false, adasFeatures: [], safetyRating: "", additionalEquipment: [] },
  warranty: { vehicle: "", battery: "", motor: "" },
  pros: [], cons: [],
  metaTitle: "", metaDescription: "", keywords: [],
};

/* ════════════════════════════════════════════════════════════ */
export default function VehicleEditor({ initialData, vehicleId }) {
  const router = useRouter();
  const isEdit = Boolean(vehicleId);

  const [form, setForm] = useState(() => {
    if (!initialData) return { ...DEFAULT };
    return {
      ...DEFAULT,
      ...initialData,
      launchDate: initialData.launchDate
        ? new Date(initialData.launchDate).toISOString().split("T")[0]
        : "",
      performance: { ...DEFAULT.performance, ...(initialData.performance || {}) },
      specs:       { ...DEFAULT.specs,       ...(initialData.specs || {}) },
      features:    { ...DEFAULT.features,    ...(initialData.features || {}),
        infotainment: initialData.features?.infotainment || [],
        connectivity: initialData.features?.connectivity || [],
        comfort:      initialData.features?.comfort || [],
        technology:   initialData.features?.technology || [],
      },
      safety:   { ...DEFAULT.safety,   ...(initialData.safety || {}),
        adasFeatures:        initialData.safety?.adasFeatures || [],
        additionalEquipment: initialData.safety?.additionalEquipment || [],
      },
      warranty: { ...DEFAULT.warranty, ...(initialData.warranty || {}) },
      pros:     initialData.pros || [],
      cons:     initialData.cons || [],
      gallery:  initialData.gallery || [],
      colors:   initialData.colors || [],
      keywords: initialData.keywords || [],
      variants: initialData.variants || [],
    };
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  /* ── setters ───────────────────────────────────────────── */
  const set = useCallback((key, value) => setForm((f) => ({ ...f, [key]: value })), []);
  const setNested = useCallback((parent, key, value) =>
    setForm((f) => ({ ...f, [parent]: { ...f[parent], [key]: value } })), []);

  function handleNameChange(e) {
    const name = e.target.value;
    set("name", name);
    if (!isEdit) set("slug", slugify(name));
  }

  /* ── variants ──────────────────────────────────────────── */
  function addVariant() {
    set("variants", [...form.variants, { name: "", exShowroomPrice: "", onRoadPrice: "", features: [] }]);
  }
  function updateVariant(i, field, val) {
    const v = [...form.variants];
    v[i] = { ...v[i], [field]: val };
    set("variants", v);
  }
  function removeVariant(i) {
    set("variants", form.variants.filter((_, j) => j !== i));
  }

  /* ── save ──────────────────────────────────────────────── */
  async function handleSave(publishStatus) {
    setError("");
    setSaving(true);
    const payload = { ...form, status: publishStatus || form.status };
    if (payload.launchDate === "") delete payload.launchDate;

    try {
      const url    = isEdit ? `/api/vehicles/${vehicleId}` : "/api/vehicles";
      const method = isEdit ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Save failed"); setSaving(false); return; }
      router.push("/admin/vehicles");
    } catch {
      setError("Network error — please try again");
    }
    setSaving(false);
  }

  /* ── render ────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky top bar ───────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin/vehicles")}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
              <X size={18} />
            </button>
            <div>
              <h1 className="text-base font-black text-gray-900">
                {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
              </h1>
              <p className="text-xs text-gray-400 capitalize">
                {form.vehicleType} · {form.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              onClick={() => set("featured", !form.featured)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                form.featured ? "border-yellow-300 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-500 hover:border-yellow-300 hover:bg-yellow-50"
              }`}
            >
              {form.featured ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
              {form.featured ? "Featured" : "Feature"}
            </button>
            <button
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800 transition disabled:opacity-50"
            >
              {saving ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save size={14} />
              )}
              {form.status === "published" ? "Update" : "Publish"}
            </button>
          </div>
        </div>

        {/* Tab strip */}
        <div className="mx-auto max-w-6xl overflow-x-auto px-4">
          <div className="flex gap-1 pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? "border-green-600 text-green-700"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Main content */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            {/* ── BASIC INFO ──────────────────────────── */}
            {activeTab === "basic" && (
              <Section title="Basic Information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Vehicle Name" required>
                    <Input value={form.name} onChange={handleNameChange} placeholder="e.g. Tata Nexon EV" />
                  </Field>
                  <Field label="Brand" required>
                    <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Tata Motors" />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Vehicle Type" required>
                    <Select value={form.vehicleType} onChange={(e) => set("vehicleType", e.target.value)}>
                      <option value="car">Car</option>
                      <option value="bike">Bike / Scooter</option>
                    </Select>
                  </Field>
                  <Field label="Category" required>
                    <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
                      <option value="upcoming">Upcoming</option>
                      <option value="popular">Popular</option>
                    </Select>
                  </Field>
                </div>

                <Field label="URL Slug" required hint="Auto-generated from name. Edit carefully — changing affects SEO.">
                  <Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder="e.g. tata-nexon-ev-2026" />
                </Field>

                <Field label="Expected Launch Date" hint="For upcoming vehicles only">
                  <Input type="date" value={form.launchDate} onChange={(e) => set("launchDate", e.target.value)} />
                </Field>

                <ImageUpload
                  label="Featured Image"
                  value={form.featuredImage}
                  onChange={(url) => set("featuredImage", url)}
                  hint="Recommended: 1200×630px"
                />

                <GalleryUpload images={form.gallery} onChange={(imgs) => set("gallery", imgs)} />

                <TagInput
                  label="Available Colors"
                  values={form.colors}
                  onChange={(v) => set("colors", v)}
                  placeholder="e.g. Pristine White"
                />
              </Section>
            )}

            {/* ── VARIANTS & PRICING ──────────────────── */}
            {activeTab === "variants" && (
              <Section title="Variants & Pricing">
                <div className="space-y-4">
                  {form.variants.map((v, i) => (
                    <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">Variant {i + 1}</span>
                        <button type="button" onClick={() => removeVariant(i)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Variant Name">
                          <Input value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} placeholder="e.g. Base, Mid, Top" />
                        </Field>
                        <Field label="Ex-Showroom Price">
                          <Input value={v.exShowroomPrice} onChange={(e) => updateVariant(i, "exShowroomPrice", e.target.value)} placeholder="e.g. ₹14,99,000" />
                        </Field>
                        <Field label="On-Road Price (optional)">
                          <Input value={v.onRoadPrice} onChange={(e) => updateVariant(i, "onRoadPrice", e.target.value)} placeholder="e.g. ₹16,50,000" />
                        </Field>
                      </div>
                      <div className="mt-3">
                        <ListInput
                          label="Variant Features"
                          values={v.features || []}
                          onChange={(val) => updateVariant(i, "features", val)}
                          placeholder="e.g. Dual-tone roof option"
                        />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addVariant}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 text-sm font-semibold text-gray-500 hover:border-green-400 hover:text-green-700 transition">
                    <Plus size={16} /> Add Variant
                  </button>
                </div>
              </Section>
            )}

            {/* ── PERFORMANCE ─────────────────────────── */}
            {activeTab === "performance" && (
              <Section title="Performance & Range">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { key: "batteryCapacity",    label: "Battery Capacity",       placeholder: "e.g. 40.5 kWh" },
                    { key: "drivingRange",        label: "Driving Range (ARAI)",  placeholder: "e.g. 465 km" },
                    { key: "power",               label: "Power Output",          placeholder: "e.g. 143 PS" },
                    { key: "torque",              label: "Torque",                placeholder: "e.g. 250 Nm" },
                    { key: "topSpeed",            label: "Top Speed",             placeholder: "e.g. 150 km/h" },
                    { key: "acceleration",        label: "0–100 km/h",            placeholder: "e.g. 9.2 sec" },
                    { key: "dcFastChargingTime",  label: "DC Fast Charging Time", placeholder: "e.g. 56 min (10–100%)" },
                    { key: "acChargingTime",      label: "AC Charging Time",      placeholder: "e.g. 8.6 hrs (0–100%)" },
                  ].map(({ key, label, placeholder }) => (
                    <Field key={key} label={label}>
                      <Input
                        value={form.performance[key]}
                        onChange={(e) => setNested("performance", key, e.target.value)}
                        placeholder={placeholder}
                      />
                    </Field>
                  ))}
                </div>
              </Section>
            )}

            {/* ── SPECIFICATIONS ──────────────────────── */}
            {activeTab === "specs" && (
              <Section title="Specifications">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { key: "length",          label: "Length",           placeholder: "e.g. 4612 mm" },
                    { key: "width",           label: "Width",            placeholder: "e.g. 1894 mm" },
                    { key: "height",          label: "Height",           placeholder: "e.g. 1655 mm" },
                    { key: "wheelbase",       label: "Wheelbase",        placeholder: "e.g. 2700 mm" },
                    { key: "groundClearance", label: "Ground Clearance", placeholder: "e.g. 205 mm" },
                    { key: "kerbWeight",      label: "Kerb Weight",      placeholder: "e.g. 1955 kg" },
                    { key: "seatingCapacity", label: "Seating Capacity", placeholder: "e.g. 5" },
                    { key: "bootSpace",       label: "Boot Space",       placeholder: "e.g. 350 L (cars only)" },
                  ].map(({ key, label, placeholder }) => (
                    <Field key={key} label={label}>
                      <Input
                        value={form.specs[key]}
                        onChange={(e) => setNested("specs", key, e.target.value)}
                        placeholder={placeholder}
                      />
                    </Field>
                  ))}
                </div>
              </Section>
            )}

            {/* ── FEATURES ────────────────────────────── */}
            {activeTab === "features" && (
              <Section title="Features">
                <div className="grid gap-6 sm:grid-cols-2">
                  {[
                    { key: "infotainment", label: "Infotainment Features", placeholder: "e.g. 10.25\" Touchscreen" },
                    { key: "connectivity", label: "Connectivity Features",  placeholder: "e.g. Apple CarPlay" },
                    { key: "comfort",      label: "Comfort Features",       placeholder: "e.g. Ventilated Seats" },
                    { key: "technology",   label: "Technology Features",    placeholder: "e.g. Vehicle-to-Load (V2L)" },
                  ].map(({ key, label, placeholder }) => (
                    <ListInput
                      key={key}
                      label={label}
                      values={form.features[key]}
                      onChange={(v) => setForm((f) => ({ ...f, features: { ...f.features, [key]: v } }))}
                      placeholder={placeholder}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* ── SAFETY ──────────────────────────────── */}
            {activeTab === "safety" && (
              <Section title="Safety">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Airbags">
                    <Input value={form.safety.airbags} onChange={(e) => setNested("safety", "airbags", e.target.value)} placeholder="e.g. 6 Airbags" />
                  </Field>
                  <Field label="Safety Rating">
                    <Input value={form.safety.safetyRating} onChange={(e) => setNested("safety", "safetyRating", e.target.value)} placeholder="e.g. 5-Star NCAP" />
                  </Field>
                </div>

                <div className="flex flex-wrap gap-6">
                  <Toggle checked={form.safety.abs} onChange={(v) => setNested("safety", "abs", v)} label="ABS (Anti-lock Braking)" />
                  <Toggle checked={form.safety.esc} onChange={(v) => setNested("safety", "esc", v)} label="ESC (Electronic Stability)" />
                </div>

                <ListInput
                  label="ADAS Features"
                  values={form.safety.adasFeatures}
                  onChange={(v) => setForm((f) => ({ ...f, safety: { ...f.safety, adasFeatures: v } }))}
                  placeholder="e.g. Lane Keeping Assist"
                />

                <ListInput
                  label="Additional Safety Equipment"
                  values={form.safety.additionalEquipment}
                  onChange={(v) => setForm((f) => ({ ...f, safety: { ...f.safety, additionalEquipment: v } }))}
                  placeholder="e.g. 360° Camera"
                />
              </Section>
            )}

            {/* ── WARRANTY ────────────────────────────── */}
            {activeTab === "warranty" && (
              <Section title="Warranty Coverage">
                <div className="grid gap-4">
                  {[
                    { key: "vehicle", label: "Vehicle Warranty",  placeholder: "e.g. 3 years / unlimited km" },
                    { key: "battery", label: "Battery Warranty",  placeholder: "e.g. 8 years / 1,60,000 km" },
                    { key: "motor",   label: "Motor Warranty",    placeholder: "e.g. 3 years / unlimited km" },
                  ].map(({ key, label, placeholder }) => (
                    <Field key={key} label={label}>
                      <Input
                        value={form.warranty[key]}
                        onChange={(e) => setNested("warranty", key, e.target.value)}
                        placeholder={placeholder}
                      />
                    </Field>
                  ))}
                </div>
              </Section>
            )}

            {/* ── PROS & CONS ─────────────────────────── */}
            {activeTab === "procons" && (
              <Section title="Pros & Cons">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <ThumbsUp size={16} className="text-green-600" />
                      <span className="text-sm font-bold text-gray-800">Pros</span>
                    </div>
                    <ListInput
                      label=""
                      values={form.pros}
                      onChange={(v) => set("pros", v)}
                      placeholder="e.g. Excellent real-world range"
                    />
                  </div>
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <ThumbsDown size={16} className="text-red-500" />
                      <span className="text-sm font-bold text-gray-800">Cons</span>
                    </div>
                    <ListInput
                      label=""
                      values={form.cons}
                      onChange={(v) => set("cons", v)}
                      placeholder="e.g. No DC fast charging in base"
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* ── SEO ─────────────────────────────────── */}
            {activeTab === "seo" && (
              <Section title="SEO Settings">
                <Field label="Meta Title" hint="Recommended: 50–60 characters">
                  <Input
                    value={form.metaTitle}
                    onChange={(e) => set("metaTitle", e.target.value)}
                    placeholder="e.g. Tata Nexon EV 2026 – Price, Range & Features"
                    maxLength={70}
                  />
                  <p className="mt-1 text-[11px] text-gray-400">{form.metaTitle.length} / 70</p>
                </Field>
                <Field label="Meta Description" hint="Recommended: 150–160 characters">
                  <Textarea
                    value={form.metaDescription}
                    onChange={(e) => set("metaDescription", e.target.value)}
                    placeholder="Short description that appears in Google search results…"
                    maxLength={170}
                  />
                  <p className="mt-1 text-[11px] text-gray-400">{form.metaDescription.length} / 170</p>
                </Field>
                <TagInput
                  label="Keywords"
                  values={form.keywords}
                  onChange={(v) => set("keywords", v)}
                  placeholder="Type keyword and press Enter"
                />
              </Section>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────── */}
          <div className="space-y-4">

            {/* Status card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-gray-700">Status</h3>
              <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
              <div className="mt-4 space-y-3">
                <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Featured Vehicle" />
              </div>
            </div>

            {/* Summary card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wide text-gray-700">Summary</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  {form.vehicleType === "car" ? <Car size={13} className="text-blue-500" /> : <Bike size={13} className="text-orange-500" />}
                  <span className="capitalize">{form.vehicleType} · {form.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${form.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {form.status}
                  </span>
                </div>
                {form.variants.length > 0 && (
                  <p>{form.variants.length} variant{form.variants.length > 1 ? "s" : ""}</p>
                )}
                {form.gallery.length > 0 && (
                  <p>{form.gallery.length} gallery image{form.gallery.length > 1 ? "s" : ""}</p>
                )}
                {form.colors.length > 0 && (
                  <p>{form.colors.length} color{form.colors.length > 1 ? "s" : ""}</p>
                )}
              </div>
            </div>

            {/* Save buttons */}
            <div className="space-y-2">
              <button onClick={() => handleSave("published")} disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-3 text-sm font-bold text-white hover:bg-green-800 transition disabled:opacity-50">
                {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={15} />}
                {form.status === "published" ? "Update Vehicle" : "Publish Vehicle"}
              </button>
              <button onClick={() => handleSave("draft")} disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
