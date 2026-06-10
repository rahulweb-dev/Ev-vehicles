"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

const SITE_URL = "https://www.evradar.in";
const CREDIT = `\n\n— Read more at ${SITE_URL}\n© ${new Date().getFullYear()} EV News India. All rights reserved.`;

export default function ContentProtection() {
  const pathname = usePathname();
  const [toast, setToast] = useState(false);

  useEffect(() => {
    // No protection on admin pages
    if (pathname?.startsWith("/admin")) return;

    const showToast = () => {
      setToast(true);
      clearTimeout(window.__cpTimer);
      window.__cpTimer = setTimeout(() => setToast(false), 3500);
    };

    // 1. Block right-click context menu
    const onContextMenu = (e) => {
      e.preventDefault();
      showToast();
    };

    // 2. Intercept copy — append source credit to clipboard
    const onCopy = (e) => {
      const selected = window.getSelection()?.toString() ?? "";
      if (selected.length < 10) return;
      try {
        e.clipboardData?.setData("text/plain", selected + CREDIT);
        e.preventDefault();
      } catch {}
    };

    // 3. Block common keyboard shortcuts
    const onKeyDown = (e) => {
      const k = e.key?.toLowerCase();

      // Ctrl+U (view source) / Ctrl+S (save page)
      if (e.ctrlKey && !e.shiftKey && (k === "u" || k === "s")) {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I (DevTools Elements) / Ctrl+Shift+J (DevTools Console)
      if (e.ctrlKey && e.shiftKey && (k === "i" || k === "j" || k === "c")) {
        e.preventDefault();
        showToast();
        return;
      }

      // F12 (DevTools toggle)
      if (k === "f12") {
        e.preventDefault();
        showToast();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(window.__cpTimer);
    };
  }, [pathname]);

  if (!toast) return null;

  return (
    <div
      style={{ zIndex: 99999 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-2xl bg-gray-900/95 px-5 py-3 text-sm text-white shadow-2xl backdrop-blur-sm pointer-events-none select-none"
    >
      <ShieldCheck size={16} className="text-green-400 shrink-0" />
      <span>© EV News India — Content is copyright protected.</span>
    </div>
  );
}
