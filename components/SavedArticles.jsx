"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Trash2, ArrowRight } from "lucide-react";
import ArticleImage from "@/components/news/ArticleImage";

function articleImageFallback(item) {
  const title = encodeURIComponent(item?.title || "EV News India");
  return `/api/og?title=${title}&tag=news&type=article`;
}

export default function SavedArticles() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("ev-bookmark-")) {
        try { saved.push(JSON.parse(localStorage.getItem(k))); } catch {}
      }
    }
    saved.sort((a, b) => b.savedAt - a.savedAt);
    setItems(saved);
  }, []);

  const remove = (slug) => {
    localStorage.removeItem(`ev-bookmark-${slug}`);
    setItems(prev => prev.filter(i => i.slug !== slug));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-center gap-3">
          <Bookmark size={28} className="fill-green-500 text-green-500" />
          <div>
            <h1 className="text-3xl font-black text-gray-900">Saved Articles</h1>
            <p className="mt-0.5 text-sm text-gray-500">{items.length} article{items.length !== 1 ? "s" : ""} saved</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-white py-20 text-center shadow-sm">
            <Bookmark size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-semibold text-gray-500">No saved articles yet</p>
            <p className="mt-1 text-sm text-gray-400">Tap the bookmark icon on any article to save it here.</p>
            <Link href="/news" className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700">
              Browse News <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <article key={item.slug} className="group flex gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
                <Link href={`/news/${item.slug}`} className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl">
                  <ArticleImage
                    src={item.image}
                    fallbackSrc={articleImageFallback(item)}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <Link href={`/news/${item.slug}`}>
                    <h2 className="line-clamp-2 text-sm font-bold text-gray-900 transition group-hover:text-green-600 sm:text-base">
                      {item.title}
                    </h2>
                    {item.excerpt && (
                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">{item.excerpt}</p>
                    )}
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {new Date(item.savedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <button onClick={() => remove(item.slug)}
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
