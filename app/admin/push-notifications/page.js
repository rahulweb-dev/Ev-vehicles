"use client";

import { useState, useEffect } from "react";
import { Bell, Send, Users, CheckCircle, AlertCircle, Loader2, Zap, Newspaper, Tag } from "lucide-react";

const PRESETS = [
  { label: "Breaking News",  icon: Newspaper, title: "🚨 Breaking EV News", body: "A new electric vehicle has just been launched in India! Click to read more." },
  { label: "Price Drop",     icon: Tag,       title: "💰 EV Price Drop Alert!", body: "Great news! EV prices have dropped. Check the latest deals now." },
  { label: "New Article",    icon: Zap,       title: "⚡ New Article on EVRadar", body: "We've published something you won't want to miss. Read it now!" },
  { label: "Weekly Digest",  icon: Bell,      title: "📰 Your Weekly EV Digest", body: "Top 5 EV stories this week – catch up on everything you missed!" },
];

export default function PushNotificationsPage() {
  const [title,     setTitle]     = useState("");
  const [body,      setBody]      = useState("");
  const [url,       setUrl]       = useState("/");
  const [icon,      setIcon]      = useState("");
  const [image,     setImage]     = useState("");
  const [sending,   setSending]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [subCount,  setSubCount]  = useState(null);

  useEffect(() => {
    fetch("/api/push/count").then(r => r.json()).then(d => setSubCount(d.count)).catch(() => {});
  }, []);

  async function handleSend(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res  = await fetch("/api/push/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, body, url, icon: icon || undefined, image: image || undefined }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Network error" });
    } finally {
      setSending(false);
    }
  }

  function applyPreset(preset) {
    setTitle(preset.title);
    setBody(preset.body);
  }

  const charLeft = 160 - body.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Push Notifications</h1>
            <p className="text-sm text-gray-500 mt-0.5">Broadcast to all subscribers</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 shadow-sm">
            <Users size={16} className="text-green-600" />
            <span className="text-sm font-bold text-gray-900">
              {subCount === null ? "…" : subCount.toLocaleString("en-IN")} subscribers
            </span>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-5 rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 mb-3">Quick Templates</p>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map(preset => {
              const Icon = preset.icon;
              return (
                <button key={preset.label} onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-left hover:border-green-400 hover:bg-green-50 transition">
                  <Icon size={14} className="text-green-600 shrink-0" />
                  <span className="text-xs font-semibold text-gray-700">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm space-y-4">
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700">
              <span>Notification Title <span className="text-red-500">*</span></span>
              <span className="text-gray-400 font-normal">{title.length}/65</span>
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={65}
              placeholder="e.g. 🚨 Tata Nexon EV facelift launched at ₹14.99 Lakh"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition"
              required />
          </div>

          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700">
              <span>Message Body <span className="text-red-500">*</span></span>
              <span className={`font-normal ${charLeft < 20 ? "text-red-500" : "text-gray-400"}`}>{charLeft} left</span>
            </label>
            <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={160}
              rows={3} placeholder="Write a compelling message to get subscribers to click…"
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition"
              required />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Click URL (default: /)
            </label>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="/news/tata-nexon-ev-facelift-2025"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Icon URL (optional)</label>
              <input value={icon} onChange={e => setIcon(e.target.value)}
                placeholder="/images/logo.png"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none transition" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Image URL (optional)</label>
              <input value={image} onChange={e => setImage(e.target.value)}
                placeholder="https://… article image"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none transition" />
            </div>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-[10px] font-semibold text-gray-400 mb-2">Preview</p>
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-green-600 flex items-center justify-center">
                  <Bell size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{title || "Notification title"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{body || "Message body…"}</p>
                  <p className="text-[10px] text-gray-400 mt-1">evradar.in</p>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-3 flex items-start gap-2.5 ${result.error ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
              {result.error
                ? <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                : <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
              }
              <div className="text-sm">
                {result.error
                  ? <p className="font-semibold text-red-700">{result.error}</p>
                  : <>
                      <p className="font-semibold text-green-800">Sent to {result.sent} subscriber{result.sent !== 1 ? "s" : ""}!</p>
                      {result.failed > 0 && <p className="text-xs text-green-700">{result.failed} failed · {result.removed} stale removed</p>}
                    </>
                }
              </div>
            </div>
          )}

          <button type="submit" disabled={sending || !title.trim() || !body.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-3 text-sm font-bold text-white hover:bg-green-800 transition disabled:opacity-50">
            {sending
              ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
              : <><Send size={16} /> Send Push Notification</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
