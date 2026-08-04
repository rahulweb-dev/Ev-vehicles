"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2, ArrowRight, BookOpen } from "lucide-react";
import ArticleImage from "@/components/news/ArticleImage";

const CAT_STYLE = {
  cars:       "bg-blue-50 text-blue-700",
  bikes:      "bg-orange-50 text-orange-700",
  commercial: "bg-purple-50 text-purple-700",
  charging:   "bg-teal-50 text-teal-700",
};

function articleImageFallback(article) {
  const title = encodeURIComponent(article?.title || "EV News India");
  const tag = encodeURIComponent(article?.category || "news");
  return `/api/og?title=${title}&tag=${tag}&type=article`;
}

export default function ReadingListClient() {
  const [list, setList]       = useState([]);
  const [mounted, setMounted] = useState(false);

  function load() {
    try { setList(JSON.parse(localStorage.getItem("_ev_reading") || "[]")); }
    catch { setList([]); }
  }

  useEffect(() => {
    setMounted(true);
    load();
    window.addEventListener("reading-list-change", load);
    return () => window.removeEventListener("reading-list-change", load);
  }, []);

  function remove(slug) {
    const next = list.filter(a => a.slug !== slug);
    localStorage.setItem("_ev_reading", JSON.stringify(next));
    setList(next);
    window.dispatchEvent(new Event("reading-list-change"));
  }

  function clearAll() {
    if (!confirm("Clear your entire reading list?")) return;
    localStorage.removeItem("_ev_reading");
    setList([]);
    window.dispatchEvent(new Event("reading-list-change"));
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Reading List</h1>
              <p className="text-sm text-gray-500">{list.length} saved article{list.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {list.length > 0 && (
            <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition">
              Clear all
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-500 mb-2">Your reading list is empty</h2>
            <p className="text-sm text-gray-400 mb-6">Save articles to read later while browsing EV Radar</p>
            <Link href="/news" className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-800 transition">
              Browse News <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(a => (
              <div key={a.slug} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition group">
                <div className="relative w-20 h-14 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <ArticleImage
                    src={a.image}
                    fallbackSrc={articleImageFallback(a)}
                    alt={a.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/news/${a.slug}`} className="block">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-green-700 transition">{a.title}</h3>
                  </Link>
                  {a.category && (
                    <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${CAT_STYLE[a.category] || "bg-gray-100 text-gray-600"}`}>
                      {a.category.charAt(0).toUpperCase() + a.category.slice(1)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/news/${a.slug}`}
                    className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition" title="Read">
                    <ArrowRight size={14} />
                  </Link>
                  <button onClick={() => remove(a.slug)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
