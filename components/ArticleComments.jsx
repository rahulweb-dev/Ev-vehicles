"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Loader2, User } from "lucide-react";

export default function ArticleComments({ slug }) {
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [name,     setName]     = useState("");
  const [content,  setContent]  = useState("");
  const [posting,  setPosting]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  useEffect(() => {
    fetch(`/api/comments?slug=${slug}`)
      .then(r => r.json())
      .then(data => setComments(data.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !content.trim()) { setError("Name and comment are required."); return; }
    setPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleSlug: slug, name: name.trim(), content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to post comment."); return; }
      setName(""); setContent(""); setSuccess(true);
      setTimeout(() => setSuccess(false), 6000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="mt-10 border-t border-gray-100 pt-10">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-gray-900">
        <MessageSquare size={22} className="text-green-600" />
        Comments {comments.length > 0 && <span className="text-base text-gray-400">({comments.length})</span>}
      </h2>

      {/* Post form */}
      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-700">Leave a comment</h3>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          maxLength={60}
          className="mb-3 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share your thoughts…"
          rows={4}
          maxLength={1000}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 resize-none"
        />
        <div className="mt-1 text-right text-xs text-gray-400">{content.length}/1000</div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {success && <p className="mt-2 text-sm font-medium text-amber-600">Comment submitted! It will appear after admin review.</p>}

        <button type="submit" disabled={posting}
          className="mt-3 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70">
          {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Post Comment
        </button>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/4 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-3 w-3/4 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 py-10 text-center">
          <MessageSquare size={32} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 rounded-2xl bg-white border border-gray-100 px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
