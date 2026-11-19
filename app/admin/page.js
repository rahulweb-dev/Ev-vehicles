"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, Eye, Plus, FileText, Zap, Users, Car, Bike, Truck, ArrowUpRight, Clock, Star, Mail, BellRing, BellOff,
  Database, RefreshCw, Monitor, Smartphone, Tablet, Activity, CalendarClock, Sparkles, BookOpen, Image as ImageIcon,
  Radio, Send, Globe, PenSquare, Gauge, TrendingUp, CircleCheck, Rocket, ChevronRight,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaPinterest } from "react-icons/fa6";
import { getPusherClient } from "@/lib/pusherClient";
import ArticleImage from "@/components/news/ArticleImage";
import { Card, CardHeader, CountUp, Delta, Sparkline, AreaChart, Donut, Ring, Bar, Skeleton } from "@/components/admin/dashboard/ui";

const CAT = {
  cars: { label: "Cars", dot: "bg-sky-500", bar: "bg-gradient-to-r from-sky-400 to-sky-600", chip: "bg-sky-50 text-sky-700" },
  bikes: { label: "Two-wheelers", dot: "bg-orange-500", bar: "bg-gradient-to-r from-amber-400 to-orange-500", chip: "bg-orange-50 text-orange-700" },
  commercial: { label: "Commercial", dot: "bg-violet-500", bar: "bg-gradient-to-r from-violet-400 to-violet-600", chip: "bg-violet-50 text-violet-700" },
  charging: { label: "Charging", dot: "bg-teal-500", bar: "bg-gradient-to-r from-teal-400 to-emerald-500", chip: "bg-teal-50 text-teal-700" },
};
const catOf = (c) => CAT[c] || { label: c || "Other", dot: "bg-slate-400", bar: "bg-slate-400", chip: "bg-slate-100 text-slate-600" };
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const fmtWhen = (d) => new Date(d).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const ogFallback = (a) => `/api/og?title=${encodeURIComponent(a?.title || "EV Radar")}&tag=${encodeURIComponent(a?.category || "news")}&type=article`;

