'use client'

import { useState, useEffect } from 'react'
import NewsCard from '@/components/news/NewsCard'
import { NewsGridSkeleton } from '@/components/skeletons/Skeletons'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ArticlesFeed({
  category,
  limit = 18,
  cols = 'sm:grid-cols-2 lg:grid-cols-3',
  skeletonCount = 6,
}) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)

  useEffect(() => {
    setPage(1)
  }, [category])

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams({
      status: 'published',
      limit:  String(limit),
      page:   String(page),
      ...(category ? { category } : {}),
    })

    fetch(`/api/articles?${qs}`)
      .then(r => r.json())
      .then(data => {
        setArticles(data.articles || [])
        setTotalPages(data.pages || 1)
        setTotal(data.total || 0)
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [category, limit, page])

  if (loading) return <NewsGridSkeleton count={skeletonCount} />

  if (!articles.length) {
    return <p className="py-12 text-center text-sm text-gray-400">No articles found.</p>
  }

  return (
    <>
      <div className={`grid gap-6 ${cols}`}>
        {articles.map(article => (
          <NewsCard key={article._id || article.id} article={article} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-green-500 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p
              if (totalPages <= 7) {
                p = i + 1
              } else if (page <= 4) {
                p = i + 1
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i
              } else {
                p = page - 3 + i
              }
              return (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className={`h-9 w-9 rounded-xl text-sm font-semibold transition ${
                    p === page
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-green-500 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-gray-400">
        Page {page} of {totalPages} · {total.toLocaleString('en-IN')} articles
      </p>
    </>
  )
}
