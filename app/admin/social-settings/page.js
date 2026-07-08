"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2, AlertCircle, Loader2, Save,
  Eye, EyeOff, ToggleLeft, ToggleRight, ExternalLink,
} from "lucide-react";

const PLATFORMS = [
  {
    id:    "facebook",
    label: "Facebook Page",
    emoji: "📘",
    color: "blue",
    docs:  "https://developers.facebook.com/docs/pages/",
    fields: [
      { key: "appId",       label: "App ID",              hint: "From Facebook Developer Portal" },
      { key: "appSecret",   label: "App Secret",          hint: "Keep this secret", secret: true },
      { key: "accessToken", label: "Page Access Token",   hint: "Long-lived Page Access Token", secret: true },
      { key: "pageId",      label: "Page ID",             hint: "Numeric ID of your Facebook Page" },
    ],
  },
  {
    id:    "linkedin",
    label: "LinkedIn Company Page",
    emoji: "💼",
    color: "sky",
    docs:  "https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api",
    fields: [
      { key: "clientId",     label: "Client ID",     hint: "From LinkedIn Developer App" },
      { key: "clientSecret", label: "Client Secret", hint: "Keep this secret", secret: true },
      { key: "accessToken",  label: "Access Token",  hint: "OAuth 2.0 access token", secret: true },
      { key: "companyUrn",   label: "Company URN",   hint: "e.g. 123456789 or urn:li:organization:123456789" },
    ],
  },
  {
    id:    "pinterest",
    label: "Pinterest Board",
    emoji: "📌",
    color: "red",
    docs:  "https://developers.pinterest.com/tools/oauth-token",
    fields: [
      { key: "accessToken", label: "Access Token", hint: "OAuth token — must have scopes: pins:read, pins:write, boards:read", secret: true },
      { key: "boardId",     label: "Board ID",     hint: "Numeric board ID (get from developers.pinterest.com/tools/oauth-token → GET /boards)" },
    ],
  },
  {
    id:    "telegram",
    label: "Telegram Channel",
    emoji: "✈️",
    color: "cyan",
    docs:  "https://core.telegram.org/bots/api",
    fields: [
      { key: "botToken",  label: "Bot Token",   hint: "Token from @BotFather", secret: true },
      { key: "channelId", label: "Channel ID",  hint: "@channelname or numeric chat ID" },
    ],
  },
];

const INPUT = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-mono";

function PlatformCard({ platform, serverData, onSave }) {
  const [enabled,   setEnabled]   = useState(serverData?.enabled ?? false);
  const [creds,     setCreds]     = useState(() => {
    const out = {};
    platform.fields.forEach(f => { out[f.key] = ""; });
    return out;
  });
  const [show,      setShow]      = useState({});
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function setField(key, val) {
    setCreds(prev => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/social-settings", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platform.id, enabled, credentials: creds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      // Reset fields after save so we don't show stale values
      const blank = {};
      platform.fields.forEach(f => { blank[f.key] = ""; });
      setCreds(blank);
      showToast("Settings saved!");
      onSave?.();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const colorMap = {
    blue: { ring: "ring-blue-200",   badge: "bg-blue-100 text-blue-700",   toggle: "text-blue-600" },
    sky:  { ring: "ring-sky-200",    badge: "bg-sky-100 text-sky-700",     toggle: "text-sky-600"  },
    red:  { ring: "ring-red-200",    badge: "bg-red-100 text-red-700",     toggle: "text-red-500"  },
    cyan: { ring: "ring-cyan-200",   badge: "bg-cyan-100 text-cyan-700",   toggle: "text-cyan-600" },
  };
  const c = colorMap[platform.color] || colorMap.blue;
  const isSet = serverData?.updatedAt;

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ring-2 ${enabled ? c.ring : "ring-transparent"} transition`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{platform.emoji}</span>
          <div>
            <p className="text-sm font-bold text-gray-900">{platform.label}</p>
            {isSet && (
              <p className="text-[10px] text-gray-400">
                Last updated: {new Date(serverData.updatedAt).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isSet && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.badge}`}>
              Configured
            </span>
          )}
          <button
            onClick={() => setEnabled(!enabled)}
            title={enabled ? "Disable" : "Enable"}
            className={`transition ${c.toggle}`}
          >
            {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-300" />}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mx-5 mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${toast.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {toast.type === "error" ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
          {toast.msg}
        </div>
      )}

      {/* Fields */}
      <div className="space-y-4 px-5 py-4">
        {platform.fields.map(({ key, label, hint, secret }) => (
          <div key={key} className="space-y-1">
            <label className="block text-xs font-semibold text-gray-600">{label}</label>
            <div className="relative">
              <input
                type={secret && !show[key] ? "password" : "text"}
                value={creds[key]}
                onChange={(e) => setField(key, e.target.value)}
                placeholder={
                  serverData?.credentials?.[key] === "••••••••"
                    ? "Already set — paste new value to update"
                    : hint
                }
                className={`${INPUT} ${secret ? "pr-9" : ""}`}
              />
              {secret && (
                <button
                  type="button"
                  onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {show[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400">{hint}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <a
          href={platform.docs}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
        >
          <ExternalLink size={11} /> API Docs
        </a>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-700 transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save {platform.label.split(" ")[0]} Settings
        </button>
      </div>
    </div>
  );
}

export default function SocialSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  async function fetchSettings() {
    try {
      const res  = await fetch("/api/admin/social-settings");
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { fetchSettings(); }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Social Media Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure credentials for each platform. Tokens are encrypted with AES-256 before being stored.
        </p>
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <strong>Security note:</strong> Add{" "}
          <code className="rounded bg-amber-100 px-1 font-mono">ENCRYPTION_KEY</code> (64-char hex) to your{" "}
          <code className="rounded bg-amber-100 px-1 font-mono">.env.local</code>.
          Generate with: <code className="rounded bg-amber-100 px-1 font-mono">openssl rand -hex 32</code>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Loading settings…
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {PLATFORMS.map((platform) => {
            const serverData = settings.find((s) => s.platform === platform.id);
            return (
              <PlatformCard
                key={platform.id}
                platform={platform}
                serverData={serverData}
                onSave={fetchSettings}
              />
            );
          })}
        </div>
      )}

      {/* Env variable guide */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Environment Variable Required</p>
        <code className="block rounded-lg border border-gray-200 bg-white p-3 font-mono text-xs text-gray-700">
          {`# .env.local\nENCRYPTION_KEY=your_64_char_hex_key_here`}
        </code>
        <p className="mt-2 text-[11px] text-gray-400">
          Generate once: <strong>openssl rand -hex 32</strong> — same key must be used across deployments.
        </p>
      </div>
    </div>
  );
}
