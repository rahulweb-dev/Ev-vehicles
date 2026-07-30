"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Newspaper, LogOut,
  Menu, X, ExternalLink, Settings,
  Users, Building2, MapPin, ShieldCheck, Car, LayoutTemplate, MessageSquare, Radio, MessagesSquare, BookOpen, Bell, SearchCheck, UserCircle, Tag, Star, Mail,
  Share2, BarChart3, HardDrive, Database, Image as ImageIcon, Megaphone, Link2,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";

function fmtBytes(b) {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(1)} ${u[i]}`;
}

function MiniStorageBar({ used, total, color }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  return (
    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
      <div
        className={`h-full rounded-full ${pct >= 85 ? "bg-red-500" : color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SidebarStorageWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/storage")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {});
  }, []);

  if (!data) return null;

  const mongo  = data.mongo;
  const imgkit = data.imagekit;

  const mongoTotal = mongo?.fsTotalSize  || 512 * 1024 * 1024;
  const mongoUsed  = mongo?.fsUsedSize   || mongo?.storageSize || 0;
  const mongoPct   = mongoTotal > 0 ? Math.min((mongoUsed / mongoTotal) * 100, 100) : 0;

  const ikTotal = 20 * 1024 * 1024 * 1024;
  const ikUsed  = imgkit?.totalSize || 0;
  const ikPct   = ikTotal > 0 ? Math.min((ikUsed / ikTotal) * 100, 100) : 0;

  return (
    <div className="mx-3 mb-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <HardDrive size={12} className="text-gray-400" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Storage</span>
      </div>

      {/* MongoDB */}
      {mongo && (
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Database size={10} className="text-emerald-600" />
              <span className="text-[10px] font-semibold text-gray-600">MongoDB</span>
            </div>
            <span className="text-[10px] text-gray-400">{mongoPct.toFixed(0)}%</span>
          </div>
          <MiniStorageBar used={mongoUsed} total={mongoTotal} color="bg-emerald-500" />
          <div className="mt-0.5 flex justify-between text-[9px] text-gray-400">
            <span>{fmtBytes(mongoUsed)} used</span>
            <span>{fmtBytes(mongoTotal - mongoUsed)} free</span>
          </div>
        </div>
      )}

      {/* ImageKit */}
      {imgkit && (
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <ImageIcon size={10} className="text-violet-600" />
              <span className="text-[10px] font-semibold text-gray-600">ImageKit</span>
            </div>
            <span className="text-[10px] text-gray-400">{ikPct.toFixed(0)}%</span>
          </div>
          <MiniStorageBar used={ikUsed} total={ikTotal} color="bg-violet-500" />
          <div className="mt-0.5 flex justify-between text-[9px] text-gray-400">
            <span>{fmtBytes(ikUsed)} used</span>
            <span>{fmtBytes(ikTotal - ikUsed)} free</span>
          </div>
        </div>
      )}
    </div>
  );
}

const ADMIN_NAV = [
  { href: "/admin",                 label: "Dashboard",    icon: LayoutDashboard, exact: true },
  { href: "/admin/articles",        label: "Articles",     icon: Newspaper },
  { href: "/admin/blogs",           label: "Blogs",        icon: BookOpen },
  { href: "/admin/vehicles",        label: "Vehicles",     icon: Car },
  { href: "/admin/brands",          label: "Brand Logos",  icon: Tag },
  { href: "/admin/banners",         label: "Banners",      icon: LayoutTemplate },
  { href: "/admin/leads",           label: "Leads",        icon: Users },
  { href: "/admin/chatbot-leads",   label: "Chatbot Leads", icon: MessageSquare },
  { href: "/admin/live-chat",       label: "Live Chat",    icon: Radio, badge: "liveChat" },
  { href: "/admin/reviews",             label: "Reviews",           icon: Star,           badge: "reviews" },
  { href: "/admin/comments",           label: "Comments",          icon: MessagesSquare, badge: "comments" },
  { href: "/admin/subscribers",         label: "Subscribers",        icon: Mail },
  { href: "/admin/marketing/campaigns", label: "Campaigns",          icon: Megaphone },
  { href: "/admin/push-notifications", label: "Push Notifications", icon: Bell },
  { href: "/admin/notifications",      label: "Notifications",      icon: Bell },
  { href: "/admin/seo-audit",          label: "SEO Audit",          icon: SearchCheck },
  { href: "/admin/social-settings",   label: "Social Settings",    icon: Share2 },
  { href: "/admin/social-report",     label: "Social Report",      icon: BarChart3 },
  { href: "/admin/authors",            label: "Authors",            icon: UserCircle },
  { href: "/admin/dealers",            label: "Dealers",            icon: Building2 },
  { href: "/admin/tools/links",         label: "Link Checker",       icon: Link2 },
  { href: "/admin/settings",           label: "Settings",           icon: Settings },
];

const DEALER_NAV = [
  { href: "/admin/leads", label: "My Leads", icon: Users },
];

