"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare, Phone, MapPin, Car, Search, RefreshCw,
  X, Send, UserCheck, Clock, CheckCircle, ChevronLeft,
  Zap, BellRing, Users, Trash2, Circle,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusherClient";

/* ── helpers ───────────────────────────────────────────────────────── */
const STATUS = {
  waiting: { label: "Waiting",  bg: "bg-orange-100 text-orange-700", dot: "bg-orange-400" },
  active:  { label: "Active",   bg: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  closed:  { label: "Closed",   bg: "bg-gray-100 text-gray-500",     dot: "bg-gray-400"  },
};

function timeAgo(date) {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

/* ── notification sound (Web Audio API — no file needed) ────────── */
function playSound(type = "chat") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "new") {
      // Two-tone chime for new visitor
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else {
      // Soft single beep for new message
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }
    osc.type = "sine";
  } catch {}
}

/* ── main component ────────────────────────────────────────────────── */
export default function LiveChatAdminPage() {
  const [sessions,       setSessions]       = useState([]);
  const [activeSession,  setActiveSession]  = useState(null);
  const [agents,         setAgents]         = useState([]);
  const [filter,         setFilter]         = useState("all");
  const [search,         setSearch]         = useState("");
  const [loading,        setLoading]        = useState(true);
  const [sending,        setSending]        = useState(false);
  const [msgInput,       setMsgInput]       = useState("");
  const [mobileView,     setMobileView]     = useState("list");
  const [currentUser,    setCurrentUser]    = useState(null);
  const [unreadMap,      setUnreadMap]      = useState({});
  const [soundOn,        setSoundOn]        = useState(true);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const soundOnRef = useRef(true);
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  /* load current admin user */
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setCurrentUser(d.user);
    }).catch(() => {});
  }, []);

  /* load agents list for assignment dropdown */
  useEffect(() => {
    fetch("/api/live-chat/agents").then(r => r.json()).then(d => {
      setAgents(d.agents || []);
    }).catch(() => {});
  }, []);

  /* fetch session list */
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const qs   = filter !== "all" ? `?status=${filter}` : "";
      const data = await fetch(`/api/live-chat/sessions${qs}`).then(r => r.json());
      setSessions(data.sessions || []);
    } catch {}
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  /* ── Pusher: admin-notifications channel ── */
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const ch = pusher.subscribe("admin-notifications");

    ch.bind("new-session", (data) => {
      setSessions(prev => {
        if (prev.find(s => s.sessionId === data.sessionId)) return prev;
        return [data, ...prev];
      });
      if (soundOnRef.current) playSound("new");
      /* browser notification if tab is in background */
      if (document.hidden && Notification.permission === "granted") {
        new Notification("EVRadar Live Chat", {
          body: `New visitor: ${data.userName || "Visitor"} is waiting`,
          icon: "/images/logo.png",
        });
      }
    });

    ch.bind("user-message", (data) => {
      setSessions(prev => prev.map(s =>
        s.sessionId === data.sessionId
          ? { ...s, lastMessageAt: data.timestamp }
          : s
      ));
      setUnreadMap(prev => ({
        ...prev,
        [data.sessionId]: (prev[data.sessionId] || 0) + 1,
      }));
      if (soundOnRef.current) playSound("chat");
    });

    return () => {
      ch.unbind_all();
      pusher.unsubscribe("admin-notifications");
    };
  }, [filter]);

  /* ── Pusher: per-session channel ── */
  useEffect(() => {
    if (!activeSession?.sessionId) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const name = `live-chat-${activeSession.sessionId}`;
    const ch   = pusher.subscribe(name);

    ch.bind("new-message", (msg) => {
      if (msg.role === "user") {
        setActiveSession(prev => prev
          ? { ...prev, messages: [...(prev.messages || []), { ...msg, _id: Date.now() }] }
          : prev
        );
        /* clear unread for this session since we're looking at it */
        setUnreadMap(prev => ({ ...prev, [activeSession.sessionId]: 0 }));
      }
    });

    ch.bind("session-updated", (data) => {
      setActiveSession(prev => prev ? { ...prev, ...data } : prev);
      setSessions(prev => prev.map(s =>
        s.sessionId === activeSession.sessionId ? { ...s, ...data } : s
      ));
    });

    return () => {
      ch.unbind_all();
      pusher.unsubscribe(name);
    };
  }, [activeSession?.sessionId]);

  /* auto-scroll on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  /* open a session — fetch full messages */
  const openSession = async (sessionId) => {
    setUnreadMap(prev => ({ ...prev, [sessionId]: 0 }));
    try {
      const data = await fetch(`/api/live-chat/session?sessionId=${sessionId}`).then(r => r.json());
      setActiveSession(data.session);
      setMobileView("chat");
      setTimeout(() => inputRef.current?.focus(), 120);
    } catch {}
  };

  /* send agent message */
  const sendMessage = async () => {
    if (!msgInput.trim() || !activeSession || sending) return;
    const content = msgInput.trim();
    setMsgInput("");
    setSending(true);

    /* optimistic UI update */
    const opt = {
      role:       "agent",
      content,
      senderName: currentUser?.name || "EV Expert",
      _id:        `opt-${Date.now()}`,
      createdAt:  new Date().toISOString(),
    };
    setActiveSession(prev => prev
      ? { ...prev, status: "active", messages: [...(prev.messages || []), opt] }
      : prev
    );
    setSessions(prev => prev.map(s =>
      s.sessionId === activeSession.sessionId ? { ...s, status: "active" } : s
    ));

    try {
      await fetch("/api/live-chat/message", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId:  activeSession.sessionId,
          role:       "agent",
          content,
          senderName: currentUser?.name || "EV Expert",
        }),
      });
    } catch {}
    setSending(false);
  };

  /* update session (status / assign) */
  const updateSession = async (id, update) => {
    try {
      const data = await fetch(`/api/live-chat/session/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(update),
      }).then(r => r.json());
      setActiveSession(data.session);
      setSessions(prev => prev.map(s => s._id === id ? { ...s, ...update } : s));
    } catch {}
  };

  /* delete session */
  const deleteSession = async (id, sessionId) => {
    if (!confirm("Delete this chat session?")) return;
    await fetch(`/api/live-chat/session/${id}`, { method: "DELETE" });
    setSessions(prev => prev.filter(s => s._id !== id));
    if (activeSession?._id === id) {
      setActiveSession(null);
      setMobileView("list");
    }
  };

  /* request browser notification permission on first load */
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const filtered = sessions.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.userName?.toLowerCase().includes(q)
      || s.userPhone?.includes(q)
      || s.userCity?.toLowerCase().includes(q)
      || s.interestedVehicle?.toLowerCase().includes(q);
  });

  const waitingCount = sessions.filter(s => s.status === "waiting").length;
  const activeCount  = sessions.filter(s => s.status === "active").length;

  /* ──────────────────── RENDER ─────────────────────────────────── */
  return (
    <div className="flex h-[calc(100vh-64px)] lg:h-screen overflow-hidden bg-gray-50">

      {/* ══ LEFT: Session List ══════════════════════════════════════ */}
      <div className={`flex flex-col ${mobileView === "chat" ? "hidden lg:flex" : "flex"}
        w-full lg:w-80 xl:w-96 shrink-0 border-r border-gray-200 bg-white`}>

        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-600 text-white">
              <MessageSquare size={16} />
            </div>
            <span className="font-bold text-gray-900">Live Chats</span>
            {waitingCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                {waitingCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundOn(p => !p)}
              title={soundOn ? "Mute notifications" : "Unmute notifications"}
              className={`rounded-lg p-1.5 transition ${soundOn ? "text-green-600 hover:bg-green-50" : "text-gray-300 hover:bg-gray-100"}`}
            >
              <BellRing size={14} />
            </button>
            <button onClick={fetchSessions} title="Refresh"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* stats bar */}
        <div className="flex border-b border-gray-100 divide-x divide-gray-100">
          {[
            { label: "Waiting", count: waitingCount, color: "text-orange-600 bg-orange-50", filter: "waiting" },
            { label: "Active",  count: activeCount,  color: "text-green-600 bg-green-50",   filter: "active"  },
          ].map(b => (
            <button key={b.filter} onClick={() => setFilter(b.filter === filter ? "all" : b.filter)}
              className={`flex-1 py-2 text-center transition ${filter === b.filter ? b.color : "hover:bg-gray-50"}`}>
              <p className="text-lg font-black text-gray-900">{b.count}</p>
              <p className="text-[10px] font-semibold text-gray-400">{b.label}</p>
            </button>
          ))}
        </div>

        {/* filter tabs */}
        <div className="flex border-b border-gray-100">
          {["all", "waiting", "active", "closed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-[11px] font-semibold capitalize transition ${
                filter === f
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* search */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <Search size={12} className="shrink-0 text-gray-400" />
            <input type="text" placeholder="Search name, phone, city…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400" />
          </div>
        </div>

        {/* session cards */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              <RefreshCw size={14} className="mr-2 animate-spin" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare size={36} className="mb-2 text-gray-200" />
              <p className="text-sm text-gray-500">No sessions yet</p>
              <p className="text-xs text-gray-400 mt-1">Sessions appear here when users click "Live Chat" in the chatbot</p>
            </div>
          ) : filtered.map(s => {
            const sc       = STATUS[s.status] || STATUS.waiting;
            const isActive = activeSession?.sessionId === s.sessionId;
            const unread   = unreadMap[s.sessionId] || 0;
            return (
              <button key={s._id || s.sessionId} onClick={() => openSession(s.sessionId)}
                className={`w-full px-4 py-3.5 text-left transition hover:bg-gray-50 ${
                  isActive ? "border-l-[3px] border-green-600 bg-green-50/50" : ""
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                      {s.userName?.[0]?.toUpperCase() || "V"}
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${sc.dot}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{s.userName || "Visitor"}</p>
                      {s.interestedVehicle ? (
                        <p className="truncate text-xs text-gray-400">{s.interestedVehicle}</p>
                      ) : s.userCity ? (
                        <p className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={9} /> {s.userCity}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="whitespace-nowrap text-[10px] text-gray-400">
                      {timeAgo(s.lastMessageAt || s.createdAt)}
                    </span>
                    {unread > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1 text-[9px] font-black text-white">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sc.bg}`}>
                    {sc.label}
                  </span>
                  {s.userPhone && (
                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                      <Phone size={8} /> {s.userPhone}
                    </span>
                  )}
                  {s.assignedToName && (
                    <span className="flex items-center gap-0.5 text-[10px] text-blue-500">
                      <UserCheck size={8} /> {s.assignedToName}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ RIGHT: Chat Panel ═══════════════════════════════════════ */}
      <div className={`flex flex-col flex-1 min-w-0 ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}>

        {/* ── Empty state ── */}
        {!activeSession ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100">
              <MessageSquare size={36} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Real-Time Live Chat</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
              Select a session from the left to start chatting. Visitors using "Live Chat" in the chatbot appear here instantly.
            </p>
            {waitingCount > 0 && (
              <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3">
                <BellRing size={18} className="text-orange-500" />
                <span className="text-sm font-semibold text-orange-700">
                  {waitingCount} visitor{waitingCount > 1 ? "s are" : " is"} waiting for a reply
                </span>
              </div>
            )}
            <div className="mt-8 max-w-md rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">How it works</p>
              <div className="space-y-2.5">
                {[
                  ["🤖", 'Visitor clicks "Live Chat" in the chatbot → fills quick form'],
                  ["🔔", "You get a real-time notification here + browser notification"],
                  ["💬", "Click the session → type your reply → press Enter to send"],
                  ["👥", "Assign to any agent using the dropdown in the chat header"],
                  ["✅", "Mark as closed when done — visitor sees a goodbye message"],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="text-base">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Chat header ── */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                {/* mobile back button */}
                <button onClick={() => { setMobileView("list"); setActiveSession(null); }}
                  className="mr-0.5 text-gray-400 hover:text-gray-600 lg:hidden">
                  <ChevronLeft size={20} />
                </button>

                {/* avatar */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                  activeSession.status === "waiting" ? "bg-orange-500"
                  : activeSession.status === "active" ? "bg-green-600"
                  : "bg-gray-400"
                }`}>
                  {activeSession.userName?.[0]?.toUpperCase() || "V"}
                </div>

                <div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">{activeSession.userName || "Visitor"}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    {activeSession.userPhone && (
                      <a href={`tel:${activeSession.userPhone}`}
                        className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                        <Phone size={10} /> {activeSession.userPhone}
                      </a>
                    )}
                    {activeSession.userCity && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={9} /> {activeSession.userCity}
                      </span>
                    )}
                    {activeSession.interestedVehicle && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Car size={9} /> {activeSession.interestedVehicle}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* right controls */}
              <div className="flex items-center gap-2">
                {/* status badge */}
                <span className={`hidden sm:inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[activeSession.status]?.bg}`}>
                  {STATUS[activeSession.status]?.label}
                </span>

                {/* assign agent */}
                <select
                  value={activeSession.assignedToId || ""}
                  onChange={e => {
                    const agent = agents.find(a => a._id === e.target.value);
                    updateSession(activeSession._id, {
                      assignedToId:   e.target.value,
                      assignedToName: agent?.name || "",
                    });
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-600 outline-none hover:border-green-400 transition cursor-pointer"
                >
                  <option value="">Assign Agent</option>
                  {agents.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>

                {/* close / reopen */}
                {activeSession.status !== "closed" ? (
                  <button onClick={() => updateSession(activeSession._id, { status: "closed" })}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition">
                    <X size={12} /> Close
                  </button>
                ) : (
                  <button onClick={() => updateSession(activeSession._id, { status: "active" })}
                    className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100 transition">
                    <CheckCircle size={12} /> Reopen
                  </button>
                )}

                {/* delete */}
                <button onClick={() => deleteSession(activeSession._id, activeSession.sessionId)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto bg-gray-50/70 p-4 space-y-2">
              {activeSession.status === "waiting" && (
                <div className="flex justify-center">
                  <span className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-medium text-orange-700">
                    <Clock size={12} className="animate-pulse" />
                    {activeSession.userName} is waiting for your reply
                  </span>
                </div>
              )}

              {(!activeSession.messages || activeSession.messages.length === 0) && (
                <div className="flex justify-center pt-8">
                  <p className="text-sm text-gray-400">No messages yet. Say hi 👋</p>
                </div>
              )}

              {activeSession.messages?.map((msg, i) => {
                const isAgent = msg.role === "agent";
                return (
                  <div key={msg._id || i} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      isAgent
                        ? "rounded-br-sm bg-green-600 text-white"
                        : "rounded-bl-sm bg-white border border-gray-200 text-gray-800"
                    }`}>
                      {isAgent && msg.senderName && (
                        <p className="mb-0.5 text-[10px] font-semibold text-green-200">{msg.senderName}</p>
                      )}
                      {!isAgent && (
                        <p className="mb-0.5 text-[10px] font-semibold text-gray-400">{activeSession.userName}</p>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.createdAt && (
                        <p className={`mt-1 text-[10px] ${isAgent ? "text-green-200" : "text-gray-400"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            {activeSession.status !== "closed" ? (
              <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    placeholder={`Reply to ${activeSession.userName}…`}
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }}
                    className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300 transition"
                    style={{ minHeight: "42px", maxHeight: "120px" }}
                  />
                  <button onClick={sendMessage} disabled={!msgInput.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition">
                    <Send size={16} />
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-gray-400">Enter to send · Shift+Enter for new line</p>
              </div>
            ) : (
              <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-3.5 text-center">
                <p className="text-sm text-gray-500">This chat session is closed.</p>
                <button onClick={() => updateSession(activeSession._id, { status: "active" })}
                  className="mt-2 text-xs text-green-600 underline hover:text-green-700">
                  Reopen chat
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
