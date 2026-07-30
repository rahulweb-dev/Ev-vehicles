"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { Eye, TrendingUp, BarChart2, Gauge } from "lucide-react";

function ArticleAnalyticsWidget({ slug }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/admin/pageviews/article?slug=${encodeURIComponent(slug)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});
  }, [slug]);

  if (!stats) return null;

  const maxCount = Math.max(...(stats.daily?.map(d => d.count) || [1]), 1);

  return (
    <div className="mx-4 mb-4 rounded-xl border border-gray-700 bg-gray-800/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={14} className="text-green-400" />
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Article Analytics</span>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: "Today",    value: stats.today,  icon: Eye,         color: "text-blue-400" },
          { label: "7 Days",   value: stats.week,   icon: TrendingUp,  color: "text-green-400" },
          { label: "Total",    value: stats.total,  icon: BarChart2,   color: "text-purple-400" },
          { label: "Avg Scroll", value: `${stats.avgScroll}%`, icon: Gauge, color: "text-orange-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="text-center">
            <Icon size={14} className={`${color} mx-auto mb-1`} />
            <p className="text-sm font-bold text-white">{value}</p>
            <p className="text-[10px] text-gray-500">{label}</p>
          </div>
        ))}
      </div>
      {stats.daily?.length > 0 && (
        <div className="flex items-end gap-1 h-10">
          {stats.daily.map(d => (
            <div key={d._id} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d._id}: ${d.count} views`}>
              <div
                className="w-full rounded-t bg-green-500/60"
                style={{ height: `${Math.round((d.count / maxCount) * 100)}%`, minHeight: "2px" }}
              />
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-gray-600 mt-1 text-center">Last 7 days</p>
    </div>
  );
}

export default function EditArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.article) setArticle(d.article);
        else setError("Article not found");
      })
      .catch(() => setError("Failed to load article"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <>
      {article?.slug && <ArticleAnalyticsWidget slug={article.slug} />}
      <ArticleEditor initialData={article} />
    </>
  );
}
