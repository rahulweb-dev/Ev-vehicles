"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [setup, setSetup] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function runSetup(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(setup),
    });
    const data = await res.json();
    setResult({ ok: res.ok, message: data.message || data.error });
    setLoading(false);
  }

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-6 max-w-2xl">
      <h1 className="text-2xl font-black text-white mb-2">Settings</h1>
      <p className="text-sm text-gray-400 mb-8">Configure your CMS and database.</p>

      {/* Setup Section */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 mb-6">
        <h2 className="font-bold text-white mb-1">Initial Setup & Seed Database</h2>
        <p className="text-xs text-gray-400 mb-5">
          Use this only once to create your first admin user and seed the database with existing articles.
          This will fail if an admin user already exists.
        </p>

        {result && (
          <div className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
            result.ok ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
          }`}>
            {result.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {result.message}
          </div>
        )}

        <form onSubmit={runSetup} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-400">Admin Name</label>
            <input
              type="text"
              required
              value={setup.name}
              onChange={(e) => setSetup((s) => ({ ...s, name: e.target.value }))}
              placeholder="Rahul Sharma"
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-400">Admin Email</label>
            <input
              type="email"
              required
              value={setup.email}
              onChange={(e) => setSetup((s) => ({ ...s, email: e.target.value }))}
              placeholder="admin@evnewsindia.com"
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-400">Password (min 8 chars)</label>
            <input
              type="password"
              required
              minLength={8}
              value={setup.password}
              onChange={(e) => setSetup((s) => ({ ...s, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-500 transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            Run Setup & Seed Database
          </button>
        </form>
      </div>

      {/* Environment Variables Guide */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="font-bold text-white mb-3">Required Environment Variables</h2>
        <div className="space-y-2 font-mono text-xs">
          {[
            ["MONGODB_URI", "MongoDB Atlas connection string"],
            ["JWT_SECRET", "Secret key for JWT tokens"],
            ["IMAGEKIT_PUBLIC_KEY", "ImageKit public key"],
            ["IMAGEKIT_PRIVATE_KEY", "ImageKit private key"],
            ["IMAGEKIT_URL_ENDPOINT", "ImageKit URL endpoint"],
            ["INDEXNOW_KEY", "UUID key for IndexNow API"],
            ["NEXT_PUBLIC_SITE_URL", "Your website URL"],
          ].map(([key, desc]) => (
            <div key={key} className="flex gap-2 rounded-lg bg-gray-800 px-3 py-2">
              <span className="text-green-400 flex-shrink-0">{key}</span>
              <span className="text-gray-500">— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
