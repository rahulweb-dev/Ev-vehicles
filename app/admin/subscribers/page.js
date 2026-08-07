"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Users, UserX, Download, Send, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const SIMPLE_TEMPLATE = (subject) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
  <div style="background:#16a34a;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:white;margin:0;font-size:20px;">⚡ EV Radar</h1>
    <p style="color:#bbf7d0;margin:8px 0 0;font-size:13px;">India's #1 Electric Vehicle News Platform</p>
  </div>
  <div style="background:white;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
    <h2 style="color:#111827;margin:0 0 16px;">${subject}</h2>
    <p style="color:#4b5563;line-height:1.7;">Write your newsletter content here...</p>
    <p style="color:#4b5563;line-height:1.7;">You can include:</p>
    <ul style="color:#4b5563;line-height:2;">
      <li>Latest EV news and launches</li>
      <li>New car/bike reviews</li>
      <li>EV tips and guides</li>
      <li>Price updates</li>
    </ul>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://www.evradar.in" style="background:#16a34a;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
        Read More on EV Radar →
      </a>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
      You are receiving this because you subscribed at evradar.in.<br>
      <a href="https://www.evradar.in/unsubscribe" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  </div>
</div>`.trim();

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats,       setStats]       = useState({ total: 0, active: 0, unsubscribed: 0 });
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("active");

  // Newsletter compose state
  const [showCompose, setShowCompose] = useState(false);
  const [subject,     setSubject]     = useState("");
  const [html,        setHtml]        = useState("");
  const [testEmail,   setTestEmail]   = useState("");
  const [sending,       setSending]       = useState(false);
  const [sendResult,    setSendResult]    = useState(null);
  const [digestSending, setDigestSending] = useState(false);
  const [digestResult,  setDigestResult]  = useState(null);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, unsub, all] = await Promise.all([
        fetch("/api/subscribe?status=active&limit=500"),
        fetch("/api/subscribe?status=unsubscribed&limit=1"),
        fetch("/api/subscribe?limit=1"),
      ].map(p => p.then(r => r.json())));
      setSubscribers(activeRes.subscribers || []);
      setStats({
        total:         all.total || 0,
        active:        activeRes.total || 0,
        unsubscribed:  unsub.total || 0,
      });
    } catch { setSubscribers([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  function exportCSV() {
    const rows = [["Email", "Status", "Source", "Joined"]];
    subscribers.forEach(s => {
      rows.push([s.email, s.status, s.source || "website",
        s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : ""]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function sendNewsletter(isTest = false) {
    if (!subject.trim() || !html.trim()) {
      alert("Subject and HTML content are required.");
      return;
    }
    if (isTest && !testEmail.trim()) {
      alert("Enter a test email address.");
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html, testEmail: isTest ? testEmail : undefined }),
      });
      const data = await res.json();
      setSendResult(data);
    } catch {
      setSendResult({ error: "Network error" });
    }
    setSending(false);
  }

  async function sendWeeklyDigest() {
    if (!confirm(`Send weekly digest to ${stats.active} subscribers?`)) return;
    setDigestSending(true);
    setDigestResult(null);
    try {
      const secret = prompt("Enter DIGEST_SECRET:");
      if (!secret) { setDigestSending(false); return; }
      const res  = await fetch(`/api/digest/weekly?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      setDigestResult(data);
    } catch {
      setDigestResult({ error: "Network error" });
    }
    setDigestSending(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Email Subscribers</h1>
          <p className="mt-0.5 text-sm text-gray-500">Manage newsletter subscribers and send campaigns.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSubscribers}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={sendWeeklyDigest} disabled={digestSending}
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100 transition disabled:opacity-60">
            <Mail size={14} /> {digestSending ? "Sending…" : "Weekly Digest"}
          </button>
          <button onClick={() => setShowCompose(!showCompose)}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition">
            <Send size={14} /> Send Newsletter
          </button>
        </div>
      </div>

      {/* Stats */}
      {digestResult && (
        <div className={`rounded-2xl border p-4 text-sm font-semibold ${digestResult.error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
          {digestResult.error
            ? `Error: ${digestResult.error}`
            : `Weekly digest sent! ${digestResult.sent}/${digestResult.subscribers} delivered, covering ${digestResult.articles} articles.`}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Subscribers", value: stats.total,        icon: <Users size={20} className="text-blue-500" />,  bg: "bg-blue-50" },
          { label: "Active",             value: stats.active,       icon: <CheckCircle size={20} className="text-green-500" />, bg: "bg-green-50" },
          { label: "Unsubscribed",       value: stats.unsubscribed, icon: <UserX size={20} className="text-red-400" />,   bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} mb-3`}>
              {s.icon}
            </div>
            <p className="text-3xl font-black text-gray-900">{s.value.toLocaleString()}</p>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Compose Newsletter */}
      {showCompose && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-900">
            <Mail size={18} className="text-green-600" /> Compose Newsletter
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Subject Line *</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Top 5 EVs Launched This Week | EV Radar"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-600">HTML Content *</label>
                <button
                  onClick={() => setHtml(SIMPLE_TEMPLATE(subject || "Your Newsletter Subject"))}
                  className="text-xs font-semibold text-green-600 hover:underline"
                >
                  Load template
                </button>
              </div>
              <textarea
                value={html}
                onChange={e => setHtml(e.target.value)}
                rows={10}
                placeholder="<p>Your HTML email content here...</p>"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono focus:border-green-500 focus:outline-none resize-y"
              />
              <p className="mt-1 text-xs text-gray-400">
                Tip: Click &ldquo;Load template&rdquo; for a ready-made green-branded HTML email.
              </p>
            </div>

            {/* Test send */}
            <div className="rounded-xl bg-yellow-50 border border-yellow-100 p-4">
              <p className="text-xs font-bold text-yellow-800 mb-2">Send test email first</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-yellow-200 px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none"
                />
                <button
                  onClick={() => sendNewsletter(true)}
                  disabled={sending}
                  className="flex items-center gap-1.5 rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 disabled:opacity-50 transition"
                >
                  <Send size={13} /> {sending ? "Sending…" : "Send Test"}
                </button>
              </div>
            </div>

            {/* Result */}
            {sendResult && (
              <div className={`rounded-xl border p-4 text-sm ${sendResult.error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
                {sendResult.error ? (
                  <p className="flex items-center gap-2"><AlertCircle size={15} /> {sendResult.error}</p>
                ) : (
                  <p className="flex items-center gap-2">
                    <CheckCircle size={15} />
                    {sendResult.mode === "test"
                      ? "Test email sent successfully!"
                      : `Sent to ${sendResult.sent}/${sendResult.total} subscribers.${sendResult.failed > 0 ? ` (${sendResult.failed} failed)` : ""}`}
                  </p>
                )}
              </div>
            )}

            {/* Send to all */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Will send to <strong className="text-gray-700">{stats.active.toLocaleString()} active subscribers</strong>
              </p>
              <button
                onClick={() => {
                  if (!confirm(`Send to ALL ${stats.active} active subscribers? This cannot be undone.`)) return;
                  sendNewsletter(false);
                }}
                disabled={sending || stats.active === 0}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 transition"
              >
                <Send size={15} /> {sending ? "Sending…" : `Send to All (${stats.active})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscriber list */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900">Active Subscribers</h2>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
            {subscribers.length} loaded
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <RefreshCw size={28} className="mx-auto mb-2 animate-spin opacity-30" />
            <p className="text-sm">Loading subscribers…</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Mail size={36} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No active subscribers yet</p>
            <p className="text-sm mt-1">Subscribers appear here when users sign up via the newsletter form.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Source</th>
                  <th className="px-6 py-3 text-left">Joined</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscribers.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-800">{s.email}</td>
                    <td className="px-6 py-3 text-gray-500 capitalize">{s.source || "website"}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
