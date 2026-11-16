// Curated "X vs Y" comparison pages with hand-written editorial (intro, key differences,
// who should buy which, verdict, FAQs). Prices/specs on the page itself come live from the
// vehicles collection; the editorial in comparisons-data.json must be refreshed when prices
// change materially. Only curated pairs are indexed — any other pair renders as noindex.
import DATA from "./comparisons-data.json";

export const COMPARISONS = DATA.map((c) => ({ ...c, slug: `${c.a}-vs-${c.b}` }));

const BY_KEY = new Map(COMPARISONS.map((c) => [`${c.a}|${c.b}`, c]));

/** Curated entry for a pair in either order; `reversed` = URL order differs from canonical. */
export function findComparison(slugA, slugB) {
  const fwd = BY_KEY.get(`${slugA}|${slugB}`);
  if (fwd) return { comparison: fwd, reversed: false };
  const rev = BY_KEY.get(`${slugB}|${slugA}`);
  if (rev) return { comparison: rev, reversed: true };
  return { comparison: null, reversed: false };
}

/** Curated comparisons that include this vehicle slug. */
export function comparisonsFor(slug) {
  return COMPARISONS.filter((c) => c.a === slug || c.b === slug);
}
