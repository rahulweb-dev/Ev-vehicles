'use client'

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

/* ─── Theme wrappers ────────────────────────────────────────── */
function LightTheme({ children }) {
  return <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">{children}</SkeletonTheme>
}
function DarkTheme({ children }) {
  return <SkeletonTheme baseColor="#1f2937" highlightColor="#374151">{children}</SkeletonTheme>
}
function GreenTheme({ children }) {
  return <SkeletonTheme baseColor="#14532d" highlightColor="#166534">{children}</SkeletonTheme>
}

/* ─── News card skeleton ─────────────────────────────────────── */
export function NewsCardSkeleton({ horizontal = false }) {
  if (horizontal) {
    return (
      <LightTheme>
        <div className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3">
          <Skeleton className="h-24! w-32! rounded-xl! shrink-0!" />
          <div className="flex-1">
            <Skeleton height={10} width={60} className="mb-2" />
            <Skeleton count={2} height={13} className="mb-1" />
            <Skeleton height={10} width={80} className="mt-2" />
          </div>
        </div>
      </LightTheme>
    )
  }
  return (
    <LightTheme>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <Skeleton className="h-48! w-full!" />
        <div className="p-4">
          <Skeleton height={10} width={70} className="mb-2" />
          <Skeleton count={2} height={14} className="mb-1" />
          <Skeleton height={10} width="60%" className="mt-3" />
        </div>
      </div>
    </LightTheme>
  )
}

/* ─── News grid skeleton ─────────────────────────────────────── */
export function NewsGridSkeleton({ count = 6 }) {
  return (
    <LightTheme>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array(count).fill(0).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <Skeleton className="h-48! w-full!" />
            <div className="p-4 space-y-2">
              <Skeleton height={10} width={80} />
              <Skeleton height={14} count={2} />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton circle height={24} width={24} />
                <Skeleton height={10} width={100} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </LightTheme>
  )
}

/* ─── Featured article skeleton ─────────────────────────────── */
export function FeaturedArticleSkeleton() {
  return (
    <LightTheme>
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
        <Skeleton className="h-85! w-full! md:h-105!" />
        <div className="p-6">
          <Skeleton height={10} width={90} className="mb-3" />
          <Skeleton height={22} count={2} className="mb-2" />
          <Skeleton height={12} count={2} className="mb-4" />
          <div className="flex gap-3">
            <Skeleton height={44} width={160} className="rounded-full!" />
            <Skeleton height={44} width={120} className="rounded-full!" />
          </div>
        </div>
      </div>
    </LightTheme>
  )
}

