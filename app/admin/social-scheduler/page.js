"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, Send, Loader2, ImagePlus, Trash2, RefreshCw, ExternalLink, CheckCircle2, AlertCircle, Clock } from "lucide-react";

const STATUS = {
  scheduled: { label: "Scheduled", cls: "bg-blue-100 text-blue-700" },
  publishing: { label: "Publishing…", cls: "bg-amber-100 text-amber-700" },
  published: { label: "Published", cls: "bg-green-100 text-green-700" },
  partial: { label: "Partly failed", cls: "bg-orange-100 text-orange-700" },
  failed: { label: "Failed", cls: "bg-red-100 text-red-700" },
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-600" },
};
const PLAT = { facebook: { label: "Facebook", emoji: "📘" }, instagram: { label: "Instagram", emoji: "📸" } };

// <input type="datetime-local"> wants local time "YYYY-MM-DDTHH:mm"
const localInput = (d) => { const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return x.toISOString().slice(0, 16); };
const fmt = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export default function SocialSchedulerPage() {
  const [data, setData] = useState({ posts: [], connected: {} });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(() => ({ platforms: ["facebook", "instagram"], message: "", igCaption: "", link: "", imageUrl: "", when: localInput(new Date(Date.now() + 3600e3)) }));
  const [sameCaption, setSameCaption] = useState(true);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/social-posts?status=${filter}`).then((r) => (r.ok ? r.json() : null)).then((d) => { if (alive && d) setData(d); }).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [filter, reload]);

  const refresh = () => { setLoading(true); setReload((n) => n + 1); };
  const say = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 5000); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const togglePlatform = (p) => setForm((f) => ({ ...f, platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p] }));

  async function upload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy("upload");
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("folder", "/social");
      const r = await fetch("/api/upload", { method: "POST", body: fd }); const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Upload failed");
      setForm((f) => ({ ...f, imageUrl: d.url }));
    } catch (err) { say(err.message, "err"); }
    setBusy(""); e.target.value = "";
  }

  async function submit(publishNow) {
    setBusy(publishNow ? "now" : "schedule");
    try {
      const body = { platforms: form.platforms, message: form.message, igCaption: sameCaption ? "" : form.igCaption, link: form.link, imageUrl: form.imageUrl,
        ...(publishNow ? { publishNow: true } : { scheduledAt: new Date(form.when).toISOString() }) };
      const r = await fetch("/api/admin/social-posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      if (publishNow) {
        const res = d.result?.results || {};
        const failed = Object.entries(res).filter(([, v]) => !v?.ok);
        failed.length ? say(`Some posts failed: ${failed.map(([p, v]) => `${PLAT[p].label}: ${v.error}`).join(" · ")}`, "err") : say("Published!");
      } else say(`Scheduled for ${fmt(form.when)}`);
      setForm((f) => ({ ...f, message: "", igCaption: "", link: "", imageUrl: "" }));
      refresh();
    } catch (err) { say(err.message, "err"); }
    setBusy("");
  }

  async function action(id, method) {
    if (method === "DELETE" && !confirm("Delete this post from the scheduler? (Already-published posts stay on Facebook/Instagram.)")) return;
    setBusy(id);
    const r = await fetch(`/api/admin/social-posts/${id}`, { method }); const d = await r.json();
    if (!r.ok) say(d.error || "Failed", "err"); else say(method === "DELETE" ? "Removed" : "Done");
    setBusy(""); refresh();
  }

  const igLen = (sameCaption ? form.message : form.igCaption).length;
  const notConnected = ["facebook", "instagram"].filter((p) => data.connected && data.connected[p] === false);

  return (
    <div className="space-y-6 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900"><CalendarClock size={22} />Social Scheduler</h1>
        <p className="text-sm text-gray-500">Write a post once and publish it to Facebook and Instagram now or at a set time. New articles and guides are auto-posted when “Auto-post” is on in <Link href="/admin/social-settings" className="font-semibold text-blue-600">Social Settings</Link>.</p>
      </div>

      {notConnected.length > 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notConnected.map((p) => PLAT[p].label).join(" and ")} {notConnected.length > 1 ? "aren't" : "isn't"} connected yet. Add the details in <Link href="/admin/social-settings" className="font-bold underline">Social Settings</Link> and switch it on.
        </p>
      )}
      {toast && <p className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${toast.type === "err" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{toast.type === "err" ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}{toast.msg}</p>}

      {/* Composer */}
      <div className="grid gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          <div className="flex gap-2">
            {Object.entries(PLAT).map(([p, v]) => (
              <button key={p} type="button" onClick={() => togglePlatform(p)} className={`rounded-full border px-4 py-1.5 text-xs font-bold ${form.platforms.includes(p) ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600"}`}>{v.emoji} {v.label}</button>
            ))}
          </div>
          <textarea value={form.message} onChange={set("message")} rows={6} placeholder="What do you want to post? Add hashtags at the end, e.g. #EV #ElectricVehicles"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-gray-400 focus:bg-white" />
          {form.platforms.includes("instagram") && (
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <input type="checkbox" checked={sameCaption} onChange={(e) => setSameCaption(e.target.checked)} className="h-4 w-4" />Use the same text for the Instagram caption
            </label>
          )}
          {form.platforms.includes("instagram") && !sameCaption && (
            <textarea value={form.igCaption} onChange={set("igCaption")} rows={4} placeholder="Instagram caption (links aren't clickable on Instagram — say “link in bio”)"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-gray-400 focus:bg-white" />
          )}
          {form.platforms.includes("instagram") && <p className={`text-[11px] ${igLen > 2200 ? "text-red-600" : "text-gray-400"}`}>Instagram caption: {igLen}/2,200 characters</p>}
          <input value={form.link} onChange={set("link")} placeholder="Link for Facebook (optional), e.g. https://www.evradar.in/news/..." className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none" />
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold text-gray-600">Publish at<br />
              <input type="datetime-local" value={form.when} onChange={set("when")} className="mt-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
            </label>
            <button disabled={!!busy} onClick={() => submit(false)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy === "schedule" ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}Schedule</button>
            <button disabled={!!busy} onClick={() => submit(true)} className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy === "now" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Publish now</button>
          </div>
          <p className="text-[11px] text-gray-400">Scheduled posts go out within 15 minutes of the chosen time (via the same scheduler that publishes articles).</p>
        </div>

        <div className="space-y-2">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {form.imageUrl ? <img src={form.imageUrl} alt="Post image" className="h-full w-full object-cover" /> : <span className="px-4 text-center text-xs text-gray-400">Image (required for Instagram). Square or 4:5 works best.</span>}
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">
            {busy === "upload" ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}{form.imageUrl ? "Change image" : "Upload image"}
            <input type="file" accept="image/*" onChange={upload} className="hidden" />
          </label>
          {form.imageUrl && <button onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))} className="w-full text-xs text-gray-400 hover:text-red-600">Remove image</button>}
        </div>
      </div>

      {/* Posts */}
      <div className="flex items-center gap-2">
        {["all", "scheduled", "published", "failed"].map((s) => (
          <button key={s} onClick={() => { setLoading(true); setFilter(s); }} className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize ${filter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>{s}</button>
        ))}
        <button onClick={refresh} className="ml-auto rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Refresh"><RefreshCw size={15} /></button>
      </div>
      {loading ? <Loader2 className="animate-spin text-gray-400" /> : data.posts.length === 0 ? <p className="text-sm text-gray-500">No posts yet.</p> : (
        <div className="space-y-3">
          {data.posts.map((p) => (
            <div key={p._id} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.igImageUrl || p.fbImageUrl ? (
                <div className="flex shrink-0 gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.platforms.includes("facebook") && p.fbImageUrl && <a href={p.fbImageUrl} target="_blank" rel="noreferrer" title="Facebook image 1200×630"><img src={p.fbImageUrl} alt="Facebook image" className="h-20 w-[152px] rounded-lg object-cover" /></a>}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.platforms.includes("instagram") && p.igImageUrl && <a href={p.igImageUrl} target="_blank" rel="noreferrer" title="Instagram card 1080×1350"><img src={p.igImageUrl} alt="Instagram card" className="h-20 w-16 rounded-lg object-cover" /></a>}
                </div>
              ) : p.imageUrl ? <img src={`${p.imageUrl.split("?")[0]}?tr=w-160`} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" /> : <div className="h-20 w-20 shrink-0 rounded-lg bg-gray-100" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-md px-2 py-0.5 font-bold ${STATUS[p.status]?.cls}`}>{STATUS[p.status]?.label}</span>
                  <span className="text-gray-500">{fmt(p.scheduledAt)}</span>
                  {p.source?.kind !== "manual" && <a href={`/${p.source?.kind === "blog" ? "blogs" : "news"}/${p.source?.slug || ""}`} target="_blank" rel="noreferrer" className="rounded-md bg-purple-100 px-2 py-0.5 font-bold text-purple-700">Auto: {p.source?.kind === "blog" ? "buyer's guide" : "article"}{p.status === "scheduled" ? " · posts when it goes live" : ""}</a>}
                </div>
                <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-gray-800">{p.message || p.igCaption}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {p.platforms.map((pl) => {
                    const r = p.results?.[pl];
                    return (
                      <span key={pl} className={`flex items-center gap-1 rounded-lg border px-2 py-1 ${r?.ok ? "border-green-200 text-green-700" : r?.error ? "border-red-200 text-red-700" : "border-gray-200 text-gray-600"}`} title={r?.error || ""}>
                        {PLAT[pl].emoji} {PLAT[pl].label}{r?.ok && r.permalink && <a href={r.permalink} target="_blank" rel="noreferrer"><ExternalLink size={11} /></a>}{r?.error && `: ${r.error.slice(0, 80)}`}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                {["scheduled", "failed", "partial"].includes(p.status) && (
                  <button disabled={busy === p._id} onClick={() => action(p._id, "POST")} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">{p.status === "scheduled" ? "Post now" : "Retry"}</button>
                )}
                {p.status !== "publishing" && <button disabled={busy === p._id} onClick={() => action(p._id, "DELETE")} className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600"><Trash2 size={12} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
