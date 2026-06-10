"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

export default function BookmarkButton({ slug, title, image, excerpt, compact = false }) {
  const key = `ev-bookmark-${slug}`;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(!!localStorage.getItem(key));
  }, [key]);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      localStorage.removeItem(key);
      setSaved(false);
    } else {
      localStorage.setItem(key, JSON.stringify({ slug, title, image, excerpt, savedAt: Date.now() }));
      setSaved(true);
    }
  };

  const sz = compact ? 13 : 15;

  return (
    <button
      onClick={toggle}
      aria-label={saved ? "Remove bookmark" : "Save article"}
      title={saved ? "Remove from saved" : "Save for later"}
      className={`flex items-center gap-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
        compact ? "px-2 py-1" : "px-3 py-1.5"
      } ${
        saved
          ? "bg-green-50 text-green-600"
          : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-500"
      }`}
    >
      <Bookmark
        size={sz}
        className={`transition-all duration-200 ${saved ? "fill-green-500 text-green-500 scale-110" : ""}`}
      />
      {!compact && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
