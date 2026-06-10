"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, Eye } from "lucide-react";

function fmtViews(n) {
  if (!n) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function TrendingWidget() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/articles/trending?limit=5")
      .then(r => r.json())
      .then(d => setArticles(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && articles.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-base font-black text-gray-900">
        <TrendingUp size={17} className="text-green-600" />
        Trending Today
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-14 w-14 rounded-xl bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 rounded bg-gray-100" />
                <div className="h-3 w-2/3 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {articles.map((a, i) => (
            <Link
              key={a._id?.toString?.() || i}
              href={`/news/${a.slug}`}
              className="group flex gap-3 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
            >
              {/* Thumbnail with rank badge */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {a.image && (
                  <Image
                    src={a.image}
                    alt={a.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                )}
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[9px] font-black text-white shadow">
                  {i + 1}
                </span>
              </div>

              {/* Title + views */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-green-600 transition">
                  {a.title}
                </p>
                {a.views > 0 && (
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                    <Eye size={10} />
                    {fmtViews(a.views)} views
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
