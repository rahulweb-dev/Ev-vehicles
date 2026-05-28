"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Newspaper, BookOpen, LogOut,
  BatteryCharging, Menu, X, ExternalLink, Settings,
  Users, Building2, MapPin, ShieldCheck,
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin",         label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/articles",label: "Articles",  icon: Newspaper },
  { href: "/admin/blogs",   label: "Blogs",     icon: BookOpen },
  { href: "/admin/leads",   label: "Leads",     icon: Users },
  { href: "/admin/dealers", label: "Dealers",   icon: Building2 },
  { href: "/admin/settings",label: "Settings",  icon: Settings },
];

const DEALER_NAV = [
  { href: "/admin/leads",   label: "My Leads",  icon: Users },
];

export default function AdminSidebar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const [collapsed, setCollapsed]   = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) setCurrentUser(d.user);
    }).catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const isAdmin  = currentUser?.role === "admin";
  const navItems = isAdmin ? ADMIN_NAV : DEALER_NAV;

  function isActive(item) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col ${collapsed ? "w-16" : "w-64"} shrink-0 bg-gray-900 border-r border-gray-800 transition-all duration-200`}>

        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <BatteryCharging size={20} className="text-green-400" />
              <span className="font-black text-white text-sm">EV News Admin</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition">
            <Menu size={18} />
          </button>
        </div>

        {/* User info strip */}
        {!collapsed && currentUser && (
          <div className={`mx-3 mt-3 rounded-xl border p-3 ${
            isAdmin
              ? "border-green-800/40 bg-green-900/10"
              : "border-blue-800/40 bg-blue-900/10"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                isAdmin ? "bg-green-600/30 text-green-400" : "bg-blue-600/30 text-blue-400"
              }`}>
                {currentUser.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {isAdmin
                    ? <><ShieldCheck size={10} className="text-green-400" /><span className="text-[10px] text-green-400 font-semibold">Super Admin</span></>
                    : <><MapPin size={10} className="text-blue-400" /><span className="text-[10px] text-blue-400 font-semibold">{currentUser.city || "Dealer"}</span></>
                  }
                </div>
              </div>
            </div>
            {!isAdmin && currentUser.city && (
              <p className="mt-2 text-[10px] text-blue-400/70 leading-tight">
                You see leads from <strong className="text-blue-300">{currentUser.city}, {currentUser.state}</strong> only
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 mt-2">
          {navItems.map((item) => {
            const Icon   = item.icon;
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href} title={item.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-green-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}>
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.label === "Leads" && !isAdmin && currentUser?.city && (
                  <span className="ml-auto rounded-lg bg-blue-600/30 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
                    {currentUser.city}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          {isAdmin && (
            <a href="/" target="_blank" title="View Site"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition">
              <ExternalLink size={18} className="shrink-0" />
              {!collapsed && <span>View Site</span>}
            </a>
          )}
          <button onClick={handleLogout} disabled={loggingOut} title="Logout"
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition">
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>{loggingOut ? "Logging out…" : "Logout"}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <MobileTopBar navItems={navItems} pathname={pathname} onLogout={handleLogout} currentUser={currentUser} isAdmin={isAdmin} />
    </>
  );
}

function MobileTopBar({ navItems, pathname, onLogout, currentUser, isAdmin }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BatteryCharging size={20} className="text-green-400" />
          <span className="font-black text-white text-sm">
            {isAdmin ? "EV News Admin" : `Dealer · ${currentUser?.city || ""}`}
          </span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-gray-400">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <nav className="p-3 space-y-1 bg-gray-900 border-t border-gray-800">
          {currentUser && (
            <div className={`mb-2 rounded-xl border p-3 ${isAdmin ? "border-green-800/40 bg-green-900/10" : "border-blue-800/40 bg-blue-900/10"}`}>
              <p className="text-xs font-bold text-white">{currentUser.name}</p>
              <p className={`text-[10px] font-semibold ${isAdmin ? "text-green-400" : "text-blue-400"}`}>
                {isAdmin ? "Super Admin · All locations" : `Dealer · ${currentUser.city}, ${currentUser.state}`}
              </p>
            </div>
          )}
          {navItems.map((item) => {
            const Icon   = item.icon;
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  active ? "bg-green-600 text-white" : "text-gray-400"
                }`}>
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      )}
    </div>
  );
}
