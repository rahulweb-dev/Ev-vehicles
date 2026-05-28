"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";

export default function EditArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.article) setArticle(d.article);
        else setError("Article not found");
      })
      .catch(() => setError("Failed to load article"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return <ArticleEditor initialData={article} />;
}
