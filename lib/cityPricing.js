// On-road price estimates per city for EVs, from verified state road-tax rules (lib/city-tax-data.json).
// Rule: we only show a road-tax figure / on-road total when the state's rule is high or medium
// confidence and the rate is known for that price band. Otherwise pages show "ex-showroom + road
// tax as applicable" and ask the buyer to confirm with the RTO — never a guessed number.
import DATA from "./city-tax-data.json";

export const TAX_AS_OF = DATA.asOf;
export const REGISTRATION_NOTE = DATA.registrationNote;
export const CITIES = DATA.cities; // [{ slug, name, state }]
const BY_SLUG = Object.fromEntries(CITIES.map((c) => [c.slug, c]));

// The original 12 city pages (pre-built at deploy time); others render on first request.
export const TOP_CITY_SLUGS = ["mumbai", "delhi", "bangalore", "hyderabad", "chennai", "pune", "ahmedabad", "kolkata", "jaipur", "lucknow", "chandigarh", "bhopal"];

export function getCity(slug) {
  const c = BY_SLUG[slug];
  if (!c) return null;
  return { ...c, rules: DATA.states[c.state] };
}

/** Cities to link from a city page: same state first, then the big metros. */
export function nearbyCities(slug, n = 8) {
  const c = BY_SLUG[slug];
  const same = CITIES.filter((x) => x.slug !== slug && c && x.state === c.state);
  const metros = TOP_CITY_SLUGS.filter((s) => s !== slug).map((s) => BY_SLUG[s]).filter(Boolean);
  return [...same, ...metros].filter((x, i, a) => a.findIndex((y) => y.slug === x.slug) === i).slice(0, n);
}

/** Road tax for a vehicle type ("car" | "bike") at an ex-showroom price in this city's state. */
export function roadTaxFor(city, type, price) {
  const rules = city?.rules;
  const t = rules?.[type === "car" ? "car" : "twoWheeler"];
  if (!rules || !t) return { known: false, pct: null, amount: null, note: "" };
  let pct = t.pct;
  if (Array.isArray(t.slabs) && price) {
    const band = t.slabs.find((s) => s.upTo === null || price <= s.upTo);
    pct = band ? band.pct : null;
  }
  const known = rules.usable && pct !== null && pct !== undefined;
  return { known, pct: known ? pct : null, amount: known && price ? Math.round((price * pct) / 100) : null, note: t.note, subsidy: t.subsidy, confidence: rules.confidence, validity: rules.validity };
}

/** Rough first-year comprehensive insurance (clearly labelled as an estimate on the page). */
export function insuranceEstimate(type, price) {
  if (!price) return null;
  return type === "car" ? Math.max(12000, Math.round((price * 0.03) / 500) * 500) : Math.max(3500, Math.round((price * 0.05) / 100) * 100);
}

/** On-road estimate: ex-showroom + road tax + insurance (registration fee is waived for EVs). */
export function onRoadEstimate(city, type, price) {
  const tax = roadTaxFor(city, type, price);
  const insurance = insuranceEstimate(type, price);
  return { tax, insurance, total: price && tax.known ? price + tax.amount + insurance : null };
}
