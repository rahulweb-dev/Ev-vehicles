"use client";
import { motion } from "framer-motion";

function fmt(n) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function BarChart({ data = [], labelKey = "month", valueKey = "totalUnits", color = "bg-green-500", title }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);

  return (
    <div>
      {title && <p className="mb-3 text-sm font-bold text-gray-700 dark:text-gray-300">{title}</p>}
      <div className="flex items-end gap-1.5 h-40">
        {data.map((d, i) => {
          const pct = ((d[valueKey] || 0) / max) * 100;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1 group">
              <span className="text-[9px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition">
                {fmt(d[valueKey] || 0)}
              </span>
              <motion.div
                className={`w-full rounded-t-md ${color} min-h-[4px] relative`}
                style={{ height: `${Math.max(pct, 2)}%` }}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
                title={`${d[labelKey]}: ${fmt(d[valueKey] || 0)}`}
              />
              <span className="text-[9px] text-gray-400 truncate w-full text-center">{d[labelKey]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
