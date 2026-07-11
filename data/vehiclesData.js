

export const electricCars = [

];

export const electricBikes = [];

// Helper functions
export function getCarBySlug(slug) {
  return electricCars.find((c) => c.slug === slug) || null;
}

export function getBikeBySlug(slug) {
  return electricBikes.find((b) => b.slug === slug) || null;
}

export function getRelatedCars(currentSlug, limit = 3) {
  return electricCars.filter((c) => c.slug !== currentSlug).slice(0, limit);
}

export function getRelatedBikes(currentSlug, limit = 3) {
  return electricBikes.filter((b) => b.slug !== currentSlug).slice(0, limit);
}
