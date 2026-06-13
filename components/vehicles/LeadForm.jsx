"use client";

import { useState } from "react";
import {
  MapPin, Phone, User, CheckCircle, Loader2,
  MessageCircle, DollarSign, RefreshCw, Clock, Star,
} from "lucide-react";

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
  "Chandigarh","Puducherry",
];

const BUDGET_RANGES = [
  "Under ₹10 Lakh", "₹10–15 Lakh", "₹15–20 Lakh",
  "₹20–30 Lakh", "₹30–50 Lakh", "Above ₹50 Lakh",
];

const CALLBACK_TIMES = [
  "As soon as possible", "Morning (9am–12pm)", "Afternoon (12pm–4pm)",
  "Evening (4pm–7pm)", "Weekend only",
];

export default function LeadForm({ vehicleName, vehicleSlug, vehicleType = "car" }) {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", city: "", state: "",
    intent: "test_drive", budget: "", callbackTime: "",
    exchange: false, whatsapp: false,
  });
  const [step,     setStep]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const [locating, setLocating] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  }

  async function detectLocation() {
    setLocating(true);
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
      );
      const { latitude, longitude } = pos.coords;
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const data = await res.json();
      const city  = data.address?.city || data.address?.town || data.address?.village || "";
      const state = data.address?.state || "";
      setForm(f => ({ ...f, city, state }));
    } catch {
      setError("Could not detect location. Please enter manually.");
    }
    setLocating(false);
  }

  function validateStep1() {
    if (!form.name.trim()) return "Please enter your name";
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) return "Enter a valid 10-digit mobile number";
    return "";
  }

  function nextStep() {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, vehicleName, vehicleSlug, vehicleType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-600">
          <CheckCircle size={28} className="text-white" />
        </div>
        <h3 className="text-xl font-black text-gray-900">Enquiry Submitted!</h3>
        <p className="mt-2 text-gray-600 text-sm max-w-xs">
          Our team will contact you{form.callbackTime ? ` during ${form.callbackTime.toLowerCase()}` : " within 24 hours"} regarding the <strong>{vehicleName}</strong>.
        </p>
        {form.whatsapp && (
          <p className="mt-2 text-xs text-green-700 font-semibold">
            We'll also reach you on WhatsApp at {form.phone}
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-700">
            <Star size={10} fill="currentColor" /> Top Rated Dealers Near You
          </div>
        </div>
        <button
          onClick={() => { setSuccess(false); setStep(1); setForm({ name: "", phone: "", email: "", city: "", state: "", intent: "test_drive", budget: "", callbackTime: "", exchange: false, whatsapp: false }); }}
          className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-500 transition"
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-green-100 bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 px-5 py-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-green-100">Get Best Price In Your City</p>
        <h3 className="text-base font-black text-white mt-0.5">{vehicleName}</h3>
        {/* Step indicator */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {[1, 2].map(s => (
            <div key={s} className={`flex items-center gap-1 text-[10px] font-bold ${step >= s ? "text-white" : "text-green-400"}`}>
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black ${step >= s ? "bg-white text-green-700" : "bg-green-500 text-white"}`}>{s}</div>
              {s === 1 ? "Contact" : "Preferences"}
            </div>
          ))}
          <div className={`h-px w-6 ${step >= 2 ? "bg-white" : "bg-green-400"}`} />
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-3">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Your Full Name *"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
            </div>

            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="Mobile Number * (10 digits)"
                maxLength={10} inputMode="numeric"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <input type="checkbox" name="whatsapp" checked={form.whatsapp} onChange={handleChange}
                className="h-4 w-4 rounded accent-green-600" />
              <MessageCircle size={14} className="text-green-600" />
              <span className="text-xs font-semibold text-gray-700">Also contact me on WhatsApp</span>
            </label>

            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="Email Address (optional)"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />

            {/* Location row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <MapPin size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="city" value={form.city} onChange={handleChange}
                  placeholder="City"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-3 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
              </div>
              <select name="state" value={form.state} onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20">
                <option value="">State</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button type="button" onClick={detectLocation} disabled={locating}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-60 transition">
              {locating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
              {locating ? "Detecting location…" : "Auto-detect My Location"}
            </button>

            <button type="button" onClick={nextStep}
              className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-black text-white hover:bg-green-500 transition shadow-lg shadow-green-600/20">
              Next: Set Preferences →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Intent */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">I want to</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "test_drive",  label: "Book Test Drive" },
                  { value: "price_quote", label: "Get Best Price" },
                  { value: "finance",     label: "EMI / Finance" },
                  { value: "general",     label: "General Query" },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, intent: opt.value }))}
                    className={`rounded-xl border py-2 px-3 text-xs font-semibold transition ${
                      form.intent === opt.value
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-gray-200 text-gray-600 hover:border-green-300"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                <DollarSign size={12} /> Budget Range
              </p>
              <select name="budget" value={form.budget} onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20">
                <option value="">Select budget (optional)</option>
                {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Callback time */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                <Clock size={12} /> Preferred Callback Time
              </p>
              <select name="callbackTime" value={form.callbackTime} onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20">
                <option value="">Any time</option>
                {CALLBACK_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Exchange */}
            <label className="flex items-center gap-2.5 cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <input type="checkbox" name="exchange" checked={form.exchange} onChange={handleChange}
                className="h-4 w-4 rounded accent-green-600" />
              <RefreshCw size={14} className="text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-700">I have a vehicle to exchange</p>
                <p className="text-[10px] text-gray-400">Get trade-in evaluation from dealer</p>
              </div>
            </label>

            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                ← Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-2 rounded-xl bg-green-600 py-3.5 text-sm font-black text-white hover:bg-green-500 disabled:opacity-60 transition shadow-lg shadow-green-600/20">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Submitting…</span>
                  : "Submit Enquiry →"
                }
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="pb-4 text-center text-[10px] text-gray-400">
        By submitting, you agree to be contacted by verified dealers. We do not spam.
      </p>
    </div>
  );
}
