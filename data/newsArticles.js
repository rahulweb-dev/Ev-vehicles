export const newsArticles = [

];

export function getArticleBySlug(slug) {
  return newsArticles.find((a) => a.slug === slug) || null;
}

export function getArticlesByCategory(category) {
  return newsArticles.filter((a) => a.category === category);
}

export function getFeaturedArticles() {
  return newsArticles.filter((a) => a.featured);
}

export function getRelatedArticles(currentSlug, category, limit = 3) {
  return newsArticles
    .filter((a) => a.slug !== currentSlug && a.category === category)
    .slice(0, limit);
}
