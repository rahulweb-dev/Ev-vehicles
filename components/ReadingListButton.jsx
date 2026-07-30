"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function ReadingListButton({ article, compact = false }) {
  const [saved, setSaved]       = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    const list = getList();
    setSaved(list.some(a => a.slug === article.slug));
  }, [article.slug]);

  function getList() {
    try { return JSON.parse(localStorage.getItem("_ev_reading") || "[]"); }
    catch { return []; }
  }

  function toggle() {
    const list    = getList();
    const already = list.some(a => a.slug === article.slug);
    let next;
    if (already) {
      next = list.filter(a => a.slug !== article.slug);
    } else {
      next = [{ slug: article.slug, title: article.title, image: article.image || null, category: article.category || null, savedAt: new Date().toISOString() }, ...list];
      if (next.length > 50) next = next.slice(0, 50);
    }
    localStorage.setItem("_ev_reading", JSON.stringify(next));
    setSaved(!already);
    window.dispatchEvent(new Event("reading-list-change"));
  }

  if (!mounted) {
    return (
      <button className={`flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 ${compact ? "p-2" : ""}`} disabled>
        <Bookmark size={compact ? 14 : 16} />
        {!compact && <span>Save</span>}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      title={saved ? "Remove from Reading List" : "Save to Reading List"}
      className={`flex items-center gap-1.5 rounded-xl border text-sm font-medium transition ${
        saved
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          : "border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
      } ${compact ? "p-2" : "px-3 py-2"}`}
    >
      {saved ? <BookmarkCheck size={compact ? 14 : 16} /> : <Bookmark size={compact ? 14 : 16} />}
      {!compact && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
