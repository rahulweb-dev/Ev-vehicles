"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit2, Trash2, BookOpen, RefreshCw, FileText } from "lucide-react";

const CATEGORIES = ["all", "tips", "guides", "reviews", "news", "comparison", "other"];

function timeAgo(date) {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminBlogsPage() {
  const [blogs,    setBlogs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("all");
  const [category, setCategory] = useState("all");
  const [deleting, setDeleting] = useState(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (status   !== "all") qs.set("status",   status);
      if (category !== "all") qs.set("category", category);
      if (search)             qs.set("search",   search);
      qs.set("limit", "100");
      const data = await fetch(`/api/blogs?${qs}`).then(r => r.json());
      setBlogs(data.blogs || []);
    } catch {}
    setLoading(false);
  }, [status, category, search]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  async function handleDelete(id) {
    if (!confirm("Delete this blog post?")) return;
    setDeleting(id);
    await fetch(`/api/blogs/${id}`, { method: "DELETE" });
    setBlogs(prev => prev.filter(b => b._id !== id));
    setDeleting(null);
  }

  async function toggleStatus(blog) {
    const newStatus = blog.status === "published" ? "draft" : "published";
    await fetch(`/api/blogs/${blog._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, status: newStatus } : b));
  }

  const published = blogs.filter(b => b.status === "published").length;
  const drafts    = blogs.filter(b => b.status === "draft").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BookOpen size={24} className="text-green-600" /> Blog Management
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {published} published · {drafts} drafts · {blogs.length} total
          </p>
        </div>
        <Link href="/admin/blogs/new"
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition shadow-sm">
          <Plus size={16} /> New Blog
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search blogs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green-400 focus:outline-none"
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-green-400 focus:outline-none">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-green-400 focus:outline-none">
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <button onClick={fetchBlogs}
          className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-100 transition">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={20} className="animate-spin text-green-600" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={40} className="text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No blog posts yet</p>
            <Link href="/admin/blogs/new"
              className="mt-4 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition">
              Write your first blog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {blogs.map(blog => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{blog.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{blog.excerpt}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 capitalize">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">{blog.author}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(blog)}
                        className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                          blog.status === "published"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        }`}>
                        {blog.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                      <span className="flex items-center gap-1"><Eye size={11} /> {blog.views || 0}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                      {timeAgo(blog.publishedAt || blog.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/blogs/${blog._id}/edit`}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition">
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          disabled={deleting === blog._id}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition disabled:opacity-40">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
