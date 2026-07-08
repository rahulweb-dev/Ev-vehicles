"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2, XCircle, Clock, RefreshCw,
  Loader2, ChevronLeft, ChevronRight, ExternalLink,
} from "lucide-react";

const PLATFORMS = [
  { id: "facebook",  label: "FB",  emoji: "📘" },
  { id: "linkedin",  label: "LI",  emoji: "💼" },
  { id: "pinterest", label: "PIN", emoji: "📌" },
  { id: "telegram",  label: "TG",  emoji: "✈️" },
];

function StatusPill({ status, platform }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
        <Clock size={9} /> —
      </span>
    );
  }
  if (status.published) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700" title={`Published ${new Date(status.publishedAt).toLocaleString("en-IN")}`}>
        <CheckCircle2 size={9} /> OK
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600" title={status.error || "Failed"}>
      <XCircle size={9} /> Fail
    </span>
  );
}

function RetryButton({ articleId, targets, onRetried }) {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  async function handleRetry() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/social-publish/${articleId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      setTimeout(() => { setDone(false); onRetried?.(); }, 1500);
    } catch (err) {
      alert(`Retry failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRetry}
      disabled={loading || done}
      className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
        done
          ? "bg-green-100 text-green-700"
          : "bg-amber-50 text-amber-700 hover:bg-amber-100"
      } disabled:opacity-60`}
    >
      {loading ? (
        <Loader2 size={11} className="animate-spin" />
      ) : done ? (
        <CheckCircle2 size={11} />
      ) : (
        <RefreshCw size={11} />
      )}
      {done ? "Done!" : "Retry"}
    </button>
  );
}

export default function SocialReportPage() {
  const [articles, setArticles] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/social-report?page=${page}&limit=20`);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {}
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Social Publishing Report</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {total} article{total !== 1 ? "s" : ""} with social targets
          </p>
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      {loading && articles.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Loading report…
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 py-20 text-center">
          <p className="text-sm text-gray-500">No articles with social targets yet.</p>
          <p className="mt-1 text-xs text-gray-400">
            Select platforms in the{" "}
            <Link href="/admin/articles/new" className="text-blue-500 hover:underline">article editor</Link>{" "}
            when publishing.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Article</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Published</th>
                  {PLATFORMS.map((p) => (
                    <th key={p.id} className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-400">
                      {p.emoji} {p.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {articles.map((article) => {
                  const ss = article.socialStatus ?? {};
                  const failedPlatforms = (article.socialTargets ?? []).filter(
                    (p) => !ss[p]?.published
                  );
                  return (
                    <tr key={article._id} className="hover:bg-gray-50 transition">
                      <td className="max-w-xs px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div>
                            <p className="line-clamp-2 text-xs font-semibold text-gray-800">{article.title}</p>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 capitalize">
                                {article.category}
                              </span>
                              <a
                                href={`/news/${article.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5"
                              >
                                <ExternalLink size={9} /> View
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })
                          : "—"}
                      </td>
                      {PLATFORMS.map((p) => (
                        <td key={p.id} className="px-3 py-3 text-center">
                          {article.socialTargets?.includes(p.id)
                            ? <StatusPill status={ss[p.id]} platform={p.id} />
                            : <span className="text-[10px] text-gray-300">—</span>
                          }
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {failedPlatforms.length > 0 && (
                            <RetryButton
                              articleId={article._id}
                              targets={failedPlatforms}
                              onRetried={fetchReport}
                            />
                          )}
                          <Link
                            href={`/admin/articles/${article._id}/edit`}
                            className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
