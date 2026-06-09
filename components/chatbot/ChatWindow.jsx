"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, ChevronRight, Zap, ExternalLink, RotateCcw } from "lucide-react";
import Link from "next/link";

/* ─── Conversation Flow Tree ─────────────────────────────────────── */
const FLOW = {
  welcome: {
    bot: [
      "👋 Hello! Welcome to **EVRadar India**",
      "India's #1 Electric Vehicle Platform 🚗⚡\n\nPlease select an option below:",
    ],
    options: [
      { label: "🚗 Buy Electric Car",     next: "buy_car" },
      { label: "🏍 Buy Electric Bike",    next: "buy_bike" },
      { label: "⚡ Compare EVs",           next: "compare_info" },
      { label: "📰 Latest EV News",       next: "news_info" },
      { label: "🔋 Charging & Battery",   next: "charging" },
      { label: "🎁 EV Subsidies & EMI",   next: "subsidies" },
      { label: "📞 Talk to EV Expert",    next: "lead" },
    ],
  },

  buy_car: {
    bot: ["Great choice! 🚗 Let's find the perfect electric car for you.", "What's your budget?"],
    options: [
      { label: "Under ₹10 lakh",   next: "car_u10" },
      { label: "₹10 – 15 lakh",   next: "car_10_15" },
      { label: "₹15 – 25 lakh",   next: "car_15_25" },
      { label: "Above ₹25 lakh",  next: "car_above25" },
      { label: "⬅ Main Menu",     next: "welcome" },
    ],
  },

  car_u10: {
    bot: [
      "🚗 **Best EVs under ₹10 lakh:**\n\n• **Tata Tiago EV** — from ₹8.49 lakh | Range: 315 km\n• **MG Comet EV** — from ₹6.99 lakh | Range: 230 km\n• **Citroen eC3** — from ₹9.7 lakh | Range: 316 km\n\nAll prices are approximate ex-showroom. Subsidy applicable.",
    ],
    link: { label: "Browse All Electric Cars →", href: "/cars" },
    options: [
      { label: "📞 Book Test Drive",  next: "lead" },
      { label: "⚡ Compare These",    next: "compare_info" },
      { label: "⬅ Change Budget",    next: "buy_car" },
    ],
  },

  car_10_15: {
    bot: [
      "🚗 **Best EVs in ₹10–15 lakh range:**\n\n• **Tata Punch EV** — from ₹10.99 lakh | Range: 421 km\n• **MG Windsor EV** — from ₹13.5 lakh | Range: 331 km\n• **Tata Nexon EV** — from ₹14.49 lakh | Range: 465 km",
    ],
    link: { label: "Browse All Electric Cars →", href: "/cars" },
    options: [
      { label: "📞 Book Test Drive",  next: "lead" },
      { label: "⚡ Compare These",    next: "compare_info" },
      { label: "⬅ Change Budget",    next: "buy_car" },
    ],
  },

  car_15_25: {
    bot: [
      "🚗 **Top EVs in ₹15–25 lakh range:**\n\n• **Tata Harrier EV** — from ₹21.49 lakh | Range: 538 km\n• **Hyundai Creta EV** — from ₹17.99 lakh | Range: 473 km\n• **Mahindra BE6** — from ₹18.9 lakh | Range: 682 km\n• **Nexon EV (top trim)** — ₹19.99 lakh | Range: 465 km",
    ],
    link: { label: "Browse All Electric Cars →", href: "/cars" },
    options: [
      { label: "📞 Book Test Drive",  next: "lead" },
      { label: "⚡ Compare These",    next: "compare_info" },
      { label: "⬅ Change Budget",    next: "buy_car" },
    ],
  },

  car_above25: {
    bot: [
      "🚗 **Premium EVs above ₹25 lakh:**\n\n• **Tata Curvv EV** — from ₹17.49 lakh | Range: 502 km\n• **Hyundai IONIQ 5** — from ₹46.05 lakh | Range: 631 km\n• **Kia EV6** — from ₹60.95 lakh | Range: 708 km\n• **BMW iX1** — from ₹66.9 lakh | Range: 440 km\n• **Mercedes EQS** — from ₹1.55 crore | Range: 857 km",
    ],
    link: { label: "Browse All Electric Cars →", href: "/cars" },
    options: [
      { label: "📞 Book Test Drive",  next: "lead" },
      { label: "⚡ Compare These",    next: "compare_info" },
      { label: "⬅ Change Budget",    next: "buy_car" },
    ],
  },

  buy_bike: {
    bot: ["🏍 Let's find the perfect electric bike for you!", "What's your budget?"],
    options: [
      { label: "Under ₹1 lakh",          next: "bike_u1" },
      { label: "₹1 lakh – ₹1.5 lakh",   next: "bike_1_1_5" },
      { label: "Above ₹1.5 lakh",        next: "bike_above1_5" },
      { label: "⬅ Main Menu",            next: "welcome" },
    ],
  },

  bike_u1: {
    bot: [
      "🏍 **Best Electric Scooters under ₹1 lakh:**\n\n• **Ola S1 Air** — ₹84,999 | Range: 101 km\n• **Bajaj Chetak** — ₹95,998 | Range: 126 km\n• **TVS iQube ST** — ₹94,434 | Range: 100 km\n• **Ather 450S** — ₹97,000 | Range: 115 km",
    ],
    link: { label: "Browse All Electric Bikes →", href: "/bikes" },
    options: [
      { label: "📞 Book Test Ride",    next: "lead" },
      { label: "⬅ Change Budget",     next: "buy_bike" },
    ],
  },

  bike_1_1_5: {
    bot: [
      "🏍 **Best Electric Bikes in ₹1–1.5 lakh:**\n\n• **Ola S1 Pro** — ₹1.29 lakh | Range: 195 km\n• **Ather 450X** — ₹1.2 lakh | Range: 150 km\n• **TVS iQube** — ₹1.06 lakh | Range: 140 km\n• **Vida V1** (Hero) — ₹1.09 lakh | Range: 143 km",
    ],
    link: { label: "Browse All Electric Bikes →", href: "/bikes" },
    options: [
      { label: "📞 Book Test Ride",    next: "lead" },
      { label: "⬅ Change Budget",     next: "buy_bike" },
    ],
  },

  bike_above1_5: {
    bot: [
      "🏍 **Premium Electric Bikes above ₹1.5 lakh:**\n\n• **Ultraviolette F77** — ₹3.8 lakh | Range: 323 km\n• **Tork Kratos R** — ₹1.84 lakh | Range: 180 km\n• **Revolt RV400** — ₹1.53 lakh | Range: 150 km\n• **Matter Aera** — ₹1.44 lakh | Range: 125 km",
    ],
    link: { label: "Browse All Electric Bikes →", href: "/bikes" },
    options: [
      { label: "📞 Book Test Ride",    next: "lead" },
      { label: "⬅ Change Budget",     next: "buy_bike" },
    ],
  },

  compare_info: {
    bot: [
      "⚡ Compare any two EVs side by side — price, range, battery, specs, features, pros & cons!",
    ],
    link: { label: "Open EV Compare Tool →", href: "/compare" },
    options: [
      { label: "📞 Need Help Choosing?",  next: "lead" },
      { label: "⬅ Main Menu",            next: "welcome" },
    ],
  },

  news_info: {
    bot: ["📰 Stay updated with India's latest EV news, launches and reviews!"],
    link: { label: "Read Latest EV News →", href: "/news" },
    options: [
      { label: "🚗 Car Launches",      next: "news_cars" },
      { label: "🏍 Bike Launches",     next: "news_bikes" },
      { label: "🏛 Policy Updates",    next: "subsidies" },
      { label: "⬅ Main Menu",         next: "welcome" },
    ],
  },

  news_cars: {
    bot: [
      "🚗 **Latest EV Car News on EVRadar:**\n\nCovers Tata, Mahindra, Hyundai, Kia, BYD, BMW, Mercedes and more — launches, reviews, price updates and first drives.",
    ],
    link: { label: "Read Latest Car News →", href: "/news" },
    options: [
      { label: "🏍 Bike News",      next: "news_bikes" },
      { label: "⬅ Back",           next: "news_info" },
    ],
  },

  news_bikes: {
    bot: [
      "🏍 **Latest EV Bike News on EVRadar:**\n\nCovers Ola, Ather, TVS, Bajaj, Ultraviolette, Tork and more — launches, comparisons, long-term reviews.",
    ],
    link: { label: "Read Latest Bike News →", href: "/news" },
    options: [
      { label: "🚗 Car News",       next: "news_cars" },
      { label: "⬅ Back",           next: "news_info" },
    ],
  },

  charging: {
    bot: ["🔋 What would you like to know about EV charging?"],
    options: [
      { label: "🏠 Home Charging Setup",   next: "charging_home" },
      { label: "⚡ Public Charging",        next: "charging_public" },
      { label: "💰 Charging Cost",         next: "charging_cost" },
      { label: "🔋 Battery Life Tips",     next: "battery_tips" },
      { label: "⬅ Main Menu",             next: "welcome" },
    ],
  },

  charging_home: {
    bot: [
      "🏠 **Home Charging Setup:**\n\n• **15A socket (slow)** — Comes with car, 8–10 hrs full charge. Cost: ₹0–5,000\n• **AC Wall Box (7.2 kW)** — 4–6 hrs full charge. Cost: ₹15,000–30,000\n• Most EVs include a portable charger in the box\n• A dedicated 15A line from MCB is recommended\n• Solar charging possible with 3–5 kW rooftop setup",
    ],
    options: [
      { label: "💰 Charging Cost",     next: "charging_cost" },
      { label: "⚡ Public Charging",   next: "charging_public" },
      { label: "⬅ Back",              next: "charging" },
    ],
  },

  charging_public: {
    bot: [
      "⚡ **Public Charging Networks in India:**\n\n• **Tata Power** — 4,000+ chargers across India\n• **Ather Grid** — 1,800+ fast chargers (all brands)\n• **BPCL / HPCL** — At fuel stations nationwide\n• **Statiq, ChargeZone, Greenzo** — App-based networks\n\n🔌 DC Fast Charger (50 kW+): 0–80% in 40–60 mins\n📱 Find chargers: PlugShare app, EVATLASMAP",
    ],
    options: [
      { label: "💰 Charging Cost",     next: "charging_cost" },
      { label: "🏠 Home Charging",     next: "charging_home" },
      { label: "⬅ Back",              next: "charging" },
    ],
  },

  charging_cost: {
    bot: [
      "💰 **EV Charging Cost (avg. ₹8/unit):**\n\n• **MG Comet (17.3 kWh)** → ~₹138 full charge\n• **Tata Tiago EV (24 kWh)** → ~₹192\n• **Nexon EV (40.5 kWh)** → ~₹324\n• **Harrier EV (74 kWh)** → ~₹592\n\n⚡ Cost per km: ₹0.80–1.50 vs ₹7–10 for petrol\n💚 **Save up to 85% on fuel costs!**",
    ],
    options: [
      { label: "🔋 Battery Life Tips",  next: "battery_tips" },
      { label: "⬅ Back",               next: "charging" },
    ],
  },

  battery_tips: {
    bot: [
      "🔋 **EV Battery Care Tips:**\n\n• Keep charge between **20–80%** for daily use\n• Avoid frequent DC fast charging (use for trips)\n• Park in shade — heat degrades battery faster\n• Use **scheduled charging** at night (cheaper tariff)\n• LFP batteries (Tata, MG) can be charged to 100% daily\n• Battery warranty: **8 years / 1.6 lakh km** on most brands",
    ],
    options: [
      { label: "💰 Charging Cost",   next: "charging_cost" },
      { label: "⬅ Back",            next: "charging" },
    ],
  },

  subsidies: {
    bot: ["🎁 What subsidy information do you need?"],
    options: [
      { label: "🇮🇳 FAME II / PM e-DRIVE",  next: "fame2" },
      { label: "🏙 State EV Subsidies",       next: "state_subsidy" },
      { label: "🏦 EV Loan & EMI",            next: "emi_info" },
      { label: "⬅ Main Menu",                next: "welcome" },
    ],
  },

  fame2: {
    bot: [
      "🇮🇳 **Central Government EV Subsidies:**\n\n• **FAME II (ended 2024):** 2W up to ₹15,000, 3W up to ₹30,000\n• **PM e-DRIVE Scheme (2024–26):** ₹10,900 crore total allocation\n  — 2W subsidy: ₹10,000/vehicle\n  — Electric buses & commercial vehicles covered\n• Most EV prices shown online already include subsidy\n• Check eligibility with your dealer before booking",
    ],
    options: [
      { label: "🏙 State Subsidies",  next: "state_subsidy" },
      { label: "🏦 EV Loan & EMI",   next: "emi_info" },
      { label: "⬅ Back",             next: "subsidies" },
    ],
  },

  state_subsidy: {
    bot: [
      "🏙 **State EV Subsidies (2025):**\n\n• **Delhi** — 2W: ₹5,000/kWh (up to ₹30,000) | 4W: ₹1.5 lakh\n• **Maharashtra** — 2W: ₹10,000 | 4W: ₹1 lakh + road tax waiver\n• **Gujarat** — 2W: ₹20,000 | 4W: ₹1.5 lakh\n• **Rajasthan** — Road tax & registration waiver\n• **Karnataka / Tamil Nadu** — Road tax exemption\n\n*Visit your state transport department for latest rates.*",
    ],
    options: [
      { label: "🇮🇳 Central Subsidies",  next: "fame2" },
      { label: "🏦 EV Loan & EMI",       next: "emi_info" },
      { label: "⬅ Back",                 next: "subsidies" },
    ],
  },

  emi_info: {
    bot: [
      "🏦 **EV Loan & EMI Info:**\n\n• SBI, HDFC, ICICI, Kotak offer dedicated EV loans\n• Interest rates: **7.9%–9.5%** (lower than petrol car loans)\n• Zero processing fee on many EV models\n\n📊 **Example — Nexon EV at ₹15 lakh:**\n  48 months @ 8.5% = ~₹37,200/month\n\n• Many dealers offer **0% EMI** for 6–12 months\n• Fuel savings offset EMI cost significantly!",
    ],
    options: [
      { label: "📞 Get Loan Quote",       next: "lead" },
      { label: "🏙 State Subsidies",     next: "state_subsidy" },
      { label: "⬅ Back",                 next: "subsidies" },
    ],
  },

  lead: {
    bot: [
      "Our EV Expert will be happy to help you! 🚗⚡",
      "Please fill in your details and we'll get back to you within 24 hours:",
    ],
    showLead: true,
  },
};

