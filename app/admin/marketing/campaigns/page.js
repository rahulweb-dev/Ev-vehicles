"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Mail, Plus, Send, Trash2, Eye, ChevronLeft, Zap, Clock,
  CheckCircle2, XCircle, Loader2, Copy, MessageSquare,
  Megaphone, Newspaper, Tag, Star, Gift, AlertCircle,
  Users, ArrowRight, X, TestTube, Upload, FileText,
  ClipboardList, ChevronDown, UserCheck,
} from "lucide-react";

// ─── Email utilities ────────────────────────────────────────────────────────

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

function extractEmails(text) {
  const found = text.match(EMAIL_RE) || [];
  return [...new Set(found.map(e => e.toLowerCase()))];
}

async function parseFileEmails(file) {
  const name = file.name.toLowerCase();

  // CSV / TXT — read as text and regex-extract
  if (name.endsWith(".csv") || name.endsWith(".txt")) {
    const text = await file.text();
    return extractEmails(text);
  }

  // Excel — use xlsx (already installed)
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    try {
      const XLSX = (await import("xlsx")).default;
      const buf  = await file.arrayBuffer();
      const wb   = XLSX.read(buf, { type: "array" });
      let all    = "";
      wb.SheetNames.forEach(sn => {
        all += XLSX.utils.sheet_to_csv(wb.Sheets[sn]) + "\n";
      });
      return extractEmails(all);
    } catch {
      return [];
    }
  }

  return [];
}

// ─── Send Modal ─────────────────────────────────────────────────────────────

