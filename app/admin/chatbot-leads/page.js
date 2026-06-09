"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare, Phone, Mail, MapPin, Car, Bike,
  RefreshCw, Trash2, CheckCircle, Clock, XCircle, PhoneCall,
  Download, Search,
} from "lucide-react";

const STATUS_CONFIG = {
  new:       { label: "New",       color: "bg-blue-100 text-blue-700",   icon: Clock },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-700", icon: PhoneCall },
  converted: { label: "Converted", color: "bg-green-100 text-green-700",  icon: CheckCircle },
  lost:      { label: "Lost",      color: "bg-red-100 text-red-700",     icon: XCircle },
};

const STATUSES = ["all", "new", "contacted", "converted", "lost"];

function fmt(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ChatbotLeadsPage() {
  const [leads,   setLeads]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const qs  = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/chatbot-leads${qs}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch { setLeads([]); }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [filter]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    await fetch(`/api/chatbot-leads/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    });
    setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
    setUpdatingId(null);
  };

  const deleteLead = async (id) => {
    if (!confirm("Delete this chatbot lead?")) return;
    await fetch(`/api/chatbot-leads/${id}`, { method: "DELETE" });
    setLeads(prev => prev.filter(l => l._id !== id));
    setTotal(t => t - 1);
  };

  const exportCSV = () => {
    const headers = ["Name", "Phone", "Email", "City", "Vehicle", "Type", "Status", "Date"];
    const rows = leads.map(l => [
      l.name, l.phone, l.email, l.city,
      l.interestedVehicle, l.vehicleType, l.status,
      new Date(l.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ""}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `chatbot-leads-${Date.now()}.csv`;
    a.click();
  };

  const filtered = leads.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.name?.toLowerCase().includes(q)
      || l.phone?.includes(q)
      || l.email?.toLowerCase().includes(q)
      || l.city?.toLowerCase().includes(q)
      || l.interestedVehicle?.toLowerCase().includes(q);
  });

  const counts = {
    all:       leads.length,
    new:       leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    converted: leads.filter(l => l.status === "converted").length,
    lost:      leads.filter(l => l.status === "lost").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Chatbot Leads</h1>
            <p className="text-sm text-gray-500">{total} total enquiries from EVRadar AI chat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLeads}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:border-green-400 transition">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "New",       count: counts.new,       color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
          { label: "Contacted", count: counts.contacted, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
          { label: "Converted", count: counts.converted, color: "text-green-600",  bg: "bg-green-50 border-green-200" },
          { label: "Lost",      count: counts.lost,      color: "text-red-600",    bg: "bg-red-50 border-red-200" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 text-xs font-semibold capitalize transition border-r border-gray-200 last:border-0 ${
                filter === s ? "bg-green-600 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}>
              {s} {s !== "all" && counts[s] > 0 && `(${counts[s]})`}
            </button>
          ))}
        </div>

        <div className="flex flex-1 min-w-48 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">
            <RefreshCw size={16} className="mr-2 animate-spin" /> Loading leads…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageSquare size={40} className="text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No chatbot leads yet</p>
            <p className="text-gray-400 text-sm mt-1">Leads will appear here when users fill the chat form</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Interested In</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(lead => {
                  const sc = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={lead._id} className="hover:bg-gray-50/60 transition">
                      {/* Contact */}
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900 text-sm">{lead.name}</p>
                        <a href={`tel:${lead.phone}`}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-0.5">
                          <Phone size={10} /> {lead.phone}
                        </a>
                        {lead.email && (
                          <a href={`mailto:${lead.email}`}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-0.5">
                            <Mail size={10} /> {lead.email}
                          </a>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5">
                        {lead.city ? (
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin size={12} className="text-gray-400" /> {lead.city}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      {/* Vehicle */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {lead.vehicleType === "bike" || lead.vehicleType === "commercial"
                            ? <Bike size={13} className="text-purple-500" />
                            : <Car  size={13} className="text-blue-500" />
                          }
                          <span className="text-sm text-gray-700">
                            {lead.interestedVehicle || <span className="text-gray-300 italic text-xs">Not specified</span>}
                          </span>
                        </div>
                        <span className="mt-0.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 capitalize">
                          {lead.vehicleType}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <select
                          value={lead.status}
                          disabled={updatingId === lead._id}
                          onChange={e => updateStatus(lead._id, e.target.value)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold border-0 outline-none cursor-pointer ${sc.color}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                            <option key={val} value={val}>{cfg.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {fmt(lead.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <a href={`tel:${lead.phone}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                            title="Call">
                            <Phone size={14} />
                          </a>
                          <a href={`https://wa.me/91${lead.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi ${lead.name}, I'm from EVRadar team. I see you're interested in an electric vehicle. How can I help you?`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                            title="WhatsApp">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </a>
                          <button onClick={() => deleteLead(lead._id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                            title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
