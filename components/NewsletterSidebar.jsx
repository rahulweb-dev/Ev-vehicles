"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function NewsletterSidebar() {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Subscribed! You'll get daily EV news.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="rounded-2xl bg-green-600 p-5 text-white">
      <h3 className="font-bold text-lg">Get EV News Daily</h3>
      <p className="mt-1 text-sm text-green-100">Join 50,000+ readers who never miss an EV update.</p>

      {status === "success" ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-medium">
          <CheckCircle2 size={16} className="shrink-0" />
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="w-full rounded-xl bg-white/20 px-4 py-2.5 text-sm text-white placeholder-green-200 outline-none focus:bg-white/30"
          />
          {status === "error" && (
            <p className="text-xs text-green-100">{message}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-50 disabled:opacity-70"
          >
            {status === "loading" && <Loader2 size={14} className="animate-spin" />}
            Subscribe Free
          </button>
        </form>
      )}
    </div>
  );
}