/* ─── Article detail skeleton ────────────────────────────────── */
export function ArticleDetailSkeleton() {
  return (
    <>
      <DarkTheme>
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-4xl px-4">
            <Skeleton height={12} width={180} className="mb-4" />
            <Skeleton height={22} className="mb-2" />
            <Skeleton height={22} width="75%" className="mb-5" />
            <div className="flex items-center gap-4">
              <Skeleton circle height={36} width={36} />
              <Skeleton height={12} width={160} />
            </div>
          </div>
        </div>
      </DarkTheme>
      <LightTheme>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Skeleton className="h-80! w-full! rounded-3xl! md:h-110!" />
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Skeleton height={12} width={100} />
            <Skeleton height={12} width={80} />
            <Skeleton height={12} width={90} />
          </div>
          <div className="mt-6 space-y-3">
            <Skeleton height={14} count={3} className="mb-1" />
            <Skeleton height={14} width="80%" />
            <div className="py-2" />
            <Skeleton height={14} count={4} className="mb-1" />
            <Skeleton height={14} width="65%" />
            <div className="py-2" />
            <Skeleton height={200} className="rounded-2xl!" />
            <div className="py-2" />
            <Skeleton height={14} count={3} className="mb-1" />
            <Skeleton height={14} width="70%" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {[80, 100, 70, 90, 75].map((w, i) => (
              <Skeleton key={i} height={28} width={w} className="rounded-full!" />
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton height={20} width={180} className="mb-5" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-gray-100">
                <Skeleton className="h-36! w-full!" />
                <div className="p-3 space-y-1.5">
                  <Skeleton height={12} count={2} />
                  <Skeleton height={10} width="60%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </LightTheme>
    </>
  )
}

/* ─── News listing page skeleton ─────────────────────────────── */
export function NewsPageSkeleton() {
  return (
    <>
      <DarkTheme>
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <Skeleton height={12} width={160} className="mb-4" />
            <Skeleton height={28} width="50%" className="mb-2" />
            <Skeleton height={14} width={300} />
          </div>
        </div>
      </DarkTheme>
      <LightTheme>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-10 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 overflow-hidden rounded-3xl border border-gray-100">
              <Skeleton className="h-72! w-full!" />
              <div className="p-5 space-y-2">
                <Skeleton height={10} width={80} />
                <Skeleton height={18} count={2} />
                <Skeleton height={12} width={200} />
              </div>
            </div>
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3 overflow-hidden rounded-2xl border border-gray-100 p-3">
                  <Skeleton className="h-20! w-24! rounded-xl! shrink-0!" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton height={10} width={60} />
                    <Skeleton height={13} count={2} />
                    <Skeleton height={10} width={80} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <NewsGridSkeleton count={9} />
        </div>
      </LightTheme>
    </>
  )
}

/* ─── Category page skeleton ─────────────────────────────────── */
export function CategoryPageSkeleton({ accentClass = 'bg-green-950' }) {
  return (
    <>
      <GreenTheme>
        <div className={`${accentClass} py-14`}>
          <div className="mx-auto max-w-7xl px-4">
            <Skeleton height={12} width={160} className="mb-4" />
            <Skeleton height={26} width="45%" className="mb-2" />
            <Skeleton height={14} width={320} className="mb-5" />
            <div className="flex gap-3">
              <Skeleton height={44} width={140} className="rounded-full!" />
              <Skeleton height={44} width={140} className="rounded-full!" />
            </div>
          </div>
        </div>
      </GreenTheme>
      <LightTheme>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-6 flex flex-wrap gap-2">
            {[70, 90, 80, 75, 85].map((w, i) => (
              <Skeleton key={i} height={36} width={w} className="rounded-full!" />
            ))}
          </div>
          <NewsGridSkeleton count={6} />
        </div>
      </LightTheme>
    </>
  )
}

/* ─── Vehicle detail page skeleton ──────────────────────────── */
export function VehicleDetailSkeleton() {
  return (
    <LightTheme>
      <div className="bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton height={12} width={220} className="mb-5" />
          <div className="grid gap-8 lg:grid-cols-2">
            <Skeleton className="h-64! w-full! rounded-3xl! lg:h-80!" />
            <div className="space-y-4">
              <Skeleton height={10} width={100} />
              <Skeleton height={28} width="70%" />
              <Skeleton height={24} width={160} />
              <div className="grid grid-cols-3 gap-3 pt-2">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} height={72} className="rounded-2xl!" />)}
              </div>
              <div className="flex gap-3 pt-2">
                <Skeleton height={48} className="flex-1 rounded-full!" />
                <Skeleton height={48} className="flex-1 rounded-full!" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton height={20} width={180} className="mb-5" />
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-gray-100 px-5 py-3 last:border-0">
              <Skeleton height={12} width={140} />
              <Skeleton height={12} width={160} className="ml-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <Skeleton height={20} width={200} className="mb-5" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-100">
              <Skeleton className="h-44! w-full!" />
              <div className="p-4 space-y-2">
                <Skeleton height={10} width={80} />
                <Skeleton height={16} />
                <Skeleton height={16} width="60%" />
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {Array(3).fill(0).map((_, j) => <Skeleton key={j} height={52} className="rounded-xl!" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LightTheme>
  )
}

/* ─── Blog listing page skeleton ────────────────────────────── */
export function BlogsPageSkeleton() {
  return (
    <LightTheme>
      <div className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton height={28} width={200} className="mb-2" />
          <Skeleton height={14} width={360} />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-10 overflow-hidden rounded-3xl border border-gray-100">
          <Skeleton className="h-64! w-full! md:h-80!" />
          <div className="p-6 space-y-3">
            <Skeleton height={10} width={90} />
            <Skeleton height={20} count={2} />
            <Skeleton height={12} count={2} />
            <Skeleton height={44} width={160} className="rounded-full!" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-100">
              <Skeleton className="h-44! w-full!" />
              <div className="p-4 space-y-2">
                <Skeleton height={10} width={80} />
                <Skeleton height={16} count={2} />
                <Skeleton height={10} width="60%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </LightTheme>
  )
}

/* ─── Blog detail skeleton ───────────────────────────────────── */
export function BlogDetailSkeleton() {
  return (
    <LightTheme>
      <div className="bg-gray-50 py-10">
        <div className="mx-auto max-w-3xl px-4">
          <Skeleton height={12} width={160} className="mb-4" />
          <Skeleton height={26} className="mb-2" />
          <Skeleton height={26} width="70%" className="mb-5" />
          <div className="flex items-center gap-3">
            <Skeleton circle height={36} width={36} />
            <Skeleton height={12} width={150} />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-64! w-full! rounded-3xl! md:h-96! mb-8" />
        <div className="space-y-3">
          <Skeleton height={14} count={4} />
          <Skeleton height={14} width="75%" />
          <div className="py-2" />
          <Skeleton height={14} count={3} />
          <Skeleton height={14} width="60%" />
          <div className="py-2" />
          <Skeleton height={180} className="rounded-2xl!" />
          <div className="py-2" />
          <Skeleton height={14} count={3} />
          <Skeleton height={14} width="80%" />
        </div>
      </div>
    </LightTheme>
  )
}

/* ─── Compare page skeleton ──────────────────────────────────── */
export function ComparePageSkeleton() {
  return (
    <>
      <DarkTheme>
        <div className="bg-gray-950 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <Skeleton height={26} width={280} className="mb-2" />
            <Skeleton height={14} width={350} />
          </div>
        </div>
      </DarkTheme>
      <LightTheme>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center gap-3">
                <Skeleton circle height={56} width={56} />
                <Skeleton height={14} width={120} />
                <Skeleton height={36} width={160} className="rounded-full!" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex border-b border-gray-100 last:border-0">
                <div className="w-1/4 border-r border-gray-100 px-5 py-4">
                  <Skeleton height={12} width="70%" />
                </div>
                {Array(3).fill(0).map((_, j) => (
                  <div key={j} className="flex-1 border-r border-gray-100 last:border-0 px-5 py-4">
                    <Skeleton height={12} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </LightTheme>
    </>
  )
}

/* ─── About page skeleton ────────────────────────────────────── */
export function AboutPageSkeleton() {
  return (
    <LightTheme>
      <div className="bg-gray-950 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <DarkTheme>
            <Skeleton circle height={80} width={80} className="mx-auto mb-4" />
            <Skeleton height={28} width={280} className="mx-auto mb-2" />
            <Skeleton height={14} width={400} className="mx-auto mb-1" />
            <Skeleton height={14} width={300} className="mx-auto" />
          </DarkTheme>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-5 text-center">
              <Skeleton height={28} width={80} className="mx-auto mb-2" />
              <Skeleton height={12} width={90} className="mx-auto" />
            </div>
          ))}
        </div>
        <Skeleton height={22} width={140} className="mb-6" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <Skeleton circle height={56} width={56} />
              <div className="flex-1">
                <Skeleton height={14} width="70%" className="mb-1.5" />
                <Skeleton height={11} width="50%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </LightTheme>
  )
}

/* ─── Contact page skeleton ──────────────────────────────────── */
export function ContactPageSkeleton() {
  return (
    <LightTheme>
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <Skeleton height={26} width={220} className="mb-2" />
          <Skeleton height={14} width={340} className="mb-8" />
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
                <Skeleton circle height={44} width={44} />
                <div className="flex-1">
                  <Skeleton height={12} width={80} className="mb-1.5" />
                  <Skeleton height={11} width={120} />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-gray-100 p-6 space-y-4">
            <Skeleton height={44} className="rounded-xl!" />
            <Skeleton height={44} className="rounded-xl!" />
            <Skeleton height={44} className="rounded-xl!" />
            <Skeleton height={100} className="rounded-xl!" />
            <Skeleton height={48} className="rounded-full!" />
          </div>
        </div>
      </div>
    </LightTheme>
  )
}

/* ─── Vehicle card skeleton ──────────────────────────────────── */
export function VehicleCardSkeleton() {
  return (
    <LightTheme>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Skeleton className="h-52! w-full!" />
        <div className="p-4 space-y-2.5">
          <Skeleton height={10} width={80} />
          <Skeleton height={16} width="70%" />
          <Skeleton height={20} width={130} />
          <Skeleton height={10} width={90} />
          <div className="grid grid-cols-3 gap-2 pt-1">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} height={60} className="rounded-xl!" />)}
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} circle height={16} width={16} />)}
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton height={14} width={80} />
            <Skeleton height={30} width={80} className="rounded-full!" />
          </div>
        </div>
      </div>
    </LightTheme>
  )
}

