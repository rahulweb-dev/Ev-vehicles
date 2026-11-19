"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Newspaper, LogOut, Menu, X, ExternalLink, Settings, Users, Building2, MapPin, ShieldCheck, Car,
  LayoutTemplate, MessageSquare, Radio, MessagesSquare, BookOpen, Bell, SearchCheck, UserCircle, Tag, Star, Mail,
  Share2, BarChart3, Megaphone, Link2, Zap, CalendarClock, Inbox, Search, ChevronsLeft, ChevronsRight, BellRing,
  LineChart, Database, Image as ImageIcon, Sparkles,
} from "lucide-react";
import { FaFacebook } from "react-icons/fa6";
import { getPusherClient } from "@/lib/pusherClient";

const ADMIN_GROUPS = [
  { label: "Overview", items: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  ] },
  { label: "Content", items: [
    { href: "/admin/articles", label: "Articles", icon: Newspaper },
    { href: "/admin/blogs", label: "Buyer's guides", icon: BookOpen },
    { href: "/admin/vehicles", label: "Vehicles", icon: Car },
    { href: "/admin/ev-sales", label: "EV sales data", icon: LineChart },
    { href: "/admin/brands", label: "Brand logos", icon: Tag },
    { href: "/admin/banners", label: "Banners", icon: LayoutTemplate },
    { href: "/admin/authors", label: "Authors", icon: UserCircle },
  ] },
  { label: "Customers", items: [
    { href: "/admin/leads", label: "Leads", icon: Sparkles },
    { href: "/admin/chatbot-leads", label: "Chatbot leads", icon: MessageSquare },
    { href: "/admin/live-chat", label: "Live chat", icon: Radio, badge: "liveChat" },
    { href: "/admin/dealers", label: "Dealers", icon: Building2 },
  ] },
  { label: "Community", items: [
    { href: "/admin/comments", label: "Comments", icon: MessagesSquare, badge: "comments" },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/charging-reports", label: "Charging reports", icon: Zap },
  ] },
  { label: "Social", items: [
    { href: "/admin/social-scheduler", label: "Scheduler", icon: CalendarClock },
    { href: "/admin/social-inbox", label: "Social inbox", icon: Inbox },
    { href: "/admin/my-social", label: "My Social", icon: Share2 },
    { href: "/admin/social-report", label: "Social report", icon: BarChart3 },
    { href: "/admin/social-settings", label: "Connections", icon: FaFacebook },
  ] },
  { label: "Marketing", items: [
    { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
    { href: "/admin/marketing/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/admin/push-notifications", label: "Push notifications", icon: BellRing },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
  ] },
  { label: "Tools", items: [
    { href: "/admin/seo-audit", label: "SEO audit", icon: SearchCheck },
    { href: "/admin/tools/links", label: "Link checker", icon: Link2 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ] },
];

const DEALER_GROUPS = [
  { label: "Workspace", items: [
    { href: "/admin/leads", label: "My leads", icon: Sparkles },
    { href: "/admin/my-social", label: "My Social", icon: Share2 },
  ] },
];

const readCollapsed = () => { try { return localStorage.getItem("admin-sidebar-collapsed") === "1"; } catch { return false; } };

function fmtBytes(b) {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB"], i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(1)} ${u[i]}`;
}

function Brand({ collapsed }) {
  return (
    <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30">
        <Zap size={18} className="text-white" fill="currentColor" />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
      </span>
      {!collapsed && (
        <span className="min-w-0 leading-tight">
          <span className="block text-[15px] font-bold tracking-tight text-white">EV Radar</span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300/80">Admin studio</span>
        </span>
      )}
    </Link>
  );
}

function StorageMini() {
  const [d, setD] = useState(null);
  useEffect(() => { fetch("/api/admin/storage").then((r) => (r.ok ? r.json() : null)).then((x) => x && setD(x)).catch(() => {}); }, []);
  if (!d) return null;
  const rows = [
    ["MongoDB", d.mongo?.fsUsedSize || d.mongo?.storageSize || 0, d.mongo?.fsTotalSize || 512 * 1024 * 1024, "from-emerald-400 to-teal-500", Database],
    ["ImageKit", d.imagekit?.totalSize || 0, 20 * 1024 * 1024 * 1024, "from-violet-400 to-fuchsia-500", ImageIcon],
  ];
  return (
    <div className="mx-3 mb-2 space-y-2.5 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/[0.06]">
      {rows.map(([l, used, total, g, I]) => {
        const pct = total ? Math.min((used / total) * 100, 100) : 0;
        return (
          <div key={l}>
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 font-medium text-white/60"><I size={10} />{l}</span>
              <span className="text-white/40">{fmtBytes(used)}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div className={`h-full rounded-full bg-gradient-to-r ${pct >= 85 ? "from-rose-400 to-rose-600" : g}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NavBody({ groups, pathname, collapsed, counts, user, isAdmin, onNavigate, onLogout, loggingOut, layoutKey }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return groups;
    return groups.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(s)) })).filter((g) => g.items.length);
  }, [q, groups]);
  const isActive = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  return (
    <>
      {!collapsed && (
        <div className="px-3 pt-4">
          <label className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2 text-white/40 ring-1 ring-white/[0.06] focus-within:ring-emerald-400/40">
            <Search size={14} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search menu…" className="w-full bg-transparent text-[13px] text-white placeholder-white/35 outline-none" />
          </label>
        </div>
      )}

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]">
        {filtered.map((g) => (
          <div key={g.label}>
            {!collapsed ? <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">{g.label}</p> : <div className="mx-auto mb-2 h-px w-6 bg-white/10" />}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const Icon = item.icon, active = isActive(item);
                const n = item.badge ? counts[item.badge] || 0 : 0;
                return (
                  <li key={item.href} className="relative">
                    <Link href={item.href} onClick={onNavigate} title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition-colors ${collapsed ? "justify-center" : ""} ${active ? "text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white"}`}>
                      {active && (
                        <motion.span layoutId={`nav-active-${layoutKey}`} className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent ring-1 ring-inset ring-emerald-400/25"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}>
                          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.6)]" />
                        </motion.span>
                      )}
                      <Icon size={17} className={`relative shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? "text-emerald-300" : ""}`} />
                      {!collapsed && <span className="relative truncate">{item.label}</span>}
                      {n > 0 && (collapsed
                        ? <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0B1120]" />
                        : <span className={`relative ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white ${item.badge === "liveChat" ? "animate-pulse bg-rose-500" : "bg-amber-500"}`}>{n}</span>)}
                      {!collapsed && item.label === "My leads" && !isAdmin && user?.city && <span className="relative ml-auto rounded-md bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300">{user.city}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {!filtered.length && <p className="px-3 text-xs text-white/35">Nothing matches “{q}”.</p>}
      </nav>

      <div className="border-t border-white/[0.06] pt-3">
        {!collapsed && isAdmin && <StorageMini />}
        {user && (
          <div className={`mx-3 mb-3 flex items-center gap-2.5 rounded-xl p-2 ${collapsed ? "justify-center" : "bg-white/[0.04] ring-1 ring-white/[0.06]"}`}>
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 text-sm font-bold text-white">
              {user.name?.[0]?.toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#0B1120]" />
            </span>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">{user.name}</p>
                  <p className="flex items-center gap-1 truncate text-[10px] text-white/45">
                    {isAdmin ? <><ShieldCheck size={10} className="text-emerald-400" />Super admin</> : <><MapPin size={10} className="text-sky-400" />{user.city ? `${user.city}, ${user.state}` : "Dealer"}</>}
                  </p>
                </div>
                {isAdmin && <a href="/" target="_blank" rel="noreferrer" title="View site" className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"><ExternalLink size={15} /></a>}
                <button onClick={onLogout} disabled={loggingOut} title="Log out" className="rounded-lg p-1.5 text-white/40 transition hover:bg-rose-500/15 hover:text-rose-300 disabled:opacity-50"><LogOut size={15} /></button>
              </>
            )}
          </div>
        )}
        {collapsed && <button onClick={onLogout} title="Log out" className="mx-auto mb-3 flex rounded-lg p-2 text-white/40 hover:bg-rose-500/15 hover:text-rose-300"><LogOut size={16} /></button>}
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [waitingChats, setWaitingChats] = useState(0);
  const [pendingComments, setPendingComments] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((d) => d.user && setUser(d.user)).catch(() => {}); }, []);
  useEffect(() => {
    fetch("/api/live-chat/sessions?status=waiting").then((r) => r.json()).then((d) => setWaitingChats(d.total || 0)).catch(() => {});
    const pusher = getPusherClient();
    if (!pusher) return;
    const ch = pusher.subscribe("admin-notifications");
    ch.bind("new-session", () => setWaitingChats((n) => n + 1));
    return () => { ch.unbind_all(); pusher.unsubscribe("admin-notifications"); };
  }, []);
  useEffect(() => { fetch("/api/admin/comments?status=pending&limit=1").then((r) => r.json()).then((d) => setPendingComments(d.pendingCount || 0)).catch(() => {}); }, []);

  function toggle() {
    setCollapsed((c) => { try { localStorage.setItem("admin-sidebar-collapsed", c ? "0" : "1"); } catch {} return !c; });
  }
  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const isAdmin = user?.role === "admin";
  const groups = isAdmin ? ADMIN_GROUPS : DEALER_GROUPS;
  const counts = { liveChat: waitingChats, comments: pendingComments };
  const shared = { groups, pathname, counts, user, isAdmin, onLogout: logout, loggingOut };
  const shell = "bg-[#0B1120] bg-[radial-gradient(120%_60%_at_0%_0%,rgba(16,185,129,0.12),transparent_60%),radial-gradient(80%_50%_at_100%_100%,rgba(56,189,248,0.08),transparent_60%)]";

  return (
    <>
      {/* Desktop */}
      <motion.aside animate={{ width: collapsed ? 76 : 264 }} transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/[0.06] lg:flex ${shell}`}>
        <div className={`flex h-16 items-center border-b border-white/[0.06] px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          <Brand collapsed={collapsed} />
          {!collapsed && <button onClick={toggle} className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white" aria-label="Collapse sidebar"><ChevronsLeft size={17} /></button>}
        </div>
        {collapsed && <button onClick={toggle} className="mx-auto mt-3 rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white" aria-label="Expand sidebar"><ChevronsRight size={17} /></button>}
        <NavBody {...shared} collapsed={collapsed} layoutKey="desktop" />
      </motion.aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600"><Zap size={16} className="text-white" fill="currentColor" /></span>
          <span className="text-[15px] font-bold tracking-tight text-slate-900">EV Radar <span className="font-medium text-slate-400">Admin</span></span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Open menu">
          <Menu size={21} />
          {waitingChats + pendingComments > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside className={`fixed inset-y-0 left-0 z-[70] flex w-[86%] max-w-[300px] flex-col shadow-2xl lg:hidden ${shell}`}
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 380, damping: 38 }}>
              <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
                <Brand collapsed={false} />
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close menu"><X size={19} /></button>
              </div>
              <NavBody {...shared} collapsed={false} layoutKey="mobile" onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
