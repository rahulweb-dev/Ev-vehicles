"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Newspaper, Eye, Plus, CheckCircle2, FileText,
  BarChart2, Zap, Users, Car, Bike, Truck, ArrowRight,
  Clock, Star, Mail, BellRing, HardDrive, Image as ImageIcon,
  Database, RefreshCw, AlertCircle, TrendingUp, Monitor, Smartphone, Tablet,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";
import ArticleImage from "@/components/news/ArticleImage";

function articleImageFallback(article) {
  const title = encodeURIComponent(article?.title || "EV Radar");
  const tag = encodeURIComponent(article?.category || "news");
  return `/api/og?title=${title}&tag=${tag}&type=article`;
}

function playSound(type = "chat") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    if (type === "new") {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.onended = () => ctx.close();
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else {
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.onended = () => ctx.close();
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {}
}

function StatCard({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/75">{label}</p>
          <p className="mt-1.5 text-3xl font-black">{value ?? "—"}</p>
          {sub && <p className="mt-1 text-xs text-white/60">{sub}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
          <Icon size={22} />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10" />
    </div>
  );
}

function ArticleCard({ article }) {
  const catColor = {
    cars: "bg-blue-500", bikes: "bg-orange-500",
    commercial: "bg-purple-500", charging: "bg-teal-500",
  }[article.category] || "bg-gray-400";

  return (
    <div className="group flex gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:border-green-200 hover:shadow-sm transition">
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <ArticleImage
          src={article.image}
          fallbackSrc={articleImageFallback(article)}
          alt={article.imageAlt || article.title}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <span className={`absolute left-1 top-1 rounded px-1 py-0.5 text-[8px] font-black text-white uppercase ${catColor}`}>
          {article.category.slice(0, 3)}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <p className="line-clamp-2 text-sm font-semibold text-gray-800 leading-snug">{article.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            article.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {article.status}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Eye size={10} /> {(article.views || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>
      <Link href={`/admin/articles/${article._id}/edit`}
        className="self-start rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-700 transition opacity-0 group-hover:opacity-100">
        <BarChart2 size={14} />
      </Link>
    </div>
  );
}

function fmtBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

function StorageBar({ used, total, color = "bg-green-500" }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const danger = pct >= 85;
  return (
    <div className="mt-1.5">
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${danger ? "bg-red-500" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-gray-400">{pct.toFixed(1)}% used</p>
    </div>
  );
}

function StorageWidget({ storage, loading, onRefresh, refreshing }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive size={16} className="text-blue-600" />
          <span className="font-bold text-gray-800 text-sm">Storage Usage</span>
        </div>
        <div className="space-y-3">
          {[1,2].map(i => (
            <div key={i} className="animate-pulse space-y-1.5">
              <div className="h-3 w-1/2 rounded bg-gray-100" />
              <div className="h-2 w-full rounded-full bg-gray-100" />
              <div className="h-2 w-1/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const mongo   = storage?.mongo;
  const imgkit  = storage?.imagekit;
  const fetchedAt = storage?.fetchedAt
    ? new Date(storage.fetchedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;

  // MongoDB Atlas free tier = 512 MB; paid tiers expose fsTotalSize
  const mongoTotal = mongo?.fsTotalSize || 512 * 1024 * 1024;
  const mongoUsed  = mongo?.fsUsedSize  || mongo?.storageSize || 0;

  // ImageKit free = 20 GB
  const ikTotal = 20 * 1024 * 1024 * 1024;
  const ikUsed  = imgkit?.totalSize || 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HardDrive size={16} className="text-blue-600" />
          <span className="font-bold text-gray-800 text-sm">Storage Usage</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh storage stats"
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition disabled:opacity-40"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-4">
        {/* MongoDB */}
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Database size={13} className="text-emerald-600" />
            <span className="text-xs font-bold text-gray-700">MongoDB Atlas</span>
          </div>
          {mongo ? (
            <>
              <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                <span>Used: <b className="text-gray-800">{fmtBytes(mongoUsed)}</b></span>
                <span>Total: <b className="text-gray-800">{fmtBytes(mongoTotal)}</b></span>
              </div>
              <StorageBar used={mongoUsed} total={mongoTotal} color="bg-emerald-500" />
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400">
                <span>Data: {fmtBytes(mongo.dataSize)}</span>
                <span>Indexes: {fmtBytes(mongo.indexSize)}</span>
                <span>Collections: {mongo.collections}</span>
                <span>Documents: {(mongo.objects || 0).toLocaleString("en-IN")}</span>
              </div>
            </>
          ) : (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
              <AlertCircle size={11} /> Could not fetch MongoDB stats
            </p>
          )}
        </div>

        {/* ImageKit */}
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon size={13} className="text-violet-600" />
            <span className="text-xs font-bold text-gray-700">ImageKit CDN</span>
          </div>
          {imgkit ? (
            <>
              <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                <span>Used: <b className="text-gray-800">{fmtBytes(ikUsed)}</b></span>
                <span>Plan: <b className="text-gray-800">{fmtBytes(ikTotal)}</b></span>
              </div>
              <StorageBar used={ikUsed} total={ikTotal} color="bg-violet-500" />
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400">
                <span>Files: {(imgkit.totalFiles || 0).toLocaleString("en-IN")}</span>
                <span>Free: {fmtBytes(ikTotal - ikUsed)}</span>
                {imgkit.truncated && <span className="text-amber-500">* counted first 5000 files</span>}
              </div>
            </>
          ) : (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
              <AlertCircle size={11} /> Could not fetch ImageKit stats
            </p>
          )}
        </div>
      </div>

      {fetchedAt && (
        <p className="mt-3 text-[10px] text-gray-400 text-right">
          {storage?.cached ? "Cached · " : ""}Last updated {fetchedAt}
        </p>
      )}
    </div>
  );
}

// ─── 7-day bar chart (inline SVG) ─────────────────────────────────────────
function TrafficBars({ data }) {
  if (!data || data.length === 0) return (
    <div className="flex h-16 items-center justify-center text-xs text-gray-300">No data yet</div>
  );
  const max = Math.max(...data.map(d => d.views), 1);
  const W = 280, H = 52;
  const barW = Math.floor(W / data.length) - 3;
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return (
    <div className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
        {data.map((d, i) => {
          const h = Math.max(3, (d.views / max) * H);
          const x = i * (barW + 3);
          const y = H - h;
          return (
            <g key={d.date}>
              <rect x={x} y={0} width={barW} height={H} rx={2} fill="#f0fdf4" />
              <rect x={x} y={y} width={barW} height={h} rx={2} fill="#16a34a" />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between px-0.5">
        {data.map(d => {
          const day = new Date(d.date + "T00:00:00").getDay();
          return (
            <span key={d.date} className="text-[9px] text-gray-400">{days[day]}</span>
          );
        })}
      </div>
    </div>
  );
}

function SiteTrafficWidget({ pv, pvLoading, onRefresh, refreshing }) {
  if (pvLoading) {
    return (
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-green-700" />
          <h2 className="font-bold text-gray-800">Website Traffic</h2>
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mb-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-20" />
          ))}
        </div>
        <div className="animate-pulse rounded-xl bg-gray-100 h-16" />
      </div>
    );
  }

  const today     = pv?.today     || { views: 0, unique: 0 };
  const yesterday = pv?.yesterday || { views: 0, unique: 0 };
  const month     = pv?.month     || { views: 0 };
  const topPages  = pv?.topPages  || [];
  const devices   = pv?.devices   || {};
  const totalToday = today.views;
  const viewDelta  = today.views - yesterday.views;
  const mob = devices.mobile  || 0;
  const desk= devices.desktop || 0;
  const tab = devices.tablet  || 0;
  const devTotal = mob + desk + tab || 1;

  const fetchedAt = pv?.fetchedAt
    ? new Date(pv.fetchedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-green-700" />
          <h2 className="font-bold text-gray-800">Website Traffic</h2>
          {pv?.cached && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400">cached</span>}
        </div>
        <div className="flex items-center gap-2">
          {fetchedAt && <span className="text-[10px] text-gray-400">{fetchedAt}</span>}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh traffic stats"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition disabled:opacity-40"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mb-5">
        {[
          { label: "Today's Views",    value: today.views,     sub: viewDelta >= 0 ? `+${viewDelta} vs yesterday` : `${viewDelta} vs yesterday`, positive: viewDelta >= 0, bg: "bg-green-50 border-green-100", num: "text-green-700" },
          { label: "Today's Visitors", value: today.unique,    sub: "unique sessions",   positive: true, bg: "bg-blue-50 border-blue-100",   num: "text-blue-700" },
          { label: "Yesterday Views",  value: yesterday.views, sub: `${yesterday.unique} visitors`, positive: null, bg: "bg-gray-50 border-gray-200",  num: "text-gray-700" },
          { label: "This Month",       value: month.views,     sub: "last 30 days",      positive: null, bg: "bg-purple-50 border-purple-100", num: "text-purple-700" },
        ].map(({ label, value, sub, positive, bg, num }) => (
          <div key={label} className={`rounded-xl border ${bg} p-3`}>
            <p className="text-[11px] font-medium text-gray-500">{label}</p>
            <p className={`text-2xl font-black mt-0.5 ${num}`}>{(value ?? 0).toLocaleString("en-IN")}</p>
            {sub && (
              <p className={`text-[10px] mt-0.5 ${positive === true ? "text-green-600" : positive === false ? "text-red-500" : "text-gray-400"}`}>
                {sub}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* 7-day bar chart */}
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[11px] font-bold text-gray-600 mb-2">Last 7 Days</p>
          <TrafficBars data={pv?.last7days} />
          {pv?.last7days?.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-1 text-right">
              {pv.last7days.reduce((s, d) => s + d.views, 0).toLocaleString("en-IN")} total views
            </p>
          )}
        </div>

        {/* Right column: top pages + device split */}
        <div className="space-y-3">
          {/* Top pages */}
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[11px] font-bold text-gray-600 mb-2">Top Pages Today</p>
            {topPages.length === 0 ? (
              <p className="text-[11px] text-gray-400">No visits tracked yet</p>
            ) : (
              <div className="space-y-1.5">
                {topPages.slice(0, 5).map(p => (
                  <div key={p.path} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[11px] text-gray-600" title={p.path}>
                      {p.path === "/" ? "Home" : p.path}
                    </span>
                    <span className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                      {p.views}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device split */}
          {totalToday > 0 && (
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[11px] font-bold text-gray-600 mb-2">Devices Today</p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Smartphone, label: "Mobile",  count: mob,  color: "text-blue-600" },
                  { icon: Monitor,    label: "Desktop", count: desk, color: "text-green-700" },
                  { icon: Tablet,     label: "Tablet",  count: tab,  color: "text-purple-600" },
                ].map(({ icon: Icon, label, count, color }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5 flex-1">
                    <Icon size={14} className={color} />
                    <p className={`text-sm font-bold ${color}`}>{Math.round((count / devTotal) * 100)}%</p>
                    <p className="text-[9px] text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]           = useState(null);
  const [recent, setRecent]         = useState([]);
  const [featured, setFeatured]     = useState([]);
  const [leads, setLeads]           = useState(null);
  const [vehicles, setVehicles]     = useState(null);
  const [subscribers, setSubscribers] = useState(null);
  const [analytics, setAnalytics]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [soundOn, setSoundOn]       = useState(true);
  const [newChats, setNewChats]     = useState(0);
  const [reindexing, setReindexing] = useState(false);
  const [reindexResult, setReindexResult] = useState(null);
  const [storage, setStorage]       = useState(null);
  const [storageLoading, setStorageLoading] = useState(true);
  const [storageRefreshing, setStorageRefreshing] = useState(false);
  const [pv, setPv]                 = useState(null);
  const [pvLoading, setPvLoading]   = useState(true);
  const [pvRefreshing, setPvRefreshing] = useState(false);
  const soundOnRef                  = useRef(true);
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  /* Pusher: listen for new live-chat sessions from any page */
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const ch = pusher.subscribe("admin-notifications");
    ch.bind("new-session", (data) => {
      if (soundOnRef.current) playSound("new");
      setNewChats(p => p + 1);
      if (document.hidden && Notification.permission === "granted") {
        new Notification("EVRadar Live Chat", {
          body: `New visitor: ${data.userName || "Visitor"} is waiting`,
          icon: "/images/logo.png",
        });
      }
    });
    ch.bind("user-message", () => {
      if (soundOnRef.current) playSound("chat");
    });
    return () => { ch.unbind_all(); pusher.unsubscribe("admin-notifications"); };
  }, []);

  async function fetchStorage(force = false) {
    const url = force ? "/api/admin/storage?bust=" + Date.now() : "/api/admin/storage";
    try {
      const res = await fetch(url);
      if (res.ok) setStorage(await res.json());
    } catch {}
    setStorageLoading(false);
    setStorageRefreshing(false);
  }

  async function fetchPageviews(force = false) {
    const url = force ? "/api/admin/pageviews?bust=" + Date.now() : "/api/admin/pageviews";
    try {
      const res = await fetch(url);
      if (res.ok) setPv(await res.json());
    } catch {}
    setPvLoading(false);
    setPvRefreshing(false);
  }

  useEffect(() => { fetchStorage(); fetchPageviews(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function load() {
      try {
        const [pubRes, draftRes, latestRes, leadsRes, featRes, vehRes, subRes, analyticsRes] = await Promise.all([
          fetch("/api/articles?status=published&limit=100"),
          fetch("/api/articles?status=draft&limit=100"),
          fetch("/api/articles?status=published&limit=6"),
          fetch("/api/leads?limit=200"),
          fetch("/api/articles?status=published&featured=true&limit=3"),
          fetch("/api/vehicles?limit=200"),
          fetch("/api/subscribe?limit=50"),
          fetch("/api/admin/analytics"),
        ]);
        const [pub, draft, latest, leadsData, feat, vehData, subData, analyticsData] = await Promise.all([
          pubRes.json(), draftRes.json(), latestRes.json(), leadsRes.json(), featRes.json(), vehRes.json(), subRes.json(), analyticsRes.json(),
        ]);
        setAnalytics(analyticsData);
        const totalViews = (pub.articles || []).reduce((s, a) => s + (a.views || 0), 0);
        setStats({ published: pub.total || 0, drafts: draft.total || 0, total: (pub.total || 0) + (draft.total || 0), views: totalViews });
        setRecent(latest.articles || []);
        setFeatured((feat.articles || []).slice(0, 3));
        const allLeads = leadsData.leads || [];
        setLeads({
          total: allLeads.length,
          newLeads: allLeads.filter((l) => l.status === "new").length,
          cars: allLeads.filter((l) => l.vehicleType === "car").length,
          bikes: allLeads.filter((l) => l.vehicleType === "bike").length,
          commercial: allLeads.filter((l) => l.vehicleType === "commercial").length,
          recent: allLeads.slice(0, 4),
        });
        const allV = vehData.vehicles || [];
        setVehicles({
          total:        allV.length,
          upcomingCars: allV.filter((v) => v.category === "upcoming" && v.vehicleType === "car").length,
          upcomingBikes:allV.filter((v) => v.category === "upcoming" && v.vehicleType === "bike").length,
          popularCars:  allV.filter((v) => v.category === "popular"  && v.vehicleType === "car").length,
          popularBikes: allV.filter((v) => v.category === "popular"  && v.vehicleType === "bike").length,
          published:    allV.filter((v) => v.status === "published").length,
        });
        setSubscribers({
          total:   subData.total || 0,
          recent:  (subData.subscribers || []).slice(0, 6),
        });
      } catch {
        setStats({ published: 0, drafts: 0, total: 0, views: 0 });
        setLeads({ total: 0, newLeads: 0, cars: 0, bikes: 0, commercial: 0, recent: [] });
        setVehicles({ total: 0, upcomingCars: 0, upcomingBikes: 0, popularCars: 0, popularBikes: 0, published: 0 });
        setSubscribers({ total: 0, recent: [] });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Welcome back — EVBharat India CMS</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn(p => !p)}
            title={soundOn ? "Mute notifications" : "Unmute notifications"}
            className={`relative rounded-xl p-2.5 border transition ${
              soundOn ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100" : "border-gray-200 bg-white text-gray-300 hover:bg-gray-50"
            }`}
          >
            <BellRing size={16} />
            {newChats > 0 && soundOn && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                {newChats}
              </span>
            )}
          </button>
          {newChats > 0 && (
            <Link href="/admin/live-chat"
              onClick={() => setNewChats(0)}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition animate-pulse shadow-sm">
              <BellRing size={14} /> {newChats} New Chat{newChats > 1 ? "s" : ""}
            </Link>
          )}
          <button
            onClick={async () => {
              setReindexing(true);
              setReindexResult(null);
              try {
                const res = await fetch("/api/admin/reindex", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "all" }) });
                const data = await res.json();
                setReindexResult(data.success ? `✓ Submitted ${data.totalUrls} URLs to Google/Bing` : "✗ Reindex failed");
              } catch {
                setReindexResult("✗ Network error");
              } finally {
                setReindexing(false);
                setTimeout(() => setReindexResult(null), 8000);
              }
            }}
            disabled={reindexing}
            title="Submit all content to Google & Bing via IndexNow"
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
          >
            <Zap size={14} className={reindexing ? "animate-spin" : ""} />
            {reindexing ? "Submitting…" : reindexResult || "Re-index All"}
          </button>
          <Link href="/admin/articles/new"
            className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 transition shadow-sm">
            <Plus size={16} /> New Article
          </Link>
        </div>
      </div>

      {/* Site Traffic */}
      <SiteTrafficWidget
        pv={pv}
        pvLoading={pvLoading}
        refreshing={pvRefreshing}
        onRefresh={() => { setPvRefreshing(true); fetchPageviews(true); }}
      />

      {/* Stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Newspaper}    label="Total Articles" value={stats?.total}
          sub={`${stats?.published ?? 0} published · ${stats?.drafts ?? 0} drafts`}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
        <StatCard icon={CheckCircle2} label="Published"      value={stats?.published}
          sub="Live on site" gradient="bg-gradient-to-br from-green-600 to-green-800" />
        <StatCard icon={FileText}     label="Drafts"         value={stats?.drafts}
          sub="Awaiting publish" gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
        <StatCard icon={Eye}          label="Total Views"    value={stats?.views?.toLocaleString("en-IN")}
          sub="Across all articles" gradient="bg-gradient-to-br from-purple-500 to-purple-700" />
      </div>

      {/* Vehicle stats */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car size={18} className="text-green-700" />
            <h2 className="font-bold text-gray-800">Vehicle CMS</h2>
            {loading
              ? <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              : <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">{vehicles?.total ?? 0} total</span>
            }
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/vehicles/new"
              className="flex items-center gap-1.5 rounded-xl bg-green-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-800 transition">
              <Plus size={12} /> Add Vehicle
            </Link>
            <Link href="/admin/vehicles"
              className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 transition">
              Manage all <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Upcoming Cars",   value: vehicles?.upcomingCars,  icon: Car,  color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100",   href: "/admin/vehicles?category=upcoming&type=car" },
            { label: "Upcoming Bikes",  value: vehicles?.upcomingBikes, icon: Bike, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100", href: "/admin/vehicles?category=upcoming&type=bike" },
            { label: "Popular Cars",    value: vehicles?.popularCars,   icon: Car,  color: "text-green-700",  bg: "bg-green-50",  border: "border-green-100",  href: "/admin/vehicles?category=popular&type=car" },
            { label: "Popular Bikes",   value: vehicles?.popularBikes,  icon: Bike, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", href: "/admin/vehicles?category=popular&type=bike" },
          ].map(({ label, value, icon: Icon, color, bg, border, href }) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 rounded-xl border ${border} ${bg} px-4 py-3 transition hover:shadow-sm`}>
              <Icon size={18} className={color} />
              <div>
                {loading
                  ? <div className="h-5 w-8 animate-pulse rounded bg-gray-200 mb-1" />
                  : <p className="text-xl font-black text-gray-900">{value ?? 0}</p>
                }
                <p className="text-[11px] text-gray-500">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {!loading && vehicles?.published !== undefined && (
          <p className="mt-3 text-[11px] text-gray-400">
            {vehicles.published} published · {(vehicles.total - vehicles.published)} drafts
          </p>
        )}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left — articles (2 cols) */}
        <div className="space-y-6 lg:col-span-2">

          {/* Featured */}
          {(loading || featured.length > 0) && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold text-gray-800">
                  <Star size={16} className="text-yellow-500" /> Featured Articles
                </h2>
                <Link href="/admin/articles" className="text-xs font-semibold text-green-700 hover:text-green-900 transition">
                  View all →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {loading
                  ? Array(3).fill(0).map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-gray-200 h-48" />)
                  : featured.map((a) => (
                    <Link key={a._id} href={`/admin/articles/${a._id}/edit`}
                      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-green-200 hover:shadow-md transition">
                      <div className="relative h-32 w-full bg-gray-100">
                        <ArticleImage
                          src={a.image}
                          fallbackSrc={articleImageFallback(a)}
                          alt={a.imageAlt || a.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                        <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-yellow-400/90 px-2 py-0.5 text-[9px] font-black text-yellow-900">
                          <Star size={8} fill="currentColor" /> Featured
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-2 text-xs font-semibold text-gray-800 leading-snug">{a.title}</p>
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400">
                          <Eye size={9} /> {(a.views || 0).toLocaleString("en-IN")} views
                        </div>
                      </div>
                    </Link>
                  ))
                }
              </div>
            </section>
          )}

          {/* Recent articles */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-gray-800">
                <Clock size={16} className="text-gray-400" /> Recent Articles
              </h2>
              <Link href="/admin/articles" className="text-xs font-semibold text-green-700 hover:text-green-900 transition">
                Manage all →
              </Link>
            </div>
            <div className="space-y-2">
              {loading
                ? Array(5).fill(0).map((_, i) => <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-18" />)
                : recent.length === 0
                ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center">
                    <Newspaper size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No articles yet</p>
                    <Link href="/admin/articles/new"
                      className="mt-3 inline-flex items-center gap-1 rounded-xl bg-green-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-800 transition">
                      <Plus size={12} /> Write first article
                    </Link>
                  </div>
                )
                : recent.map((a) => <ArticleCard key={a._id} article={a} />)
              }
            </div>
          </section>

          {/* IndexNow banner */}
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                <Zap size={18} className="text-green-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">IndexNow Active</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Every article published is instantly pinged to Google, Bing &amp; Yandex.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — leads + quick actions */}
        <div className="space-y-5">

          {/* Leads card */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-700" />
                <span className="font-bold text-gray-800 text-sm">Customer Leads</span>
                {leads?.newLeads > 0 && (
                  <span className="animate-pulse rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-black text-white">
                    {leads.newLeads} NEW
                  </span>
                )}
              </div>
              <Link href="/admin/leads" className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 transition">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: "Total",      value: leads?.total,      icon: Users, color: "text-gray-800" },
                { label: "Cars",       value: leads?.cars,       icon: Car,   color: "text-blue-600" },
                { label: "Bikes",      value: leads?.bikes,      icon: Bike,  color: "text-orange-500" },
                { label: "Commercial", value: leads?.commercial, icon: Truck, color: "text-purple-600" },
              ].map(({ label, value, icon: Icon, color }, i) => (
                <div key={label} className={`flex flex-col items-center gap-0.5 py-4 ${i >= 2 ? "border-t border-gray-100" : ""}`}>
                  <Icon size={15} className={color} />
                  <p className={`text-xl font-black ${color}`}>{value ?? "—"}</p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
              {loading
                ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 px-4 py-3">
                    <div className="h-8 w-8 rounded-lg bg-gray-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-2/3 rounded bg-gray-100" />
                      <div className="h-2 w-1/2 rounded bg-gray-100" />
                    </div>
                  </div>
                ))
                : leads?.recent?.length === 0
                ? <p className="py-8 text-center text-xs text-gray-400">No leads yet</p>
                : leads?.recent?.map((lead) => {
                  const TypeIcon = lead.vehicleType === "car" ? Car : lead.vehicleType === "bike" ? Bike : Truck;
                  const typeColor = lead.vehicleType === "car"
                    ? "bg-blue-100 text-blue-600"
                    : lead.vehicleType === "bike"
                    ? "bg-orange-100 text-orange-500"
                    : "bg-purple-100 text-purple-600";
                  return (
                    <div key={lead._id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeColor}`}>
                        <TypeIcon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold text-gray-800">{lead.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{lead.vehicleName} · {lead.phone}</p>
                      </div>
                      <span className={`text-[10px] font-bold capitalize ${
                        lead.status === "new" ? "text-green-600"
                        : lead.status === "contacted" ? "text-yellow-600"
                        : lead.status === "converted" ? "text-emerald-600"
                        : "text-red-500"
                      }`}>{lead.status}</span>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* Email Subscribers */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-green-700" />
                <span className="font-bold text-gray-800 text-sm">Email Subscribers</span>
                {!loading && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                    {subscribers?.total ?? 0}
                  </span>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-52 overflow-y-auto">
              {loading
                ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 px-4 py-3">
                    <div className="h-7 w-7 rounded-full bg-gray-100" />
                    <div className="h-2.5 w-2/3 rounded bg-gray-100" />
                  </div>
                ))
                : subscribers?.recent?.length === 0
                ? <p className="py-8 text-center text-xs text-gray-400">No subscribers yet</p>
                : subscribers?.recent?.map((sub) => (
                  <div key={sub._id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-black text-green-700">
                      {sub.email[0].toUpperCase()}
                    </div>
                    <p className="flex-1 truncate text-xs text-gray-700">{sub.email}</p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Top Articles by Views */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <BarChart2 size={16} className="text-purple-600" />
              <span className="font-bold text-gray-800 text-sm">Top Articles by Views</span>
            </div>
            <div className="divide-y divide-gray-50">
              {loading
                ? Array(5).fill(0).map((_, i) => <div key={i} className="animate-pulse h-10 mx-4 my-2 rounded bg-gray-100" />)
                : (analytics?.topArticles || []).map((a, i) => (
                  <div key={a._id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-xs font-black text-gray-300 w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-800">{a.title}</p>
                      <p className="text-[10px] capitalize text-gray-400">{a.category}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-purple-600 shrink-0">
                      <Eye size={10} /> {(a.views || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))
              }
              {!loading && !analytics?.topArticles?.length && (
                <p className="py-6 text-center text-xs text-gray-400">No view data yet</p>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          {(analytics?.articlesByCategory?.length > 0) && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-bold text-gray-800 text-sm">Articles by Category</h2>
              <div className="space-y-2">
                {analytics.articlesByCategory.map(cat => {
                  const colors = { cars: "bg-blue-500", bikes: "bg-orange-500", commercial: "bg-purple-500", charging: "bg-teal-500" };
                  const max = analytics.articlesByCategory[0]?.count || 1;
                  return (
                    <div key={cat._id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold capitalize text-gray-700">{cat._id}</span>
                        <span className="text-gray-400">{cat.count} articles · {(cat.totalViews || 0).toLocaleString("en-IN")} views</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${colors[cat._id] || "bg-gray-400"} transition-all`}
                          style={{ width: `${(cat.count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-gray-800 text-sm">Quick Actions</h2>
            <div className="space-y-1.5">
              {[
                { href: "/admin/articles/new", label: "Write New Article", icon: Newspaper, color: "text-blue-600",   bg: "bg-blue-50" },
                { href: "/admin/articles",     label: "Manage Articles",   icon: BarChart2, color: "text-green-700",  bg: "bg-green-50" },
                { href: "/admin/vehicles/new", label: "Add New Vehicle",   icon: Car,       color: "text-orange-600", bg: "bg-orange-50" },
                { href: "/admin/vehicles",     label: "Manage Vehicles",   icon: Bike,      color: "text-purple-600", bg: "bg-purple-50" },
                { href: "/admin/leads",        label: "View All Leads",    icon: Users,     color: "text-yellow-600", bg: "bg-yellow-50" },
                { href: "/",                   label: "View Live Site",    icon: Eye,       color: "text-teal-600",   bg: "bg-teal-50", external: true },
              ].map((action) => (
                <Link key={action.href} href={action.href}
                  target={action.external ? "_blank" : undefined}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${action.bg}`}>
                    <action.icon size={14} className={action.color} />
                  </div>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Storage usage */}
          <StorageWidget
            storage={storage}
            loading={storageLoading}
            refreshing={storageRefreshing}
            onRefresh={() => {
              setStorageRefreshing(true);
              fetchStorage(true);
            }}
          />

          {/* SEO checklist */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-gray-800 text-sm">SEO Checklist</h2>
            <ul className="space-y-2">
              {[
                "Write unique titles (50–60 chars)",
                "Add meta description (150–160 chars)",
                "Keywords in first paragraph",
                "Upload images to ImageKit CDN",
                "Add relevant tags",
                "Feature important articles",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-gray-500">
                  <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-green-600" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
