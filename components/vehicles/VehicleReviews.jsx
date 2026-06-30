"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ThumbsUp, MapPin, CheckCircle, ChevronDown, X, Loader2, Send } from "lucide-react";

function Stars({ value, max = 5, size = 14, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i}
          size={size}
          fill={i < Math.round(value) ? "#f59e0b" : "none"}
          className={`${i < Math.round(value) ? "text-amber-400" : "text-gray-300"} ${interactive ? "cursor-pointer hover:text-amber-400" : ""}`}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-gray-500">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="w-6 text-xs font-bold text-gray-700">{value?.toFixed(1)}</span>
    </div>
  );
}

function ReviewCard({ review }) {
  const [helpful, setHelpful] = useState(review.helpful || 0);
  const [voted,   setVoted]   = useState(false);

  async function markHelpful() {
    if (voted) return;
    setHelpful(h => h + 1);
    setVoted(true);
    await fetch(`/api/reviews/${review._id}/helpful`, { method: "POST" }).catch(() => {});
  }

  const since = review.ownedMonths
    ? review.ownedMonths >= 12
      ? `${Math.floor(review.ownedMonths / 12)} yr owner`
      : `${review.ownedMonths} mo owner`
    : null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-black text-white">
              {review.name[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{review.name}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                {review.city && <><MapPin size={9} />{review.city}</>}
                {since && <><span>·</span><span>{since}</span></>}
                {review.verified && <><span>·</span><CheckCircle size={9} className="text-green-500" /><span className="text-green-600 font-semibold">Verified</span></>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1">
            <Star size={12} fill="#f59e0b" className="text-amber-400" />
            <span className="text-sm font-black text-amber-700">{review.rating}.0</span>
          </div>
          <span className="text-[10px] text-gray-400">
            {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      {review.title && <p className="text-sm font-bold text-gray-900 mb-1.5">{review.title}</p>}
      <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>

      {(review.pros || review.cons) && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {review.pros && (
            <div className="rounded-xl bg-green-50 border border-green-100 px-3 py-2">
              <p className="text-[10px] font-bold text-green-700 mb-1">👍 Pros</p>
              <p className="text-xs text-green-800">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2">
              <p className="text-[10px] font-bold text-red-700 mb-1">👎 Cons</p>
              <p className="text-xs text-red-800">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      <button onClick={markHelpful} disabled={voted}
        className={`mt-3 flex items-center gap-1.5 text-xs font-semibold transition ${voted ? "text-green-600" : "text-gray-400 hover:text-gray-700"}`}>
        <ThumbsUp size={12} /> {helpful > 0 ? `${helpful} found helpful` : "Was this helpful?"}
      </button>
    </div>
  );
}

function WriteReviewModal({ vehicleSlug, vehicleName, vehicleType, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", city: "", email: "", rating: 0, ratingRange: 0, ratingComfort: 0, ratingCharging: 0, ratingValue: 0, title: "", body: "", pros: "", cons: "", ownedMonths: "" });
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.rating) return setError("Please select an overall rating");
    if (!form.body.trim()) return setError("Please write your review");
    setSaving(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, vehicleSlug, vehicleName, vehicleType, ownedMonths: form.ownedMonths ? parseInt(form.ownedMonths) : null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onSubmit();
    } catch (err) {
      setError(err.message || "Failed to submit");
    } finally {
      setSaving(false);
    }
  }

  const SUB_RATINGS = [
    { key: "ratingRange",    label: "Range & Battery" },
    { key: "ratingComfort",  label: "Comfort & Ride" },
    { key: "ratingCharging", label: "Charging Speed" },
    { key: "ratingValue",    label: "Value for Money" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="font-black text-gray-900">Rate {vehicleName}</h3>
          <button onClick={onClose} className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 transition"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">{error}</div>}

          {/* Step 1: Ratings */}
          {step === 1 && (
            <>
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Overall Rating <span className="text-red-500">*</span></p>
                <div className="flex items-center gap-2">
                  <Stars value={form.rating} size={32} interactive onChange={v => setForm(f => ({ ...f, rating: v }))} />
                  {form.rating > 0 && <span className="text-lg font-black text-amber-500">{["","Poor","Fair","Good","Very Good","Excellent"][form.rating]}</span>}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rate specific aspects</p>
                {SUB_RATINGS.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-36">{label}</span>
                    <Stars value={form[key]} size={20} interactive onChange={v => setForm(f => ({ ...f, [key]: v }))} />
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => { if (!form.rating) return setError("Please select a rating"); setError(""); setStep(2); }}
                className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700 transition">
                Next →
              </button>
            </>
          )}

          {/* Step 2: Review text */}
          {step === 2 && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Review Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} maxLength={120}
                  placeholder="Summarise your experience in one line"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Your Review <span className="text-red-500">*</span></label>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} maxLength={1000} rows={4}
                  placeholder="Share your experience — range in real-world, comfort, charging, after-sales…"
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none" />
                <p className="text-right text-[10px] text-gray-400">{form.body.length}/1000</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-green-700">👍 What you loved</label>
                  <textarea value={form.pros} onChange={e => setForm(f => ({ ...f, pros: e.target.value }))} maxLength={200} rows={2}
                    placeholder="Range, comfort, features…"
                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-green-400 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-red-600">👎 What needs work</label>
                  <textarea value={form.cons} onChange={e => setForm(f => ({ ...f, cons: e.target.value }))} maxLength={200} rows={2}
                    placeholder="Charging time, boot space…"
                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-red-300 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">← Back</button>
                <button type="button" onClick={() => { if (!form.body.trim()) return setError("Please write your review"); setError(""); setStep(3); }}
                  className="flex-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700 transition">Next →</button>
              </div>
            </>
          )}

          {/* Step 3: Personal details */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Your Name <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={60} required
                    placeholder="First name"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} maxLength={40}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Email (private)</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="For verification only"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Owned for (months)</label>
                  <input type="number" value={form.ownedMonths} onChange={e => setForm(f => ({ ...f, ownedMonths: e.target.value }))} min={0} max={120}
                    placeholder="e.g. 6"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">← Back</button>
                <button type="submit" disabled={saving}
                  className="flex-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <><Send size={14} /> Submit Review</>}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default function VehicleReviews({ vehicleSlug, vehicleName, vehicleType = "car" }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [showModal,  setShowModal]  = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/reviews?slug=${vehicleSlug}&page=${page}&limit=5`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [vehicleSlug, page]);

  useEffect(() => { load(); }, [load]);

  const stats = data?.stats;
  const avg   = stats?.avgRating ? parseFloat(stats.avgRating.toFixed(1)) : 0;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-black text-gray-900">User Reviews</h2>
          {stats && <p className="text-sm text-gray-500">{data.total} verified owner reviews</p>}
        </div>
        <button onClick={() => setShowModal(true)}
          className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition shadow-sm">
          Write a Review
        </button>
      </div>

      {/* Rating summary */}
      {stats && data.total > 0 && (
        <div className="mb-6 rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900">{avg}</p>
              <Stars value={avg} size={16} />
              <p className="text-xs text-gray-400 mt-1">{data.total} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map(star => {
                const count = stats[`count${star}`] || 0;
                const pct   = data.total ? (count / data.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-3 text-xs text-gray-500 text-right">{star}</span>
                    <Star size={10} fill="#f59e0b" className="text-amber-400 shrink-0" />
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-5 text-xs text-gray-400">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="hidden sm:flex flex-col gap-2">
              <RatingBar label="Range"    value={stats.avgRange} />
              <RatingBar label="Comfort"  value={stats.avgComfort} />
              <RatingBar label="Charging" value={stats.avgCharging} />
              <RatingBar label="Value"    value={stats.avgValue} />
            </div>
          </div>
        </div>
      )}

      {/* Submitted thank-you */}
      {submitted && (
        <div className="mb-4 rounded-2xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-800">Thank you! Your review is pending approval and will appear shortly.</p>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="animate-pulse h-28 rounded-2xl bg-white border border-gray-200" />)}</div>
      ) : data?.reviews?.length ? (
        <div className="space-y-4">
          {data.reviews.map(r => <ReviewCard key={r._id} review={r} />)}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {page > 1 && <button onClick={() => setPage(p => p - 1)} className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">← Previous</button>}
              <span className="text-xs text-gray-400">Page {page} of {data.pages}</span>
              {page < data.pages && <button onClick={() => setPage(p => p + 1)} className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Next →</button>}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center">
          <Star size={32} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-semibold text-gray-500">No reviews yet</p>
          <p className="text-xs text-gray-400 mt-1">Be the first to review the {vehicleName}</p>
          <button onClick={() => setShowModal(true)} className="mt-4 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
            Write First Review
          </button>
        </div>
      )}

      {showModal && (
        <WriteReviewModal
          vehicleSlug={vehicleSlug}
          vehicleName={vehicleName}
          vehicleType={vehicleType}
          onClose={() => setShowModal(false)}
          onSubmit={() => { setShowModal(false); setSubmitted(true); load(); }}
        />
      )}
    </div>
  );
}
