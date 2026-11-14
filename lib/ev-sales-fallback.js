// India EV sales analytics, computed from the real monthly dataset in lib/ev-sales-data.js.
// (Kept under the old "fallback" name so existing imports keep working; the analytics API
//  returns this whenever the EVSale collection is empty.)
import {
  DATA_YEAR, MONTHS_COVERED, LAST_UPDATED, SOURCE, STATES_PERIOD,
  CAR_BRANDS as RAW_CAR, TWO_WHEELER_BRANDS as RAW_TW, COMMERCIAL_BRANDS as RAW_COM,
  SEGMENT_TOTALS, STATES as RAW_STATES,
} from "./ev-sales-data.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const sum = (arr) => arr.reduce((a, x) => a + (Number.isFinite(x) ? x : 0), 0);

// YoY growth over the months where both years have a figure; null if no comparison is possible.
function yoy(curr = [], prev = []) {
  let c = 0, p = 0;
  for (let i = 0; i < MONTHS_COVERED; i++) {
    if (Number.isFinite(curr[i]) && Number.isFinite(prev[i]) && prev[i] > 0) { c += curr[i]; p += prev[i]; }
  }
  return p > 0 ? parseFloat((((c - p) / p) * 100).toFixed(1)) : null;
}

// Add an "Others" row so brand rows add up to the reported segment total each month.
function withOthers(brands, totals, slug) {
  const sales = Array.from({ length: MONTHS_COVERED }, (_, i) => {
    const t = totals?.sales?.[i];
    if (!Number.isFinite(t)) return null;
    return Math.max(0, t - sum(brands.map((b) => b.sales[i])));
  });
  const prevYear = Array.from({ length: MONTHS_COVERED }, (_, i) => {
    const t = totals?.prevYear?.[i];
    if (!Number.isFinite(t)) return null;
    const known = brands.map((b) => b.prevYear?.[i]);
    return known.every(Number.isFinite) ? Math.max(0, t - sum(known)) : null;
  });
  return sum(sales) > 0 ? [...brands, { brand: "Others", brandSlug: slug, sales, prevYear, isOthers: true }] : brands;
}

const CAR_BRANDS = withOthers(RAW_CAR, SEGMENT_TOTALS.car, "others-car");
const TWO_WHEELER_BRANDS = withOthers(RAW_TW, SEGMENT_TOTALS["two-wheeler"], "others-two-wheeler");
const COMMERCIAL_BRANDS = withOthers(RAW_COM, SEGMENT_TOTALS.commercial, "others-commercial");
const STATES = RAW_STATES;

const segTotal = (seg, brands) => {
  const t = SEGMENT_TOTALS[seg]?.sales;
  return t ? sum(t) : sum(brands.map((b) => sum(b.sales)));
};

