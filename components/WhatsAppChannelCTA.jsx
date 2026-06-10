"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

// Replace with your actual WhatsApp Channel link
const WA_CHANNEL_URL = "https://whatsapp.com/channel/REPLACE_WITH_YOUR_CHANNEL_ID";

const DISMISS_KEY  = "ev-wa-cta-dismissed";
const COOLDOWN_MS  = 3 * 24 * 60 * 60 * 1000; // 3 days
const SHOW_DELAY   = 15000; // 15 seconds

const WA_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function WhatsAppChannelCTA() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    try {
      const stored = localStorage.getItem(DISMISS_KEY);
      if (stored && Date.now() - parseInt(stored) < COOLDOWN_MS) return;
    } catch {}

    const timer = setTimeout(() => setShow(true), SHOW_DELAY);
    return () => clearTimeout(timer);
  }, [pathname]);

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
  };

  if (!show) return null;

  return (
    <div
      style={{ zIndex: 9990, bottom: "5.5rem", right: "1rem" }}
      className="fixed sm:right-6 w-72 rounded-2xl bg-white shadow-2xl border border-green-100 overflow-hidden"
    >
      {/* Green header */}
      <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {WA_ICON}
          <span className="text-white text-sm font-bold">Join on WhatsApp</span>
        </div>
        <button
          onClick={dismiss}
          className="text-white/75 hover:text-white transition"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-sm font-bold text-gray-900">Get instant EV news updates</p>
        <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
          15,000+ EV enthusiasts already get daily prices, launches &amp; deals on our channel.
        </p>
        <a
          href={WA_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          {WA_ICON}
          Join Free →
        </a>
        <button
          onClick={dismiss}
          className="mt-2 w-full text-center text-[11px] text-gray-400 transition hover:text-gray-600"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
