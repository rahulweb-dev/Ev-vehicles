"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export default function ArticleViewCounter({ slug, initialViews = 0 }) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const key = `ev-viewed-${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/articles/${slug}/view`, { method: "POST" })
      .then(r => r.json())
      .then(() => setViews(v => v + 1))
      .catch(() => {});
  }, [slug]);

  return (
    <div className="flex items-center gap-1.5 text-gray-400" title="Article views">
      <Eye size={15} />
      <span>{views.toLocaleString("en-IN")} views</span>
    </div>
  );
}
