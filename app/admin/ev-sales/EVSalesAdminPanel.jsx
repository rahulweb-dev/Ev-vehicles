"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Pencil, Trash2, Upload, RefreshCw, CheckCircle2,
  XCircle, Search, ChevronLeft, ChevronRight, LayoutDashboard,
  TableProperties, FilePlus2, FileUp, X, TrendingUp, Car, Bike, Truck, Save,
  Sheet, Download, AlertCircle, Eye,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────── */
const SEGMENTS = ["car", "two-wheeler", "commercial"];
const SEG_LABEL = { car: "Electric Car", "two-wheeler": "Two-Wheeler", commercial: "Commercial" };
const SEG_COLOR = {
  car:           "bg-blue-100 text-blue-700",
  "two-wheeler": "bg-green-100 text-green-700",
  commercial:    "bg-purple-100 text-purple-700",
};
const SEG_ICON = { car: Car, "two-wheeler": Bike, commercial: Truck };
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const EMPTY_FORM = {
  brand: "", brandSlug: "", segment: "car", state: "National",
  month: new Date().getMonth() + 1, year: new Date().getFullYear(),
  unitsSold: "", marketShare: "", growthPercentage: "", isNational: true,
};

/* ─── Helpers ────────────────────────────────────────────── */
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("en-IN");
}

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ msg, ok, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl text-sm font-semibold max-w-sm
      ${ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      {msg}
      <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

/* ─── Record Form ────────────────────────────────────────── */
function RecordForm({ initial = EMPTY_FORM, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial);

  useEffect(() => { setForm(initial); }, [initial]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  const inp = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500";
  const lbl = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

  return (
    <div className="space-y-5">
      {/* Brand Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Brand Name *</label>
          <input value={form.brand} onChange={(e) => { set("brand", e.target.value); set("brandSlug", slugify(e.target.value)); }}
            required placeholder="e.g. Tata EV" className={inp} />
        </div>
        <div>
          <label className={lbl}>Brand Slug</label>
          <input value={form.brandSlug} onChange={(e) => set("brandSlug", e.target.value)} placeholder="tata-ev" className={`${inp} text-gray-400`} />
          <p className="text-[11px] text-gray-400 mt-1">Auto-generated from brand name</p>
        </div>
      </div>

      {/* Segment */}
      <div>
        <label className={lbl}>Vehicle Segment *</label>
        <div className="grid grid-cols-3 gap-3">
          {SEGMENTS.map((seg) => {
            const Icon = SEG_ICON[seg];
            const active = form.segment === seg;
            return (
              <button key={seg} type="button" onClick={() => set("segment", seg)}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition
                  ${active ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-600 hover:border-green-300"}`}>
                <Icon size={15} /> {SEG_LABEL[seg]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Period Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Month *</label>
          <select value={form.month} onChange={(e) => set("month", e.target.value)} className={inp}>
            {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Year *</label>
          <select value={form.year} onChange={(e) => set("year", e.target.value)} className={inp}>
            {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Numbers Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={lbl}>Units Sold *</label>
          <input type="number" value={form.unitsSold} onChange={(e) => set("unitsSold", e.target.value)}
            required placeholder="e.g. 8200" min={0} className={inp} />
        </div>
        <div>
          <label className={lbl}>Market Share %</label>
          <input type="number" value={form.marketShare} onChange={(e) => set("marketShare", e.target.value)}
            placeholder="e.g. 18.5" step="0.1" min={0} max={100} className={inp} />
        </div>
        <div>
          <label className={lbl}>YoY Growth %</label>
          <input type="number" value={form.growthPercentage} onChange={(e) => set("growthPercentage", e.target.value)}
            placeholder="e.g. 32.4" step="0.1" className={inp} />
        </div>
      </div>

      {/* State + isNational */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <label className={lbl}>State / Region</label>
          <input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="National" className={inp} />
        </div>
        <div className="flex items-center gap-3 pb-2.5">
          <input type="checkbox" id="isNat" checked={form.isNational} onChange={(e) => set("isNational", e.target.checked)}
            className="h-4 w-4 rounded accent-green-600" />
          <label htmlFor="isNat" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pan-India (national data)</label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button type="button" disabled={loading}
          onClick={() => onSave(form)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {loading ? "Saving…" : "Save Record"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
            <X size={14} /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Panel ─────────────────────────────────────────── */
export default function EVSalesAdminPanel({ apiBase }) {
  const [tab, setTab] = useState("records");
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterSeg, setFilterSeg] = useState("");
  const [filterYear, setFilterYear] = useState("2025");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editRecord, setEditRecord] = useState(null); // null = add new
  const [toast, setToast] = useState(null);
  const [importJson, setImportJson] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Excel upload state
  const [xlFile, setXlFile] = useState(null);
  const [xlRows, setXlRows] = useState([]);
  const [xlErrors, setXlErrors] = useState([]);
  const [xlLoading, setXlLoading] = useState(false);
  const [xlImporting, setXlImporting] = useState(false);
  const [xlResult, setXlResult] = useState(null);
  const xlInputRef = useRef(null);

  // Summary stats
  const [stats, setStats] = useState(null);

  function showToast(msg, ok = true) { setToast({ msg, ok }); }

  /* ── Fetch records ── */
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterSeg)  params.set("segment", filterSeg);
      if (filterYear) params.set("year", filterYear);
      const res = await fetch(`${apiBase}?${params}`);
      const json = await res.json();
      let recs = json.records || [];
      if (search.trim()) {
        const q = search.toLowerCase();
        recs = recs.filter((r) => r.brand?.toLowerCase().includes(q) || r.state?.toLowerCase().includes(q));
      }
      setRecords(recs);
      setTotal(json.total || 0);
      setPages(json.pages || 1);
    } catch { showToast("Failed to load records", false); }
    setLoading(false);
  }, [apiBase, page, filterSeg, filterYear, search]);

  /* ── Fetch dashboard stats ── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/analytics?year=${filterYear}`);
      const json = await res.json();
      setStats(json);
    } catch {}
  }, [apiBase, filterYear]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  /* ── Save (create / update) ── */
  async function handleSave(form) {
    if (!form.brand || !form.unitsSold) return showToast("Brand and Units Sold are required", false);
    setFormLoading(true);
    try {
      const body = {
        ...form,
        unitsSold: Number(form.unitsSold),
        marketShare: form.marketShare ? Number(form.marketShare) : 0,
        growthPercentage: form.growthPercentage ? Number(form.growthPercentage) : 0,
        month: Number(form.month),
        year: Number(form.year),
      };

      let res;
      if (editRecord?._id) {
        res = await fetch(`${apiBase}/${editRecord._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        res = await fetch(apiBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed"); }
      showToast(editRecord?._id ? "Record updated!" : "Record saved!");
      setEditRecord(null);
      setTab("records");
      fetchRecords();
      fetchStats();
    } catch (err) { showToast(err.message, false); }
    setFormLoading(false);
  }

  /* ── Delete ── */
  async function handleDelete(id) {
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Record deleted");
      setDeleteId(null);
      fetchRecords();
      fetchStats();
    } catch (err) { showToast(err.message, false); }
  }

  /* ── Bulk Import ── */
  async function handleImport() {
    setImportLoading(true);
    try {
      const parsed = JSON.parse(importJson);
      const res = await fetch(`${apiBase}/import`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: parsed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      showToast(`Imported: ${json.inserted} new, ${json.updated} updated, ${json.errors} errors`);
      setImportJson("");
      fetchRecords();
      fetchStats();
    } catch (err) { showToast(err.message, false); }
    setImportLoading(false);
  }

  /* ── Excel: parse uploaded file ── */
  async function handleXlFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setXlFile(file);
    setXlRows([]);
    setXlErrors([]);
    setXlResult(null);
    setXlLoading(true);
    try {
      const XLSX = (await import("xlsx")).default;
      const buf  = await file.arrayBuffer();
      const wb   = XLSX.read(buf, { type: "array" });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const raw  = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const rows = [];
      const errs = [];

      raw.forEach((r, i) => {
        const row = i + 2; // 1-indexed + header
        const brand    = String(r["Brand"] || r["brand"] || "").trim();
        const segment  = String(r["Segment"] || r["segment"] || "").trim().toLowerCase();
        const state    = String(r["State"] || r["state"] || "National").trim();
        const month    = parseInt(r["Month"] || r["month"]);
        const year     = parseInt(r["Year"] || r["year"]);
        const units    = parseInt(r["UnitsSold"] || r["Units Sold"] || r["unitsSold"] || 0);
        const mktShare = parseFloat(r["MarketShare"] || r["Market Share"] || r["marketShare"] || 0) || 0;
        const growth   = parseFloat(r["Growth"] || r["GrowthPercentage"] || r["growthPercentage"] || 0) || 0;

        if (!brand)  { errs.push(`Row ${row}: Brand is required`); return; }
        if (!["car","two-wheeler","commercial"].includes(segment)) { errs.push(`Row ${row}: Segment must be car / two-wheeler / commercial (got "${segment}")`); return; }
        if (!month || month < 1 || month > 12) { errs.push(`Row ${row}: Month must be 1–12 (got "${r["Month"] || r["month"]}")`); return; }
        if (!year || year < 2020) { errs.push(`Row ${row}: Year must be 2020+ (got "${r["Year"] || r["year"]}")`); return; }
        if (!units && units !== 0) { errs.push(`Row ${row}: UnitsSold must be a number`); return; }

        rows.push({
          brand,
          brandSlug: slugify(String(r["BrandSlug"] || r["brandSlug"] || brand)),
          segment,
          state,
          month,
          year,
          unitsSold: units,
          marketShare: mktShare,
          growthPercentage: growth,
          isNational: state === "National",
        });
      });

      setXlRows(rows);
      setXlErrors(errs);
    } catch (err) {
      showToast("Could not read file: " + err.message, false);
    }
    setXlLoading(false);
  }

  /* ── Excel: submit parsed rows to API ── */
  async function handleXlImport() {
    if (!xlRows.length) return;
    setXlImporting(true);
    setXlResult(null);
    try {
      const res = await fetch(`${apiBase}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: xlRows }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      setXlResult(json);
      showToast(`Excel imported: ${json.inserted} new, ${json.updated} updated, ${json.errors} errors`);
      fetchRecords();
      fetchStats();
    } catch (err) {
      showToast(err.message, false);
    }
    setXlImporting(false);
  }

  /* ── Excel: download sample .xlsx ── */
  async function downloadSample() {
    const XLSX = (await import("xlsx")).default;
    const sample = [
      { Brand: "Tata EV",        BrandSlug: "tata-ev",        Segment: "car",          State: "National",    Month: 1, Year: 2025, UnitsSold: 8200,  MarketShare: 55.2, Growth: 28 },
      { Brand: "Tata EV",        BrandSlug: "tata-ev",        Segment: "car",          State: "Maharashtra", Month: 1, Year: 2025, UnitsSold: 1800,  MarketShare: 52.1, Growth: 25 },
      { Brand: "Tata EV",        BrandSlug: "tata-ev",        Segment: "car",          State: "Delhi",       Month: 1, Year: 2025, UnitsSold: 1200,  MarketShare: 49.8, Growth: 22 },
      { Brand: "MG EV",          BrandSlug: "mg-ev",          Segment: "car",          State: "National",    Month: 1, Year: 2025, UnitsSold: 2100,  MarketShare: 14.1, Growth: 18 },
      { Brand: "Ola Electric",   BrandSlug: "ola-electric",   Segment: "two-wheeler",  State: "National",    Month: 1, Year: 2025, UnitsSold: 32000, MarketShare: 34.8, Growth: 42 },
      { Brand: "Ola Electric",   BrandSlug: "ola-electric",   Segment: "two-wheeler",  State: "Karnataka",   Month: 1, Year: 2025, UnitsSold: 6400,  MarketShare: 36.2, Growth: 45 },
      { Brand: "TVS iQube",      BrandSlug: "tvs-iqube",      Segment: "two-wheeler",  State: "National",    Month: 1, Year: 2025, UnitsSold: 18000, MarketShare: 19.6, Growth: 35 },
      { Brand: "Tata EV Commercial", BrandSlug: "tata-ev-commercial", Segment: "commercial", State: "National", Month: 1, Year: 2025, UnitsSold: 2200, MarketShare: 58.3, Growth: 22 },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    // Column widths
    ws["!cols"] = [18,20,14,14,8,6,12,13,8].map((w) => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "EV Sales Data");

    // Instructions sheet
    const instructions = [
      { Column: "Brand",        Required: "Yes", Description: "Brand name (e.g. Tata EV)" },
      { Column: "BrandSlug",    Required: "No",  Description: "URL slug - auto-generated if empty (e.g. tata-ev)" },
      { Column: "Segment",      Required: "Yes", Description: "car / two-wheeler / commercial" },
      { Column: "State",        Required: "No",  Description: "State name or 'National' for pan-India data" },
      { Column: "Month",        Required: "Yes", Description: "1 to 12 (Jan=1, Dec=12)" },
      { Column: "Year",         Required: "Yes", Description: "e.g. 2025" },
      { Column: "UnitsSold",    Required: "Yes", Description: "Number of EVs sold" },
      { Column: "MarketShare",  Required: "No",  Description: "Percentage e.g. 18.5" },
      { Column: "Growth",       Required: "No",  Description: "YoY growth % e.g. 32.4 or -5.2" },
    ];
    const ws2 = XLSX.utils.json_to_sheet(instructions);
    ws2["!cols"] = [16, 10, 42].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws2, "Instructions");

    XLSX.writeFile(wb, "ev-sales-import-template.xlsx");
  }

  /* ── Tab nav ── */
  const TABS = [
    { id: "records",  label: "All Records",  icon: TableProperties },
    { id: "add",      label: "Add / Edit",   icon: FilePlus2       },
    { id: "excel",    label: "Excel Upload", icon: Sheet           },
    { id: "import",   label: "JSON Import",  icon: FileUp          },
    { id: "overview", label: "Dashboard",    icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-green-500" /> EV Sales Manager
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{total} records · Year {filterYear}</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setPage(1); }}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {[2023, 2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
            </select>
            <button onClick={() => { setTab("add"); setEditRecord(null); }}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition">
              <Plus size={14} /> Add Record
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                tab === id ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── DASHBOARD TAB ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Records",    value: total,                                           color: "bg-green-50 text-green-700"  },
                { label: "Car Records",      value: records.filter((r) => r.segment === "car").length,          color: "bg-blue-50 text-blue-700"    },
                { label: "2-Wheeler Records", value: records.filter((r) => r.segment === "two-wheeler").length, color: "bg-emerald-50 text-emerald-700" },
                { label: "Commercial Records",value: records.filter((r) => r.segment === "commercial").length,  color: "bg-purple-50 text-purple-700"  },
              ].map((s, i) => (
                <div key={i} className={`${s.color} rounded-2xl p-5`}>
                  <p className="text-3xl font-black">{s.value}</p>
                  <p className="text-xs font-semibold mt-1 opacity-80">{s.label}</p>
                </div>
              ))}
            </div>

            {stats && !stats.isFallback && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="font-black text-gray-900 dark:text-white text-sm mb-4">Sales Summary — {filterYear}</h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "Total EV Units",    value: stats.grandTotal },
                    { label: "Car Units",          value: stats.totals?.car?.totalUnits },
                    { label: "Two-Wheeler Units",  value: stats.totals?.["two-wheeler"]?.totalUnits },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                      <p className="text-xl font-black text-gray-900 dark:text-white">{fmt(s.value)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5 text-sm text-amber-800 dark:text-amber-300">
              <p className="font-bold mb-1">How to use this panel</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li><strong>All Records</strong> — view, search, edit or delete any sales record</li>
                <li><strong>Add / Edit</strong> — add a single month's data for a brand</li>
                <li><strong>Bulk Import</strong> — paste JSON to import multiple records at once</li>
                <li>Each record = one brand + one segment + one month + one year</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── RECORDS TAB ── */}
        {tab === "records" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 flex-1 min-w-52">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search brand or state…" className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none" />
                {search && <button onClick={() => setSearch("")}><X size={13} className="text-gray-400" /></button>}
              </div>
              <select value={filterSeg} onChange={(e) => { setFilterSeg(e.target.value); setPage(1); }}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                <option value="">All Segments</option>
                {SEGMENTS.map((s) => <option key={s} value={s}>{SEG_LABEL[s]}</option>)}
              </select>
              <button onClick={fetchRecords} disabled={loading}
                className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition">
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              {loading ? (
                <div className="py-16 text-center text-gray-400 text-sm">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-3" /> Loading records…
                </div>
              ) : records.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-gray-400 text-sm">No records found.</p>
                  <button onClick={() => setTab("add")} className="mt-3 text-green-600 text-sm font-bold hover:underline">Add first record →</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        <th className="text-left px-4 py-3">Brand</th>
                        <th className="text-left px-4 py-3">Segment</th>
                        <th className="text-center px-3 py-3">Month</th>
                        <th className="text-center px-3 py-3">Year</th>
                        <th className="text-right px-4 py-3">Units Sold</th>
                        <th className="text-right px-4 py-3">Mkt Share</th>
                        <th className="text-right px-4 py-3">Growth</th>
                        <th className="text-right px-4 py-3">State</th>
                        <th className="text-center px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {records.map((r) => (
                        <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                          <td className="px-4 py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">{r.brand}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SEG_COLOR[r.segment] || ""}`}>
                              {SEG_LABEL[r.segment] || r.segment}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-400">{MONTH_NAMES[(r.month || 1) - 1]}</td>
                          <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-400">{r.year}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{(r.unitsSold || 0).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{r.marketShare ? `${r.marketShare}%` : "—"}</td>
                          <td className="px-4 py-3 text-right">
                            {r.growthPercentage != null ? (
                              <span className={`text-xs font-bold ${r.growthPercentage >= 0 ? "text-green-600" : "text-red-500"}`}>
                                {r.growthPercentage >= 0 ? "+" : ""}{r.growthPercentage}%
                              </span>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-gray-400">{r.state || "National"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => { setEditRecord(r); setTab("add"); }}
                                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition">
                                <Pencil size={12} /> Edit
                              </button>
                              <button onClick={() => setDeleteId(r._id)}
                                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg transition">
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{total} records · Page {page} of {pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition">
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition">
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ADD / EDIT TAB ── */}
        {tab === "add" && (
          <div className="max-w-2xl">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-black text-gray-900 dark:text-white">
                    {editRecord ? `Editing: ${editRecord.brand} — ${MONTH_NAMES[(editRecord.month || 1) - 1]} ${editRecord.year}` : "Add New Record"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editRecord ? "Update this sales entry" : "Add monthly EV sales data for a brand"}
                  </p>
                </div>
                {editRecord && (
                  <button onClick={() => setEditRecord(null)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    <Plus size={12} className="rotate-45" /> New record
                  </button>
                )}
              </div>
              <RecordForm
                initial={editRecord ? {
                  brand: editRecord.brand || "",
                  brandSlug: editRecord.brandSlug || "",
                  segment: editRecord.segment || "car",
                  state: editRecord.state || "National",
                  month: editRecord.month || 1,
                  year: editRecord.year || 2025,
                  unitsSold: editRecord.unitsSold ?? "",
                  marketShare: editRecord.marketShare ?? "",
                  growthPercentage: editRecord.growthPercentage ?? "",
                  isNational: editRecord.isNational ?? true,
                } : EMPTY_FORM}
                onSave={handleSave}
                onCancel={editRecord ? () => { setEditRecord(null); setTab("records"); } : null}
                loading={formLoading}
              />
            </div>
          </div>
        )}

        {/* ── EXCEL UPLOAD TAB ── */}
        {tab === "excel" && (
          <div className="max-w-4xl space-y-5">
            {/* Step 1: Download sample */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-black">1</span>
                    Download Sample Template
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg">
                    Download the Excel template, fill in your EV sales data (one row per brand per month per state), then upload it below.
                  </p>
                </div>
                <button onClick={downloadSample}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shrink-0">
                  <Download size={15} /> Download Template (.xlsx)
                </button>
              </div>

              {/* Column reference */}
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="text-left px-3 py-2 rounded-tl-lg font-bold text-gray-600">Column Name</th>
                      <th className="text-center px-3 py-2 font-bold text-gray-600">Required</th>
                      <th className="text-left px-3 py-2 rounded-tr-lg font-bold text-gray-600">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {[
                      ["Brand",       true,  "Brand name e.g. Tata EV, Ola Electric"],
                      ["BrandSlug",   false, "Auto-generated from brand name if empty (e.g. tata-ev)"],
                      ["Segment",     true,  "Must be exactly: car  /  two-wheeler  /  commercial"],
                      ["State",       false, "State name (Maharashtra, Delhi…) or 'National' for pan-India"],
                      ["Month",       true,  "Number 1–12  (Jan = 1, Feb = 2 … Dec = 12)"],
                      ["Year",        true,  "e.g. 2025"],
                      ["UnitsSold",   true,  "Number of vehicles sold e.g. 8200"],
                      ["MarketShare", false, "Percentage share e.g. 18.5  (leave blank if unknown)"],
                      ["Growth",      false, "Year-over-year growth % e.g. 32.4 or -5.2"],
                    ].map(([col, req, desc]) => (
                      <tr key={col} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2"><code className="font-bold text-green-600">{col}</code></td>
                        <td className="px-3 py-2 text-center">
                          {req
                            ? <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full text-[10px]">Required</span>
                            : <span className="bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full text-[10px]">Optional</span>}
                        </td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 2: Upload */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-black">2</span>
                Upload Your Excel File
              </h2>
              <input ref={xlInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleXlFile} />

              {!xlFile ? (
                <button onClick={() => xlInputRef.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 py-12 flex flex-col items-center gap-3 hover:border-green-400 hover:bg-green-50/50 transition group">
                  <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-green-100 transition">
                    <Upload size={22} className="text-gray-400 group-hover:text-green-600 transition" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-700 dark:text-gray-300">Click to upload Excel file</p>
                    <p className="text-xs text-gray-400 mt-1">Supports .xlsx, .xls, .csv · Max 10MB</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 px-5 py-4">
                  <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-800 flex items-center justify-center shrink-0">
                    <Sheet size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{xlFile.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{(xlFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => { setXlFile(null); setXlRows([]); setXlErrors([]); setXlResult(null); if (xlInputRef.current) xlInputRef.current.value = ""; }}
                    className="text-gray-400 hover:text-red-500 transition">
                    <X size={16} />
                  </button>
                </div>
              )}

              {xlLoading && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500"><RefreshCw size={14} className="animate-spin" /> Parsing file…</div>
              )}
            </div>

            {/* Step 3: Preview & errors */}
            {(xlRows.length > 0 || xlErrors.length > 0) && (
              <div className="space-y-4">
                {/* Validation errors */}
                {xlErrors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-5">
                    <p className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 text-sm mb-3">
                      <AlertCircle size={15} /> {xlErrors.length} row{xlErrors.length !== 1 ? "s" : ""} have errors (skipped)
                    </p>
                    <ul className="space-y-1">
                      {xlErrors.map((e, i) => <li key={i} className="text-xs text-red-600 dark:text-red-400">• {e}</li>)}
                    </ul>
                  </div>
                )}

                {/* Preview table */}
                {xlRows.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                      <p className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                        <Eye size={14} className="text-green-500" />
                        Preview — {xlRows.length} valid row{xlRows.length !== 1 ? "s" : ""} ready to import
                      </p>
                      {xlResult ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <CheckCircle2 size={12} /> Imported: {xlResult.inserted} new · {xlResult.updated} updated
                        </span>
                      ) : (
                        <button onClick={handleXlImport} disabled={xlImporting}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-xl text-sm transition">
                          {xlImporting ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                          {xlImporting ? "Importing…" : `Import ${xlRows.length} Records`}
                        </button>
                      )}
                    </div>
                    <div className="overflow-x-auto max-h-80">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                          <tr className="font-bold text-gray-500">
                            {["#","Brand","Segment","State","Month","Year","Units Sold","Mkt Share","Growth"].map((h) => (
                              <th key={h} className="text-left px-3 py-2 whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                          {xlRows.map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                              <td className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{r.brand}</td>
                              <td className="px-3 py-2">
                                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${SEG_COLOR[r.segment] || ""}`}>{SEG_LABEL[r.segment]}</span>
                              </td>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">{r.state}</td>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{MONTH_NAMES[r.month - 1]}</td>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.year}</td>
                              <td className="px-3 py-2 font-bold text-gray-900 dark:text-white">{r.unitsSold.toLocaleString("en-IN")}</td>
                              <td className="px-3 py-2 text-gray-500">{r.marketShare ? `${r.marketShare}%` : "—"}</td>
                              <td className={`px-3 py-2 font-bold ${r.growthPercentage >= 0 ? "text-green-600" : "text-red-500"}`}>
                                {r.growthPercentage ? `${r.growthPercentage > 0 ? "+" : ""}${r.growthPercentage}%` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── IMPORT TAB ── */}
        {tab === "import" && (
          <div className="max-w-3xl space-y-5">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <h2 className="font-black text-gray-900 dark:text-white mb-1 flex items-center gap-2"><FileUp size={16} className="text-blue-500" /> Bulk Import</h2>
              <p className="text-xs text-gray-500 mb-4">Paste a JSON array. Saves time when entering multiple months of data at once.</p>
              <textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} rows={10}
                placeholder={'[\n  {\n    "brand": "Tata EV",\n    "brandSlug": "tata-ev",\n    "segment": "car",\n    "month": 1,\n    "year": 2025,\n    "unitsSold": 8200,\n    "marketShare": 55.2,\n    "growthPercentage": 28,\n    "state": "National",\n    "isNational": true\n  }\n]'}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-xs font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y mb-4" />
              <button onClick={handleImport} disabled={importLoading || !importJson.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">
                {importLoading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                {importLoading ? "Importing…" : "Import Records"}
              </button>
            </div>

            {/* Template */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Required Fields</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { field: "brand", desc: "Brand name e.g. Tata EV" },
                  { field: "brandSlug", desc: "URL slug e.g. tata-ev" },
                  { field: "segment", desc: "car / two-wheeler / commercial" },
                  { field: "month", desc: "1–12" },
                  { field: "year", desc: "e.g. 2025" },
                  { field: "unitsSold", desc: "Number of units" },
                ].map((f) => (
                  <div key={f.field} className="bg-white dark:bg-gray-900 rounded-xl p-3">
                    <code className="text-xs font-bold text-green-600">{f.field}</code>
                    <p className="text-[11px] text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-7 max-w-sm w-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="font-black text-gray-900 dark:text-white text-base mb-1">Delete this record?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This action cannot be undone. The record will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition">
                Yes, Delete
              </button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}
    </div>
  );
}
