"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, User, ChevronDown, CheckCircle, Loader2 } from "lucide-react";

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
  "Chandigarh","Puducherry",
];

export default function LeadForm({ vehicleName, vehicleSlug, vehicleType = "car" }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", state: "", intent: "test_drive" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  }

  async function detectLocation() {
    setLocating(true);
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
      );
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        "";
      const state = data.address?.state || "";
      setForm((f) => ({ ...f, city, state }));
    } catch {
      setError("Could not detect location. Please enter manually.");
    }
    setLocating(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter your name");
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, "")))
      return setError("Enter a valid 10-digit mobile number");

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, vehicleName, vehicleSlug, vehicleType }),
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
      <div className="flex flex-col items-center justify-center rounded-2xl bg-green-50 p-8 text-center">
        <CheckCircle size={48} className="text-green-500 mb-3" />
        <h3 className="text-xl font-black text-gray-900">Enquiry Submitted!</h3>
        <p className="mt-2 text-gray-600 text-sm">
          Our team will contact you within 24 hours regarding the <strong>{vehicleName}</strong>.
        </p>
        <button
          onClick={() => { setSuccess(false); setForm({ name: "", phone: "", email: "", city: "", state: "", intent: "test_drive" }); }}
          className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-500"
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-lg">
      <div className="mb-5 rounded-xl bg-green-600 px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-green-100">Get Best Price In Your City</p>
        <h3 className="text-lg font-black text-white">{vehicleName}</h3>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Full Name *"
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          />
        </div>

        <div className="relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Mobile Number * (10 digits)"
            required
            maxLength={10}
            inputMode="numeric"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          />
        </div>

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email Address (optional)"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
        />

        {/* Location row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <MapPin size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-3 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
          </div>
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          >
            <option value="">State</option>
            {INDIA_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={detectLocation}
          disabled={locating}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-60"
        >
          {locating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
          {locating ? "Detecting location…" : "Auto-detect My Location"}
        </button>

        <select
          name="intent"
          value={form.intent}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
        >
          <option value="test_drive">Book Test Drive</option>
          <option value="price_quote">Get Best Price / Quote</option>
          <option value="finance">Finance & EMI Options</option>
          <option value="general">General Enquiry</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-black text-white shadow-lg shadow-green-600/30 transition hover:bg-green-500 disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Submitting…
            </span>
          ) : "Get Best Price & Test Drive"}
        </button>
      </form>

      <p className="mt-3 text-center text-[10px] text-gray-400">
        By submitting, you agree to be contacted by dealers in your city. We do not spam.
      </p>
    </div>
  );
}
