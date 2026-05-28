"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, Search, ExternalLink } from "lucide-react";

const STATUS_COLORS = {
  published: "bg-green-900/50 text-green-400 border-green-800",
  draft: "bg-yellow-900/50 text-yellow-400 border-yellow-800",
};

const CATEGORY_COLORS = {
  cars: "bg-blue-900/40 text-blue-400",
  bikes: "bg-orange-900/40 text-orange-400",
  commercial: "bg-purple-900/40 text-purple-400",
  charging: "bg-teal-900/40 text-teal-400",
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);

  async function loadArticles() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const [pubRes, draftRes] = await Promise.all([
        fetch("/api/articles?status=published&limit=100"),
        fetch("/api/articles?status=draft&limit=100"),
      ]);
      const [pub, draft] = await Promise.all([pubRes.json(), draftRes.json()]);
      const all = [...(pub.articles || []), ...(draft.articles || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setArticles(all);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadArticles(); }, []);

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    setDeleting(null);
    loadArticles();
  }

  const filtered = articles.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Articles</h1>
          <p className="text-sm text-gray-400">{articles.length} total articles</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-500 transition"
        >
          <Plus size={16} />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-gray-800 pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-green-500"
          />
        </div>
        {["all", "published", "draft"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition ${
              statusFilter === s
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Views</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="animate-pulse h-4 w-full rounded bg-gray-800" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                    No articles found.
                  </td>
                </tr>
              ) : (
                filtered.map((article) => (
                  <tr key={article._id} className="hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white line-clamp-1 max-w-xs">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">/news/{article.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize ${CATEGORY_COLORS[article.category] || "bg-gray-800 text-gray-400"}`}>
                        {article.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${STATUS_COLORS[article.status]}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {(article.views || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {article.status === "published" && (
                          <a
                            href={`/news/${article.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 hover:bg-gray-800 transition"
                            title="View live"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        <Link
                          href={`/admin/articles/${article._id}/edit`}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-gray-800 transition"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(article._id, article.title)}
                          disabled={deleting === article._id}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
