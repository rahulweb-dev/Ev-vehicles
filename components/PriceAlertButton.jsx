"use client";

import { useState } from "react";
import { Bell, X, CheckCircle, Loader2, Mail } from "lucide-react";

export default function PriceAlertButton({ vehicleName, vehicleSlug }) {
  const [open,    setOpen]    = useState(false);
  const [email,   setEmail]   = useState("");
  const [state,   setState]   = useState("idle"); // idle | loading | success | error
  const [err,     setErr]     = useState("");

  async function subscribe(e) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Enter a valid email address"); return;
    }
    setState("loading"); setErr("");
    try {
      const res  = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, source: `price-alert:${vehicleSlug}`, tags: ["price-alert", vehicleSlug] }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Could not subscribe"); setState("error"); return; }
      setState("success");
    } catch {
      setErr("Network error. Please try again."); setState("error");
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border-2 border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-100 transition active:scale-95">
        <Bell size={15} className="animate-[ring_2s_ease-in-out_infinite]" />
        Price Drop Alert
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>

            {state === "success" ? (
              <div className="text-center py-4">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-green-100 mb-4">
                  <CheckCircle size={28} className="text-green-600" />
                </div>
                <h3 className="font-black text-gray-900 mb-1">Alert Set!</h3>
                <p className="text-sm text-gray-500">We&apos;ll email you if the price of <strong>{vehicleName}</strong> drops.</p>
                <button onClick={() => { setState("idle"); setEmail(""); setOpen(false); }}
                  className="mt-5 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white">Done</button>
              </div>
            ) : (
              <form onSubmit={subscribe}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 mb-4">
                  <Bell size={22} className="text-orange-600" />
                </div>
                <h3 className="font-black text-gray-900 mb-1">Price Drop Alert</h3>
                <p className="text-sm text-gray-500 mb-5">Get notified when <strong>{vehicleName}</strong> price drops or a new variant is launched.</p>
                <div className="relative mb-3">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required value={email} onChange={e => setEmail(e.target.value)}
                    type="email" placeholder="Your email address"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white transition" />
                </div>
                {err && <p className="mb-3 text-xs font-semibold text-red-600">{err}</p>}
                <button type="submit" disabled={state === "loading"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-70 transition">
                  {state === "loading" ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
                  {state === "loading" ? "Setting alert…" : "Notify Me"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
