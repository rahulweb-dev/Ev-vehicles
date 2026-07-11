"use client";

import { useState } from "react";
import { X, Phone, User, MapPin, CheckCircle, Loader2, MessageCircle } from "lucide-react";

const INTENTS = [
  { value: "test_drive",  label: "Book Test Drive" },
  { value: "price",       label: "Get Best Price" },
  { value: "loan",        label: "Loan / Finance" },
  { value: "general",     label: "General Enquiry" },
];

export default function LeadFormModal({ vehicleName, vehicleSlug, vehicleType = "car", onClose }) {
  const [form, setForm]   = useState({ name: "", phone: "", email: "", city: "", intent: "test_drive" });
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const [err,   setErr]   = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) {
      setErr("Enter a valid 10-digit mobile number"); return;
    }
    setState("loading");
    setErr("");
    try {
      const res = await fetch("/api/leads", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, vehicleName, vehicleSlug, vehicleType }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Something went wrong"); setState("error"); return; }
      setState("success");
    } catch {
      setErr("Network error. Please try again."); setState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 px-6 py-5">
          <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition">
            <X size={16} />
          </button>
          <p className="text-xs font-bold text-green-100 uppercase tracking-wider mb-1">Quick Enquiry</p>
          <h2 className="text-xl font-black text-white leading-tight">{vehicleName}</h2>
        </div>

        {state === "success" ? (
          <div className="px-6 py-10 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Enquiry Received!</h3>
            <p className="text-gray-500 text-sm mb-1">Our team will call you within 24 hours.</p>
            <p className="text-gray-400 text-xs mb-6">You can also WhatsApp us at <a href="https://wa.me/919999999999" className="text-green-600 font-semibold">+91 99999 99999</a></p>
            <button onClick={onClose} className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-5 space-y-4">
            {/* Intent */}
            <div className="grid grid-cols-2 gap-2">
              {INTENTS.map(i => (
                <button key={i.value} type="button" onClick={() => setForm(f => ({ ...f, intent: i.value }))}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                    form.intent === i.value ? "border-green-600 bg-green-600 text-white" : "border-gray-200 bg-gray-50 text-gray-700 hover:border-green-400"
                  }`}>
                  {i.label}
                </button>
              ))}
            </div>

            {/* Name */}
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input required value={form.name} onChange={set("name")} placeholder="Your Name *"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white transition" />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input required value={form.phone} onChange={set("phone")} placeholder="Mobile Number * (10 digits)"
                type="tel" maxLength={10} inputMode="numeric"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white transition" />
            </div>

            {/* City */}
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.city} onChange={set("city")} placeholder="Your City (optional)"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white transition" />
            </div>

            {err && <p className="rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">{err}</p>}

            <button type="submit" disabled={state === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-black text-white shadow-lg hover:bg-green-700 disabled:opacity-70 transition">
              {state === "loading" ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
              {state === "loading" ? "Sending…" : "Send Enquiry"}
            </button>

            <p className="text-center text-[10px] text-gray-400">
              By submitting, you agree to be contacted by an authorized dealer. No spam.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
