"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare, Check, X, Trash2, Search,
  ExternalLink, ChevronLeft, ChevronRight,
  CheckCheck, Filter, RefreshCw, AlertCircle,
} from "lucide-react";

const STATUS_TABS = [
  { id: "all",      label: "All" },
  { id: "pending",  label: "Pending", color: "text-amber-600" },
  { id: "approved", label: "Approved", color: "text-green-600" },
];

export default function AdminCommentsPage() {
  const [comments,     setComments]     = useState([]);
  const [total,        setTotal]        = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [status,       setStatus]       = useState("pending");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [pages,        setPages]        = useState(1);
  const [actionId,     setActionId]     = useState(null); // id being acted upon
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status, page, limit: LIMIT,
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/admin/comments?${params}`);
      const data = await res.json();
      setComments(data.comments || []);
      setTotal(data.total || 0);
      setPendingCount(data.pendingCount || 0);
      setPages(data.pages || 1);
    } catch {}
    setLoading(false);
  }, [status, page, search]);

  useEffect(() => { load(); }, [load]);

  /* Reset to page 1 when status/search changes */
  useEffect(() => { setPage(1); }, [status, search]);

  const handleApprove = async (id) => {
    setActionId(id);
    await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    setComments(prev => prev.filter(c => c._id !== id));
    setPendingCount(n => Math.max(0, n - 1));
    setTotal(n => Math.max(0, n - 1));
    setActionId(null);
  };

  const handleReject = async (id) => {
    setActionId(id);
    await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: false }),
    });
    setComments(prev => prev.filter(c => c._id !== id));
    setTotal(n => Math.max(0, n - 1));
    setActionId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this comment?")) return;
    setActionId(id);
    await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    setComments(prev => prev.filter(c => c._id !== id));
    const wasUnapproved = comments.find(c => c._id === id && !c.approved);
    if (wasUnapproved) setPendingCount(n => Math.max(0, n - 1));
    setTotal(n => Math.max(0, n - 1));
    setActionId(null);
  };

  const approveAll = async () => {
    if (!confirm(`Approve all ${total} visible pending comments?`)) return;
    await Promise.all(comments.filter(c => !c.approved).map(c =>
      fetch(`/api/admin/comments/${c._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      })
    ));
    await load();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <MessageSquare size={24} className="text-green-600" />
            Comments
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {pendingCount > 0
              ? <span className="font-semibold text-amber-600">{pendingCount} pending review</span>
              : "All comments reviewed"}
            {total > 0 && ` · ${total} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {status === "pending" && comments.length > 0 && (
            <button onClick={approveAll}
              className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
              <CheckCheck size={15} /> Approve All
            </button>
          )}
          <button onClick={load}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 transition shadow-sm">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {STATUS_TABS.map(tab => (
            <button key={tab.id} onClick={() => setStatus(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition ${
                status === tab.id
                  ? "bg-green-600 text-white"
                  : `${tab.color || "text-gray-600"} hover:bg-gray-50`
              }`}>
              {tab.label}
              {tab.id === "pending" && pendingCount > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  status === "pending" ? "bg-white/30 text-white" : "bg-amber-100 text-amber-700"
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, content or article…"
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm outline-none transition focus:border-green-500 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 border-b border-gray-50 px-5 py-4 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/4 rounded bg-gray-100" />
                  <div className="h-3 w-3/4 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-8 w-8 rounded-lg bg-gray-100" />
                  <div className="h-8 w-8 rounded-lg bg-gray-100" />
                  <div className="h-8 w-8 rounded-lg bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="font-semibold text-gray-400">
              {status === "pending" ? "No comments pending review" : "No comments found"}
            </p>
            {search && <p className="mt-1 text-sm text-gray-400">Try a different search term</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {comments.map(c => (
              <div key={c._id} className={`flex items-start gap-4 px-5 py-4 transition ${
                actionId === c._id ? "opacity-50 pointer-events-none" : "hover:bg-gray-50/50"
              }`}>
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-black text-green-700 mt-0.5">
                  {c.name.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">{c.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      c.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {c.approved ? "Approved" : "Pending"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{c.content}</p>

                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                    <span>On:</span>
                    <Link href={`/news/${c.articleSlug}`} target="_blank"
                      className="flex items-center gap-1 font-medium text-green-600 hover:text-green-700 truncate max-w-60">
                      {c.articleSlug} <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!c.approved && (
                    <button onClick={() => handleApprove(c._id)}
                      title="Approve comment"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100">
                      <Check size={15} />
                    </button>
                  )}
                  {c.approved && (
                    <button onClick={() => handleReject(c._id)}
                      title="Unapprove (hide) comment"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-amber-50 hover:text-amber-600">
                      <X size={15} />
                    </button>
                  )}
                  <Link href={`/news/${c.articleSlug}`} target="_blank"
                    title="View article"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600">
                    <ExternalLink size={14} />
                  </Link>
                  <button onClick={() => handleDelete(c._id)}
                    title="Delete permanently"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-gray-400">
              Page {page} of {pages} · {total} total
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-semibold text-gray-700">{page}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <AlertCircle size={15} className="shrink-0 mt-0.5" />
        <span>New comments are held for review. Approve them to make them visible on article pages. Rejected comments stay hidden but are not deleted.</span>
      </div>
    </div>
  );
}
