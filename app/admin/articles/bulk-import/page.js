"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Upload, FileText, CheckCircle, AlertCircle, Download, ArrowLeft, Loader2, X } from "lucide-react";

const CSV_TEMPLATE_HEADER = "title,slug,excerpt,content,image,imageAlt,category,author,tags,readTime,featured,status,metaTitle,metaDescription";
const CSV_EXAMPLE_ROW     = '"Tata Nexon EV 2025 Review","tata-nexon-ev-2025-review","Best-in-class range and features.","<p>Full review here...</p>","https://example.com/img.jpg","Tata Nexon EV","cars","EV Radar Team","tata|nexon|ev","5 min","false","draft","Tata Nexon EV 2025 Review | EVRadar","Full review of Tata Nexon EV 2025 with pros, cons and verdict."';

export default function BulkImportPage() {
  const [file,      setFile]      = useState(null);
  const [dragging,  setDragging]  = useState(false);
  const [importing, setImporting] = useState(false);
  const [result,    setResult]    = useState(null);
  const inputRef = useRef(null);

  function handleFile(f) {
    if (!f || !f.name.endsWith(".csv")) { alert("Please select a .csv file"); return; }
    setFile(f);
    setResult(null);
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch("/api/admin/bulk-import", { method: "POST", body: fd });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Network error" });
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const content = `${CSV_TEMPLATE_HEADER}\n${CSV_EXAMPLE_ROW}`;
    const blob    = new Blob([content], { type: "text/csv" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href = url; a.download = "evradar-articles-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/articles" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Bulk Import Articles</h1>
            <p className="text-sm text-gray-500">Import multiple articles at once via CSV</p>
          </div>
        </div>

        {/* Template download */}
        <div className="mb-5 rounded-2xl bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-800">Download CSV Template</p>
              <p className="text-xs text-blue-600 mt-0.5">Use the template to format your articles correctly before importing.</p>
              <ul className="mt-2 text-xs text-blue-700 space-y-0.5">
                <li><span className="font-semibold">Required:</span> title, content</li>
                <li><span className="font-semibold">category:</span> cars | bikes | commercial | charging</li>
                <li><span className="font-semibold">tags:</span> separate with | pipe character</li>
                <li><span className="font-semibold">status:</span> draft (default) | published</li>
                <li><span className="font-semibold">content:</span> HTML allowed</li>
              </ul>
            </div>
            <button onClick={downloadTemplate}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 transition">
              <Download size={13} /> Template
            </button>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`mb-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition ${
            dragging ? "border-green-400 bg-green-50" : "border-gray-300 bg-white hover:border-green-400 hover:bg-green-50/50"
          }`}>
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          {file ? (
            <div className="flex items-center gap-3 text-green-700">
              <FileText size={28} className="shrink-0" />
              <div>
                <p className="font-bold">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }}
                className="ml-3 rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition">
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={32} className="mb-3 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">Drag & drop your CSV file here</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse</p>
            </>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`mb-5 rounded-2xl p-4 ${result.error ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
            {result.error ? (
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <p className="text-sm font-semibold text-red-700">{result.error}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-green-600 shrink-0" />
                  <p className="text-sm font-bold text-green-800">Import complete</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total rows", value: result.total, color: "text-gray-900" },
                    { label: "Created",    value: result.created, color: "text-green-700" },
                    { label: "Skipped",    value: result.skipped, color: "text-orange-600" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl bg-white border border-gray-200 p-3 text-center">
                      <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                {result.errors?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-red-700 mb-1">Errors:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {result.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-600 rounded bg-red-100 px-2 py-1">
                          <strong>{err.title}</strong>: {err.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <Link href="/admin/articles"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:underline">
                  View imported articles →
                </Link>
              </>
            )}
          </div>
        )}

        <button onClick={handleImport} disabled={!file || importing}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-700 py-3.5 text-sm font-bold text-white hover:bg-green-800 transition disabled:opacity-50">
          {importing
            ? <><Loader2 size={16} className="animate-spin" /> Importing…</>
            : <><Upload size={16} /> Import Articles</>
          }
        </button>
      </div>
    </div>
  );
}
