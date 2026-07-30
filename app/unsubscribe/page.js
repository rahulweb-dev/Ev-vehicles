"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams }                from "next/navigation";
import Link                               from "next/link";
import { CheckCircle2, XCircle, Mail, ArrowLeft } from "lucide-react";

function UnsubscribeContent() {
  const params = useSearchParams();
  const done   = params.get("done") === "1";
  const error  = params.get("error") === "1";

  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(done);
  const [err,     setErr]     = useState(error ? "This unsubscribe link is invalid or expired." : "");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErr("");
    try {
      // Ask the server for a token for this email, then confirm
      const res = await fetch("/api/unsubscribe/token", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Failed"); return; }

      const res2 = await fetch("/api/unsubscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token: data.token, email: email.trim().toLowerCase() }),
      });
      const data2 = await res2.json();
      if (!res2.ok) { setErr(data2.error || "Failed"); return; }
      setSuccess(true);
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-md p-8 text-center">
          <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2">You're unsubscribed</h1>
          <p className="text-gray-500 text-sm mb-6">
            You've been removed from EV Radar email updates. You won't receive any more newsletters.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-800 transition">
            <ArrowLeft size={15} /> Back to EV Radar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-md p-8">
        <div className="mb-6 text-center">
          <Mail size={40} className="text-gray-300 mx-auto mb-3" />
          <h1 className="text-xl font-black text-gray-900">Unsubscribe from EV Radar</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email address below to stop receiving EV Radar newsletters.
          </p>
        </div>

        {err && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <XCircle size={16} className="shrink-0" /> {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Processing…" : "Confirm Unsubscribe"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Changed your mind?{" "}
          <Link href="/" className="text-green-700 font-semibold hover:underline">
            Back to EV Radar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  );
}
