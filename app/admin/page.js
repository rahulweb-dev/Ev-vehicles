"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Newspaper, Eye, Plus, CheckCircle2, FileText,
  BarChart2, Zap, Users, Car, Bike, Truck, ArrowRight,
  TrendingUp, Clock, Star,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/75">{label}</p>
          <p className="mt-1.5 text-3xl font-black">{value ?? "—"}</p>
          {sub && <p className="mt-1 text-xs text-white/60">{sub}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
          <Icon size={22} />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10" />
    </div>
  );
}

function ArticleCard({ article }) {
  const catColor = {
    cars: "bg-blue-500", bikes: "bg-orange-500",
    commercial: "bg-purple-500", charging: "bg-teal-500",
  }[article.category] || "bg-gray-400";

  return (
    <div className="group flex gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:border-green-200 hover:shadow-sm transition">
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {article.image ? (
          <Image src={article.image} alt={article.imageAlt || article.title} fill
            className="object-cover transition group-hover:scale-105" sizes="80px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Newspaper size={18} className="text-gray-300" />
          </div>
        )}
        <span className={`absolute left-1 top-1 rounded px-1 py-0.5 text-[8px] font-black text-white uppercase ${catColor}`}>
          {article.category.slice(0, 3)}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <p className="line-clamp-2 text-sm font-semibold text-gray-800 leading-snug">{article.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            article.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {article.status}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Eye size={10} /> {(article.views || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>
      <Link href={`/admin/articles/${article._id}/edit`}
        className="self-start rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-700 transition opacity-0 group-hover:opacity-100">
        <BarChart2 size={14} />
      </Link>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [recent, setRecent]     = useState([]);
  const [featured, setFeatured] = useState([]);
  const [leads, setLeads]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pubRes, draftRes, latestRes, leadsRes, featRes] = await Promise.all([
          fetch("/api/articles?status=published&limit=100"),
          fetch("/api/articles?status=draft&limit=100"),
          fetch("/api/articles?status=published&limit=6"),
          fetch("/api/leads?limit=200"),
          fetch("/api/articles?status=published&featured=true&limit=3"),
        ]);
        const [pub, draft, latest, leadsData, feat] = await Promise.all([
          pubRes.json(), draftRes.json(), latestRes.json(), leadsRes.json(), featRes.json(),
        ]);
        const totalViews = (pub.articles || []).reduce((s, a) => s + (a.views || 0), 0);
        setStats({ published: pub.total || 0, drafts: draft.total || 0, total: (pub.total || 0) + (draft.total || 0), views: totalViews });
        setRecent(latest.articles || []);
        setFeatured((feat.articles || []).slice(0, 3));
        const allLeads = leadsData.leads || [];
        setLeads({
          total: allLeads.length,
          newLeads: allLeads.filter((l) => l.status === "new").length,
          cars: allLeads.filter((l) => l.vehicleType === "car").length,
          bikes: allLeads.filter((l) => l.vehicleType === "bike").length,
          commercial: allLeads.filter((l) => l.vehicleType === "commercial").length,
          recent: allLeads.slice(0, 4),
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
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:p-6 lg:pt-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Welcome back — EVBharat India CMS</p>
        </div>
        <Link href="/admin/articles/new"
          className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 transition shadow-sm">
          <Plus size={16} /> New Article
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Newspaper}    label="Total Articles" value={stats?.total}
          sub={`${stats?.published ?? 0} published · ${stats?.drafts ?? 0} drafts`}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
        <StatCard icon={CheckCircle2} label="Published"      value={stats?.published}
          sub="Live on site" gradient="bg-gradient-to-br from-green-600 to-green-800" />
        <StatCard icon={FileText}     label="Drafts"         value={stats?.drafts}
          sub="Awaiting publish" gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
        <StatCard icon={Eye}          label="Total Views"    value={stats?.views?.toLocaleString("en-IN")}
          sub="Across all articles" gradient="bg-gradient-to-br from-purple-500 to-purple-700" />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left — articles (2 cols) */}
        <div className="space-y-6 lg:col-span-2">

          {/* Featured */}
          {(loading || featured.length > 0) && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold text-gray-800">
                  <Star size={16} className="text-yellow-500" /> Featured Articles
                </h2>
                <Link href="/admin/articles" className="text-xs font-semibold text-green-700 hover:text-green-900 transition">
                  View all →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {loading
                  ? Array(3).fill(0).map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-gray-200 h-48" />)
                  : featured.map((a) => (
                    <Link key={a._id} href={`/admin/articles/${a._id}/edit`}
                      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-green-200 hover:shadow-md transition">
                      <div className="relative h-32 w-full bg-gray-100">
                        {a.image && (
                          <Image src={a.image} alt={a.imageAlt || a.title} fill
                            className="object-cover transition group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw" />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                        <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-yellow-400/90 px-2 py-0.5 text-[9px] font-black text-yellow-900">
                          <Star size={8} fill="currentColor" /> Featured
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-2 text-xs font-semibold text-gray-800 leading-snug">{a.title}</p>
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400">
                          <Eye size={9} /> {(a.views || 0).toLocaleString("en-IN")} views
                        </div>
                      </div>
                    </Link>
                  ))
                }
              </div>
            </section>
          )}

          {/* Recent articles */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-gray-800">
                <Clock size={16} className="text-gray-400" /> Recent Articles
              </h2>
              <Link href="/admin/articles" className="text-xs font-semibold text-green-700 hover:text-green-900 transition">
                Manage all →
              </Link>
            </div>
            <div className="space-y-2">
              {loading
                ? Array(5).fill(0).map((_, i) => <div key={i} className="animate-pulse rounded-xl bg-gray-200 h-18" />)
                : recent.length === 0
                ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center">
                    <Newspaper size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No articles yet</p>
                    <Link href="/admin/articles/new"
                      className="mt-3 inline-flex items-center gap-1 rounded-xl bg-green-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-800 transition">
                      <Plus size={12} /> Write first article
                    </Link>
                  </div>
                )
                : recent.map((a) => <ArticleCard key={a._id} article={a} />)
              }
            </div>
          </section>

          {/* IndexNow banner */}
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                <Zap size={18} className="text-green-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">IndexNow Active</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Every article published is instantly pinged to Google, Bing &amp; Yandex.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — leads + quick actions */}
        <div className="space-y-5">

          {/* Leads card */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-700" />
                <span className="font-bold text-gray-800 text-sm">Customer Leads</span>
                {leads?.newLeads > 0 && (
                  <span className="animate-pulse rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-black text-white">
                    {leads.newLeads} NEW
                  </span>
                )}
              </div>
              <Link href="/admin/leads" className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 transition">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: "Total",      value: leads?.total,      icon: Users, color: "text-gray-800" },
                { label: "Cars",       value: leads?.cars,       icon: Car,   color: "text-blue-600" },
                { label: "Bikes",      value: leads?.bikes,      icon: Bike,  color: "text-orange-500" },
                { label: "Commercial", value: leads?.commercial, icon: Truck, color: "text-purple-600" },
              ].map(({ label, value, icon: Icon, color }, i) => (
                <div key={label} className={`flex flex-col items-center gap-0.5 py-4 ${i >= 2 ? "border-t border-gray-100" : ""}`}>
                  <Icon size={15} className={color} />
                  <p className={`text-xl font-black ${color}`}>{value ?? "—"}</p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
              {loading
                ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 px-4 py-3">
                    <div className="h-8 w-8 rounded-lg bg-gray-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-2/3 rounded bg-gray-100" />
                      <div className="h-2 w-1/2 rounded bg-gray-100" />
                    </div>
                  </div>
                ))
                : leads?.recent?.length === 0
                ? <p className="py-8 text-center text-xs text-gray-400">No leads yet</p>
                : leads?.recent?.map((lead) => {
                  const TypeIcon = lead.vehicleType === "car" ? Car : lead.vehicleType === "bike" ? Bike : Truck;
                  const typeColor = lead.vehicleType === "car"
                    ? "bg-blue-100 text-blue-600"
                    : lead.vehicleType === "bike"
                    ? "bg-orange-100 text-orange-500"
                    : "bg-purple-100 text-purple-600";
                  return (
                    <div key={lead._id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeColor}`}>
                        <TypeIcon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold text-gray-800">{lead.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{lead.vehicleName} · {lead.phone}</p>
                      </div>
                      <span className={`text-[10px] font-bold capitalize ${
                        lead.status === "new" ? "text-green-600"
                        : lead.status === "contacted" ? "text-yellow-600"
                        : lead.status === "converted" ? "text-emerald-600"
                        : "text-red-500"
                      }`}>{lead.status}</span>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-gray-800 text-sm">Quick Actions</h2>
            <div className="space-y-1.5">
              {[
                { href: "/admin/articles/new", label: "Write New Article", icon: Newspaper, color: "text-blue-600",   bg: "bg-blue-50" },
                { href: "/admin/articles",     label: "Manage Articles",   icon: BarChart2, color: "text-green-700",  bg: "bg-green-50" },
                { href: "/admin/leads",        label: "View All Leads",    icon: Users,     color: "text-yellow-600", bg: "bg-yellow-50" },
                { href: "/",                   label: "View Live Site",    icon: Eye,       color: "text-purple-600", bg: "bg-purple-50", external: true },
              ].map((action) => (
                <Link key={action.href} href={action.href}
                  target={action.external ? "_blank" : undefined}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${action.bg}`}>
                    <action.icon size={14} className={action.color} />
                  </div>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* SEO checklist */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-gray-800 text-sm">SEO Checklist</h2>
            <ul className="space-y-2">
              {[
                "Write unique titles (50–60 chars)",
                "Add meta description (150–160 chars)",
                "Keywords in first paragraph",
                "Upload images to ImageKit CDN",
                "Add relevant tags",
                "Feature important articles",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-gray-500">
                  <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-green-600" />
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
