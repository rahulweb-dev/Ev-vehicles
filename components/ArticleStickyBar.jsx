"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";

const DISMISS_KEY = "ev-sticky-bar";

export default function ArticleStickyBar() {
  const [show,      setShow]      = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
      return;
    }

    const onScroll = () => {
      const pct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (pct > 0.65) setShow(true);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  if (dismissed || !show) return null;

  return (
    <div
      style={{ zIndex: 9988 }}
      className="fixed bottom-0 left-0 right-0 border-t border-green-600/30 bg-gradient-to-r from-green-700 to-green-600 px-4 py-3 shadow-2xl"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
            <MessageCircle size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white leading-tight">Ready to buy an EV?</p>
            <p className="text-xs text-green-100 hidden sm:block truncate">
              Get FREE expert consultation — compare prices, EMI &amp; best deals
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/contact"
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-green-700 shadow transition hover:bg-green-50"
          >
            Get Free Advice
            <ArrowRight size={13} />
          </Link>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
