"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, CheckCircle, XCircle, Loader2, ExternalLink, Phone } from "lucide-react";

const ISSUE = { not_working: "Not working", closed: "Closed permanently", wrong_location: "Wrong location", wrong_details: "Wrong details", other: "Other" };

export default function ChargingReportsPage() {
  const [status, setStatus] = useState("pending");
  const [data, setData] = useState({ reports: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/charging-reports?status=${status}`);
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  }, [status]);
  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/charging-reports?status=${status}`).then((r) => (r.ok ? r.json() : null)).then((d) => { if (alive && d) setData(d); }).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [status]);

  async function act(id, action) {
    setBusy(id); setMsg("");
    const res = await fetch("/api/admin/charging-reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    const d = await res.json();
    setMsg(res.ok ? (d.effect || (action === "approve" ? "Approved" : "Rejected")) : d.error || "Failed");
    setBusy("");
    load();
  }

  const gmaps = (c) => c?.length === 2 ? `https://www.google.com/maps?q=${c[1]},${c[0]}` : null;

  return (
    <div className="space-y-5 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Charging Station Reports</h1>
        <p className="text-sm text-gray-500">Missing stations and problems reported by visitors. Approving a missing station adds it to the map; approving “closed” or “wrong location” updates the station.</p>
      </div>
      <div className="flex gap-2">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button key={s} onClick={() => { setLoading(true); setStatus(s); }} className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize ${status === s ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}>
            {s}{data.counts?.[s] ? ` (${data.counts[s]})` : ""}
          </button>
        ))}
      </div>
      {msg && <p className="rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">{msg}</p>}
      {loading ? <Loader2 className="animate-spin text-gray-400" /> : data.reports.length === 0 ? <p className="text-sm text-gray-500">No {status} reports.</p> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.reports.map((r) => {
            const loc = gmaps(r.location?.coordinates);
            const stLoc = gmaps(r.station?.location?.coordinates);
            return (
              <div key={r._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${r.kind === "missing" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                      {r.kind === "missing" ? "Missing station" : `Problem: ${ISSUE[r.issue] || r.issue}`}
                    </span>
                    <p className="mt-2 font-black text-gray-900">{r.name || r.station?.name || "Unnamed"}</p>
                    <p className="text-xs text-gray-500">{[r.network, r.chargerType, r.city].filter(Boolean).join(" · ")}</p>
                  </div>
                  <p className="shrink-0 text-[11px] text-gray-400">{new Date(r.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                {r.address && <p className="mt-2 text-sm text-gray-700">{r.address}</p>}
                {r.details && <p className="mt-2 rounded-lg bg-gray-50 p-2 text-sm text-gray-700">{r.details}</p>}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {loc && <a href={loc} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg border px-2 py-1 font-semibold text-gray-700"><MapPin size={12} />Reported location<ExternalLink size={10} /></a>}
                  {stLoc && <a href={stLoc} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg border px-2 py-1 font-semibold text-gray-700"><MapPin size={12} />Current map location<ExternalLink size={10} /></a>}
                  {r.reporterPhone && <a href={`tel:${r.reporterPhone}`} className="flex items-center gap-1 rounded-lg border px-2 py-1 font-semibold text-gray-700"><Phone size={12} />{r.reporterName || "Reporter"} {r.reporterPhone}</a>}
                </div>
                {r.status === "pending" ? (
                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                    <button disabled={busy === r._id} onClick={() => act(r._id, "approve")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2 text-xs font-bold text-white disabled:opacity-50"><CheckCircle size={13} />Approve</button>
                    <button disabled={busy === r._id} onClick={() => act(r._id, "reject")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-bold text-gray-600 disabled:opacity-50"><XCircle size={13} />Reject</button>
                  </div>
                ) : <p className="mt-3 text-xs text-gray-500">{r.status}{r.adminNote ? ` — ${r.adminNote}` : ""}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
