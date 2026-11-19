"use client";

// "Connect with Facebook": log in with Facebook, pick the Page (its Instagram account is linked
// automatically) — no manual tokens. Also shows the values to paste into the Meta app settings.
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Copy, Check, Link2 } from "lucide-react";

const MESSAGES = {
  "missing-app": ["err", "Enter your Meta App ID and App Secret in the Facebook Page card below and Save, then click Connect with Facebook."],
  denied: ["err", "Facebook login was cancelled."],
  "bad-state": ["err", "The login link expired or didn't match. Please click Connect with Facebook again."],
  "no-pages": ["err", "Logged in, but Facebook returned no Pages. Make sure you're an admin of the Page and selected it (and its Instagram account) when Facebook asked."],
  "choose-page": ["ok", "Logged in with Facebook. Now choose which Page to connect."],
  error: ["err", "Facebook login failed."],
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

export default function MetaConnectPanel({ onConnected }) {
  const [data, setData] = useState(null);
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/social/meta/pages").then((r) => r.json()).then((d) => {
      if (!alive) return;
      setData(d);
      const q = new URLSearchParams(window.location.search);
      const m = q.get("meta");
      if (m && MESSAGES[m]) setNote({ type: MESSAGES[m][0], text: MESSAGES[m][1] + (q.get("reason") ? ` (${q.get("reason")})` : "") });
    }).catch(() => alive && setData({ error: true }));
    return () => { alive = false; };
  }, [reload]);

  async function choose(pageId) {
    setBusy(pageId);
    const r = await fetch("/api/admin/social/meta/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageId }) });
    const d = await r.json();
    setBusy("");
    if (!r.ok) { setNote({ type: "err", text: d.error }); return; }
    setNote({ type: "ok", text: `Connected ${d.page.name}${d.instagram ? ` and Instagram @${d.instagram.username}` : " (no Instagram account is linked to this Page)"}.${d.webhookSubscribed ? " Real-time alerts are on." : ` Real-time alerts not active yet: ${d.webhookError || "check webhook setup"}.`}` });
    window.history.replaceState(null, "", "/admin/social-settings");
    setReload((n) => n + 1); onConnected?.();
  }

  if (!data) return <div className="mb-6 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" />Checking Facebook connection…</div>;

  const c = data.connected;
  return (
    <div className="mb-6 space-y-4 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-black text-gray-900">📘📸 Facebook &amp; Instagram connection</p>
          {c ? (
            <p className="mt-1 text-sm text-gray-600">Connected to <b>{c.page.name}</b>{c.instagram?.username ? <> and Instagram <b>@{c.instagram.username}</b></> : null}.{" "}
              {c.page.webhookSubscribed ? <span className="font-semibold text-green-700">Real-time alerts on.</span> : <span className="font-semibold text-amber-700">Real-time alerts off.</span>}</p>
          ) : <p className="mt-1 text-sm text-gray-600">Log in with Facebook and pick your Page — the linked Instagram account connects automatically. No tokens to copy.</p>}
        </div>
        {data.appConfigured ? (
          <a href="/api/admin/social/meta/connect" className="flex items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"><Link2 size={15} />{c ? "Reconnect / change Page" : "Connect with Facebook"}</a>
        ) : data.appError ? <p className="max-w-sm rounded-xl bg-red-50 p-3 text-xs text-red-700"><b>App Secret problem:</b> {data.appError} Paste the correct App Secret in the Facebook Page card below and click Save.</p>
        : <p className="max-w-xs rounded-xl bg-amber-50 p-3 text-xs text-amber-800">First enter your Meta <b>App ID</b> and <b>App Secret</b> in the Facebook Page card below and click Save.</p>}
      </div>

      {note && <p className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${note.type === "err" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{note.type === "err" ? <AlertCircle size={15} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}{note.text}</p>}

      {data.loggedIn && data.pages?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Your Pages</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.pages.map((p) => (
              <div key={p.id} className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${c?.page?.id === p.id ? "border-green-400 bg-green-50" : "border-gray-200"}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">{p.name}</p>
                  <p className="truncate text-xs text-gray-500">{p.instagram ? `📸 @${p.instagram.username}` : "No Instagram linked"}</p>
                </div>
                {c?.page?.id === p.id ? <span className="text-xs font-bold text-green-700">Connected</span> : (
                  <button disabled={!!busy} onClick={() => choose(p.id)} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">{busy === p.id ? <Loader2 size={12} className="animate-spin" /> : "Use this Page"}</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {data.pagesError && <p className="text-xs text-red-600">Couldn&apos;t load Pages: {data.pagesError}. Click Connect with Facebook again.</p>}

      <details className="rounded-xl bg-gray-50 p-3">
        <summary className="cursor-pointer text-xs font-bold text-gray-700">Meta app setup values (paste these into developers.facebook.com)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <CopyField label="Valid OAuth Redirect URI (Facebook Login → Settings)" value={data.setup?.oauthRedirectUri} />
          <CopyField label="Webhook Callback URL (Webhooks → Page and Instagram)" value={data.setup?.webhookUrl} />
          <CopyField label="Webhook Verify Token" value={data.setup?.webhookVerifyToken || (data.appConfigured ? "" : "Save App Secret first")} />
          <div className="text-[11px] text-gray-500">Webhook fields to subscribe: <b>Page</b> → messages, feed · <b>Instagram</b> → messages, comments. App Domain: <b>evradar.in</b></div>
        </div>
      </details>
    </div>
  );
}
