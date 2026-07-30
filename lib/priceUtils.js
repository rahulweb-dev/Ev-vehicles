/**
 * Parse a human-entered price string into a plain Number (rupees).
 * Returns null if unparseable (keeps DB clean).
 *
 * Handles:
 *   "₹14.99 Lakh"  → 1499000
 *   "14.99 lakh"   → 1499000
 *   "14,99,000"    → 1499000
 *   "1499000"      → 1499000
 *   "Price TBA"    → null
 */
export function parsePrice(raw) {
  if (!raw && raw !== 0) return null;
  if (typeof raw === "number") return isFinite(raw) ? Math.round(raw) : null;

  const s = String(raw).replace(/[₹,\s]/g, "").toLowerCase();

  // "X lakh" or "X lac"
  const lakhMatch = s.match(/^([\d.]+)\s*la[ck]h?$/);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1]) * 100_000);

  // "X crore"
  const croreMatch = s.match(/^([\d.]+)\s*crore?$/);
  if (croreMatch) return Math.round(parseFloat(croreMatch[1]) * 10_000_000);

  // Plain number
  const n = parseFloat(s);
  if (!isNaN(n)) return Math.round(n);

  return null;
}

/**
 * Format a numeric price (rupees) as a display string.
 * formatPrice(1499000) → "₹14.99 Lakh"
 * formatPrice(null)    → "Price TBA"
 */
export function formatPrice(n) {
  if (n == null || !isFinite(n)) return "Price TBA";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(2)} Lakh`;
  return `₹${n.toLocaleString("en-IN")}`;
}
