"use client";

// My Social — every user (dealer, partner, admin) connects their OWN Facebook Pages and Instagram
// accounts with one click and posts / schedules to them from evradar.in.
import { useEffect, useState } from "react";
import { Loader2, Link2, Camera, Unlink, Send, CalendarClock, ImagePlus, Trash2, RefreshCw, ExternalLink, CheckCircle2, AlertCircle, Users, Bell } from "lucide-react";

const MESSAGES = {
  connected: ["ok", "Connected! Your accounts are listed below."],
  "missing-app": ["err", "Social connections aren't set up on this site yet. Please ask the EV Radar admin."],
  denied: ["err", "Login was cancelled."],
  "bad-state": ["err", "The login link expired. Please try again."],
  "no-pages": ["err", "Facebook returned no Pages. Make sure you're an admin of the Page and tick it when Facebook asks which Pages to allow."],
  error: ["err", "Login failed."],
};
const STATUS = {
  scheduled: ["Scheduled", "bg-blue-100 text-blue-700"], publishing: ["Publishing…", "bg-amber-100 text-amber-700"],
  published: ["Published", "bg-green-100 text-green-700"], partial: ["Partly failed", "bg-orange-100 text-orange-700"],
  failed: ["Failed", "bg-red-100 text-red-700"], draft: ["Draft", "bg-gray-100 text-gray-600"],
};
const ICON = { facebook: "📘", instagram: "📸" };
const localInput = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
const label = (a) => (a.username ? `@${a.username}` : a.name);

