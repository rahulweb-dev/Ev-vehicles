"use client";

// Building blocks for the admin dashboard: cards, animated numbers, sparkline, area chart, donut, ring gauge.
import { useEffect, useId, useState } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";

export const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] } }),
};

export function Card({ className = "", children, i = 0, ...rest }) {
  return (
    <motion.div variants={fade} initial="hidden" animate="show" custom={i}
      className={`rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] ${className}`} {...rest}>
      {children}
    </motion.div>
  );
}

export function CardHeader({ icon: Icon, title, tone = "emerald", right, sub }) {
  const tones = {
    emerald: "from-emerald-500 to-teal-500", blue: "from-sky-500 to-indigo-500", violet: "from-violet-500 to-fuchsia-500",
    amber: "from-amber-400 to-orange-500", rose: "from-rose-500 to-pink-500", slate: "from-slate-600 to-slate-800",
  };
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-5">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]} text-white shadow-sm`}><Icon size={17} /></span>}
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-bold tracking-tight text-slate-900">{title}</h2>
          {sub && <p className="truncate text-xs text-slate-500">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />;
}

/** Number that counts up when it appears or changes. */
export function CountUp({ value = 0, duration = 1.1, className = "" }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("en-IN"));
  useEffect(() => {
    const c = animate(mv, Number(value) || 0, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [value, duration, mv]);
  return <motion.span className={className}>{text}</motion.span>;
}

export function Delta({ value, suffix = "vs yesterday" }) {
  if (value == null || Number.isNaN(value)) return null;
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
      <svg width="8" height="8" viewBox="0 0 8 8" className={up ? "" : "rotate-180"}><path d="M4 1 7 6H1z" fill="currentColor" /></svg>
      {up ? "+" : ""}{value.toLocaleString("en-IN")} <span className="font-normal opacity-70">{suffix}</span>
    </span>
  );
}

/** Tiny line chart for KPI cards. */
export function Sparkline({ data = [], color = "#10b981", height = 36 }) {
  const id = useId().replace(/:/g, "");
  if (data.length < 2) return <div style={{ height }} />;
  const W = 120, H = height, max = Math.max(...data, 1), min = Math.min(...data, 0);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, H - 3 - ((v - min) / (max - min || 1)) * (H - 6)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs><linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <motion.path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#s${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />
      <motion.path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeOut" }} />
    </svg>
  );
}

/** 7/14-day traffic area chart with hover tooltip. */
export function AreaChart({ data = [], height = 200 }) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState(null);
  if (!data.length) return <div className="flex items-center justify-center text-sm text-slate-400" style={{ height }}>No traffic recorded yet</div>;
  const W = 640, H = height, P = { t: 14, r: 8, b: 26, l: 8 };
  const max = Math.max(...data.map((d) => d.views), 1) * 1.15;
  const x = (i) => P.l + (i / Math.max(data.length - 1, 1)) * (W - P.l - P.r);
  const y = (v) => P.t + (1 - v / max) * (H - P.t - P.b);
  const pts = data.map((d, i) => [x(i), y(d.views)]);
  // Smooth curve (Catmull-Rom → Bezier)
  const path = pts.reduce((acc, p, i, a) => {
    if (!i) return `M${p[0]},${p[1]}`;
    const p0 = a[i - 2] || a[i - 1], p1 = a[i - 1], p2 = p, p3 = a[i + 1] || p;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return `${acc} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }, "");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const h = hover != null ? data[hover] : null;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`a${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.28" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient>
          <linearGradient id={`l${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={P.l} x2={W - P.r} y1={P.t + f * (H - P.t - P.b)} y2={P.t + f * (H - P.t - P.b)} stroke="#e2e8f0" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />)}
        <motion.path d={`${path} L${x(data.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`} fill={`url(#a${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.4 }} />
        <motion.path d={path} fill="none" stroke={`url(#l${id})`} strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }} />
        {hover != null && <line x1={pts[hover][0]} x2={pts[hover][0]} y1={P.t} y2={H - P.b} stroke="#94a3b8" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />}
        {data.map((d, i) => (
          <rect key={d.date} x={x(i) - (W / data.length) / 2} y={0} width={W / data.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {/* Dots and labels as HTML so they don't stretch with the SVG */}
      {pts.map((p, i) => (
        <span key={i} className={`pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow transition-transform ${hover === i ? "scale-150" : "scale-100"}`}
          style={{ left: `${(p[0] / W) * 100}%`, top: `${(p[1] / H) * 100}%` }} />
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-1">
        {data.map((d) => <span key={d.date} className="w-8 text-center text-[11px] font-medium text-slate-400">{days[new Date(d.date + "T00:00:00").getDay()]}</span>)}
      </div>
      {h && (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-xl"
          style={{ left: `${Math.min(Math.max((pts[hover][0] / W) * 100, 10), 90)}%`, top: `${(pts[hover][1] / H) * 100 - 4}%` }}>
          <p className="font-semibold">{new Date(h.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
          <p className="text-emerald-300">{h.views.toLocaleString("en-IN")} views{h.unique != null ? ` · ${h.unique.toLocaleString("en-IN")} visitors` : ""}</p>
        </div>
      )}
    </div>
  );
}

/** Donut chart: segments [{ label, value, color }]. */
export function Donut({ segments = [], size = 132, stroke = 16, center }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const lens = segments.map((s) => (s.value / total) * C);
  const offs = lens.map((_, i) => lens.slice(0, i).reduce((a, x) => a + x, 0));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const len = lens[i], off = offs[i];
          return <motion.circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeLinecap="butt"
            strokeDasharray={`${len} ${C - len}`} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: -off }} transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }} />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{center}</div>
    </div>
  );
}

/** Circular usage gauge (0–100). */
export function Ring({ pct = 0, size = 64, stroke = 7, color = "#10b981", children }) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r, p = Math.min(Math.max(pct, 0), 100);
  const c = p >= 85 ? "#ef4444" : color;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={C}
          initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - p / 100) }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-700">{children ?? `${p.toFixed(0)}%`}</div>
    </div>
  );
}

/** Animated horizontal bar. */
export function Bar({ pct = 0, className = "bg-emerald-500", delay = 0 }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <motion.div className={`h-full rounded-full ${className}`} initial={{ width: 0 }} animate={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  );
}