export function FALLBACK_ANALYTICS() {
  const segs = { car: CAR_BRANDS, "two-wheeler": TWO_WHEELER_BRANDS, commercial: COMMERCIAL_BRANDS };

  const monthlyTrend = Array.from({ length: MONTHS_COVERED }, (_, i) => ({
    month: i + 1,
    monthName: MONTHS[i],
    totalUnits: Object.entries(segs).reduce((s, [seg, brands]) => {
      const t = SEGMENT_TOTALS[seg]?.sales?.[i];
      return s + (Number.isFinite(t) ? t : sum(brands.map((b) => b.sales[i])));
    }, 0),
  }));

  const totals = Object.fromEntries(Object.entries(segs).map(([seg, brands]) => [seg, {
    totalUnits: segTotal(seg, brands),
    avgGrowth: yoy(SEGMENT_TOTALS[seg]?.sales, SEGMENT_TOTALS[seg]?.prevYear),
  }]));
  const grandTotal = sum(Object.values(totals).map((t) => t.totalUnits));

  const brandRankings = Object.entries(segs).flatMap(([seg, brands]) => brands.filter((b) => !b.isOthers).map((b) => {
    const totalUnits = sum(b.sales);
    const share = totals[seg].totalUnits > 0 ? parseFloat(((totalUnits / totals[seg].totalUnits) * 100).toFixed(1)) : 0;
    return { brand: b.brand, brandSlug: b.brandSlug, segment: seg, totalUnits, marketShare: share, avgMarketShare: share, avgGrowth: yoy(b.sales, b.prevYear) };
  })).sort((a, b) => b.totalUnits - a.totalUnits);

  const decorate = (brands) => brands.map((b) => ({ ...b, totalUnits: sum(b.sales) }));

  return {
    year: DATA_YEAR,
    dataYear: DATA_YEAR,
    monthsCovered: MONTHS_COVERED,
    periodLabel: `Jan–${MONTHS[MONTHS_COVERED - 1]} ${DATA_YEAR}`,
    lastUpdated: LAST_UPDATED,
    source: SOURCE,
    statesPeriod: STATES_PERIOD,
    grandTotal,
    totals,
    avgGrowth: yoy(
      Array.from({ length: MONTHS_COVERED }, (_, i) => sum(Object.keys(segs).map((s) => SEGMENT_TOTALS[s]?.sales?.[i]))),
      Array.from({ length: MONTHS_COVERED }, (_, i) => {
        const v = Object.keys(segs).map((s) => SEGMENT_TOTALS[s]?.prevYear?.[i]);
        return v.every(Number.isFinite) ? sum(v) : null;
      }),
    ),
    brandRankings,
    monthlyTrend,
    segmentBreakdown: Object.entries(totals)
      .map(([segment, t]) => ({ segment, totalUnits: t.totalUnits, share: grandTotal > 0 ? ((t.totalUnits / grandTotal) * 100).toFixed(1) : "0" }))
      .sort((a, b) => b.totalUnits - a.totalUnits),
    stateSales: STATES,
    carBrands: decorate(CAR_BRANDS),
    twoBrands: decorate(TWO_WHEELER_BRANDS),
    commercialBrands: decorate(COMMERCIAL_BRANDS),
    monthlyByBrand: { cars: CAR_BRANDS, twoWheelers: TWO_WHEELER_BRANDS, commercial: COMMERCIAL_BRANDS },
    isFallback: false,
  };
}

// One segment only (brand rankings, totals and monthly trend for that segment).
export function SEGMENT_ANALYTICS(segment) {
  const a = FALLBACK_ANALYTICS();
  const brands = { car: CAR_BRANDS, "two-wheeler": TWO_WHEELER_BRANDS, commercial: COMMERCIAL_BRANDS }[segment] || [];
  const t = SEGMENT_TOTALS[segment]?.sales;
  return {
    ...a,
    brandRankings: a.brandRankings.filter((b) => b.segment === segment),
    grandTotal: a.totals[segment]?.totalUnits || 0,
    monthlyTrend: Array.from({ length: MONTHS_COVERED }, (_, i) => ({
      month: i + 1, monthName: MONTHS[i],
      totalUnits: Number.isFinite(t?.[i]) ? t[i] : sum(brands.map((b) => b.sales[i])),
    })),
  };
}

// Plain-language facts for page copy (top brands, totals) — always derived from the data.
export function SALES_FACTS() {
  const a = FALLBACK_ANALYTICS();
  const top = (seg) => a.brandRankings.filter((b) => b.segment === seg);
  return {
    year: DATA_YEAR,
    periodLabel: a.periodLabel,
    lastMonthLabel: `${MONTHS[MONTHS_COVERED - 1]} ${DATA_YEAR}`,
    grandTotal: a.grandTotal,
    totals: a.totals,
    topCar: top("car").slice(0, 5),
    topTwoWheeler: top("two-wheeler").slice(0, 5),
    topCommercial: top("commercial").slice(0, 3),
    topStates: STATES.slice(0, 5),
    statesPeriod: STATES_PERIOD,
    source: SOURCE,
    lastUpdated: LAST_UPDATED,
  };
}

export { MONTHS, CAR_BRANDS, TWO_WHEELER_BRANDS, COMMERCIAL_BRANDS, STATES, DATA_YEAR, MONTHS_COVERED, LAST_UPDATED, SOURCE };
