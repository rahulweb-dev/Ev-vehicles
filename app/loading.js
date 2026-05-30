import { VehicleSliderSkeleton, LatestNewsSectionSkeleton } from '@/components/skeletons/Skeletons'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero placeholder */}
      <div className="hidden md:block h-[480px] lg:h-[600px] w-full animate-pulse bg-gray-200" />
      <div className="md:hidden h-[340px] w-full animate-pulse bg-gray-900" />

      {/* Latest news skeleton */}
      <LatestNewsSectionSkeleton />

      {/* Vehicle slider skeletons */}
      <VehicleSliderSkeleton count={4} />
      <VehicleSliderSkeleton count={4} />
    </div>
  )
}
