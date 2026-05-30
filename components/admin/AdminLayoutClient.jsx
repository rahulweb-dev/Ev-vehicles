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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
