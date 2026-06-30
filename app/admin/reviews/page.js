"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, CheckCircle, XCircle, Trash2, Car, Bike, RefreshCw, Eye } from "lucide-react";
import Link from "next/link";

const STATUS_TABS = [
  { id: "pending",  label: "Pending",  color: "bg-yellow-100 text-yellow-800" },
  { id: "approved", label: "Approved", color: "bg-green-100 text-green-800" },
  { id: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={14} className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
      ))}
      <span className="ml-1 text-sm font-bold text-gray-700">{rating}/5</span>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [activeTab,  setActiveTab]  = useState("pending");
  const [reviews,    setReviews]    = useState([]);
  const [counts,     setCounts]     = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading,    setLoading]    = useState(true);
  const [actionId,   setActionId]   = useState(null);

  const fetchReviews = useCallback(async (status) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/reviews?status=${status}&limit=50`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch { setReviews([]); }
    setLoading(false);
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const [p, a, r] = await Promise.all([
        fetch("/api/reviews?status=pending&limit=1").then(r => r.json()),
        fetch("/api/reviews?status=approved&limit=1").then(r => r.json()),
        fetch("/api/reviews?status=rejected&limit=1").then(r => r.json()),
      ]);
      setCounts({ pending: p.total || 0, approved: a.total || 0, rejected: r.total || 0 });
    } catch {}
  }, []);

  useEffect(() => {
    fetchReviews(activeTab);
    fetchCounts();
  }, [activeTab, fetchReviews, fetchCounts]);

  async function updateStatus(id, status) {
    setActionId(id);
    try {
      await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setReviews(prev => prev.filter(r => r._id !== id));
      setCounts(prev => ({
        ...prev,
        [activeTab]: Math.max(0, prev[activeTab] - 1),
        [status]: prev[status] + 1,
      }));
    } catch { alert("Action failed"); }
    setActionId(null);
  }

  async function deleteReview(id) {
    if (!confirm("Delete this review permanently?")) return;
    setActionId(id);
    try {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      setReviews(prev => prev.filter(r => r._id !== id));
      setCounts(prev => ({ ...prev, [activeTab]: Math.max(0, prev[activeTab] - 1) }));
    } catch { alert("Delete failed"); }
    setActionId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Vehicle Reviews</h1>
          <p className="mt-0.5 text-sm text-gray-500">Approve or reject user-submitted reviews before they go public.</p>
        </div>
        <button onClick={() => { fetchReviews(activeTab); fetchCounts(); }}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {STATUS_TABS.map(t => (
          <div key={t.id} className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t.label}</p>
            <p className="mt-1 text-3xl font-black text-gray-900">{counts[t.id]}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 rounded-t-xl px-5 py-2.5 text-sm font-bold transition ${
              activeTab === t.id
                ? "bg-white border border-b-white -mb-px text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
            {counts[t.id] > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${t.color}`}>
                {counts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">
          <RefreshCw size={32} className="mx-auto mb-3 animate-spin opacity-40" />
          <p className="text-sm">Loading reviews…</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">No {activeTab} reviews</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard
              key={review._id}
              review={review}
              activeTab={activeTab}
              actionId={actionId}
              onApprove={() => updateStatus(review._id, "approved")}
              onReject={() => updateStatus(review._id, "rejected")}
              onDelete={() => deleteReview(review._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review, activeTab, actionId, onApprove, onReject, onDelete }) {
  const busy = actionId === review._id;
  const vehiclePath = review.vehicleType === "bike"
    ? `/bikes/${review.vehicleSlug}`
    : `/cars/${review.vehicleSlug}`;

  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${busy ? "opacity-60" : ""}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: review content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              review.vehicleType === "bike" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"
            }`}>
              {review.vehicleType === "bike" ? <Bike size={11} /> : <Car size={11} />}
              {review.vehicleName || review.vehicleSlug}
            </span>
            {review.city && (
              <span className="text-[11px] text-gray-400">{review.city}</span>
            )}
            {date && <span className="text-[11px] text-gray-400">{date}</span>}
          </div>

          <div className="flex items-center gap-3 mb-2">
            <p className="font-bold text-gray-900">{review.name}</p>
            {review.email && <p className="text-xs text-gray-400">{review.email}</p>}
          </div>

          <StarRating rating={review.rating} />

          {review.title && (
            <p className="mt-2 text-sm font-semibold text-gray-800">{review.title}</p>
          )}
          <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{review.body}</p>

          {(review.pros || review.cons) && (
            <div className="mt-3 flex gap-4">
              {review.pros && (
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={14} className="mt-0.5 shrink-0 text-green-500" />
                  <p className="text-xs text-gray-500"><strong className="text-gray-700">Pros:</strong> {review.pros}</p>
                </div>
              )}
              {review.cons && (
                <div className="flex items-start gap-1.5">
                  <XCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
                  <p className="text-xs text-gray-500"><strong className="text-gray-700">Cons:</strong> {review.cons}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
          <Link href={vehiclePath} target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
            <Eye size={13} /> View vehicle
          </Link>

          {activeTab !== "approved" && (
            <button onClick={onApprove} disabled={busy}
              className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 transition disabled:opacity-50">
              <CheckCircle size={13} /> Approve
            </button>
          )}

          {activeTab !== "rejected" && (
            <button onClick={onReject} disabled={busy}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-50">
              <XCircle size={13} /> Reject
            </button>
          )}

          <button onClick={onDelete} disabled={busy}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-400 hover:border-red-200 hover:text-red-500 transition disabled:opacity-50">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
