"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, Eye, Search, ExternalLink,
  BookOpen, CheckCircle2, FileText, LayoutGrid, List,
  Calendar, TrendingUp, Square, CheckSquare, X,
  Globe, EyeOff, Image as ImageIcon,
} from "lucide-react";

const CAT_STYLE = {
  tips:       { label: "Tips",       dot: "bg-sky-500",    badge: "bg-sky-50 text-sky-700 border-sky-200" },
  guides:     { label: "Guides",     dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700 border-blue-200" },
  reviews:    { label: "Reviews",    dot: "bg-rose-500",   badge: "bg-rose-50 text-rose-700 border-rose-200" },
  news:       { label: "News",       dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  comparison: { label: "Comparison", dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  other:      { label: "Other",      dot: "bg-gray-400",   badge: "bg-gray-50 text-gray-600 border-gray-200" },
};

const CATEGORIES = ["all", "tips", "guides", "reviews", "news", "comparison", "other"];

const STATUS_STYLE = {
  published: "bg-green-100 text-green-700 border border-green-200",
  draft:     "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

/* ── Grid card ──────────────────────────────────────────────── */
function BlogGridCard({ blog, onDelete, deleting, isSelected, onSelect }) {
  const cat = CAT_STYLE[blog.category] || CAT_STYLE.other;
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border shadow-sm hover:shadow-md transition ${isSelected ? "border-green-500 ring-2 ring-green-300" : "border-gray-200 bg-white hover:border-green-200"}`}>
      {/* Thumbnail */}
      <div className="relative h-44 w-full shrink-0 bg-gray-100">
        {blog.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.image}
            alt={blog.imageAlt || blog.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-50">
            <ImageIcon size={28} className="text-gray-300" />
            <span className="text-xs text-gray-300">No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

        {/* Checkbox */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onSelect(blog._id); }}
          className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md transition"
        >
          {isSelected
            ? <CheckSquare size={20} className="text-green-600 drop-shadow" fill="white" />
            : <Square size={20} className="text-white drop-shadow opacity-70 group-hover:opacity-100" />}
        </button>

        {/* Category badge */}
        <div className="absolute left-9 top-3 flex items-center gap-1.5">
          <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${cat.badge}`}>
            {cat.label}
          </span>
        </div>

        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${STATUS_STYLE[blog.status] || STATUS_STYLE.draft}`}>
          {blog.status}
        </span>

        {/* Hover actions */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
          {blog.status === "published" && (
            <a href={`/blogs/${blog.slug}`} target="_blank"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-gray-600 shadow hover:bg-green-600 hover:text-white transition" title="View live">
              <ExternalLink size={14} />
            </a>
          )}
          <Link href={`/admin/blogs/${blog._id}/edit`}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-gray-600 shadow hover:bg-blue-600 hover:text-white transition" title="Edit">
            <Pencil size={14} />
          </Link>
          <button onClick={() => onDelete(blog._id, blog.title)} disabled={deleting === blog._id}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-gray-600 shadow hover:bg-red-600 hover:text-white transition disabled:opacity-40" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-bold text-gray-900 leading-snug mb-2">{blog.title}</h3>
        {blog.excerpt && (
          <p className="line-clamp-2 text-xs text-gray-400 leading-relaxed mb-3">{blog.excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Eye size={11} /> {(blog.views || 0).toLocaleString("en-IN")}</span>
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── List row ───────────────────────────────────────────────── */
function BlogListRow({ blog, onDelete, deleting, isSelected, onSelect }) {
  const cat = CAT_STYLE[blog.category] || CAT_STYLE.other;
  return (
    <div className={`group flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition ${isSelected ? "border-green-500 bg-green-50 ring-1 ring-green-300" : "border-gray-200 bg-white hover:border-green-200 hover:shadow-md"}`}>
      {/* Checkbox */}
      <button onClick={() => onSelect(blog._id)} className="shrink-0 text-gray-400 hover:text-green-600 transition">
        {isSelected ? <CheckSquare size={18} className="text-green-600" /> : <Square size={18} />}
      </button>

      {/* Thumbnail */}
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {blog.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={blog.image} alt={blog.title} className="h-full w-full object-cover"
            onError={e => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <div className="flex h-full items-center justify-center"><ImageIcon size={16} className="text-gray-300" /></div>
        )}
        <span className={`absolute bottom-0 left-0 right-0 py-0.5 text-center text-[8px] font-black uppercase text-white ${cat.dot}`}>
          {cat.label}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">{blog.title}</p>
        <p className="truncate text-xs text-gray-400">/blogs/{blog.slug}</p>
      </div>

      <span className={`hidden sm:inline-block shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${STATUS_STYLE[blog.status] || STATUS_STYLE.draft}`}>
        {blog.status}
      </span>

      <span className="hidden md:flex shrink-0 items-center gap-1 text-xs text-gray-400 min-w-16">
        <Eye size={11} /> {(blog.views || 0).toLocaleString("en-IN")}
      </span>

      <span className="hidden lg:block shrink-0 text-xs text-gray-400 min-w-20 text-right">
        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
      </span>

      <div className="flex shrink-0 items-center gap-1">
        {blog.status === "published" && (
          <a href={`/blogs/${blog.slug}`} target="_blank"
            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition" title="View live">
            <ExternalLink size={14} />
          </a>
        )}
        <Link href={`/admin/blogs/${blog._id}/edit`}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Edit">
          <Pencil size={14} />
        </Link>
        <button onClick={() => onDelete(blog._id, blog.title)} disabled={deleting === blog._id}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function AdminBlogsPage() {
  const [blogs, setBlogs]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [catFilter, setCatFilter]       = useState("all");
  const [view, setView]                 = useState("grid");
  const [deleting, setDeleting]         = useState(null);
  const [selected, setSelected]         = useState(new Set());
  const [bulkLoading, setBulkLoading]   = useState(false);

  async function loadBlogs() {
    setLoading(true);
    try {
      const [pubRes, draftRes] = await Promise.all([
        fetch("/api/blogs?status=published&limit=200"),
        fetch("/api/blogs?status=draft&limit=200"),
      ]);
      const [pub, draft] = await Promise.all([pubRes.json(), draftRes.json()]);
      const all = [...(pub.blogs || []), ...(draft.blogs || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBlogs(all);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBlogs(); }, []);

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"?\nThis cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/blogs/${id}`, { method: "DELETE" });
    setDeleting(null);
    loadBlogs();
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll()     { setSelected(new Set(filtered.map(b => b._id))); }
  function clearSelected() { setSelected(new Set()); }

  async function handleBulkAction(action) {
    const ids = [...selected];
    if (!ids.length) return;
    if (action === "delete" && !confirm(`Delete ${ids.length} blog post${ids.length > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/blogs/bulk", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, ids }),
      });
      if (res.ok) { clearSelected(); loadBlogs(); }
    } finally {
      setBulkLoading(false);
    }
  }

  const filtered = blogs.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || (b.slug || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchCat    = catFilter === "all" || b.category === catFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const published  = blogs.filter(b => b.status === "published").length;
  const drafts     = blogs.filter(b => b.status === "draft").length;
  const totalViews = blogs.reduce((s, b) => s + (b.views || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BookOpen size={22} className="text-green-600" /> Blog Management
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{blogs.length} posts total</p>
        </div>
        <Link href="/admin/blogs/new"
          className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 transition shadow-sm">
          <Plus size={16} /> New Blog Post
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total",       value: blogs.length,                    icon: BookOpen,     color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
          { label: "Published",   value: published,                       icon: CheckCircle2, color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
          { label: "Drafts",      value: drafts,                          icon: FileText,     color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
          { label: "Total Views", value: totalViews.toLocaleString("en-IN"), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl border ${border} ${bg} px-4 py-3 shadow-sm`}>
            <Icon size={18} className={color} />
            <div>
              <p className="text-lg font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + view toggle */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-52 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by title or slug…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition" />
        </div>

        {/* Status filter */}
        <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm p-0.5">
          {["all", "published", "draft"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                statusFilter === s ? "bg-green-700 text-white" : "text-gray-500 hover:text-gray-900"
              }`}>
              {s}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap rounded-xl border border-gray-200 bg-white shadow-sm p-0.5">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                catFilter === c ? "bg-green-700 text-white" : "text-gray-500 hover:text-gray-900"
              }`}>
              {c === "all" ? "All" : (CAT_STYLE[c]?.label || c)}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="ml-auto flex rounded-xl border border-gray-200 bg-white shadow-sm p-0.5">
          <button onClick={() => setView("grid")}
            className={`rounded-lg p-1.5 transition ${view === "grid" ? "bg-green-700 text-white" : "text-gray-400 hover:text-gray-700"}`}
            title="Grid view"><LayoutGrid size={16} /></button>
          <button onClick={() => setView("list")}
            className={`rounded-lg p-1.5 transition ${view === "list" ? "bg-green-700 text-white" : "text-gray-400 hover:text-gray-700"}`}
            title="List view"><List size={16} /></button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-white shadow-lg">
          <button onClick={clearSelected} className="rounded p-0.5 hover:bg-white/20 transition">
            <X size={16} />
          </button>
          <span className="flex-1 text-sm font-semibold">{selected.size} selected</span>
          <button onClick={() => handleBulkAction("publish")} disabled={bulkLoading}
            className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30 transition disabled:opacity-50">
            <Globe size={13} /> Publish
          </button>
          <button onClick={() => handleBulkAction("unpublish")} disabled={bulkLoading}
            className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30 transition disabled:opacity-50">
            <EyeOff size={13} /> Unpublish
          </button>
          <button onClick={() => handleBulkAction("delete")} disabled={bulkLoading}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold hover:bg-red-700 transition disabled:opacity-50">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}

      {/* Select-all row */}
      {!loading && filtered.length > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <button onClick={selected.size === filtered.length ? clearSelected : selectAll}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-700 transition font-medium">
            {selected.size === filtered.length && filtered.length > 0
              ? <><CheckSquare size={14} className="text-green-600" /> Deselect all</>
              : <><Square size={14} /> Select all ({filtered.length})</>}
          </button>
          {(search || statusFilter !== "all" || catFilter !== "all") && (
            <span className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of {blogs.length}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        view === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="h-44 rounded-t-2xl bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3.5 w-3/4 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white border border-gray-200 h-20 shadow-sm" />
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 shadow-sm">
          <BookOpen size={40} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-400">
            {search || statusFilter !== "all" || catFilter !== "all"
              ? "No blog posts match your filters"
              : "No blog posts yet"}
          </p>
          {!search && statusFilter === "all" && catFilter === "all" && (
            <Link href="/admin/blogs/new"
              className="mt-4 flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800 transition">
              <Plus size={14} /> Write your first blog post
            </Link>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(b => (
            <BlogGridCard key={b._id} blog={b} onDelete={handleDelete} deleting={deleting}
              isSelected={selected.has(b._id)} onSelect={toggleSelect} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => (
            <BlogListRow key={b._id} blog={b} onDelete={handleDelete} deleting={deleting}
              isSelected={selected.has(b._id)} onSelect={toggleSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
