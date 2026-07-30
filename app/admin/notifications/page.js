"use client";

import { useEffect, useState } from "react";
import { Bell, Users, Mail, Clock, RefreshCw, TrendingUp, MousePointer, Eye } from "lucide-react";

function ago(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function fmtScheduled(date) {
  const d = new Date(date);
  return d.toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const INTENT_LABELS = {
  test_drive:  "Test Drive",
  price_quote: "Price Quote",
  finance:     "Finance",
  general:     "Enquiry",
};

export default function NotificationsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/notifications");
      if (!r.ok) throw new Error("Failed to load");
      setData(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-xs text-gray-500">Last 24 hours activity</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      {loading && !data && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <div className="space-y-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-600">New Leads</span>
              </div>
              <p className="text-2xl font-black text-blue-700">{data.leads.length}</p>
              <p className="text-xs text-blue-500">in past 24 hours</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-green-600">New Subscribers</span>
              </div>
              <p className="text-2xl font-black text-green-700">{data.newSubs}</p>
              <p className="text-xs text-green-500">in past 24 hours</p>
            </div>
          </div>

          {/* Recent Leads */}
          <section>
            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Recent Leads
            </h2>
            {data.leads.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No leads in the last 24 hours</p>
            ) : (
              <div className="space-y-2">
                {data.leads.map((lead) => (
                  <div key={lead._id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500">
                        {lead.vehicleName}
                        {lead.city ? ` · ${lead.city}` : ""}
                        {" · "}
                        <span className="text-blue-600">{INTENT_LABELS[lead.intent] || lead.intent}</span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{ago(lead.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Campaigns Sent */}
          <section>
            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-500" />
              Campaigns Sent (24h)
            </h2>
            {data.campaigns.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No campaigns sent in the last 24 hours</p>
            ) : (
              <div className="space-y-2">
                {data.campaigns.map((c) => (
                  <div key={c._id} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{ago(c.sentAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 truncate">{c.subject}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Mail className="w-3 h-3" /> {c.sentCount} sent
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <Eye className="w-3 h-3" /> {c.openCount || 0} opens
                      </span>
                      <span className="flex items-center gap-1 text-blue-600">
                        <MousePointer className="w-3 h-3" /> {c.clickCount || 0} clicks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Scheduled Articles */}
          <section>
            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Going Live in 24 Hours
            </h2>
            {data.scheduledArticles.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No articles scheduled in the next 24 hours</p>
            ) : (
              <div className="space-y-2">
                {data.scheduledArticles.map((a) => (
                  <div key={a._id} className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                    <span className="text-xs text-orange-600 whitespace-nowrap ml-2">{fmtScheduled(a.scheduledAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <p className="text-center text-xs text-gray-400">
            Last refreshed {ago(data.fetchedAt)}
          </p>
        </div>
      )}
    </div>
  );
}
