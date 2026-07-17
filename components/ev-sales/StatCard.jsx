"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

function fmt(n) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `${(n / 100000).toFixed(2)} L`;
  if (n >= 1000)     return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function StatCard({ label, value, growth, icon: Icon, color = "bg-green-50 dark:bg-green-900/20", iconColor = "text-green-600", index = 0, suffix = "" }) {
  const isPositive = (growth || 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
          {Icon && <Icon size={20} className={iconColor} />}
        </div>
        {growth !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-bold rounded-full px-2 py-0.5 ${isPositive ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(growth).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-black text-gray-900 dark:text-white">
        {fmt(Number(value) || 0)}{suffix}
      </p>
      <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
    </motion.div>
  );
}