export default function MySocialPage() {
  const [me, setMe] = useState(null);
  const [acc, setAcc] = useState(null);
  const [all, setAll] = useState(null);
  const [posts, setPosts] = useState([]);
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState("");
  const [reload, setReload] = useState(0);
  const [form, setForm] = useState(() => ({ accountIds: [], message: "", igCaption: "", link: "", imageUrl: "", when: localInput(new Date(Date.now() + 3600e3)) }));

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()).catch(() => ({})),
      fetch("/api/my-social/accounts").then((r) => r.json()),
      fetch("/api/my-social/posts").then((r) => r.json()),
    ]).then(async ([m, a, p]) => {
      if (!alive) return;
      setMe(m.user || null); setAcc(a); setPosts(p.posts || []);
      setForm((f) => (f.accountIds.length || !a.accounts ? f : { ...f, accountIds: a.accounts.map((x) => x.id) }));
      if (m.user?.role === "admin") { const d = await fetch("/api/my-social/accounts?all=1").then((r) => r.json()); if (alive) setAll(d.accounts || []); }
      const q = new URLSearchParams(window.location.search);
      const k = q.get("meta") || q.get("ig");
      if (k && MESSAGES[k]) {
        setNote({ type: MESSAGES[k][0], text: MESSAGES[k][1] + (q.get("reason") ? ` (${q.get("reason")})` : "") });
        window.history.replaceState(null, "", "/admin/my-social");
      }
    });
    return () => { alive = false; };
  }, [reload]);

  const refresh = () => setReload((n) => n + 1);
  const say = (text, type = "ok") => setNote({ type, text });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (id) => setForm((f) => ({ ...f, accountIds: f.accountIds.includes(id) ? f.accountIds.filter((x) => x !== id) : [...f.accountIds, id] }));

  async function disconnect(a) {
    if (!confirm(`Disconnect ${label(a)}?`)) return;
    setBusy(a.id);
    const r = await fetch(`/api/my-social/accounts?id=${a.id}`, { method: "DELETE" });
    setBusy("");
    if (r.ok) { say(`${label(a)} disconnected.`); setForm((f) => ({ ...f, accountIds: f.accountIds.filter((x) => x !== a.id) })); refresh(); }
    else say((await r.json()).error || "Failed", "err");
  }

  async function upload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy("upload");
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("folder", "/social-users");
      const r = await fetch("/api/upload", { method: "POST", body: fd }); const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Upload failed");
      setForm((f) => ({ ...f, imageUrl: d.url }));
    } catch (err) { say(err.message, "err"); }
    setBusy(""); e.target.value = "";
  }

  async function submit(publishNow) {
    setBusy(publishNow ? "now" : "schedule");
    try {
      const body = { accountIds: form.accountIds, message: form.message, igCaption: form.igCaption, link: form.link, imageUrl: form.imageUrl,
        ...(publishNow ? { publishNow: true } : { scheduledAt: new Date(form.when).toISOString() }) };
      const r = await fetch("/api/my-social/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      if (publishNow) {
        const res = d.result?.accountResults || [];
        const bad = res.filter((x) => !x.ok);
        say(bad.length ? `Posted to ${res.length - bad.length}/${res.length}. ${bad.map((x) => `${x.name}: ${x.error}`).join(" · ")}` : `Posted to ${res.length} account${res.length === 1 ? "" : "s"}.`, bad.length ? "err" : "ok");
      } else say(`Scheduled for ${fmt(form.when)}.`);
      setForm((f) => ({ ...f, message: "", igCaption: "", link: "", imageUrl: "" }));
      refresh();
    } catch (err) { say(err.message, "err"); }
    setBusy("");
  }

  async function postAction(p, method) {
    if (method === "DELETE" && !confirm("Delete this post from the list? (It won't be removed from Facebook/Instagram.)")) return;
    setBusy(p._id);
    const r = await fetch(`/api/my-social/posts/${p._id}`, { method }); const d = await r.json();
    setBusy("");
    if (!r.ok) say(d.error || "Failed", "err"); else refresh();
  }

  if (!acc) return <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" />Loading…</div>;
  const accounts = acc.accounts || [];
  const hasIg = accounts.some((a) => form.accountIds.includes(a.id) && a.platform === "instagram");

  return (
    <div className="space-y-6 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Social</h1>
        <p className="text-sm text-gray-500">Connect your own Facebook Pages and Instagram accounts, then post or schedule to them from here. Only you can see and post to your accounts.</p>
      </div>

      {note && <p className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${note.type === "err" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{note.type === "err" ? <AlertCircle size={15} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}{note.text}</p>}

      {/* Accounts */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-base font-black text-gray-900">Your connected accounts</p>
          <div className="flex flex-wrap gap-2">
            {acc.available?.facebook && <a href="/api/admin/social/meta/connect?for=me" className="flex items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"><Link2 size={15} />Connect Facebook Pages</a>}
            {acc.available?.instagram && <a href="/api/admin/social/instagram/connect?for=me" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"><Camera size={15} />Connect Instagram</a>}
          </div>
        </div>
        {!acc.available?.facebook && !acc.available?.instagram && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Social connections aren&apos;t switched on yet{me?.role === "admin" ? " — enter the Meta App ID/Secret (and Instagram App ID/Secret) in Social Settings." : ". Please ask the EV Radar admin."}</p>}
        <p className="mt-2 text-xs text-gray-500">Facebook: tick every Page you want when Facebook asks — Instagram accounts linked to those Pages are added automatically. Instagram without a Facebook Page: use Connect Instagram (Business or Creator account).</p>

        {accounts.length === 0 ? <p className="mt-4 text-sm text-gray-500">No accounts connected yet.</p> : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  {a.picture ? <img src={a.picture} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">{ICON[a.platform]}</span>}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">{ICON[a.platform]} {label(a)}</p>
                    <p className="truncate text-[11px] text-gray-500">{a.platform === "instagram" ? (a.mode === "instagram-login" ? "Instagram login" : "via Facebook Page") : "Facebook Page"} · {a.webhookSubscribed ? "alerts on" : "alerts off"}</p>
                    {a.lastError && <p className="truncate text-[11px] text-red-600" title={a.lastError}>{a.lastError}</p>}
                  </div>
                </div>
                <button disabled={busy === a.id} onClick={() => disconnect(a)} className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-red-600" aria-label={`Disconnect ${label(a)}`}>{busy === a.id ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />}</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Composer */}
      {accounts.length > 0 && (
        <section className="grid gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_260px]">
          <div className="space-y-3">
            <p className="text-base font-black text-gray-900">New post</p>
            <div className="flex flex-wrap gap-2">
              {accounts.map((a) => (
                <button key={a.id} type="button" onClick={() => toggle(a.id)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${form.accountIds.includes(a.id) ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>{ICON[a.platform]} {label(a)}</button>
              ))}
            </div>
            <textarea value={form.message} onChange={set("message")} rows={5} placeholder="What do you want to share?" className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:bg-white" />
            {hasIg && <textarea value={form.igCaption} onChange={set("igCaption")} rows={3} placeholder="Instagram caption (optional — uses the text above if empty). Links aren't clickable on Instagram." className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:bg-white" />}
            <input value={form.link} onChange={set("link")} placeholder="Link (optional, shown on Facebook)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white" />
            <div className="flex flex-wrap items-center gap-2">
              <input type="datetime-local" value={form.when} onChange={set("when")} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
              <button disabled={!!busy || !form.accountIds.length} onClick={() => submit(false)} className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-800 disabled:opacity-50">{busy === "schedule" ? <Loader2 size={14} className="animate-spin" /> : <CalendarClock size={14} />}Schedule</button>
              <button disabled={!!busy || !form.accountIds.length} onClick={() => submit(true)} className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy === "now" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Publish now</button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
              {form.imageUrl ? <img src={form.imageUrl} alt="Post image" className="h-full w-full object-cover" /> : <span className="px-4 text-center text-xs text-gray-400">Image (required for Instagram). Square or 4:5 works best.</span>}
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">
              {busy === "upload" ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}{form.imageUrl ? "Change image" : "Upload image"}
              <input type="file" accept="image/*" onChange={upload} className="hidden" />
            </label>
          </div>
        </section>
      )}

      {/* Alerts */}
      {acc.events?.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-2 flex items-center gap-2 text-base font-black text-gray-900"><Bell size={16} />Recent messages &amp; comments</p>
          <ul className="space-y-1.5 text-sm">{acc.events.map((e, i) => <li key={i} className="text-gray-700"><span className="text-xs text-gray-400">{fmt(e.at)}</span> {ICON[e.platform]} {e.kind}{e.sender ? ` from ${e.sender}` : ""}: {e.text?.slice(0, 140)}{!e.read && <span className="ml-1 rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">new</span>}</li>)}</ul>
          <p className="mt-2 text-[11px] text-gray-400">Reply in the Facebook / Instagram app. You also get these by email.</p>
        </section>
      )}

      {/* Posts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between"><p className="text-base font-black text-gray-900">Your posts</p><button onClick={refresh} className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700"><RefreshCw size={12} />Refresh</button></div>
        {posts.length === 0 ? <p className="text-sm text-gray-500">No posts yet.</p> : posts.map((p) => (
          <div key={p._id} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            {p.imageUrl ? <img src={`${p.imageUrl.split("?")[0]}?tr=w-160`} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" /> : <div className="h-20 w-20 shrink-0 rounded-lg bg-gray-100" />}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full px-2 py-0.5 font-bold ${STATUS[p.status]?.[1] || ""}`}>{STATUS[p.status]?.[0] || p.status}</span>
                <span className="text-gray-400">{fmt(p.scheduledAt)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-gray-800">{p.message || p.igCaption}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                {(p.accountResults?.length ? p.accountResults : []).map((r, i) => r.ok
                  ? <a key={i} href={r.permalink || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-green-700">{ICON[r.platform]} {r.name} <ExternalLink size={10} /></a>
                  : <span key={i} className="text-red-600" title={r.error}>{ICON[r.platform]} {r.name}: {r.error?.slice(0, 80)}</span>)}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              {["scheduled", "failed", "partial"].includes(p.status) && <button disabled={busy === p._id} onClick={() => postAction(p, "POST")} className="rounded-lg bg-gray-900 px-2.5 py-1.5 text-[11px] font-bold text-white disabled:opacity-50">{busy === p._id ? <Loader2 size={11} className="animate-spin" /> : p.status === "scheduled" ? "Post now" : "Retry"}</button>}
              {p.status !== "publishing" && <button disabled={busy === p._id} onClick={() => postAction(p, "DELETE")} className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:text-red-600" aria-label="Delete"><Trash2 size={12} /></button>}
            </div>
          </div>
        ))}
      </section>

      {/* Admin overview */}
      {all && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-3 flex items-center gap-2 text-base font-black text-gray-900"><Users size={16} />All users&apos; connected accounts ({all.length})</p>
          {all.length === 0 ? <p className="text-sm text-gray-500">No one has connected an account yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-left text-sm">
              <thead><tr className="text-xs text-gray-500"><th className="py-1.5 pr-3">User</th><th className="pr-3">Account</th><th className="pr-3">Type</th><th className="pr-3">Alerts</th><th className="pr-3">Connected</th><th /></tr></thead>
              <tbody>{all.map((a) => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="py-2 pr-3"><p className="font-semibold text-gray-900">{a.owner?.name || "—"}</p><p className="text-[11px] text-gray-400">{a.owner?.email} · {a.owner?.role}</p></td>
                  <td className="pr-3">{ICON[a.platform]} {label(a)}</td>
                  <td className="pr-3 text-xs text-gray-500">{a.mode === "instagram-login" ? "Instagram login" : "Facebook"}</td>
                  <td className="pr-3 text-xs">{a.webhookSubscribed ? "on" : "off"}</td>
                  <td className="pr-3 text-xs text-gray-500">{fmt(a.connectedAt)}</td>
                  <td><button onClick={() => disconnect(a)} className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:text-red-600" aria-label="Disconnect"><Unlink size={12} /></button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </section>
      )}
    </div>
  );
}
