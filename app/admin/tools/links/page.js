"use client";

import { useState } from "react";
import { Link2, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

export default function BrokenLinksPage() {
  const [url, setUrl]         = useState("https://www.evradar.in");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError]     = useState("");

  async function run() {
    if (!url) return;
    setRunning(true);
    setResults(null);
    setError("");

    try {
      const res = await fetch(`/api/admin/tools/check-links?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  const broken  = results?.links?.filter(l => l.status >= 400 || l.status === 0) || [];
  const ok      = results?.links?.filter(l => l.status > 0 && l.status < 400)   || [];
  const total   = results?.links?.length || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Link2 className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Broken Link Checker</h1>
          <p className="text-xs text-gray-500">Scan a page for broken links (4xx, 5xx, network errors)</p>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.evradar.in/news/..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition"
        />
        <button
          onClick={run}
          disabled={running || !url}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition disabled:opacity-50"
        >
          {running ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {running ? "Scanning…" : "Scan"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      {running && (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-red-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Scanning links, this may take a minute…</p>
        </div>
      )}

      {results && !running && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
              <p className="text-2xl font-black text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">Total Links</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
              <p className="text-2xl font-black text-green-700">{ok.length}</p>
              <p className="text-xs text-green-600">Working</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
              <p className="text-2xl font-black text-red-700">{broken.length}</p>
              <p className="text-xs text-red-600">Broken</p>
            </div>
          </div>

          {/* Broken links */}
          {broken.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} /> Broken Links ({broken.length})
              </h2>
              <div className="space-y-2">
                {broken.map((l, i) => (
                  <div key={i} className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <span className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold ${l.status === 0 ? "bg-gray-200 text-gray-600" : "bg-red-200 text-red-800"}`}>
                      {l.status === 0 ? "ERR" : l.status}
                    </span>
                    <a href={l.url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-xs text-red-700 truncate hover:underline">
                      {l.url}
                    </a>
                    {l.text && <span className="text-xs text-gray-400 shrink-0 max-w-32 truncate">{l.text}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {broken.length === 0 && (
            <div className="text-center py-10 bg-green-50 rounded-2xl border border-green-100">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="font-bold text-green-700">No broken links found!</p>
              <p className="text-sm text-green-600 mt-1">All {total} links on this page are working.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
