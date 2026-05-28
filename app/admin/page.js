"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Newspaper, Eye, Plus, CheckCircle2, FileText,
  BarChart2, Zap, Users, Car, Bike, Truck, ArrowRight,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-5">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${color} mb-4`}>
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-3xl font-black text-white">{value ?? "—"}</p>
      <p className="mt-1 text-sm font-medium text-gray-300">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [leads, setLeads]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [publishedRes, draftRes, latestRes, leadsRes] = await Promise.all([
          fetch("/api/articles?status=published&limit=100"),
          fetch("/api/articles?status=draft&limit=100"),
          fetch("/api/articles?status=published&limit=5"),
          fetch("/api/leads?limit=200"),
        ]);
        const [pub, draft, latest, leadsData] = await Promise.all([
          publishedRes.json(),
          draftRes.json(),
          latestRes.json(),
          leadsRes.json(),
        ]);

        const totalViews = (pub.articles || []).reduce((s, a) => s + (a.views || 0), 0);
        setStats({
          published: pub.total || 0,
          drafts:    draft.total || 0,
          total:     (pub.total || 0) + (draft.total || 0),
          views:     totalViews,
        });
        setRecent(latest.articles || []);

        const allLeads = leadsData.leads || [];
        setLeads({
          total:      allLeads.length,
          newLeads:   allLeads.filter((l) => l.status === "new").length,
          cars:       allLeads.filter((l) => l.vehicleType === "car").length,
          bikes:      allLeads.filter((l) => l.vehicleType === "bike").length,
          commercial: allLeads.filter((l) => l.vehicleType === "commercial").length,
          recent:     allLeads.slice(0, 5),
        });
      } catch {
        setStats({ published: 0, drafts: 0, total: 0, views: 0 });
        setLeads({ total: 0, newLeads: 0, cars: 0, bikes: 0, commercial: 0, recent: [] });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6 pt-20 lg:p-8 lg:pt-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Welcome back to EV News India CMS</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-500"
        >
          <Plus size={16} /> New Article
        </Link>
      </div>

      {/* Article Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={Newspaper}    label="Total Articles" value={stats?.total}                          color="bg-blue-600"   />
        <StatCard icon={CheckCircle2} label="Published"      value={stats?.published}                     color="bg-green-600"  />
        <StatCard icon={FileText}     label="Drafts"         value={stats?.drafts}                        color="bg-yellow-600" />
        <StatCard icon={Eye}          label="Total Views"    value={stats?.views?.toLocaleString("en-IN")} color="bg-purple-600" />
      </div>

      {/* ── Leads Overview ───────────────────────────────────────────── */}
      <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Users size={18} className="text-green-400" />
            <h2 className="font-bold text-white">Customer Leads</h2>
            {leads?.newLeads > 0 && (
              <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-[11px] font-black text-white animate-pulse">
                {leads.newLeads} NEW
              </span>
            )}
          </div>
          <Link href="/admin/leads" className="flex items-center gap-1 text-xs font-semibold text-green-400 hover:text-green-300 transition">
            View All <ArrowRight size={13} />
          </Link>
        </div>

        {/* Lead Type Breakdown */}
        <div className="grid grid-cols-2 divide-x divide-gray-800 border-b border-gray-800 sm:grid-cols-4">
          {[
            { label: "Total Leads",  value: leads?.total,      icon: Users, color: "text-white" },
            { label: "Car Enquiries",  value: leads?.cars,       icon: Car,   color: "text-blue-400" },
            { label: "Bike Enquiries", value: leads?.bikes,      icon: Bike,  color: "text-orange-400" },
            { label: "Commercial",   value: leads?.commercial,  icon: Truck, color: "text-purple-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex flex-col items-center gap-1 py-5">
              <Icon size={18} className={color} />
              <p className={`text-2xl font-black ${color}`}>{value ?? "—"}</p>
              <p className="text-[11px] font-medium text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent Leads list */}
        <div className="divide-y divide-gray-800/60">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 px-5 py-4">
                <div className="h-9 w-9 rounded-xl bg-gray-800 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/2 rounded bg-gray-800" />
                  <div className="h-2.5 w-1/3 rounded bg-gray-800" />
                </div>
              </div>
            ))
          ) : leads?.recent?.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-600">
              No leads yet — leads appear when customers submit an enquiry form
            </div>
          ) : (
            leads?.recent?.map((lead) => {
              const typeColor = lead.vehicleType === "car"
                ? "bg-blue-900/50 text-blue-400"
                : lead.vehicleType === "bike"
                ? "bg-orange-900/50 text-orange-400"
                : "bg-purple-900/50 text-purple-400";
              const TypeIcon = lead.vehicleType === "car" ? Car : lead.vehicleType === "bike" ? Bike : Truck;
              const statusColor = lead.status === "new" ? "text-green-400" : lead.status === "contacted" ? "text-yellow-400" : lead.status === "converted" ? "text-emerald-400" : "text-red-400";
              return (
                <div key={lead._id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${typeColor}`}>
                    <TypeIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{lead.name}
                      <span className="ml-2 text-xs font-normal text-gray-500">· {lead.vehicleName}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {lead.phone}{lead.city ? ` · ${lead.city}` : ""}
                      {" · "}{new Date(lead.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <span className={`text-xs font-bold capitalize ${statusColor}`}>{lead.status}</span>
                </div>
              );
            })
          )}
        </div>

        {leads?.total > 5 && (
          <div className="border-t border-gray-800 px-5 py-3">
            <Link href="/admin/leads" className="text-xs font-semibold text-green-400 hover:text-green-300 transition">
              View all {leads.total} leads →
            </Link>
          </div>
        )}
      </div>

      {/* IndexNow Banner */}
      <div className="mb-8 rounded-2xl bg-green-900/20 border border-green-800/40 p-5">
        <div className="flex items-center gap-3">
          <Zap size={20} className="text-green-400 shrink-0" />
          <div>
            <p className="font-bold text-green-300 text-sm">IndexNow Active</p>
            <p className="text-xs text-green-500/70">
              Every article you publish is automatically pinged to Google, Bing &amp; Yandex within seconds via IndexNow.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* Recent Articles */}
        <div className="rounded-2xl bg-gray-900 border border-gray-800">
          <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
            <h2 className="font-bold text-white">Recent Articles</h2>
            <Link href="/admin/articles" className="text-xs text-green-400 hover:text-green-300 transition">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-800">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3 p-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-gray-800" />
                    <div className="h-2.5 w-1/2 rounded bg-gray-800" />
                  </div>
                </div>
              ))
            ) : recent.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Newspaper size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No articles yet. Create your first one!</p>
              </div>
            ) : (
              recent.map((article) => (
                <div key={article._id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold uppercase ${
                    article.category === "cars"       ? "bg-blue-900/50 text-blue-400"   :
                    article.category === "bikes"      ? "bg-orange-900/50 text-orange-400" :
                    article.category === "commercial" ? "bg-purple-900/50 text-purple-400" :
                    "bg-green-900/50 text-green-400"
                  }`}>
                    {article.category.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{article.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-IN")}
                      {" · "}{article.views || 0} views
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      article.status === "published" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"
                    }`}>
                      {article.status}
                    </span>
                    <Link href={`/admin/articles/${article._id}/edit`} className="text-xs text-gray-500 hover:text-white transition">
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions + SEO */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-5">
            <h2 className="mb-4 font-bold text-white">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { href: "/admin/articles/new", label: "Write New Article", icon: Newspaper, color: "text-blue-400" },
                { href: "/admin/articles",     label: "Manage Articles",   icon: BarChart2, color: "text-green-400" },
                { href: "/admin/leads",        label: "View All Leads",    icon: Users,     color: "text-yellow-400" },
                { href: "/",                   label: "View Live Site",    icon: Eye,       color: "text-purple-400" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    target={action.href === "/" ? "_blank" : undefined}
                    className="flex items-center gap-3 rounded-xl border border-gray-800 px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-gray-700 hover:bg-gray-800 hover:text-white"
                  >
                    <Icon size={16} className={action.color} />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-5">
            <h2 className="mb-3 font-bold text-white text-sm">SEO Checklist</h2>
            <ul className="space-y-2 text-xs text-gray-400">
              {[
                "Write unique titles (50–60 chars)",
                "Add meta description (150–160 chars)",
                "Use target keywords in first paragraph",
                "Upload images to ImageKit for fast CDN",
                "Add relevant tags for categorization",
                "Feature important articles on homepage",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-green-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