function fmtBytes(bytes) {
  if (!bytes) return "0 B";
  const u = ["B", "KB", "MB", "GB"], i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${u[i]}`;
}

function playSound(type = "chat") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); osc.type = "sine";
    const t = ctx.currentTime, len = type === "new" ? 0.4 : 0.25;
    osc.frequency.setValueAtTime(type === "new" ? 880 : 660, t);
    if (type === "new") osc.frequency.setValueAtTime(1100, t + 0.12);
    gain.gain.setValueAtTime(type === "new" ? 0.4 : 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + len);
    osc.onended = () => ctx.close(); osc.start(t); osc.stop(t + len);
  } catch {}
}

function greetingFor(d) {
  const h = d.getHours();
  return h < 5 ? "Working late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/* ─── KPI card ─────────────────────────────────────────────────────── */
function Kpi({ i, icon: Icon, label, value, delta, deltaSuffix, foot, spark, color, gradient, loading, href }) {
  const body = (
    <Card i={i} className="group relative h-full overflow-hidden p-5 transition-shadow hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]">
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-[0.12] blur-2xl transition-opacity group-hover:opacity-25`} />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <div className="mt-1.5 text-[30px] font-bold leading-none tracking-tight text-slate-900">{loading ? <Skeleton className="h-8 w-20" /> : <CountUp value={value} />}</div>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-black/5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110`}><Icon size={19} /></span>
      </div>
      <div className="mt-3 flex min-h-[22px] flex-wrap items-center gap-2">
        {delta != null && !loading && <Delta value={delta} suffix={deltaSuffix} />}
        {foot && <span className="text-xs text-slate-400">{foot}</span>}
      </div>
      {spark && <div className="-mx-1 mt-3"><Sparkline data={spark} color={color} /></div>}
    </Card>
  );
  return href ? <Link href={href} className="block h-full">{body}</Link> : body;
}

/* ─── Traffic ──────────────────────────────────────────────────────── */
function TrafficCard({ pv, loading, onRefresh, refreshing }) {
  const last = pv?.last7days || [];
  const total7 = last.reduce((s, d) => s + d.views, 0);
  const dev = pv?.devices || {};
  const mob = dev.mobile || 0, desk = dev.desktop || 0, tab = dev.tablet || 0, devTotal = mob + desk + tab;
  const top = (pv?.topPages || []).slice(0, 5);
  const topMax = Math.max(...top.map((p) => p.views), 1);
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <Card i={4} className="xl:col-span-2">
        <CardHeader icon={Activity} title="Website traffic" sub="Page views over the last 7 days" right={
          <div className="flex items-center gap-2">
            {pv?.fetchedAt && <span className="hidden text-[11px] text-slate-400 sm:inline">Updated {new Date(pv.fetchedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
            <button onClick={onRefresh} disabled={refreshing} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40" aria-label="Refresh traffic"><RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /></button>
          </div>} />
        <div className="flex flex-wrap gap-x-8 gap-y-2 px-5 pt-4">
          {[["7-day views", total7], ["This month", pv?.month?.views || 0], ["Yesterday", pv?.yesterday?.views || 0]].map(([l, v]) => (
            <div key={l}><p className="text-xs text-slate-500">{l}</p><p className="text-lg font-bold tracking-tight text-slate-900">{loading ? <Skeleton className="h-6 w-14" /> : <CountUp value={v} />}</p></div>
          ))}
        </div>
        <div className="px-3 pb-4 pt-2">{loading ? <Skeleton className="mx-2 h-[200px]" /> : <AreaChart data={last} />}</div>
      </Card>

      <Card i={5} className="flex flex-col">
        <CardHeader icon={Gauge} title="Today's audience" tone="blue" sub="Devices and most-read pages" />
        <div className="flex items-center gap-5 px-5 pt-4">
          <Donut segments={[{ label: "Mobile", value: mob, color: "#0ea5e9" }, { label: "Desktop", value: desk, color: "#10b981" }, { label: "Tablet", value: tab, color: "#a855f7" }]}
            center={<><span className="text-xl font-bold text-slate-900">{devTotal ? Math.round((mob / devTotal) * 100) : 0}%</span><span className="text-[10px] font-medium text-slate-400">mobile</span></>} />
          <div className="flex-1 space-y-2.5">
            {[["Mobile", mob, Smartphone, "text-sky-500"], ["Desktop", desk, Monitor, "text-emerald-500"], ["Tablet", tab, Tablet, "text-purple-500"]].map(([l, v, I, c]) => (
              <div key={l} className="flex items-center gap-2 text-sm">
                <I size={14} className={c} /><span className="flex-1 text-slate-600">{l}</span>
                <span className="font-semibold text-slate-900">{devTotal ? Math.round((v / devTotal) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex-1 border-t border-slate-100 px-5 py-4">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Top pages today</p>
          {loading ? <Skeleton className="h-24" /> : top.length === 0 ? <p className="text-sm text-slate-400">No visits tracked yet today.</p> : (
            <ul className="space-y-2.5">
              {top.map((p, i) => (
                <li key={p.path}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <a href={p.path} target="_blank" rel="noreferrer" className="truncate text-slate-600 hover:text-emerald-700" title={p.path}>{p.path === "/" ? "Home page" : p.path}</a>
                    <span className="shrink-0 font-semibold text-slate-900">{p.views}</span>
                  </div>
                  <Bar pct={(p.views / topMax) * 100} className="bg-gradient-to-r from-sky-400 to-indigo-500" delay={0.1 * i} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ─── Social automation ────────────────────────────────────────────── */
function SocialCard({ social, i }) {
  const queue = (social?.posts || []).filter((p) => p.status === "scheduled").sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  const fb = social?.connected?.facebook, ig = social?.connected?.instagram, pn = social?.connected?.pinterest;
  return (
    <Card i={i} className="overflow-hidden">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 px-5 pb-5 pt-5 text-white">
        <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15"><Rocket size={17} /></span>
            <div><p className="text-[15px] font-bold tracking-tight">Social autopilot</p><p className="text-xs text-white/55">Articles post themselves when they go live</p></div>
          </div>
          <Link href="/admin/social-scheduler" className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold ring-1 ring-white/15 transition hover:bg-white/20">Open <ArrowUpRight size={13} /></Link>
        </div>
        <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[[FaFacebook, "Facebook", fb, "text-[#1877F2]"], [FaInstagram, "Instagram", ig, "text-[#E4405F]"], [FaPinterest, "Pinterest", pn, "text-[#E60023]"]].map(([I, l, on, c]) => (
            <div key={l} className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 ring-1 ring-white/10">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white"><I className={c} size={15} /></span>
              <div className="min-w-0"><p className="truncate text-xs font-semibold">{l}</p>
                <p className={`flex items-center gap-1 text-[10px] ${on ? "text-emerald-300" : "text-amber-300"}`}><span className={`h-1.5 w-1.5 rounded-full ${on ? "animate-pulse bg-emerald-400" : "bg-amber-400"}`} />{on ? "Connected" : "Not connected"}</p></div>
            </div>
          ))}
          <div className="rounded-xl bg-white/[0.06] px-3 py-2.5 ring-1 ring-white/10"><p className="text-xl font-bold leading-none"><CountUp value={queue.length} /></p><p className="mt-1 text-[10px] text-white/55">posts queued</p></div>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Up next</p>
        {!social ? <Skeleton className="h-28" /> : queue.length === 0 ? <p className="py-4 text-sm text-slate-400">Nothing queued. Scheduled articles appear here automatically.</p> : (
          <ul className="divide-y divide-slate-100">
            {queue.slice(0, 4).map((p) => (
              <li key={p._id} className="flex items-center gap-3 py-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.igImageUrl || (p.imageUrl ? `${p.imageUrl.split("?")[0]}?tr=w-120` : "/images/logo.png")} alt="" className="h-11 w-9 shrink-0 rounded-md bg-slate-100 object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-slate-800">{(p.message || "").replace(/^⚡\s*/, "").split("\n")[0]}</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-400"><Clock size={11} />{fmtWhen(p.scheduledAt)}</p>
                </div>
                <span className="flex shrink-0 gap-1 text-sm">{p.platforms?.includes("facebook") && <FaFacebook className="text-[#1877F2]" />}{p.platforms?.includes("instagram") && <FaInstagram className="text-[#E4405F]" />}{p.platforms?.includes("pinterest") && <FaPinterest className="text-[#E60023]" />}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [now] = useState(() => new Date());
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [leads, setLeads] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [subscribers, setSubscribers] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [social, setSocial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [newChats, setNewChats] = useState(0);
  const [reindexing, setReindexing] = useState(false);
  const [toast, setToast] = useState(null);
  const [storage, setStorage] = useState(null);
  const [storageRefreshing, setStorageRefreshing] = useState(false);
  const [pv, setPv] = useState(null);
  const [pvLoading, setPvLoading] = useState(true);
  const [pvRefreshing, setPvRefreshing] = useState(false);
  const soundOnRef = useRef(true);
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  /* Pusher: new live-chat sessions */
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const ch = pusher.subscribe("admin-notifications");
    ch.bind("new-session", (data) => {
      if (soundOnRef.current) playSound("new");
      setNewChats((p) => p + 1);
      if (document.hidden && typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("EVRadar Live Chat", { body: `New visitor: ${data.userName || "Visitor"} is waiting`, icon: "/images/logo.png" });
      }
    });
    ch.bind("user-message", () => { if (soundOnRef.current) playSound("chat"); });
    return () => { ch.unbind_all(); pusher.unsubscribe("admin-notifications"); };
  }, []);

  async function fetchStorage(force = false) {
    try { const r = await fetch(force ? `/api/admin/storage?bust=${Date.now()}` : "/api/admin/storage"); if (r.ok) setStorage(await r.json()); } catch {}
    setStorageRefreshing(false);
  }
  async function fetchPageviews(force = false) {
    try { const r = await fetch(force ? `/api/admin/pageviews?bust=${Date.now()}` : "/api/admin/pageviews"); if (r.ok) setPv(await r.json()); } catch {}
    setPvLoading(false); setPvRefreshing(false);
  }
  useEffect(() => {
    fetch("/api/admin/storage").then((r) => (r.ok ? r.json() : null)).then((d) => d && setStorage(d)).catch(() => {});
    fetch("/api/admin/pageviews").then((r) => (r.ok ? r.json() : null)).then((d) => d && setPv(d)).catch(() => {}).finally(() => setPvLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user || null)).catch(() => {});
    fetch("/api/admin/social-posts?status=scheduled").then((r) => (r.ok ? r.json() : null)).then((d) => setSocial(d || { posts: [], connected: {} })).catch(() => setSocial({ posts: [], connected: {} }));
    async function load() {
      try {
        const res = await Promise.all([
          fetch("/api/articles?status=published&limit=100"), fetch("/api/articles?status=draft&limit=100"), fetch("/api/articles?status=published&limit=6"),
          fetch("/api/leads?limit=200"), fetch("/api/articles?status=published&featured=true&limit=3"), fetch("/api/vehicles?limit=200"),
          fetch("/api/subscribe?limit=50"), fetch("/api/admin/analytics"),
        ]);
        const [pub, draft, latest, leadsData, feat, vehData, subData, analyticsData] = await Promise.all(res.map((r) => r.json()));
        setAnalytics(analyticsData);
        setStats({ published: pub.total || 0, drafts: draft.total || 0, total: (pub.total || 0) + (draft.total || 0), views: (pub.articles || []).reduce((s, a) => s + (a.views || 0), 0) });
        setRecent(latest.articles || []);
        setFeatured((feat.articles || []).slice(0, 3));
        const L = leadsData.leads || [];
        const weekAgo = Date.now() - 7 * 86400e3;
        setLeads({
          total: L.length, newLeads: L.filter((l) => l.status === "new").length, week: L.filter((l) => new Date(l.createdAt) > weekAgo).length,
          cars: L.filter((l) => l.vehicleType === "car").length, bikes: L.filter((l) => l.vehicleType === "bike").length,
          commercial: L.filter((l) => l.vehicleType === "commercial").length, recent: L.slice(0, 5),
        });
        const V = vehData.vehicles || [];
        setVehicles({
          total: V.length, published: V.filter((v) => v.status === "published").length,
          upcomingCars: V.filter((v) => v.category === "upcoming" && v.vehicleType === "car").length,
          upcomingBikes: V.filter((v) => v.category === "upcoming" && v.vehicleType === "bike").length,
          popularCars: V.filter((v) => v.category === "popular" && v.vehicleType === "car").length,
          popularBikes: V.filter((v) => v.category === "popular" && v.vehicleType === "bike").length,
        });
        setSubscribers({ total: subData.total || 0, recent: (subData.subscribers || []).slice(0, 6) });
      } catch {
        setStats({ published: 0, drafts: 0, total: 0, views: 0 });
        setLeads({ total: 0, newLeads: 0, week: 0, cars: 0, bikes: 0, commercial: 0, recent: [] });
        setVehicles({ total: 0, published: 0, upcomingCars: 0, upcomingBikes: 0, popularCars: 0, popularBikes: 0 });
        setSubscribers({ total: 0, recent: [] });
      } finally { setLoading(false); }
    }
    load();
  }, []);

  function say(text, ok = true) { setToast({ text, ok }); setTimeout(() => setToast(null), 6000); }
  async function reindex() {
    setReindexing(true);
    try {
      const r = await fetch("/api/admin/reindex", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "all" }) });
      const d = await r.json();
      say(d.success ? `Submitted ${d.totalUrls} URLs to Google & Bing via IndexNow` : "Re-index failed", !!d.success);
    } catch { say("Network error while re-indexing", false); }
    setReindexing(false);
  }

  const today = pv?.today || { views: 0, unique: 0 }, yesterday = pv?.yesterday || { views: 0, unique: 0 };
  const spark = (pv?.last7days || []).map((d) => d.views);
  const mongo = storage?.mongo, ik = storage?.imagekit;
  const mongoTotal = mongo?.fsTotalSize || 512 * 1024 * 1024, mongoUsed = mongo?.fsUsedSize || mongo?.storageSize || 0;
  const ikTotal = 20 * 1024 * 1024 * 1024, ikUsed = ik?.totalSize || 0;
  const cats = analytics?.articlesByCategory || [];
  const catMax = Math.max(...cats.map((c) => c.count), 1);
  const topArticles = analytics?.topArticles || [];
  const firstName = (me?.name || "").split(" ")[0];

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-[1440px] space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
              Live · {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-1.5 text-[28px] font-bold tracking-tight text-slate-900 sm:text-[32px]">{greetingFor(now)}{firstName ? `, ${firstName}` : ""} <span className="inline-block origin-[70%_70%] animate-[wave_2.2s_ease-in-out_1]">👋</span></h1>
            <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening on EV Radar today.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setSoundOn((p) => !p)} title={soundOn ? "Mute live-chat sounds" : "Unmute live-chat sounds"}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition ${soundOn ? "border-slate-200 text-slate-700 hover:bg-slate-50" : "border-slate-200 text-slate-300"}`}>
              {soundOn ? <BellRing size={17} /> : <BellOff size={17} />}
              {newChats > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{newChats}</span>}
            </button>
            <AnimatePresence>
              {newChats > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <Link href="/admin/live-chat" onClick={() => setNewChats(0)} className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/25">
                    <Radio size={15} className="animate-pulse" />{newChats} new chat{newChats > 1 ? "s" : ""}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={reindex} disabled={reindexing} title="Submit all content to Google & Bing via IndexNow"
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
              <Zap size={15} className={reindexing ? "animate-pulse text-amber-500" : "text-amber-500"} />{reindexing ? "Submitting…" : "Re-index all"}
            </button>
            <Link href="/admin/articles/new" className="group flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:shadow-emerald-600/40">
              <Plus size={16} className="transition-transform group-hover:rotate-90" />New article
            </Link>
          </div>
        </motion.div>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${toast.ok ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"}`}>
              <CircleCheck size={16} />{toast.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* KPIs */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi i={0} icon={Eye} label="Views today" value={today.views} delta={pvLoading ? null : today.views - yesterday.views} spark={spark} color="#10b981" gradient="from-emerald-500 to-teal-500" loading={pvLoading} />
          <Kpi i={1} icon={Users} label="Visitors today" value={today.unique} foot={`${(yesterday.unique || 0).toLocaleString("en-IN")} yesterday`} gradient="from-sky-500 to-indigo-500" loading={pvLoading} spark={(pv?.last7days || []).map((d) => d.unique ?? d.views)} color="#0ea5e9" />
          <Kpi i={2} icon={Sparkles} label="Customer leads" value={leads?.total} foot={leads ? `${leads.newLeads} new · ${leads.week} this week` : ""} gradient="from-amber-400 to-orange-500" loading={loading} href="/admin/leads" />
          <Kpi i={3} icon={Mail} label="Email subscribers" value={subscribers?.total} foot={`${(stats?.views || 0).toLocaleString("en-IN")} article views all-time`} gradient="from-violet-500 to-fuchsia-500" loading={loading} href="/admin/subscribers" />
        </div>

        {/* Traffic */}
        <TrafficCard pv={pv} loading={pvLoading} refreshing={pvRefreshing} onRefresh={() => { setPvRefreshing(true); fetchPageviews(true); }} />

        {/* Content + social */}
        <div className="grid gap-5 xl:grid-cols-3">
          <Card i={6} className="xl:col-span-2">
            <CardHeader icon={Newspaper} title="Content" sub={`${stats?.published ?? "—"} published · ${stats?.drafts ?? "—"} drafts & scheduled`} right={
              <Link href="/admin/articles" className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900">All articles <ChevronRight size={14} /></Link>} />
            <div className="grid gap-6 p-5 md:grid-cols-[1fr_1.2fr]">
              <div className="grid grid-cols-2 gap-3">
                {[["Published", stats?.published, CircleCheck, "text-emerald-600 bg-emerald-50"], ["Drafts", stats?.drafts, FileText, "text-amber-600 bg-amber-50"],
                  ["Total articles", stats?.total, Newspaper, "text-sky-600 bg-sky-50"], ["All-time views", stats?.views, TrendingUp, "text-violet-600 bg-violet-50"]].map(([l, v, I, c]) => (
                  <div key={l} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${c}`}><I size={15} /></span>
                    <p className="mt-2.5 text-xl font-bold tracking-tight text-slate-900">{loading ? <Skeleton className="h-6 w-12" /> : <CountUp value={v} />}</p>
                    <p className="text-xs text-slate-500">{l}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">By category</p>
                {loading ? <Skeleton className="h-32" /> : cats.length === 0 ? <p className="text-sm text-slate-400">No data yet.</p> : (
                  <ul className="space-y-3.5">
                    {cats.map((c, idx) => (
                      <li key={c._id}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 font-medium text-slate-700"><span className={`h-2 w-2 rounded-full ${catOf(c._id).dot}`} />{catOf(c._id).label}</span>
                          <span className="text-xs text-slate-500"><b className="font-semibold text-slate-800">{c.count}</b> articles · {(c.totalViews || 0).toLocaleString("en-IN")} views</span>
                        </div>
                        <Bar pct={(c.count / catMax) * 100} className={catOf(c._id).bar} delay={0.1 * idx} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
          <SocialCard social={social} i={7} />
        </div>

        {/* Recent + featured | Leads */}
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="space-y-5 xl:col-span-2">
            <Card i={8}>
              <CardHeader icon={Clock} title="Latest articles" tone="slate" right={<Link href="/admin/articles/new" className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"><PenSquare size={12} />Write</Link>} />
              <ul className="mt-3 divide-y divide-slate-100">
                {loading ? Array.from({ length: 4 }).map((_, i) => <li key={i} className="px-5 py-3"><Skeleton className="h-14" /></li>)
                  : recent.length === 0 ? <li className="px-5 py-10 text-center text-sm text-slate-400">No articles yet.</li>
                  : recent.map((a) => (
                    <li key={a._id}>
                      <Link href={`/admin/articles/${a._id}/edit`} className="group flex items-center gap-4 px-5 py-3 transition hover:bg-slate-50/80">
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          <ArticleImage src={a.image} fallbackSrc={ogFallback(a)} alt={a.imageAlt || a.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-slate-800 group-hover:text-emerald-700">{a.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${catOf(a.category).chip}`}>{catOf(a.category).label}</span>
                            <span className="flex items-center gap-1"><Eye size={11} />{(a.views || 0).toLocaleString("en-IN")}</span>
                            <span>{fmtDate(a.publishedAt || a.createdAt)}</span>
                          </div>
                        </div>
                        <ArrowUpRight size={16} className="shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                      </Link>
                    </li>
                  ))}
              </ul>
            </Card>

            {(loading || featured.length > 0) && (
              <div className="grid gap-5 sm:grid-cols-3">
                {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />) : featured.map((a, idx) => (
                  <Card key={a._id} i={9 + idx} className="group overflow-hidden">
                    <Link href={`/admin/articles/${a._id}/edit`} className="block">
                      <div className="relative h-36 overflow-hidden">
                        <ArticleImage src={a.image} fallbackSrc={ogFallback(a)} alt={a.imageAlt || a.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow"><Star size={10} fill="currentColor" />Featured</span>
                        <p className="absolute inset-x-3 bottom-3 line-clamp-2 text-[13px] font-semibold leading-snug text-white">{a.title}</p>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Eye size={12} />{(a.views || 0).toLocaleString("en-IN")} views</span>
                        <span>{fmtDate(a.publishedAt || a.createdAt)}</span>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <Card i={9}>
              <CardHeader icon={Sparkles} title="Customer leads" tone="amber" right={
                <div className="flex items-center gap-2">
                  {leads?.newLeads > 0 && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />{leads.newLeads} new</span>}
                  <Link href="/admin/leads" className="text-slate-400 hover:text-slate-700" aria-label="All leads"><ArrowUpRight size={17} /></Link>
                </div>} />
              <div className="mx-5 mt-4 grid grid-cols-3 gap-2">
                {[["Cars", leads?.cars, Car, "text-sky-600"], ["Bikes", leads?.bikes, Bike, "text-orange-500"], ["Commercial", leads?.commercial, Truck, "text-violet-600"]].map(([l, v, I, c]) => (
                  <div key={l} className="rounded-xl bg-slate-50 py-2.5 text-center"><I size={15} className={`mx-auto ${c}`} /><p className="mt-1 text-lg font-bold text-slate-900">{loading ? "—" : <CountUp value={v} />}</p><p className="text-[10px] text-slate-500">{l}</p></div>
                ))}
              </div>
              <ul className="mt-2 divide-y divide-slate-100 px-2 pb-2">
                {loading ? <li className="p-3"><Skeleton className="h-28" /></li> : leads?.recent?.length === 0 ? <li className="py-8 text-center text-sm text-slate-400">No leads yet.</li>
                  : leads.recent.map((l) => {
                    const I = l.vehicleType === "car" ? Car : l.vehicleType === "bike" ? Bike : Truck;
                    const st = { new: "bg-emerald-50 text-emerald-700", contacted: "bg-amber-50 text-amber-700", converted: "bg-sky-50 text-sky-700" }[l.status] || "bg-slate-100 text-slate-500";
                    return (
                      <li key={l._id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600">{(l.name || "?")[0].toUpperCase()}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-slate-800">{l.name}</p>
                          <p className="flex items-center gap-1 truncate text-[11px] text-slate-400"><I size={11} />{l.vehicleName}{l.city ? ` · ${l.city}` : ""}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${st}`}>{l.status}</span>
                      </li>
                    );
                  })}
              </ul>
            </Card>

            <Card i={10}>
              <CardHeader icon={TrendingUp} title="Most read" tone="violet" sub="All-time top articles" />
              <ol className="mt-3 space-y-1 px-2 pb-3">
                {loading ? <li className="p-3"><Skeleton className="h-36" /></li> : topArticles.length === 0 ? <li className="py-6 text-center text-sm text-slate-400">No view data yet.</li>
                  : topArticles.slice(0, 5).map((a, i) => (
                    <li key={a._id} className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${i === 0 ? "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950" : i === 1 ? "bg-slate-200 text-slate-700" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-400"}`}>{i + 1}</span>
                      <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium text-slate-800">{a.title}</p><p className="text-[11px] text-slate-400">{catOf(a.category).label}</p></div>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-violet-600"><Eye size={12} />{(a.views || 0).toLocaleString("en-IN")}</span>
                    </li>
                  ))}
              </ol>
            </Card>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card i={11} className="p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-slate-900"><Car size={17} className="text-emerald-600" />Vehicle catalogue</p>
              <Link href="/admin/vehicles/new" className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100" aria-label="Add vehicle"><Plus size={15} /></Link>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{loading ? "—" : <CountUp value={vehicles?.total} />}</p>
            <p className="text-xs text-slate-500">{vehicles ? `${vehicles.published} live · ${vehicles.total - vehicles.published} drafts` : ""}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[["Upcoming cars", vehicles?.upcomingCars, "/admin/vehicles?category=upcoming&type=car"], ["Upcoming bikes", vehicles?.upcomingBikes, "/admin/vehicles?category=upcoming&type=bike"],
                ["Popular cars", vehicles?.popularCars, "/admin/vehicles?category=popular&type=car"], ["Popular bikes", vehicles?.popularBikes, "/admin/vehicles?category=popular&type=bike"]].map(([l, v, h]) => (
                <Link key={l} href={h} className="rounded-xl border border-slate-100 px-3 py-2 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                  <p className="text-base font-bold text-slate-900">{v ?? "—"}</p><p className="text-[10px] text-slate-500">{l}</p>
                </Link>
              ))}
            </div>
          </Card>

          <Card i={12} className="p-5">
            <p className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-slate-900"><Mail size={17} className="text-violet-600" />New subscribers</p>
            <ul className="mt-3 space-y-2">
              {loading ? <Skeleton className="h-36" /> : subscribers?.recent?.length === 0 ? <p className="py-6 text-center text-sm text-slate-400">No subscribers yet.</p>
                : subscribers.recent.map((s) => (
                  <li key={s._id} className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-bold text-white">{s.email[0].toUpperCase()}</span>
                    <p className="min-w-0 flex-1 truncate text-xs text-slate-700">{s.email}</p>
                    <span className="text-[10px] text-slate-400">{fmtDate(s.createdAt)}</span>
                  </li>
                ))}
            </ul>
          </Card>

          <Card i={13} className="p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-slate-900"><Database size={17} className="text-sky-600" />Storage</p>
              <button onClick={() => { setStorageRefreshing(true); fetchStorage(true); }} disabled={storageRefreshing} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40" aria-label="Refresh storage"><RefreshCw size={14} className={storageRefreshing ? "animate-spin" : ""} /></button>
            </div>
            <div className="mt-4 space-y-4">
              {[["MongoDB Atlas", mongo, mongoUsed, mongoTotal, "#10b981", Database, mongo ? `${(mongo.objects || 0).toLocaleString("en-IN")} documents` : ""],
                ["ImageKit CDN", ik, ikUsed, ikTotal, "#8b5cf6", ImageIcon, ik ? `${(ik.totalFiles || 0).toLocaleString("en-IN")} files` : ""]].map(([l, ok, used, total, color, I, extra]) => (
                <div key={l} className="flex items-center gap-3.5">
                  {storage ? <Ring pct={total ? (used / total) * 100 : 0} color={color} /> : <Skeleton className="h-16 w-16 rounded-full" />}
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800"><I size={13} style={{ color }} />{l}</p>
                    {ok ? <><p className="text-xs text-slate-500">{fmtBytes(used)} of {fmtBytes(total)}</p><p className="text-[11px] text-slate-400">{extra}</p></>
                      : <p className="text-xs text-slate-400">{storage ? "Couldn't load stats" : "Loading…"}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card i={14} className="p-5">
            <p className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-slate-900"><Rocket size={17} className="text-orange-500" />Quick actions</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[["/admin/articles/new", "New article", PenSquare, "from-emerald-500 to-teal-500"], ["/admin/blogs/new", "New guide", BookOpen, "from-sky-500 to-indigo-500"],
                ["/admin/vehicles/new", "Add vehicle", Car, "from-amber-400 to-orange-500"], ["/admin/social-scheduler", "Social post", Send, "from-pink-500 to-rose-500"],
                ["/admin/leads", "Leads", Users, "from-violet-500 to-fuchsia-500"], ["/", "View site", Globe, "from-slate-600 to-slate-800"]].map(([h, l, I, g]) => (
                <Link key={h} href={h} target={h === "/" ? "_blank" : undefined} className="group flex flex-col items-start gap-2 rounded-xl border border-slate-100 p-3 transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${g} text-white transition-transform group-hover:scale-110`}><I size={15} /></span>
                  <span className="text-xs font-semibold text-slate-700">{l}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <p className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-400"><Zap size={12} className="text-emerald-500" />IndexNow is on: every published article is pinged to Google, Bing and Yandex instantly.</p>
      </div>
    </div>
  );
}
