"use client";
import { motion } from "framer-motion";

function fmt(n) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const SEG_COLOR = {
  car:           "bg-blue-500",
  "two-wheeler": "bg-green-500",
  commercial:    "bg-purple-500",
};

export default function HBarChart({ data = [], labelKey = "brand", valueKey = "totalUnits", segmentKey, maxItems = 8 }) {
  const visible = data.slice(0, maxItems);
  const max = Math.max(...visible.map((d) => d[valueKey] || 0), 1);

  return (
    <div className="space-y-2.5">
      {visible.map((d, i) => {
        const pct = ((d[valueKey] || 0) / max) * 100;
        const color = segmentKey ? (SEG_COLOR[d[segmentKey]] || "bg-green-500") : "bg-green-500";
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs font-semibold text-gray-700 dark:text-gray-300 truncate text-right">
              {d[labelKey]}
            </span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${Math.max(pct, 2)}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(pct, 2)}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
              />
            </div>
            <span className="w-16 shrink-0 text-xs font-bold text-gray-700 dark:text-gray-300">
              {fmt(d[valueKey] || 0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