export default function AdminSidebar() {
  const pathname    = usePathname();
  const [collapsed, setCollapsed]   = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [waitingChats,   setWaitingChats]   = useState(0);
  const [pendingComments,setPendingComments] = useState(0);
  const [currentUser,    setCurrentUser]    = useState(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) setCurrentUser(d.user);
    }).catch(() => {});
  }, []);

  /* real-time waiting chat count via Pusher */
  useEffect(() => {
    /* initial count */
    fetch("/api/live-chat/sessions?status=waiting")
      .then(r => r.json())
      .then(d => setWaitingChats(d.total || 0))
      .catch(() => {});

    const pusher = getPusherClient();
    if (!pusher) return;

    const ch = pusher.subscribe("admin-notifications");
    ch.bind("new-session",  () => setWaitingChats(n => n + 1));
    /* when session status changes to active/closed, decrement waiting */
    return () => {
      ch.unbind_all();
      pusher.unsubscribe("admin-notifications");
    };
  }, []);

  /* pending comments count */
  useEffect(() => {
    fetch("/api/admin/comments?status=pending&limit=1")
      .then(r => r.json())
      .then(d => setPendingComments(d.pendingCount || 0))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const isAdmin  = currentUser?.role === "admin";
  const navItems = isAdmin ? ADMIN_NAV : DEALER_NAV;

  function isActive(item) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside className={`hidden lg:flex flex-col ${collapsed ? "w-16" : "w-64"} shrink-0 sticky top-0 h-screen bg-white border-r border-gray-200 transition-all duration-200`}>

        {/* Logo area */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-3">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2 min-w-0">
              <Image
                src="/images/logo.png"
                alt="EVRadar"
                width={120}
                height={36}
                className="object-contain h-9 w-auto"
                priority
              />
            </Link>
          )}
          {collapsed && (
            <Link href="/admin" className="mx-auto">
              <Image
                src="/images/logo.png"
                alt="EVRadar"
                width={32}
                height={32}
                className="object-contain h-8 w-8"
                priority
              />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`${collapsed ? "mx-auto" : ""} shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition`}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* User info strip */}
        {!collapsed && currentUser && (
          <div className={`mx-3 mt-3 rounded-xl border p-3 ${
            isAdmin
              ? "border-green-200 bg-green-50"
              : "border-blue-200 bg-blue-50"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                isAdmin ? "bg-green-700 text-white" : "bg-blue-600 text-white"
              }`}>
                {currentUser.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black truncate bg-linear-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">{currentUser.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {isAdmin
                    ? <><ShieldCheck size={10} className="text-green-700" /><span className="text-[10px] text-green-700 font-semibold">Super Admin</span></>
                    : <><MapPin size={10} className="text-blue-600" /><span className="text-[10px] text-blue-600 font-semibold">{currentUser.city || "Dealer"}</span></>
                  }
                </div>
              </div>
            </div>
            {!isAdmin && currentUser.city && (
              <p className="mt-2 text-[10px] text-blue-500 leading-tight">
                Leads from <strong className="text-blue-700">{currentUser.city}, {currentUser.state}</strong> only
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 mt-2">
          {navItems.map((item) => {
            const Icon   = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-green-700 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge === "liveChat" && waitingChats > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
                    {waitingChats}
                  </span>
                )}
                {!collapsed && item.badge === "comments" && pendingComments > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white">
                    {pendingComments}
                  </span>
                )}
                {!collapsed && item.label === "Leads" && !isAdmin && currentUser?.city && (
                  <span className="ml-auto rounded-lg bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                    {currentUser.city}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom — always visible */}
        <div className="border-t border-gray-200">
          {!collapsed && isAdmin && <SidebarStorageWidget />}
          <div className="p-3 space-y-1">
          {isAdmin && (
            <a
              href="/"
              target="_blank"
              title="View Site"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              <ExternalLink size={18} className="shrink-0" />
              {!collapsed && <span>View Site</span>}
            </a>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>{loggingOut ? "Logging out…" : "Logout"}</span>}
          </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ───────────────────────────────────── */}
      <MobileTopBar
        navItems={navItems}
        pathname={pathname}
        onLogout={handleLogout}
        currentUser={currentUser}
        isAdmin={isAdmin}
        waitingChats={waitingChats}
        pendingComments={pendingComments}
      />
    </>
  );
}

function MobileTopBar({ navItems, pathname, onLogout, currentUser, isAdmin, waitingChats = 0, pendingComments = 0 }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/admin">
          <Image
            src="/images/logo.png"
            alt="EVRadar"
            width={100}
            height={30}
            className="object-contain h-8 w-auto"
            priority
          />
        </Link>
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="p-3 space-y-1 bg-white border-t border-gray-100">
          {currentUser && (
            <div className={`mb-2 rounded-xl border p-3 ${isAdmin ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}>
              <p className="text-xs font-black bg-linear-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">{currentUser.name}</p>
              <p className={`text-[10px] font-semibold ${isAdmin ? "text-green-700" : "text-blue-600"}`}>
                {isAdmin ? "Super Admin · All locations" : `Dealer · ${currentUser.city}, ${currentUser.state}`}
              </p>
            </div>
          )}
          {navItems.map((item) => {
            const Icon   = item.icon;
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  active ? "bg-green-700 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} /> {item.label}
                {item.badge === "liveChat"  && waitingChats    > 0 && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">{waitingChats}</span>}
                {item.badge === "comments"  && pendingComments > 0 && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white">{pendingComments}</span>}
              </Link>
            );
          })}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      )}
    </div>
  );
}