function SendModal({ campaign, subscriberCount, onClose, onSent, showToast }) {
  const [recipients,   setRecipients]   = useState("subscribers"); // subscribers | custom | both
  const [pasteText,    setPasteText]    = useState("");
  const [uploadEmails, setUploadEmails] = useState([]);
  const [uploading,    setUploading]    = useState(false);
  const [fileName,     setFileName]     = useState("");
  const [testEmail,    setTestEmail]    = useState("");
  const [testing,      setTesting]      = useState(false);
  const [sending,      setSending]      = useState(false);
  const fileRef = useRef();

  // merge pasted + uploaded emails
  const pastedEmails  = extractEmails(pasteText);
  const customEmails  = [...new Set([...uploadEmails, ...pastedEmails])];
  const customCount   = customEmails.length;

  const totalCount =
    recipients === "subscribers" ? subscriberCount :
    recipients === "custom"      ? customCount :
    subscriberCount + customCount;

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    const emails = await parseFileEmails(file);
    setUploadEmails(emails);
    setUploading(false);
    e.target.value = "";
  }

  async function handleTest() {
    if (!testEmail) return showToast("Enter a test email", "error");
    setTesting(true);
    try {
      const res  = await fetch(`/api/admin/marketing/campaigns/${campaign._id}/send`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ testEmail }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || "Test failed", "error");
      showToast(`Test sent to ${testEmail}`);
    } catch { showToast("Network error", "error"); }
    setTesting(false);
  }

  async function handleSend() {
    if (recipients !== "subscribers" && customCount === 0) {
      return showToast("No emails in your custom list", "error");
    }
    if (!confirm(`Send to ${totalCount.toLocaleString("en-IN")} recipient${totalCount !== 1 ? "s" : ""}?`)) return;
    setSending(true);
    try {
      const res  = await fetch(`/api/admin/marketing/campaigns/${campaign._id}/send`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ recipients, customEmails: recipients !== "subscribers" ? customEmails : [] }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || "Send failed", "error");
      showToast(`Sent to ${data.sent} recipients!`);
      onSent();
      onClose();
    } catch { showToast("Network error", "error"); }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-black text-gray-900">Send Campaign</h2>
            <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{campaign.name}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Recipient type selector */}
          <div>
            <p className="mb-2 text-xs font-bold text-gray-600 uppercase tracking-wide">Send To</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "subscribers", label: "Subscribers", icon: Users,        desc: `${subscriberCount} active` },
                { id: "custom",      label: "Custom List", icon: ClipboardList, desc: "Upload / Paste" },
                { id: "both",        label: "Both",        icon: UserCheck,     desc: "Merge all" },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setRecipients(opt.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition ${
                    recipients === opt.id
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <opt.icon size={18} className={recipients === opt.id ? "text-green-700" : "text-gray-400"} />
                  <span className={`text-xs font-bold ${recipients === opt.id ? "text-green-800" : "text-gray-700"}`}>{opt.label}</span>
                  <span className="text-[10px] text-gray-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom list input — shown when custom or both */}
          {recipients !== "subscribers" && (
            <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold text-gray-600">Upload Email List</p>

              {/* File upload */}
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden" onChange={handleFile} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-4 text-sm font-semibold text-gray-500 hover:border-green-400 hover:text-green-700 transition disabled:opacity-50"
              >
                {uploading
                  ? <><Loader2 size={16} className="animate-spin" /> Parsing file…</>
                  : <><Upload size={16} /> Upload CSV, Excel or TXT file</>
                }
              </button>

              {fileName && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-3 py-2">
                  <FileText size={14} className="text-green-700" />
                  <span className="text-xs font-semibold text-green-800 flex-1 truncate">{fileName}</span>
                  <span className="text-xs font-black text-green-700">{uploadEmails.length} emails found</span>
                </div>
              )}

              {/* Paste area */}
              <div>
                <p className="mb-1.5 text-xs font-semibold text-gray-500">Or paste emails (comma / newline separated)</p>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  placeholder={"email1@example.com, email2@example.com\nor one per line"}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs focus:border-green-500 focus:outline-none resize-none"
                />
              </div>

              {/* Email count summary */}
              <div className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-3 py-2">
                <span className="text-xs text-gray-500">Total unique emails detected</span>
                <span className="text-sm font-black text-green-700">{customCount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {/* Total recipients */}
          <div className="flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3">
            <span className="text-sm font-semibold text-gray-300">Total recipients</span>
            <span className="text-lg font-black text-white">{totalCount.toLocaleString("en-IN")}</span>
          </div>

          {/* Test send */}
          <div>
            <p className="mb-2 text-xs font-bold text-gray-600 uppercase tracking-wide">Send Test First</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-700 transition disabled:opacity-50"
              >
                {testing ? <Loader2 size={13} className="animate-spin" /> : <TestTube size={13} />}
                {testing ? "Sending…" : "Test"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || totalCount === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 py-2.5 text-sm font-bold text-white hover:bg-green-800 transition disabled:opacity-50"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {sending ? "Sending…" : `Send to ${totalCount.toLocaleString("en-IN")}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email templates ───────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id:    "newsletter",
    label: "Weekly Newsletter",
    icon:  Newspaper,
    color: "from-blue-500 to-blue-700",
    description: "Weekly EV news digest for subscribers",
    subject: "⚡ EV Radar Weekly – Top EV Stories This Week",
    previewText: "Your weekly roundup of electric vehicle news from India",
    html: (siteName = "EV Radar") => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Newsletter</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#15803d,#166534);border-radius:16px 16px 0 0;padding:32px;text-align:center">
    <p style="margin:0;color:#86efac;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Weekly Digest</p>
    <h1 style="margin:8px 0 4px;color:#fff;font-size:28px;font-weight:900;line-height:1.2">⚡ EV Radar Weekly</h1>
    <p style="margin:0;color:#bbf7d0;font-size:14px">Your top electric vehicle stories this week</p>
  </td></tr>
  <!-- Body -->
  <tr><td style="background:#fff;padding:32px">
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">Hi there 👋</p>
    <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">Here's your weekly roundup of the most important electric vehicle news from India and beyond.</p>

    <!-- Story 1 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <tr><td style="padding:20px">
        <span style="background:#dcfce7;color:#15803d;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase">🚗 Top Story</span>
        <h2 style="margin:12px 0 8px;color:#111827;font-size:18px;font-weight:800;line-height:1.3">Your headline here</h2>
        <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6">Add your article excerpt or summary here. Keep it concise and engaging — 2-3 sentences is ideal.</p>
        <a href="https://www.evradar.in/news" style="display:inline-block;background:#15803d;color:#fff;font-size:13px;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none">Read Full Story →</a>
      </td></tr>
    </table>

    <!-- Story 2 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <tr><td style="padding:20px">
        <span style="background:#fef3c7;color:#b45309;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase">🏍️ Bikes</span>
        <h2 style="margin:12px 0 8px;color:#111827;font-size:18px;font-weight:800;line-height:1.3">Second story headline</h2>
        <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6">Add your second story summary here. Keep readers engaged with the most relevant news.</p>
        <a href="https://www.evradar.in/news" style="display:inline-block;background:#15803d;color:#fff;font-size:13px;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none">Read More →</a>
      </td></tr>
    </table>

    <!-- CTA Banner -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:12px;overflow:hidden">
      <tr><td style="background:linear-gradient(135deg,#1e40af,#1d4ed8);padding:24px;text-align:center">
        <p style="margin:0 0 8px;color:#bfdbfe;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Compare EVs</p>
        <h3 style="margin:0 0 8px;color:#fff;font-size:20px;font-weight:800">Find Your Perfect Electric Vehicle</h3>
        <p style="margin:0 0 16px;color:#93c5fd;font-size:14px">Compare specs, prices, and range across all EVs in India</p>
        <a href="https://www.evradar.in/compare" style="display:inline-block;background:#fff;color:#1d4ed8;font-size:13px;font-weight:800;padding:12px 24px;border-radius:8px;text-decoration:none">Compare Now →</a>
      </td></tr>
    </table>

    <p style="margin:16px 0 0;color:#9ca3af;font-size:13px;text-align:center">Thanks for reading EV Radar — India's #1 electric vehicle news source.</p>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f9fafb;border-radius:0 0 16px 16px;padding:20px;text-align:center;border-top:1px solid #e5e7eb">
    <p style="margin:0 0 8px;color:#6b7280;font-size:12px">© 2026 ${siteName} · <a href="https://www.evradar.in" style="color:#15803d;text-decoration:none">evradar.in</a></p>
    <p style="margin:0;color:#9ca3af;font-size:11px">You're receiving this because you subscribed at evradar.in · <a href="https://www.evradar.in/unsubscribe" style="color:#9ca3af">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  },
  {
    id:    "launch",
    label: "New EV Launch",
    icon:  Zap,
    color: "from-green-500 to-green-700",
    description: "Announce a new electric vehicle launch",
    subject: "🚀 Just Launched: [Vehicle Name] is here! – EV Radar",
    previewText: "India's newest EV just dropped — check specs, price & range",
    html: () => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <!-- Hero -->
  <tr><td style="background:linear-gradient(135deg,#065f46,#047857);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50px;padding:8px 20px;margin-bottom:16px">
      <span style="color:#a7f3d0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">⚡ Just Launched</span>
    </div>
    <h1 style="margin:0 0 8px;color:#fff;font-size:36px;font-weight:900;line-height:1.1">[Vehicle Name]</h1>
    <p style="margin:0;color:#6ee7b7;font-size:16px">India's most awaited EV is finally here</p>
  </td></tr>

  <!-- Vehicle Image placeholder -->
  <tr><td style="background:#fff;padding:0">
    <div style="background:linear-gradient(180deg,#f0fdf4,#fff);height:200px;display:flex;align-items:center;justify-content:center;text-align:center;padding:32px">
      <div>
        <div style="font-size:64px;margin-bottom:8px">🚗</div>
        <p style="margin:0;color:#9ca3af;font-size:13px">Add vehicle image URL in the HTML</p>
      </div>
    </div>
  </td></tr>

  <!-- Specs grid -->
  <tr><td style="background:#fff;padding:24px 32px">
    <h2 style="margin:0 0 20px;color:#111827;font-size:20px;font-weight:800;text-align:center">Key Specifications</h2>
    <table width="100%" cellpadding="0" cellspacing="8">
      <tr>
        <td width="48%" style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;border:1px solid #bbf7d0">
          <p style="margin:0 0 4px;color:#15803d;font-size:22px;font-weight:900">XXX km</p>
          <p style="margin:0;color:#6b7280;font-size:12px;font-weight:600">Range</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background:#eff6ff;border-radius:12px;padding:16px;text-align:center;border:1px solid #bfdbfe">
          <p style="margin:0 0 4px;color:#1d4ed8;font-size:22px;font-weight:900">₹XX L</p>
          <p style="margin:0;color:#6b7280;font-size:12px;font-weight:600">Starting Price</p>
        </td>
      </tr>
      <tr><td colspan="3" style="padding:4px"></td></tr>
      <tr>
        <td width="48%" style="background:#fff7ed;border-radius:12px;padding:16px;text-align:center;border:1px solid #fed7aa">
          <p style="margin:0 0 4px;color:#c2410c;font-size:22px;font-weight:900">XX kWh</p>
          <p style="margin:0;color:#6b7280;font-size:12px;font-weight:600">Battery</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background:#fdf4ff;border-radius:12px;padding:16px;text-align:center;border:1px solid #e9d5ff">
          <p style="margin:0 0 4px;color:#7c3aed;font-size:22px;font-weight:900">XX min</p>
          <p style="margin:0;color:#6b7280;font-size:12px;font-weight:600">Fast Charge</p>
        </td>
      </tr>
    </table>

    <div style="margin:24px 0;text-align:center">
      <a href="https://www.evradar.in/cars" style="display:inline-block;background:linear-gradient(135deg,#15803d,#166534);color:#fff;font-size:15px;font-weight:800;padding:14px 32px;border-radius:10px;text-decoration:none">See Full Specs & Price →</a>
    </div>

    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center">Available at leading dealerships across India</p>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f9fafb;border-radius:0 0 16px 16px;padding:20px;text-align:center;border-top:1px solid #e5e7eb">
    <p style="margin:0 0 8px;color:#6b7280;font-size:12px">© 2026 EV Radar · <a href="https://www.evradar.in" style="color:#15803d;text-decoration:none">evradar.in</a></p>
    <p style="margin:0;color:#9ca3af;font-size:11px"><a href="https://www.evradar.in/unsubscribe" style="color:#9ca3af">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  },
  {
    id:    "breaking",
    label: "Breaking News",
    icon:  AlertCircle,
    color: "from-red-500 to-red-700",
    description: "Urgent breaking EV news alert",
    subject: "🚨 Breaking: [News Headline] – EV Radar",
    previewText: "Important EV news you need to know right now",
    html: () => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <!-- Breaking header -->
  <tr><td style="background:#dc2626;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.2);border-radius:50px;padding:6px 16px;margin-bottom:12px">
      <span style="width:8px;height:8px;background:#fca5a5;border-radius:50%;display:inline-block"></span>
      <span style="color:#fff;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase">Breaking News</span>
    </div>
    <h1 style="margin:0 0 8px;color:#fff;font-size:28px;font-weight:900;line-height:1.2">Your Breaking Headline Here</h1>
    <p style="margin:0;color:#fca5a5;font-size:13px">Just reported · EV Radar India</p>
  </td></tr>
  <!-- Content -->
  <tr><td style="background:#fff;padding:32px">
    <div style="border-left:4px solid #dc2626;padding:0 0 0 16px;margin-bottom:24px">
      <p style="margin:0;color:#374151;font-size:16px;font-weight:700;line-height:1.5">Add your lead paragraph here — the most important fact first. Keep it punchy and factual.</p>
    </div>
    <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.7">Continue with additional context and details here. Explain why this matters to EV buyers and enthusiasts in India. Include any official quotes or data points.</p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.7">Add more paragraphs as needed. Be clear, factual, and link to your full article for readers who want the complete story.</p>
    <div style="text-align:center">
      <a href="https://www.evradar.in/news" style="display:inline-block;background:#dc2626;color:#fff;font-size:15px;font-weight:800;padding:14px 32px;border-radius:10px;text-decoration:none">Read Full Story →</a>
    </div>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f9fafb;border-radius:0 0 16px 16px;padding:20px;text-align:center;border-top:1px solid #e5e7eb">
    <p style="margin:0 0 8px;color:#6b7280;font-size:12px">© 2026 EV Radar · <a href="https://www.evradar.in" style="color:#15803d;text-decoration:none">evradar.in</a></p>
    <p style="margin:0;color:#9ca3af;font-size:11px"><a href="https://www.evradar.in/unsubscribe" style="color:#9ca3af">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  },
  {
    id:    "price",
    label: "Price Update",
    icon:  Tag,
    color: "from-amber-500 to-orange-600",
    description: "EV price change announcement",
    subject: "💰 Price Update: [Vehicle] now at ₹[Price] – EV Radar",
    previewText: "Big price news for EV buyers in India",
    html: () => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#b45309,#92400e);border-radius:16px 16px 0 0;padding:32px;text-align:center">
    <span style="background:rgba(255,255,255,0.2);color:#fde68a;font-size:11px;font-weight:800;padding:6px 16px;border-radius:50px;letter-spacing:1px;text-transform:uppercase">💰 Price Update</span>
    <h1 style="margin:16px 0 8px;color:#fff;font-size:28px;font-weight:900">[Vehicle Name]</h1>
    <p style="margin:0;color:#fde68a;font-size:15px">Price just changed — here's what it means for you</p>
  </td></tr>
  <!-- Price comparison -->
  <tr><td style="background:#fff;padding:32px">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="text-align:center;padding:20px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb">
          <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;font-weight:600;text-decoration:line-through">OLD PRICE</p>
          <p style="margin:0;color:#6b7280;font-size:24px;font-weight:900;text-decoration:line-through">₹XX Lakh</p>
        </td>
        <td style="text-align:center;padding:0 16px;font-size:24px;color:#d97706">→</td>
        <td style="text-align:center;padding:20px;background:#f0fdf4;border-radius:12px;border:2px solid #15803d">
          <p style="margin:0 0 4px;color:#15803d;font-size:12px;font-weight:700">NEW PRICE</p>
          <p style="margin:0;color:#15803d;font-size:28px;font-weight:900">₹XX Lakh</p>
        </td>
      </tr>
    </table>

    <div style="background:#fef3c7;border-radius:12px;padding:16px;margin-bottom:24px;border-left:4px solid #f59e0b">
      <p style="margin:0;color:#92400e;font-size:14px;font-weight:600">💡 What this means: Add context about the price change — is it a hike or a cut? What caused it? How does it compare to competitors?</p>
    </div>

    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.7">Add more details about the variant-wise pricing, available colors, booking process, and delivery timelines here.</p>

    <div style="text-align:center">
      <a href="https://www.evradar.in/cars" style="display:inline-block;background:linear-gradient(135deg,#b45309,#92400e);color:#fff;font-size:15px;font-weight:800;padding:14px 32px;border-radius:10px;text-decoration:none">View Full Price List →</a>
    </div>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f9fafb;border-radius:0 0 16px 16px;padding:20px;text-align:center;border-top:1px solid #e5e7eb">
    <p style="margin:0 0 8px;color:#6b7280;font-size:12px">© 2026 EV Radar · <a href="https://www.evradar.in" style="color:#15803d;text-decoration:none">evradar.in</a></p>
    <p style="margin:0;color:#9ca3af;font-size:11px"><a href="https://www.evradar.in/unsubscribe" style="color:#9ca3af">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  },
  {
    id:    "offer",
    label: "Special Offer",
    icon:  Gift,
    color: "from-violet-500 to-purple-700",
    description: "Promotion, subsidy or deal announcement",
    subject: "🎁 Special Offer: [Offer Details] – EV Radar",
    previewText: "Don't miss this limited-time EV deal",
    html: () => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#6d28d9,#4c1d95);border-radius:16px 16px 0 0;padding:32px;text-align:center">
    <div style="font-size:48px;margin-bottom:12px">🎁</div>
    <span style="background:rgba(255,255,255,0.2);color:#ddd6fe;font-size:11px;font-weight:800;padding:6px 16px;border-radius:50px;letter-spacing:1px;text-transform:uppercase">Limited Time Offer</span>
    <h1 style="margin:16px 0 8px;color:#fff;font-size:30px;font-weight:900">Your Offer Headline</h1>
    <p style="margin:0;color:#c4b5fd;font-size:14px">Valid until [Date] · Limited period</p>
  </td></tr>
  <!-- Offer details -->
  <tr><td style="background:#fff;padding:32px">
    <!-- Big highlight box -->
    <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;border:2px solid #c4b5fd">
      <p style="margin:0 0 8px;color:#7c3aed;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px">You Save</p>
      <p style="margin:0 0 4px;color:#4c1d95;font-size:40px;font-weight:900">₹XX,000</p>
      <p style="margin:0;color:#7c3aed;font-size:14px">on your EV purchase</p>
    </div>

    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7">Describe the offer in detail here. What's included, who it's for, how to avail it, and any terms & conditions.</p>

    <!-- Benefits list -->
    <div style="margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f3f4f6">
        <span style="font-size:18px">✅</span>
        <span style="color:#374151;font-size:14px;font-weight:600">Benefit or feature 1</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f3f4f6">
        <span style="font-size:18px">✅</span>
        <span style="color:#374151;font-size:14px;font-weight:600">Benefit or feature 2</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0">
        <span style="font-size:18px">✅</span>
        <span style="color:#374151;font-size:14px;font-weight:600">Benefit or feature 3</span>
      </div>
    </div>

    <div style="text-align:center">
      <a href="https://www.evradar.in" style="display:inline-block;background:linear-gradient(135deg,#6d28d9,#4c1d95);color:#fff;font-size:15px;font-weight:800;padding:14px 32px;border-radius:10px;text-decoration:none">Claim Offer Now →</a>
    </div>
    <p style="margin:16px 0 0;color:#9ca3af;font-size:11px;text-align:center">*Terms and conditions apply. Limited period offer.</p>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f9fafb;border-radius:0 0 16px 16px;padding:20px;text-align:center;border-top:1px solid #e5e7eb">
    <p style="margin:0 0 8px;color:#6b7280;font-size:12px">© 2026 EV Radar · <a href="https://www.evradar.in" style="color:#15803d;text-decoration:none">evradar.in</a></p>
    <p style="margin:0;color:#9ca3af;font-size:11px"><a href="https://www.evradar.in/unsubscribe" style="color:#9ca3af">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    draft:   { label: "Draft",   cls: "bg-gray-100 text-gray-600",   icon: Clock },
    sending: { label: "Sending", cls: "bg-blue-100 text-blue-700",   icon: Loader2 },
    sent:    { label: "Sent",    cls: "bg-green-100 text-green-700", icon: CheckCircle2 },
    failed:  { label: "Failed",  cls: "bg-red-100 text-red-600",     icon: XCircle },
  };
  const { label, cls, icon: Icon } = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>
      <Icon size={10} className={status === "sending" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [campaigns, setCampaigns]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [view, setView]               = useState("list"); // list | picker | compose
  const [selectedTpl, setSelectedTpl] = useState(null);
  const [form, setForm]               = useState({ name: "", subject: "", previewText: "", html: "" });
  const [saving, setSaving]           = useState(false);
  const [sendModal, setSendModal]     = useState(null); // campaign object or null
  const [previewId, setPreviewId]     = useState(null);
  const [toast, setToast]             = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [tab, setTab]                 = useState("email"); // email | whatsapp

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [campRes, subRes] = await Promise.all([
        fetch("/api/admin/marketing/campaigns"),
        fetch("/api/subscribe?limit=1"),
      ]);
      const campData = await campRes.json();
      const subData  = await subRes.json();
      setCampaigns(campData.campaigns || []);
      setSubscriberCount(subData.total || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function pickTemplate(tpl) {
    const html = tpl.html();
    setSelectedTpl(tpl);
    setForm({ name: `${tpl.label} – ${new Date().toLocaleDateString("en-IN")}`, subject: tpl.subject, previewText: tpl.previewText, html });
    setView("compose");
  }

  async function saveDraft() {
    if (!form.name || !form.subject || !form.html) return showToast("Name, subject and content required", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, template: selectedTpl?.id || "custom" }),
      });
      if (!res.ok) throw new Error();
      showToast("Campaign saved as draft");
      await load();
      setView("list");
    } catch { showToast("Failed to save campaign", "error"); }
    setSaving(false);
  }


  async function deleteCampaign(id) {
    setDeleteId(null);
    try {
      await fetch(`/api/admin/marketing/campaigns/${id}`, { method: "DELETE" });
      showToast("Campaign deleted");
      setCampaigns(p => p.filter(c => c._id !== id));
    } catch { showToast("Delete failed", "error"); }
  }

  // ── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-8 lg:pt-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl text-sm font-semibold transition-all ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-900 text-white"
        }`}>
          {toast.type === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Send modal */}
      {sendModal && (
        <SendModal
          campaign={sendModal}
          subscriberCount={subscriberCount}
          onClose={() => setSendModal(null)}
          onSent={load}
          showToast={showToast}
        />
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <Trash2 size={32} className="mb-3 text-red-500" />
            <h3 className="mb-1 text-lg font-black text-gray-900">Delete Campaign?</h3>
            <p className="mb-5 text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => deleteCampaign(deleteId)} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewId && (() => {
        const c = campaigns.find(x => x._id === previewId);
        if (!c) return null;
        return (
          <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm">
            <div className="flex items-center justify-between bg-white px-6 py-3 shadow-sm">
              <div>
                <p className="text-xs text-gray-400">Preview · {c.subject}</p>
                <h3 className="font-bold text-gray-900">{c.name}</h3>
              </div>
              <button onClick={() => setPreviewId(null)} className="rounded-xl p-2 hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <div className="mx-auto max-w-2xl">
                <iframe srcDoc={c.html} className="w-full rounded-2xl shadow-xl bg-white" style={{ minHeight: "700px", border: "none" }} title="Email preview" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── LIST VIEW ─────────────────────────────────────────────────── */}
      {view === "list" && (
        <>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Marketing Campaigns</h1>
              <p className="mt-0.5 text-sm text-gray-500">Send email campaigns to your subscribers</p>
            </div>
            <button
              onClick={() => setView("picker")}
              className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 transition shadow-sm"
            >
              <Plus size={16} /> New Campaign
            </button>
          </div>

          {/* Channel tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setTab("email")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                tab === "email" ? "bg-green-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"
              }`}
            >
              <Mail size={15} /> Email
            </button>
            <button
              onClick={() => setTab("whatsapp")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                tab === "whatsapp" ? "bg-green-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"
              }`}
            >
              <MessageSquare size={15} /> WhatsApp
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">Soon</span>
            </button>
          </div>

          {/* WhatsApp coming soon */}
          {tab === "whatsapp" && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-200 bg-green-50 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                <MessageSquare size={30} className="text-green-600" />
              </div>
              <h2 className="mb-2 text-xl font-black text-gray-900">WhatsApp Campaigns</h2>
              <p className="mb-1 text-sm text-gray-500">Send bulk WhatsApp messages to your leads and subscribers</p>
              <p className="mb-4 text-xs text-gray-400">Integrated with WhatsApp Business API</p>
              <span className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-black text-amber-700">Coming Soon</span>
            </div>
          )}

          {/* Email campaigns list */}
          {tab === "email" && (
            <>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="animate-pulse h-24 rounded-2xl bg-gray-200" />)}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
                  <Megaphone size={36} className="mb-3 text-gray-300" />
                  <h2 className="mb-1 text-lg font-bold text-gray-700">No campaigns yet</h2>
                  <p className="mb-4 text-sm text-gray-400">Create your first email campaign to engage subscribers</p>
                  <button onClick={() => setView("picker")}
                    className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800">
                    <Plus size={14} /> Create Campaign
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(c => (
                    <div key={c._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-green-200">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100">
                          <Mail size={20} className="text-green-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 truncate">{c.name}</h3>
                            <StatusBadge status={c.status} />
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500 truncate">{c.subject}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                            <span>Created {fmt(c.createdAt)}</span>
                            {c.sentAt && <span className="flex items-center gap-1"><Send size={10} /> Sent {fmt(c.sentAt)}</span>}
                            {c.status === "sent" && (
                              <span className="flex items-center gap-1 text-green-600 font-semibold">
                                <Users size={10} /> {c.sentCount} sent · {c.failedCount} failed
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => setPreviewId(c._id)} title="Preview"
                            className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition">
                            <Eye size={16} />
                          </button>
                          {c.status === "draft" && (
                            <button
                              onClick={() => setSendModal(c)}
                              className="flex items-center gap-1.5 rounded-xl bg-green-700 px-3 py-2 text-xs font-bold text-white hover:bg-green-800 transition"
                            >
                              <Send size={13} /> Send
                            </button>
                          )}
                          <button onClick={() => setDeleteId(c._id)} title="Delete"
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── TEMPLATE PICKER ────────────────────────────────────────────── */}
      {view === "picker" && (
        <div>
          <div className="mb-6 flex items-center gap-3">
            <button onClick={() => setView("list")} className="rounded-xl p-2 hover:bg-gray-200 transition"><ChevronLeft size={20} /></button>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Choose a Template</h1>
              <p className="text-sm text-gray-500">Pick a starting point for your email campaign</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map(tpl => {
              const Icon = tpl.icon;
              return (
                <button
                  key={tpl.id}
                  onClick={() => pickTemplate(tpl)}
                  className="group text-left rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-green-400 hover:shadow-lg transition"
                >
                  <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${tpl.color}`}>
                    <Icon size={40} className="text-white/80 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 font-bold text-gray-900">{tpl.label}</h3>
                    <p className="text-xs text-gray-500">{tpl.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-green-700 group-hover:gap-2 transition-all">
                      Use template <ArrowRight size={12} />
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Custom / blank */}
            <button
              onClick={() => {
                setSelectedTpl(null);
                setForm({ name: `Custom Campaign – ${new Date().toLocaleDateString("en-IN")}`, subject: "", previewText: "", html: "" });
                setView("compose");
              }}
              className="group text-left rounded-2xl border-2 border-dashed border-gray-200 bg-white overflow-hidden hover:border-green-400 hover:shadow-md transition"
            >
              <div className="flex h-32 items-center justify-center bg-gray-50">
                <Plus size={32} className="text-gray-300 group-hover:text-green-500 group-hover:scale-110 transition" />
              </div>
              <div className="p-4">
                <h3 className="mb-1 font-bold text-gray-900">Blank / Custom</h3>
                <p className="text-xs text-gray-500">Start from scratch with your own HTML</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-green-700 group-hover:gap-2 transition-all">
                  Start blank <ArrowRight size={12} />
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── COMPOSE VIEW ──────────────────────────────────────────────── */}
      {view === "compose" && (
        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setView("picker")} className="rounded-xl p-2 hover:bg-gray-200 transition"><ChevronLeft size={20} /></button>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Compose Campaign</h1>
                {selectedTpl && <p className="text-sm text-gray-500">Template: {selectedTpl.label}</p>}
              </div>
            </div>
            <button
              onClick={saveDraft}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-800 transition disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {saving ? "Saving…" : "Save Draft"}
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left — fields */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-bold text-gray-800">Campaign Details</h2>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Campaign Name *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. July Newsletter 2026"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Email Subject *</label>
                    <input
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="e.g. ⚡ Top EV Stories This Week"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-200"
                    />
                    <p className="mt-1 text-right text-[10px] text-gray-400">{form.subject.length}/60 chars</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Preview Text</label>
                    <input
                      value={form.previewText}
                      onChange={e => setForm(f => ({ ...f, previewText: e.target.value }))}
                      placeholder="Shown in inbox before opening"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-200"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">Email HTML *</h2>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(form.html);
                      showToast("HTML copied to clipboard");
                    }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <textarea
                  value={form.html}
                  onChange={e => setForm(f => ({ ...f, html: e.target.value }))}
                  placeholder="Paste your email HTML here, or edit the template above…"
                  rows={18}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-xs leading-relaxed focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-200"
                />
                <p className="mt-1 text-[10px] text-gray-400">Edit the HTML directly. Use the preview panel on the right to see changes live.</p>
              </div>
            </div>

            {/* Right — live preview */}
            <div className="sticky top-6 self-start">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3">
                  <Eye size={15} className="text-gray-400" />
                  <span className="font-bold text-gray-800 text-sm">Live Preview</span>
                  <span className="ml-auto text-[10px] text-gray-400">Updates as you type</span>
                </div>
                <div className="p-3 bg-gray-100">
                  {form.html ? (
                    <iframe
                      srcDoc={form.html}
                      className="w-full rounded-xl bg-white shadow"
                      style={{ minHeight: "600px", border: "none" }}
                      title="Email preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center py-24 text-center text-gray-400">
                      <div>
                        <Mail size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Your email preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
                  Subject: <span className="font-semibold text-gray-700">{form.subject || "(no subject)"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
