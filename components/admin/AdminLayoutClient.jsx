"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Pages dealers cannot access
const ADMIN_ONLY = ["/admin/articles", "/admin/blogs", "/admin/dealers", "/admin/settings"];

export default function AdminLayoutClient({ children }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const isLogin   = pathname === "/admin/login";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLogin) { setChecked(true); return; }

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        const user = data.user;
        if (!user) {
          router.push(`/admin/login?from=${pathname}`);
          return;
        }
        // Dealers restricted from admin-only routes
        if (user.role === "dealer" && ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
          router.push("/admin/leads");
          return;
        }
        // Dealers land on leads, not dashboard
        if (user.role === "dealer" && pathname === "/admin") {
          router.push("/admin/leads");
          return;
        }
        setChecked(true);
      })
      .catch(() => { setChecked(true); });
  }, [pathname, isLogin, router]);

  if (isLogin) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B1120]">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/40 animate-pulse" />
          <svg viewBox="0 0 24 24" className="absolute inset-0 m-auto h-6 w-6 text-white" fill="currentColor"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">Loading admin</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
