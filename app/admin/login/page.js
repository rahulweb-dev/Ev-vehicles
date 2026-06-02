"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BatteryCharging, Eye, EyeOff, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = searchParams.get("from") || "/admin";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      window.location.href = redirectTo;
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 mb-4">
            <BatteryCharging size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">EV News India</h1>
          <p className="mt-1 text-gray-400 text-sm">Admin Dashboard Login</p>
        </div>

        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Sign In</h2>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@evradar.in"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-gray-800 px-4 py-3 text-xs text-gray-400">
            <p className="font-semibold text-gray-300 mb-1">First time? Run setup:</p>
            <code className="text-green-400">POST /api/setup</code> with your name, email &amp; password
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
