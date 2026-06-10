"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Mail, BellRing, Loader2 } from "lucide-react";

const WA_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Replace with your actual WhatsApp Channel link
const WA_CHANNEL_URL = "https://whatsapp.com/channel/REPLACE_WITH_YOUR_CHANNEL_ID";

const POPUP_KEY    = "ev-exit-popup";
const COOLDOWN_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days
const MOBILE_DELAY = 30000; // 30 seconds

export default function ExitIntentPopup() {
  const pathname = usePathname();
  const [show,   setShow]   = useState(false);
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    try {
      const stored = localStorage.getItem(POPUP_KEY);
      if (stored && Date.now() - parseInt(stored) < COOLDOWN_MS) return;
    } catch {}

    const trigger = () => {
      setShow(true);
      try { localStorage.setItem(POPUP_KEY, String(Date.now())); } catch {}
    };

    // Desktop: mouse leaves toward browser chrome
    const onMouseLeave = (e) => {
      if (e.clientY <= 0) {
        trigger();
        document.removeEventListener("mouseleave", onMouseLeave);
      }
    };
    document.addEventListener("mouseleave", onMouseLeave);

    // Mobile fallback: show after 30 seconds
    const timer = setTimeout(trigger, MOBILE_DELAY);

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      clearTimeout(timer);
    };
  }, [pathname]);

  const dismiss = () => setShow(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrMsg("");
    try {
      const res  = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrMsg(data.error || "Please try again.");
      }
    } catch {
      setStatus("error");
      setErrMsg("Network error. Please try again.");
    }
  };

  if (!show) return null;

  return (
    <div
      style={{ zIndex: 99997 }}
      className="fixed inset-0 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={dismiss} />

      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 px-6 py-5 text-white">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-75 mb-1">Wait — Don't miss out!</p>
          <h2 className="text-xl font-black leading-tight">India's latest EV deals & launches, daily</h2>
          <p className="mt-1 text-sm text-green-100">Join 15,000+ EV enthusiasts already subscribed</p>
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white transition hover:bg-white/40"
        >
          <X size={15} />
        </button>

        <div className="p-6">
          {status === "success" ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <BellRing size={26} className="text-green-600" />
              </div>
              <h3 className="text-lg font-black text-gray-900">You're subscribed!</h3>
              <p className="mt-1 text-sm text-gray-500">Welcome to India's #1 EV newsletter.</p>
              <button
                onClick={dismiss}
                className="mt-5 w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Continue Reading →
              </button>
            </div>
          ) : (
            <>
              {/* Email form */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="shrink-0 rounded-xl bg-green-600 px-4 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-70 flex items-center gap-1.5"
                >
                  {status === "loading" ? <Loader2 size={14} className="animate-spin" /> : null}
                  Subscribe
                </button>
              </form>
              {status === "error" && <p className="mt-1.5 text-xs text-red-500">{errMsg}</p>}

              {/* Divider */}
              <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
                <div className="flex-1 border-t border-gray-100" />
                <span>or join us on</span>
                <div className="flex-1 border-t border-gray-100" />
              </div>

              {/* WhatsApp CTA */}
              <a
                href={WA_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismiss}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                {WA_ICON}
                Join our WhatsApp Channel
              </a>

              <button
                onClick={dismiss}
                className="mt-4 w-full text-center text-xs text-gray-400 transition hover:text-gray-600"
              >
                No thanks, I'll miss out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
