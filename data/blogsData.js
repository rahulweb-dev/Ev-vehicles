export const blogsData = [

];

export function getBlogBySlug(slug) {
  return blogsData.find((b) => b.slug === slug) || null;
}

export function getBlogsByCategory(category) {
  return blogsData.filter((b) => b.category === category);
}

export function getRelatedBlogs(currentSlug, limit = 3) {
  return blogsData.filter((b) => b.slug !== currentSlug).slice(0, limit);
}
