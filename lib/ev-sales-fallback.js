// Realistic India EV sales fallback data (used when MongoDB has no records)

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CAR_BRANDS = [
  { brand: "Tata EV",      brandSlug: "tata-ev",      sales: [8200,7800,9100,9600,10200,11000,10800,11500,12100,12800,13200,14000] },
  { brand: "MG EV",        brandSlug: "mg-ev",         sales: [2100,1900,2400,2600,2800,3100,3000,3200,3500,3700,3900,4100] },
  { brand: "Mahindra EV",  brandSlug: "mahindra-ev",   sales: [1800,1600,2000,2100,2300,2600,2800,3100,3400,3700,4000,4300] },
  { brand: "BYD",          brandSlug: "byd",            sales: [420,380,510,560,620,700,750,820,890,960,1040,1120] },
  { brand: "Hyundai EV",   brandSlug: "hyundai-ev",    sales: [380,340,420,460,510,580,620,670,720,780,840,900] },
];

const TWO_WHEELER_BRANDS = [
  { brand: "Ola Electric",  brandSlug: "ola-electric",  sales: [32000,28000,35000,38000,42000,47000,45000,49000,53000,57000,62000,68000] },
  { brand: "TVS iQube",     brandSlug: "tvs-iqube",     sales: [18000,16000,20000,22000,24000,27000,26000,28000,31000,33000,36000,39000] },
  { brand: "Ather Energy",  brandSlug: "ather-energy",  sales: [14000,12000,16000,17000,19000,21000,20000,22000,24000,26000,28000,31000] },
  { brand: "Bajaj Chetak",  brandSlug: "bajaj-chetak",  sales: [11000,9800,12500,13500,15000,17000,16500,18000,19500,21000,23000,25000] },
  { brand: "Hero Vida",     brandSlug: "hero-vida",     sales: [8500,7600,9500,10500,11500,13000,12500,13800,15000,16200,17500,19000] },
];

const COMMERCIAL_BRANDS = [
  { brand: "Tata EV Commercial", brandSlug: "tata-ev-commercial", sales: [2200,1900,2500,2700,2900,3200,3100,3400,3700,4000,4300,4700] },
  { brand: "Ashok Leyland EV",   brandSlug: "ashok-leyland-ev",   sales: [580,510,660,720,790,880,850,930,1010,1090,1180,1280] },
  { brand: "Switch Mobility",    brandSlug: "switch-mobility",     sales: [120,100,140,160,180,210,200,220,240,260,285,310] },
  { brand: "EKA Mobility",       brandSlug: "eka-mobility",        sales: [55,45,65,75,85,100,95,105,115,125,138,150] },
];

const STATES = [
  { state: "Uttar Pradesh", totalUnits: 142000, avgGrowth: 48 },
  { state: "Maharashtra",   totalUnits: 128000, avgGrowth: 42 },
  { state: "Karnataka",     totalUnits: 116000, avgGrowth: 55 },
  { state: "Tamil Nadu",    totalUnits: 98000,  avgGrowth: 39 },
  { state: "Rajasthan",     totalUnits: 87000,  avgGrowth: 44 },
  { state: "Gujarat",       totalUnits: 82000,  avgGrowth: 37 },
  { state: "Delhi",         totalUnits: 76000,  avgGrowth: 52 },
  { state: "Telangana",     totalUnits: 68000,  avgGrowth: 61 },
  { state: "Andhra Pradesh",totalUnits: 59000,  avgGrowth: 57 },
  { state: "Madhya Pradesh",totalUnits: 48000,  avgGrowth: 41 },
  { state: "Haryana",       totalUnits: 42000,  avgGrowth: 46 },
  { state: "Kerala",        totalUnits: 38000,  avgGrowth: 35 },
];

export function FALLBACK_ANALYTICS(year = 2025) {
  // Monthly totals
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const carTotal = CAR_BRANDS.reduce((s, b) => s + b.sales[i], 0);
    const twTotal  = TWO_WHEELER_BRANDS.reduce((s, b) => s + b.sales[i], 0);
    const comTotal = COMMERCIAL_BRANDS.reduce((s, b) => s + b.sales[i], 0);
    return { month: i + 1, monthName: MONTHS[i], totalUnits: carTotal + twTotal + comTotal };
  });

  const carTotal = CAR_BRANDS.reduce((s, b) => s + b.sales.reduce((a, x) => a + x, 0), 0);
  const twTotal  = TWO_WHEELER_BRANDS.reduce((s, b) => s + b.sales.reduce((a, x) => a + x, 0), 0);
  const comTotal = COMMERCIAL_BRANDS.reduce((s, b) => s + b.sales.reduce((a, x) => a + x, 0), 0);
  const grandTotal = carTotal + twTotal + comTotal;

  // Brand rankings
  const brandRankings = [
    ...CAR_BRANDS.map((b) => ({ brand: b.brand, brandSlug: b.brandSlug, segment: "car", totalUnits: b.sales.reduce((a,x)=>a+x,0), avgMarketShare: 0, avgGrowth: 28 })),
    ...TWO_WHEELER_BRANDS.map((b) => ({ brand: b.brand, brandSlug: b.brandSlug, segment: "two-wheeler", totalUnits: b.sales.reduce((a,x)=>a+x,0), avgMarketShare: 0, avgGrowth: 35 })),
    ...COMMERCIAL_BRANDS.map((b) => ({ brand: b.brand, brandSlug: b.brandSlug, segment: "commercial", totalUnits: b.sales.reduce((a,x)=>a+x,0), avgMarketShare: 0, avgGrowth: 22 })),
  ].sort((a, b) => b.totalUnits - a.totalUnits);

  // Add market share
  brandRankings.forEach((b) => {
    const segTotal = b.segment === "car" ? carTotal : b.segment === "two-wheeler" ? twTotal : comTotal;
    b.marketShare = segTotal > 0 ? parseFloat(((b.totalUnits / segTotal) * 100).toFixed(1)) : 0;
    b.avgMarketShare = b.marketShare;
  });

  return {
    year,
    grandTotal,
    totals: {
      car:            { totalUnits: carTotal,  avgGrowth: 28 },
      "two-wheeler":  { totalUnits: twTotal,   avgGrowth: 35 },
      commercial:     { totalUnits: comTotal,  avgGrowth: 22 },
    },
    avgGrowth: 32,
    brandRankings,
    monthlyTrend,
    segmentBreakdown: [
      { segment: "two-wheeler", totalUnits: twTotal,  share: ((twTotal  / grandTotal) * 100).toFixed(1) },
      { segment: "car",         totalUnits: carTotal,  share: ((carTotal  / grandTotal) * 100).toFixed(1) },
      { segment: "commercial",  totalUnits: comTotal,  share: ((comTotal  / grandTotal) * 100).toFixed(1) },
    ],
    stateSales: STATES,
    carBrands:         CAR_BRANDS.map((b) => ({ ...b, totalUnits: b.sales.reduce((a,x)=>a+x,0) })),
    twoBrands:         TWO_WHEELER_BRANDS.map((b) => ({ ...b, totalUnits: b.sales.reduce((a,x)=>a+x,0) })),
    commercialBrands:  COMMERCIAL_BRANDS.map((b) => ({ ...b, totalUnits: b.sales.reduce((a,x)=>a+x,0) })),
    monthlyByBrand:    { cars: CAR_BRANDS, twoWheelers: TWO_WHEELER_BRANDS, commercial: COMMERCIAL_BRANDS },
    isFallback: true,
  };
}

export { MONTHS, CAR_BRANDS, TWO_WHEELER_BRANDS, COMMERCIAL_BRANDS, STATES };
