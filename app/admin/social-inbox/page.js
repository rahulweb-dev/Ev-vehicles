"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, MessageCircle, MessageSquare, Send, Loader2, RefreshCw, ExternalLink, AlertCircle } from "lucide-react";

const ICON = { facebook: "📘", instagram: "📸" };
const ago = (d) => {
  const m = Math.round((Date.now() - new Date(d)) / 60000);
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

function ReplyBox({ onSend, placeholder }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function send(e) {
    e.preventDefault(); if (!text.trim()) return;
    setBusy(true); setErr("");
    const e2 = await onSend(text.trim());
    if (e2) setErr(e2); else setText("");
    setBusy(false);
  }
  return (
    <form onSubmit={send} className="mt-2">
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white" />
        <button disabled={busy} className="flex items-center gap-1 rounded-xl bg-gray-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}Reply</button>
      </div>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </form>
  );
}

export default function SocialInboxPage() {
  const [tab, setTab] = useState("messages");
  const [platform, setPlatform] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/social-inbox").then((r) => r.json()).then((d) => alive && setData(d)).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [reload]);
  const refresh = () => { setLoading(true); setReload((n) => n + 1); };

  async function reply(body) {
    const r = await fetch("/api/admin/social-inbox", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) return d.error || "Failed";
    refresh(); return "";
  }

  const list = (data?.[tab] || []).filter((x) => platform === "all" || x.platform === platform);
  const errs = Object.entries(data?.errors || {}).filter(([k, v]) => v && v !== "Instagram not connected" && (tab === "messages" ? k.endsWith("Messages") : k.endsWith("Comments")));
  const conv = tab === "messages" && open ? list.find((c) => c.id === open) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900"><Inbox size={22} />Social Inbox</h1>
          <p className="text-sm text-gray-500">Facebook Page and Instagram messages and comments in one place. Reply directly from here.</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700"><RefreshCw size={13} className={loading ? "animate-spin" : ""} />Refresh</button>
      </div>

      {data?.newEvents?.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <b>{data.newEvents.length} new since your last visit:</b>
          <ul className="mt-1 space-y-0.5 text-xs">{data.newEvents.slice(0, 5).map((e, i) => <li key={i}>{ICON[e.platform]} {e.kind}{e.sender ? ` from ${e.sender}` : ""}: {e.text?.slice(0, 100)}</li>)}</ul>
        </div>
      )}
      {data?.error && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{data.error} — <Link href="/admin/social-settings" className="font-bold underline">Social Settings</Link></p>}

      <div className="flex flex-wrap gap-2">
        {[["messages", "Messages", MessageCircle], ["comments", "Comments", MessageSquare]].map(([k, l, I]) => (
          <button key={k} onClick={() => { setTab(k); setOpen(null); }} className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold ${tab === k ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}><I size={13} />{l} ({(data?.[k] || []).length})</button>
        ))}
        <span className="mx-1 w-px bg-gray-200" />
        {["all", "facebook", "instagram"].map((p) => (
          <button key={p} onClick={() => setPlatform(p)} className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${platform === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>{p === "all" ? "All" : `${ICON[p]} ${p}`}</button>
        ))}
      </div>

      {errs.map(([k, v]) => <p key={k} className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs text-red-700"><AlertCircle size={13} className="mt-0.5 shrink-0" /><span><b>{k.startsWith("fb") ? "Facebook" : "Instagram"}:</b> {v}{/permission|scope|#10|#200/i.test(v) ? " — this permission hasn't been granted to the app yet." : ""}</span></p>)}

      {loading && !data ? <Loader2 className="animate-spin text-gray-400" /> : tab === "messages" ? (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white">
            {list.length === 0 ? <p className="p-5 text-sm text-gray-500">No conversations.</p> : list.map((c) => (
              <button key={c.id} onClick={() => setOpen(c.id)} className={`block w-full border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${open === c.id ? "bg-blue-50" : ""}`}>
                <div className="flex items-center justify-between text-sm"><span className="font-bold text-gray-900">{ICON[c.platform]} {c.customer.name}</span><span className="text-[11px] text-gray-400">{ago(c.updatedAt)}</span></div>
                <p className="mt-0.5 truncate text-xs text-gray-500">{c.messages[c.messages.length - 1]?.text || "…"}</p>
                {c.unread > 0 && <span className="mt-1 inline-block rounded-full bg-blue-600 px-2 text-[10px] font-bold text-white">{c.unread} new</span>}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            {!conv ? <p className="text-sm text-gray-500">Select a conversation.</p> : (
              <>
                <p className="mb-3 font-black text-gray-900">{ICON[conv.platform]} {conv.customer.name}</p>
                <div className="max-h-[52vh] space-y-2 overflow-y-auto">
                  {conv.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : ""}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.fromMe ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>{m.text}<p className={`mt-0.5 text-[10px] ${m.fromMe ? "text-blue-100" : "text-gray-400"}`}>{ago(m.at)}</p></div>
                    </div>
                  ))}
                </div>
                <ReplyBox placeholder={`Reply to ${conv.customer.name}…`} onSend={(text) => reply({ type: "message", platform: conv.platform, recipientId: conv.customer.id, text })} />
                <p className="mt-1 text-[11px] text-gray-400">Meta allows replies within 24 hours of the customer&apos;s last message.</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {list.length === 0 ? <p className="text-sm text-gray-500">No recent comments.</p> : list.map((c) => (
            <div key={c.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm"><span className="font-bold text-gray-900">{ICON[c.platform]} {c.author}</span><span className="text-[11px] text-gray-400">{ago(c.at)}</span></div>
              <p className="mt-1 text-sm text-gray-800">{c.text}</p>
              <a href={c.post.url} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-[11px] text-gray-400 hover:text-blue-600">On: {c.post.text || "post"}<ExternalLink size={10} /></a>
              {c.replies > 0 && <p className="mt-1 text-[11px] text-green-700">{c.replies} repl{c.replies === 1 ? "y" : "ies"}</p>}
              <ReplyBox placeholder="Write a public reply…" onSend={(text) => reply({ type: "comment", platform: c.platform, commentId: c.id, text })} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