/* ─── Message content renderer ───────────────────────────────────── */
function MsgContent({ content }) {
  if (!content) return null;
  return (
    <div className="space-y-0.5 text-sm leading-relaxed">
      {content.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/);
        return (
          <div key={i}>
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={j}>{p.slice(2, -2)}</strong>
                : <span key={j}>{p}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Typing indicator ───────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-end gap-2 px-4 py-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600">
        <Zap size={12} className="text-white" fill="white" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-gray-800 px-4 py-3">
        {[0, 0.18, 0.36].map((d, i) => (
          <motion.span key={i} className="block h-2 w-2 rounded-full bg-green-400"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.7, delay: d }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Message bubble ─────────────────────────────────────────────── */
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 px-4 py-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600">
          <Zap size={12} className="text-white" fill="white" />
        </div>
      )}
      <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 ${
        isUser
          ? "rounded-br-sm bg-green-600 text-white"
          : "rounded-bl-sm bg-gray-800 text-gray-100"
      }`}>
        <MsgContent content={msg.content} />
      </div>
    </motion.div>
  );
}

/* ─── Link card ──────────────────────────────────────────────────── */
function LinkCard({ link }) {
  return (
    <div className="px-4 py-1">
      <Link
        href={link.href}
        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition"
      >
        {link.label} <ExternalLink size={13} />
      </Link>
    </div>
  );
}

/* ─── Option buttons ─────────────────────────────────────────────── */
function OptionButtons({ options, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-2 flex flex-wrap gap-2"
    >
      {options.map(opt => (
        <button
          key={opt.label}
          onClick={() => onSelect(opt)}
          className="rounded-full border border-gray-600 bg-gray-800 px-4 py-2 text-sm text-gray-200 hover:border-green-500 hover:text-green-400 transition active:scale-95"
        >
          {opt.label}
        </button>
      ))}
    </motion.div>
  );
}

/* ─── Lead form card ─────────────────────────────────────────────── */
function LeadFormCard({ onBack }) {
  const [form, setForm]   = useState({ name: "", phone: "", email: "", city: "", vehicleName: "", vehicleType: "any" });
  const [busy, setBusy]   = useState(false);
  const [done, setDone]   = useState(false);
  const [err,  setErr]    = useState("");
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="mx-4 my-2 rounded-xl bg-green-950 border border-green-800 p-4 text-center">
        <p className="text-2xl">✅</p>
        <p className="mt-1 text-sm font-bold text-green-400">Details Received!</p>
        <p className="text-xs text-gray-400 mt-1">Our EV expert will call you within 24 hours.</p>
        <button onClick={onBack}
          className="mt-3 rounded-full border border-gray-600 px-4 py-1.5 text-xs text-gray-300 hover:border-green-500 hover:text-green-400 transition">
          ⬅ Back to Main Menu
        </button>
      </motion.div>
    );
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/chatbot-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:              form.name.trim(),
          phone:             form.phone.trim(),
          email:             form.email?.trim()             || "",
          city:              form.city?.trim()              || "",
          interestedVehicle: form.vehicleName?.trim()       || "",
          vehicleType:       form.vehicleType               || "any",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setDone(true);
      else setErr(data.error || "Could not submit. Please try again.");
    } catch { setErr("Network error. Please try again."); }
    setBusy(false);
  };

  const f = "w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none placeholder:text-gray-500";

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="mx-4 my-2 rounded-xl bg-gray-800 border border-gray-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-white">🎯 Talk to an EV Expert</p>
          <p className="text-xs text-gray-400 mt-0.5">Test drive booking · Price quote · Finance</p>
        </div>
        <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-300 transition">Skip</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="text"  placeholder="Your Name *"    required className={f} value={form.name}        onChange={set("name")} />
        <input type="tel"   placeholder="Mobile No. *"   required className={f} value={form.phone}       onChange={set("phone")} />
        <div className="grid grid-cols-2 gap-2">
          <input type="email" placeholder="Email"        className={f} value={form.email}       onChange={set("email")} />
          <input type="text"  placeholder="City"         className={f} value={form.city}        onChange={set("city")} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="text"  placeholder="Interested EV" className={f} value={form.vehicleName} onChange={set("vehicleName")} />
          <select className={f} value={form.vehicleType} onChange={set("vehicleType")}>
            <option value="any">Not sure yet</option>
            <option value="car">Car</option>
            <option value="bike">Bike / Scooter</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        {err && <p className="text-red-400 text-xs">{err}</p>}
        <button type="submit" disabled={busy}
          className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 transition">
          {busy ? "Submitting…" : "Get Expert Callback →"}
        </button>
      </form>
    </motion.div>
  );
}

/* ─── Main ChatWindow ────────────────────────────────────────────── */
export default function ChatWindow({ onClose }) {
  const [messages,  setMessages]  = useState([]);
  const [options,   setOptions]   = useState([]);
  const [link,      setLink]      = useState(null);
  const [showLead,  setShowLead]  = useState(false);
  const [typing,    setTyping]    = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef      = useRef(null);
  const timerRef       = useRef([]);
  const currentNodeRef = useRef("welcome");
  const navigateRef    = useRef(null);

  const MSGS_KEY = "evradar_chat_msgs";
  const NODE_KEY = "evradar_chat_node";

  /* clear all pending timers */
  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  /* navigate to a flow node */
  const navigateTo = useCallback((nodeId) => {
    const node = FLOW[nodeId];
    if (!node) return;
    clearTimers();

    setOptions([]);
    setLink(null);
    setShowLead(false);
    setTyping(true);

    /* show bot messages with staggered delay */
    node.bot.forEach((text, i) => {
      const t = setTimeout(() => {
        if (i === 0) setTyping(false);
        setMessages(prev => {
          const next = [...prev, { role: "assistant", content: text, id: `${nodeId}-${i}-${Date.now()}` }];
          try { localStorage.setItem(MSGS_KEY, JSON.stringify(next.slice(-60))); } catch {}
          return next;
        });
      }, 700 + i * 450);
      timerRef.current.push(t);
    });

    /* reveal options/link/lead after all messages, then persist node */
    const afterAll = setTimeout(() => {
      currentNodeRef.current = nodeId;
      try { localStorage.setItem(NODE_KEY, nodeId); } catch {}
      if (node.link)          setLink(node.link);
      if (node.showLead)      setShowLead(true);
      else if (node.options)  setOptions(node.options);
    }, 700 + node.bot.length * 450 + 150);
    timerRef.current.push(afterAll);
  }, [clearTimers]);

  /* keep navigateRef in sync so clearHistory can call it without a dep cycle */
  navigateRef.current = navigateTo;

  /* clear chat and restart */
  const clearHistory = useCallback(() => {
    clearTimers();
    try { localStorage.removeItem(MSGS_KEY); localStorage.removeItem(NODE_KEY); } catch {}
    setMessages([]);
    setOptions([]);
    setLink(null);
    setShowLead(false);
    navigateRef.current("welcome");
  }, [clearTimers]);

  /* initialise: restore from localStorage OR fresh start */
  useEffect(() => {
    try {
      const savedMsgs = localStorage.getItem(MSGS_KEY);
      const savedNode = localStorage.getItem(NODE_KEY);
      if (savedMsgs && savedNode) {
        const msgs = JSON.parse(savedMsgs);
        const node = FLOW[savedNode];
        if (Array.isArray(msgs) && msgs.length > 0 && node) {
          setMessages(msgs);
          currentNodeRef.current = savedNode;
          /* restore the options/link/lead for the last node without re-showing messages */
          if (node.link)         setLink(node.link);
          if (node.showLead)     setShowLead(true);
          else if (node.options) setOptions(node.options);
          return;
        }
      }
    } catch {}
    /* fresh start */
    navigateTo("welcome");
    return clearTimers;
  }, []); // intentionally empty — runs once on mount only

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, options, showLead, link]);

  const handleOption = useCallback((opt) => {
    setOptions([]);
    setLink(null);
    setMessages(prev => {
      const next = [...prev, { role: "user", content: opt.label, id: `u-${Date.now()}` }];
      try { localStorage.setItem(MSGS_KEY, JSON.stringify(next.slice(-60))); } catch {}
      return next;
    });
    navigateTo(opt.next);
  }, [navigateTo]);

  const handleLeadBack = useCallback(() => {
    setShowLead(false);
    navigateTo("welcome");
  }, [navigateTo]);

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
  const waUrl    = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I need help choosing an electric vehicle from EVRadar.")}`;

  /* ── Minimized pill ── */
  if (minimized) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed bottom-24 right-6 z-50">
        <button onClick={() => setMinimized(false)}
          className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900 px-4 py-2.5 text-white shadow-2xl hover:border-green-500 transition">
          <Zap size={15} className="text-green-400" fill="currentColor" />
          <span className="text-sm font-medium">EVRadar AI</span>
          <ChevronRight size={13} className="text-gray-500" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{   opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      className={[
        "fixed inset-0 z-50 flex flex-col bg-gray-950",
        "sm:inset-auto sm:bottom-24 sm:right-6",
        "sm:h-155 sm:w-97.5",
        "sm:rounded-2xl sm:border sm:border-gray-800 sm:shadow-2xl sm:shadow-black/60",
      ].join(" ")}
    >
      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3 sm:rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-green-700 shadow-md">
            <Zap size={17} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">EVRadar AI</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              <span className="text-[11px] text-gray-400">Online · EV Expert</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {/* New Chat */}
          <button onClick={clearHistory} title="Start new chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:text-gray-300 transition">
            <RotateCcw size={13} />
          </button>
          {/* WhatsApp */}
          <a href={waUrl} target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp"
            className="flex h-8 w-8 items-center justify-center rounded-full text-green-400 hover:bg-green-900/30 transition">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
          {/* Minimize */}
          <button onClick={() => setMinimized(true)} title="Minimise"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:text-gray-300 transition">
            <Minus size={14} />
          </button>
          {/* Close */}
          <button onClick={onClose} title="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:text-red-400 transition">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto py-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#374151 transparent" }}>

        <AnimatePresence initial={false}>
          {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
        </AnimatePresence>

        {typing && <TypingDots />}

        {link && !typing && <LinkCard link={link} />}

        {showLead && !typing && (
          <LeadFormCard onBack={handleLeadBack} />
        )}

        {options.length > 0 && !typing && (
          <OptionButtons options={options} onSelect={handleOption} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-gray-800 bg-gray-900 px-4 py-3 sm:rounded-b-2xl">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-600">
            Powered by <span className="text-green-700 font-semibold">EVRadar</span>
          </p>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-green-600/10 border border-green-800 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-600/20 transition">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Talk to EV Expert
          </a>
        </div>
      </div>
    </motion.div>
  );
}
