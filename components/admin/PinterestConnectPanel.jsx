"use client";

// "Connect Pinterest": log in with Pinterest, choose (or create) the board that pins go to.
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Copy, Check, Unlink, Plus } from "lucide-react";
import { FaPinterest } from "react-icons/fa6";

const MESSAGES = {
  connected: ["ok", "Pinterest connected. Now choose the board your pins go to."],
  "missing-app": ["err", "Enter the Pinterest App ID and App secret in the Pinterest card below and Save, then click Connect Pinterest."],
  denied: ["err", "Pinterest login was cancelled."],
  "bad-state": ["err", "The login link expired. Click Connect Pinterest again."],
  error: ["err", "Pinterest login failed."],
};

function CopyField({ label, value }) {
  const [done, setDone] = useState(false);
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-500">{label}</p>
      <div className="mt-0.5 flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-gray-100 px-2 py-1.5 text-xs text-gray-800">{value || "—"}</code>
        {value && <button type="button" onClick={() => { navigator.clipboard?.writeText(value); setDone(true); setTimeout(() => setDone(false), 1500); }} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:text-gray-900" aria-label={`Copy ${label}`}>{done ? <Check size={13} /> : <Copy size={13} />}</button>}
      </div>
    </div>
  );
}

export default function PinterestConnectPanel({ onChange }) {
  const [data, setData] = useState(null);
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState("");
  const [newBoard, setNewBoard] = useState("EV News India");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/social/pinterest").then((r) => r.json()).then((d) => {
      if (!alive) return;
      setData(d);
      const q = new URLSearchParams(window.location.search);
      const m = q.get("pin");
      if (m && MESSAGES[m]) setNote({ type: MESSAGES[m][0], text: MESSAGES[m][1] + (q.get("reason") ? ` (${q.get("reason")})` : "") });
    }).catch(() => alive && setData({ error: true }));
    return () => { alive = false; };
  }, [reload]);

  async function call(method, body, okText) {
    setBusy(method + (body?.boardId || body?.createBoard || ""));
    const r = await fetch("/api/admin/social/pinterest", { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    setNote(r.ok ? { type: "ok", text: okText } : { type: "err", text: d.error || "Failed" });
    window.history.replaceState(null, "", "/admin/social-settings");
    setReload((n) => n + 1); onChange?.();
  }

  if (!data) return <div className="mb-6 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" />Checking Pinterest connection…</div>;
  const c = data.connected;

  return (
    <div className="mb-6 space-y-4 rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-base font-black text-gray-900"><FaPinterest className="text-[#E60023]" size={18} />Pinterest</p>
          {c ? <p className="mt-1 text-sm text-gray-600">Connected as <b>@{c.username}</b>, pinning to <b>{c.boardName || "your board"}</b>. Login renews automatically.</p>
            : data.loggedIn ? <p className="mt-1 text-sm text-gray-600">Logged in as <b>@{data.account?.username}</b>. Choose a board below.</p>
            : <p className="mt-1 text-sm text-gray-600">Every article becomes a tall 1000×1500 pin with a clickable link back to evradar.in.</p>}
          {(c?.lastError || data.account?.lastError) && <p className="mt-1 text-xs text-red-600">{c?.lastError || data.account?.lastError}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {data.appConfigured ? (
            <a href="/api/admin/social/pinterest/connect" className="flex items-center gap-2 rounded-xl bg-[#E60023] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"><FaPinterest size={15} />{data.loggedIn ? "Reconnect" : "Connect Pinterest"}</a>
          ) : <p className="max-w-xs rounded-xl bg-amber-50 p-3 text-xs text-amber-800">First enter the Pinterest <b>App ID</b> and <b>App secret</b> in the Pinterest card below and click Save.</p>}
          {data.loggedIn && <button disabled={!!busy} onClick={() => confirm("Disconnect Pinterest?") && call("DELETE", null, "Pinterest disconnected.")} className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-50"><Unlink size={13} />Disconnect</button>}
        </div>
      </div>

      {note && <p className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${note.type === "err" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{note.type === "err" ? <AlertCircle size={15} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}{note.text}</p>}

      {data.loggedIn && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Board for EV Radar pins</p>
          {data.boardsError && <p className="mb-2 text-xs text-red-600">Couldn&apos;t load boards: {data.boardsError}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {data.boards.map((b) => (
              <div key={b.id} className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${c?.boardId === b.id ? "border-green-400 bg-green-50" : "border-gray-200"}`}>
                <div className="min-w-0"><p className="truncate text-sm font-bold text-gray-900">{b.name}</p><p className="text-xs text-gray-500">{b.privacy?.toLowerCase()}{b.pins != null ? ` · ${b.pins} pins` : ""}</p></div>
                {c?.boardId === b.id ? <span className="text-xs font-bold text-green-700">Selected</span> : (
                  <button disabled={!!busy} onClick={() => call("POST", { boardId: b.id, boardName: b.name }, `Pins will go to “${b.name}”.`)} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">{busy === `POST${b.id}` ? <Loader2 size={12} className="animate-spin" /> : "Use this board"}</button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input value={newBoard} onChange={(e) => setNewBoard(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="New board name" />
            <button disabled={!!busy || !newBoard.trim()} onClick={() => call("POST", { createBoard: newBoard }, `Created board “${newBoard}” and selected it.`)} className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-gray-800 disabled:opacity-50"><Plus size={13} />Create public board</button>
          </div>
        </div>
      )}

      <details className="rounded-xl bg-gray-50 p-3">
        <summary className="cursor-pointer text-xs font-bold text-gray-700">Pinterest app setup values (developers.pinterest.com → My apps)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <CopyField label="Redirect URI" value={data.setup?.redirectUri} />
          <div className="text-[11px] text-gray-500">Scopes requested: boards:read, boards:write, pins:read, pins:write, user_accounts:read. Use a Pinterest <b>business</b> account. Apps start with Trial access; request Standard access so pins are public.</div>
        </div>
      </details>
    </div>
  );
}