/* ─── Vehicle slider skeleton ────────────────────────────────── */
export function VehicleSliderSkeleton({ count = 4 }) {
  return (
    <LightTheme>
      <div className="bg-white py-10">
        <div className="mx-auto max-w-325 px-4 lg:px-6">
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
            <Skeleton height={24} width={240} />
            <Skeleton height={20} width={60} />
          </div>
          <div className={`grid gap-4 grid-cols-2 lg:grid-cols-${count}`}>
            {Array(count).fill(0).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-gray-100">
                <Skeleton className="h-52! w-full!" />
                <div className="p-4 space-y-2">
                  <Skeleton height={10} width={80} />
                  <Skeleton height={16} />
                  <Skeleton height={18} width={120} />
                  <div className="grid grid-cols-3 gap-1.5">
                    {Array(3).fill(0).map((_, j) => <Skeleton key={j} height={52} className="rounded-xl!" />)}
                  </div>
                  <div className="flex justify-between pt-1">
                    <Skeleton height={14} width={70} />
                    <Skeleton height={28} width={70} className="rounded-full!" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LightTheme>
  )
}

/* ─── Latest news section skeleton (dark bg) ─────────────────── */
export function LatestNewsSectionSkeleton() {
  return (
    <section className="bg-gray-950 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <DarkTheme>
          <div className="mb-10">
            <Skeleton height={36} width={300} className="mb-3" />
            <Skeleton height={16} width={380} />
          </div>
          <div className="mb-10 flex flex-wrap gap-4">
            {[90, 85, 110, 100].map((w, i) => (
              <Skeleton key={i} height={48} width={w} className="rounded-2xl!" />
            ))}
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.7fr]">
            <Skeleton className="h-75! w-full! rounded-4xl! md:h-137.5!" />
            <div className="space-y-5">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <Skeleton className="h-28! w-32! rounded-2xl! shrink-0!" />
                  <div className="flex-1 space-y-2">
                    <Skeleton height={22} width={70} className="rounded-full!" />
                    <Skeleton height={14} count={2} />
                    <Skeleton height={12} width={80} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DarkTheme>
      </div>
    </section>
  )
}

/* ─── Generic full-page spinner fallback ────────────────────── */
export function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-gray-200 border-t-green-600" />
        <p className="text-sm text-gray-400 font-medium">Loading…</p>
      </div>
    </div>
  )
}
