'use client'

import { useState, useEffect } from 'react'
import NewsCard from '@/components/news/NewsCard'
import { NewsGridSkeleton } from '@/components/skeletons/Skeletons'

/**
 * Client-side articles feed — always shows skeleton on mount,
 * then fetches and replaces with real content.
 * cols controls grid columns class.
 */
export default function ArticlesFeed({
  category,
  limit = 20,
  cols = 'sm:grid-cols-2 lg:grid-cols-3',
  skeletonCount = 6,
}) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const qs = new URLSearchParams({
      status: 'published',
      limit: String(limit),
      ...(category ? { category } : {}),
    })

    fetch(`/api/articles?${qs}`)
      .then((r) => r.json())
      .then((data) => setArticles(data.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, limit])

  if (loading) {
    return <NewsGridSkeleton count={skeletonCount} />
  }

  if (!articles.length) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">No articles found.</p>
    )
  }

  return (
    <div className={`grid gap-6 ${cols}`}>
      {articles.map((article) => (
        <NewsCard key={article._id || article.id} article={article} />
      ))}
    </div>
  )
}
