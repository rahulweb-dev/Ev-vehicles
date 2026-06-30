"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, AlertTriangle, Info, CheckCircle, TrendingUp,
  RefreshCw, ExternalLink, Loader2, Car, Newspaper,
  Wand2, X, ChevronDown, ChevronUp,
} from "lucide-react";

const SEV = {
  high:   { color: "text-red-600",    bg: "bg-red-50    border-red-200",    dot: "bg-red-500",    label: "High" },
  medium: { color: "text-orange-600", bg: "bg-orange-50 border-orange-200", dot: "bg-orange-500", label: "Medium" },
  low:    { color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-400", label: "Low" },
};

const ISSUE_LABELS = {
  "Missing or short meta title":    "Meta Title Missing",
  "Meta title too long":            "Meta Title Too Long",
  "Missing or short meta description": "Meta Description Missing",
  "Meta description too long":      "Meta Description Too Long",
  "No featured image":              "Featured Image Missing",
  "Excerpt missing":                "Excerpt Missing",
  "No tags set":                    "No Tags",
  "No gallery images":              "No Gallery",
  "No price set":                   "No Price",
};

function ScoreRing({ score }) {
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#f59e0b" : "#ef4444";
  const r = 54, cx = 60, stroke = 8;
  const circ = 2 * Math.PI * r;
  const dash  = (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width={cx * 2} height={cx * 2}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`} style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-black" style={{ color }}>{score}</p>
        <p className="text-[10px] text-gray-400 font-semibold">SEO Score</p>
      </div>
    </div>
  );
}

function IssueGroup({ label, issues, editPath }) {
  const [open, setOpen] = useState(false);
  const sev = SEV[issues[0]?.severity] || SEV.low;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition text-left"
      >
        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${sev.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900">{label}</p>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${sev.bg} ${sev.color}`}>{sev.label}</span>
            <span className="rounded-full bg-gray-100 border border-gray-200 text-gray-500 px-2 py-0.5 text-[10px] font-bold">
              {issues.length} {issues.length === 1 ? "item" : "items"}
            </span>
            {issues[0]?.fixable && (
              <span className="rounded-full bg-green-100 border border-green-200 text-green-700 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                <Wand2 size={9} /> Auto-fixable
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={editPath} onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
            Fix <ExternalLink size={11} />
          </Link>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-50 max-h-72 overflow-y-auto">
          {issues.map((issue, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              <p className="text-xs text-gray-700 font-medium truncate flex-1 min-w-0">{issue.title}</p>
              <p className="text-[10px] text-gray-400 font-mono shrink-0">{issue.url}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SEOAuditPage() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [typeF,     setTypeF]     = useState("all");
  const [search,    setSearch]    = useState("");
  const [viewMode,  setViewMode]  = useState("grouped"); // grouped | flat
  const [fixing,    setFixing]    = useState(false);
  const [fixResult, setFixResult] = useState(null);

  async function load() {
    setLoading(true);
    setFixResult(null);
    try {
      const res  = await fetch("/api/admin/seo-audit");
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function autoFix() {
    if (!confirm(`Auto-fix ${data?.autoFixable || 0} issues? This will generate meta titles, descriptions, and excerpts for items that are missing them.`)) return;
    setFixing(true);
    try {
      const res  = await fetch("/api/admin/seo-audit/fix", { method: "POST" });
      const json = await res.json();
      setFixResult(json);
      await load();
    } catch {
      setFixResult({ error: "Auto-fix failed. Try again." });
    } finally {
      setFixing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const allIssues = data?.issues || [];

  const filtered = allIssues.filter(i => {
    if (filter !== "all" && i.severity !== filter) return false;
    if (typeF  !== "all" && i.type    !== typeF)   return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) &&
        !i.issue.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  /* Group by issue type for grouped view */
  const grouped = {};
  filtered.forEach(issue => {
    const key = Object.keys(ISSUE_LABELS).find(k => issue.issue.startsWith(k)) || issue.issue.slice(0, 40);
    const label = ISSUE_LABELS[key] || key;
    if (!grouped[label]) grouped[label] = { issues: [], fixable: issue.fixable, severity: issue.severity, editPath: issue.type === "article" ? "/admin/articles" : "/admin/vehicles" };
    grouped[label].issues.push(issue);
  });

  const groupedEntries = Object.entries(grouped).sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a[1].severity] || 2) - (order[b[1].severity] || 2);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">SEO Audit</h1>
          <p className="text-sm text-gray-500">Find and fix issues hurting your Google rankings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {data?.autoFixable > 0 && (
            <button onClick={autoFix} disabled={fixing || loading}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition shadow-sm disabled:opacity-50">
              {fixing ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              {fixing ? "Fixing…" : `Auto-fix ${data.autoFixable} issues`}
            </button>
          )}
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm disabled:opacity-50">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Re-run Audit
          </button>
        </div>
      </div>

      {/* Fix result banner */}
      {fixResult && (
        <div className={`mb-4 flex items-center gap-3 rounded-2xl border px-4 py-3 ${fixResult.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
          {fixResult.error
            ? <><AlertTriangle size={16} className="text-red-600" /><p className="text-sm font-semibold text-red-700">{fixResult.error}</p></>
            : <><CheckCircle size={16} className="text-green-600" /><p className="text-sm font-semibold text-green-700">
                Auto-fixed {fixResult.total} items — {fixResult.articlesFixed} articles, {fixResult.vehiclesFixed} vehicles.
                Re-running audit…
              </p></>
          }
          <button onClick={() => setFixResult(null)} className="ml-auto text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={36} className="animate-spin text-green-600" />
          <p className="text-gray-500 font-semibold">Auditing all pages…</p>
        </div>
      ) : data ? (
        <>
          {/* Score + stats */}
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-6 gap-4">
            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white border border-gray-200 p-4 shadow-sm flex flex-col items-center justify-center">
              <ScoreRing score={data.score} />
            </div>
            {[
              { label: "Total Issues",   value: data.total,       icon: AlertTriangle, color: "text-gray-700" },
              { label: "High Priority",  value: data.high,        icon: AlertTriangle, color: "text-red-600" },
              { label: "Medium",         value: data.medium,      icon: Info,          color: "text-orange-500" },
              { label: "Low",            value: data.low,         icon: Info,          color: "text-yellow-500" },
              { label: "Auto-fixable",   value: data.autoFixable, icon: Wand2,         color: "text-green-600" },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                  <Icon size={18} className={`${stat.color} mb-2`} />
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Coverage */}
          <div className="mb-5 grid grid-cols-2 gap-4">
            {[
              { icon: Newspaper, label: "Articles audited", value: data.counts.articles, color: "text-blue-600",  bg: "bg-blue-50  border-blue-200" },
              { icon: Car,       label: "Vehicles audited", value: data.counts.vehicles, color: "text-green-600", bg: "bg-green-50 border-green-200" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`flex items-center gap-3 rounded-2xl border ${s.bg} p-4 shadow-sm`}>
                  <Icon size={20} className={s.color} />
                  <div>
                    <p className="text-2xl font-black text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters + view toggle */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search issues or page titles…"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-green-400 focus:outline-none shadow-sm" />
            </div>
            <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm p-0.5">
              {["all","high","medium","low"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${filter === f ? "bg-green-700 text-white" : "text-gray-500 hover:text-gray-900"}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm p-0.5">
              {["all","article","vehicle"].map(f => (
                <button key={f} onClick={() => setTypeF(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${typeF === f ? "bg-green-700 text-white" : "text-gray-500 hover:text-gray-900"}`}>
                  {f === "all" ? "All" : f === "article" ? "Articles" : "Vehicles"}
                </button>
              ))}
            </div>
            <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm p-0.5">
              {[["grouped","Grouped"],["flat","Flat"]].map(([v,l]) => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${viewMode === v ? "bg-green-700 text-white" : "text-gray-500 hover:text-gray-900"}`}>
                  {l}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 ml-auto">{filtered.length} issues</p>
          </div>

          {/* Issues */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 rounded-2xl border border-dashed border-gray-200 bg-white">
              <CheckCircle size={36} className="text-green-500" />
              <p className="font-bold text-gray-700">No issues found for this filter!</p>
            </div>
          ) : viewMode === "grouped" ? (
            <div className="space-y-2">
              {groupedEntries.map(([label, group]) => (
                <IssueGroup
                  key={label}
                  label={label}
                  issues={group.issues.map(i => ({ ...i, fixable: group.fixable }))}
                  editPath={group.editPath}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((issue, i) => {
                const sev = SEV[issue.severity];
                const editPath = issue.type === "article" ? "/admin/articles" : "/admin/vehicles";
                return (
                  <div key={i} className="flex items-start gap-4 rounded-2xl bg-white border border-gray-200 px-4 py-3.5 shadow-sm hover:border-gray-300 transition">
                    <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${sev.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900 truncate">{issue.title}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${sev.bg} ${sev.color}`}>{sev.label}</span>
                        <span className="rounded-full bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 text-[10px] font-bold capitalize">{issue.type}</span>
                        {issue.fixable && (
                          <span className="rounded-full bg-green-100 border border-green-200 text-green-700 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                            <Wand2 size={9} /> Auto-fixable
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{issue.issue}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{issue.url}</p>
                    </div>
                    <Link href={editPath} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-green-600 hover:underline mt-0.5">
                      Fix <ExternalLink size={11} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-400">Failed to load audit. Try again.</div>
      )}
    </div>
  );
}
