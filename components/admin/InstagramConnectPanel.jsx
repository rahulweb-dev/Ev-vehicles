"use client";

// "Connect Instagram" with Instagram Login — no Facebook Page or business portfolio link needed.
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Copy, Check, Camera, Unlink, RefreshCw } from "lucide-react";

const MESSAGES = {
  connected: ["ok", "Instagram connected."],
  "missing-app": ["err", "Enter the Instagram App ID and Instagram App Secret in the Instagram card below and Save, then click Connect Instagram."],
  denied: ["err", "Instagram login was cancelled or refused."],
  "bad-state": ["err", "The login link expired or didn't match. Click Connect Instagram again."],
  error: ["err", "Instagram login failed."],
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

export default function InstagramConnectPanel({ onChange }) {
  const [data, setData] = useState(null);
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/social/instagram").then((r) => r.json()).then((d) => {
      if (!alive) return;
      setData(d);
      const q = new URLSearchParams(window.location.search);
      const m = q.get("ig");
      if (m && MESSAGES[m]) setNote({ type: MESSAGES[m][0], text: MESSAGES[m][1] + (q.get("reason") ? ` (${q.get("reason")})` : "") });
    }).catch(() => alive && setData({ error: true }));
    return () => { alive = false; };
  }, [reload]);

  async function act(method, body) {
    setBusy(method);
    const r = await fetch("/api/admin/social/instagram", { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (method === "DELETE") setNote({ type: "ok", text: "Instagram disconnected." });
    else setNote(d.webhookSubscribed ? { type: "ok", text: "Real-time alerts are on." } : { type: "err", text: `Alerts not active: ${d.webhookError || d.error || "unknown error"}` });
    window.history.replaceState(null, "", "/admin/social-settings");
    setReload((n) => n + 1); onChange?.();
  }

  if (!data) return <div className="mb-6 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" />Checking Instagram connection…</div>;

  const c = data.connected;
  const daysLeft = c?.tokenExpiresAt ? Math.round((new Date(c.tokenExpiresAt) - new Date(c.tokenRefreshedAt || c.connectedAt)) / 86400000) : null;
  return (
    <div className="mb-6 space-y-4 rounded-2xl border border-pink-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-black text-gray-900">📸 Instagram (direct login)</p>
          {c ? (
            <p className="mt-1 text-sm text-gray-600">Connected to <b>@{c.username}</b>{c.accountType ? ` (${c.accountType.toLowerCase().replace("_", " ")})` : ""}.{" "}
              {c.webhookSubscribed ? <span className="font-semibold text-green-700">Real-time alerts on.</span> : <span className="font-semibold text-amber-700">Real-time alerts off{c.webhookError ? ` — ${c.webhookError}` : ""}.</span>}
              {daysLeft != null && <span className="block text-xs text-gray-400">Login renews automatically every week (each renewal lasts ~{daysLeft} days).</span>}
            </p>
          ) : data.linkedViaFacebook ? (
            <p className="mt-1 text-sm text-gray-600">Currently using <b>@{data.linkedViaFacebook.username}</b> through the Facebook Page. Connecting here switches Instagram to direct login.</p>
          ) : <p className="mt-1 text-sm text-gray-600">Log in with your Instagram professional account directly — no Facebook Page link or business portfolio needed. Posting, comments and DMs all work.</p>}
          {c?.tokenError && <p className="mt-1 text-xs text-red-600">Login no longer valid: {c.tokenError}. Click Reconnect.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {data.appConfigured ? (
            <a href="/api/admin/social/instagram/connect" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"><Camera size={15} />{c ? "Reconnect" : "Connect Instagram"}</a>
          ) : <p className="max-w-xs rounded-xl bg-amber-50 p-3 text-xs text-amber-800">First enter the <b>Instagram App ID</b> and <b>Instagram App Secret</b> in the Instagram card below and click Save.</p>}
          {c && !c.webhookSubscribed && <button disabled={!!busy} onClick={() => act("POST", { action: "resubscribe" })} className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-50">{busy === "POST" ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}Retry alerts</button>}
          {c && <button disabled={!!busy} onClick={() => confirm("Disconnect Instagram from the website?") && act("DELETE")} className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-50"><Unlink size={13} />Disconnect</button>}
        </div>
      </div>

      {note && <p className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${note.type === "err" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{note.type === "err" ? <AlertCircle size={15} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}{note.text}</p>}

      <details className="rounded-xl bg-gray-50 p-3">
        <summary className="cursor-pointer text-xs font-bold text-gray-700">Instagram login setup values (Meta app → Instagram → API setup with Instagram login)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <CopyField label="OAuth redirect URI (Set up Instagram business login → Business login settings)" value={data.setup?.redirectUri} />
          <CopyField label="Webhook Callback URL (Configure webhooks)" value={data.setup?.webhookUrl} />
          <CopyField label="Webhook Verify Token" value={data.setup?.webhookVerifyToken || (data.appConfigured ? "" : "Save Instagram App Secret first")} />
          <div className="text-[11px] text-gray-500">Webhook fields to subscribe: <b>comments</b>, <b>messages</b>. In Development mode add your Instagram account under App roles → Instagram testers and accept the invite in Instagram.</div>
        </div>
      </details>
    </div>
  );
}
