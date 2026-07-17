"use client";
import { motion } from "framer-motion";

const COLORS = ["#16a34a", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444"];
const SEG_LABEL = { car: "Cars", "two-wheeler": "Two-Wheelers", commercial: "Commercial" };

export default function DonutChart({ data = [], labelKey = "segment", valueKey = "totalUnits" }) {
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0);
  const size  = 120;
  const r     = 44;
  const cx    = size / 2;
  const cy    = size / 2;
  const circ  = 2 * Math.PI * r;

  let offset = 0;
  const slices = data.map((d, i) => {
    const pct  = total > 0 ? (d[valueKey] || 0) / total : 0;
    const dash = pct * circ;
    const gap  = circ - dash;
    const slice = { ...d, pct, dash, gap, offset, color: COLORS[i % COLORS.length] };
    offset += dash;
    return slice;
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={16} />
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={16}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={circ / 4 - s.offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dasharray 0.6s ease" }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-gray-900 dark:fill-white" fontSize={10} fontWeight={700}>
          {total >= 100000 ? `${(total / 100000).toFixed(1)}L` : total >= 1000 ? `${(total / 1000).toFixed(0)}K` : total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-gray-400" fontSize={7}>Total EVs</text>
      </svg>

      <div className="space-y-2 flex-1">
        {slices.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {SEG_LABEL[s[labelKey]] || s[labelKey]}
              </span>
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {(s.pct * 100).toFixed(1)}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
