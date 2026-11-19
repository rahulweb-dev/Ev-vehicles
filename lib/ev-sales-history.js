// India EV sales HISTORY — yearly (calendar + financial year) and monthly registrations by segment.
// Every figure comes from a named, linked source (see SOURCES). null = not reported (never estimated).
// Compiled 2026-11-19. Segments: e-2W, e-3W (L3 e-rickshaw/e-cart + L5), e-PV (cars), e-CV (buses + goods carriers).
// Note: electric cargo three-wheelers are counted in e-3W, not e-CV.

export const HISTORY_UPDATED = "2026-11-19";

export const SOURCES = {
  EVR21: { name: "EVreporter", title: "India's Electric Vehicle Sales Trend for 2021", url: "https://evreporter.com/?p=10304", date: "Jan 2022" },
  FADA23: { name: "Storyboard18 (FADA data)", title: "EV sales in India jumped 49.25% to 1,529,947 units in 2023", url: "https://www.storyboard18.com/how-it-works/ea-sales-in-india-jumped-49-25-percent-year-on-year-to-1529947-units-in-2023-20005.htm", date: "Jan 2024" },
  JMK22: { name: "JMK Research", title: "India witnessed a spectacular EV show in 2022 with 212% y-o-y growth", url: "https://jmkresearch.com/india-witnessed-a-spectacular-ev-show-in-2022-with-212-y-o-y-growth/", date: "Jan 2023" },
  AP24: { name: "Autocar Pro", title: "EV sales in CY2024 jump 27% but miss 2-million mark by 50,886 units", url: "https://www.autocarpro.in/analysis-sales/ev-sales-in-cy2024-jump-27-but-miss-2-million-mark-by-50886-units-124229", date: "Jan 2025" },
  AP25: { name: "Autocar Pro", title: "EV sales in India hit record 2.27 million in CY2025", url: "https://www.autocarpro.in/analysis/ev-sales-in-india-hit-record-227-million-in-cy2025-all-4-segments-scale-new-highs-130452", date: "Jan 2026" },
  FADA22: { name: "The Federal (FADA data)", title: "India's EV sales see three-fold jump in FY22", url: "https://thefederal.com/business/indias-ev-sales-see-three-fold-jump-in-fy-22-4-29-lakh-units-sold", date: "Apr 2022" },
  APFY23: { name: "Autocar Pro", title: "EV sales in India hit 1.17 million units in FY2023", url: "https://www.autocarpro.in/analysis-sales/ev-sales-in-india-hit-116-million-units-in-fy2023-race-past-100000-units-six-months-in-a-row-114543", date: "Mar 2023" },
  APFY24: { name: "Autocar Pro", title: "EV sales in India jump 41% to 1.66 million in FY2024", url: "https://www.autocarpro.in/analysis-sales/ev-sales-in-india-jump-41-to-166-million-in-fy2024-2-and-3ws-cars-and-suvs-scale-new-highs-119852", date: "Apr 2024" },
  APFY24CV: { name: "Autocar Pro", title: "Tata Motors tops electric CV retail sales in FY2024", url: "https://www.autocarpro.in/analysis-sales/tata-motors-tops-electric-commercial-vehicle-retail-sales-in-fy2024-119983", date: "Apr 2024" },
  APFY25: { name: "Autocar Pro", title: "EV sales grow 17% to 1.96 million in FY2025", url: "https://www.autocarpro.in/analysis-sales/ev-sales-grow-17-to-196-million-in-fy2025-2-and-3ws-cars-and-suvs-hit-new-highs-125656", date: "Apr 2025" },
  APFY26: { name: "Autocar Pro", title: "EV sales in India surpass 2.45 million units in FY2026", url: "https://www.autocarpro.in/analysis-sales/ev-sales-in-india-surpass-245-million-units-in-fy2026-all-4-segments-register-double-digit-growth-131974", date: "Apr 2026" },
  JMKFY25: { name: "JMK Research", title: "FY2025 sees record 2 million EV sales in India", url: "https://jmkresearch.com/indias-electric-vehicle-sales-crossed-2-million-in-fy2025/", date: "Apr 2025" },
  MHI: { name: "Ministry of Heavy Industries (Vahan)", title: "Lok Sabha Unstarred Question 2913", url: "https://heavyindustries.gov.in/sites/default/files/2026-03/lsauq_2913_0.pdf", date: "Mar 2026" },
  EVRM: { name: "EVreporter", title: "India's electric vehicle sales trend (monthly reports, Vahan)", url: "https://evreporter.com/indias-electric-vehicle-sales-trend-december-2025/", date: "2025–2026" },
};

// Calendar years. twoW/threeW/pv/cv/total in units; bus/goods are the parts of cv where a source splits them.
export const CALENDAR_YEARS = [
  { year: 2020, twoW: null, threeW: null, pv: 4642, cv: null, total: 122607, src: "EVR21", note: "Segment split for 2020 isn't published in a consistent source; total and cars only." },
  { year: 2021, twoW: 157712, threeW: 155025, pv: 14218, cv: null, total: 329190, src: "EVR21", note: "e-3W = L3 (146,336) + L5 (8,689) as reported by the source; e-2W is high-speed models only." },
  { year: 2022, twoW: 631464, threeW: 352710, pv: 38240, cv: 2649, bus: 1953, total: 1025063, src: "FADA23", busSrc: "JMK22", note: "Total is the sum of the four FADA segments." },
  { year: 2023, twoW: 859376, threeW: 582793, pv: 82105, cv: 5673, total: 1529947, src: "FADA23" },
  { year: 2024, twoW: 1148575, threeW: 691323, pv: 99068, cv: 10038, bus: 3822, goods: 6216, total: 1949114, src: "AP24" },
  { year: 2025, twoW: 1280168, threeW: 797727, pv: 176980, cv: 15798, bus: 4395, goods: 11324, total: 2270425, src: "AP25" },
];

// Financial years (April–March). mhiLakh = official Ministry of Heavy Industries total from Vahan (lakh units).
export const FINANCIAL_YEARS = [
  { fy: "FY20", twoW: null, threeW: null, pv: null, cv: null, total: null, mhiLakh: 1.74, src: "MHI" },
  { fy: "FY21", twoW: 41046, threeW: 88391, pv: 4984, cv: 400, total: 134821, mhiLakh: 1.43, src: "FADA22", note: "FADA data for FY21–FY22 excludes Andhra Pradesh, Madhya Pradesh, Lakshadweep and Telangana." },
  { fy: "FY22", twoW: 231338, threeW: 177874, pv: 17802, cv: 2203, total: 429217, mhiLakh: 4.59, src: "FADA22" },
  { fy: "FY23", twoW: 728201, threeW: 402098, pv: 47544, cv: null, total: 1171944, mhiLakh: 11.83, src: "APFY24", totalSrc: "APFY23" },
  { fy: "FY24", twoW: 944082, threeW: 632485, pv: 90379, cv: 8571, total: 1675800, mhiLakh: 16.81, src: "APFY24", cvSrc: "APFY24CV" },
  { fy: "FY25", twoW: 1150781, threeW: 698914, pv: 107462, cv: 8840, bus: 3570, total: 1967547, mhiLakh: 19.68, src: "APFY26", pvSrc: "APFY25", busSrc: "JMKFY25" },
  { fy: "FY26", twoW: 1402138, threeW: 830818, pv: 199590, cv: 19648, bus: 5039, goods: 14607, total: 2452921, mhiLakh: null, src: "APFY26" },
];

// Calendar 2025, month by month, all segments — EVreporter monthly Vahan reports (one consistent source).
// Excludes Telangana and low-speed e-2W. e-3W = L5 passenger + L5 cargo + e-rickshaw + e-cart. goods = e-goods carriers (split from Jun 2025).
export const MONTHLY_2025 = [
  { m: 1, twoW: 98263, pv: 11766, threeW: 59957, bus: 360, goods: null, total: 170984 },
  { m: 2, twoW: 76583, pv: 9372, threeW: 53114, bus: 307, goods: null, total: 139938 },
  { m: 3, twoW: 130375, pv: 12343, threeW: 59556, bus: 277, goods: null, total: 203253 },
  { m: 4, twoW: 92391, pv: 13119, threeW: 62533, bus: 284, goods: null, total: 168963 },
  { m: 5, twoW: 100281, pv: 12212, threeW: 66017, bus: 338, goods: null, total: 179556 },
  { m: 6, twoW: 105931, pv: 13921, threeW: 60558, bus: 531, goods: 617, total: 181573 },
  { m: 7, twoW: 102924, pv: 15437, threeW: 69145, bus: 361, goods: 875, total: 188804 },
  { m: 8, twoW: 104966, pv: 18308, threeW: 63476, bus: 391, goods: 1143, total: 188355 },
  { m: 9, twoW: 104124, pv: 15118, threeW: 61028, bus: 343, goods: 1208, total: 181907 },
  { m: 10, twoW: 144636, pv: 18984, threeW: 70601, bus: 290, goods: 1483, total: 236142 },
  { m: 11, twoW: 117648, pv: 15502, threeW: 83672, bus: 369, goods: 1297, total: 218517 },
  { m: 12, twoW: 97399, pv: 14870, threeW: 88290, bus: 569, goods: 1392, total: 202523 },
];
export const MONTHLY_2025_SRC = "EVRM";

// Calendar 2026 electric three-wheelers (with split) and e-buses — EVreporter monthly Vahan reports.
export const THREE_WHEELER_2026 = [
  { m: 1, total: 75765, l5p: 20553, l5c: 3116, erick: 44438, ecart: 7658, bus: 391 },
  { m: 2, total: 66398, l5p: 21099, l5c: 3196, erick: 34835, ecart: 7268, bus: 578 },
  { m: 3, total: 63549, l5p: 23472, l5c: 3713, erick: 28936, ecart: 7428, bus: 559 },
  { m: 4, total: 64549, l5p: 25418, l5c: 3238, erick: 28151, ecart: 7742, bus: 347 },
  { m: 5, total: 72754, l5p: 31416, l5c: 4050, erick: 29803, ecart: 7485, bus: 360 },
  { m: 6, total: 77445, l5p: 33677, l5c: 4348, erick: 32123, ecart: 7297, bus: 710 },
  { m: 7, total: 88319, l5p: 41375, l5c: 4944, erick: 34718, ecart: 7282, bus: 575 },
  { m: 8, total: 79842, l5p: 40419, l5c: 4583, erick: 28811, ecart: 6029, bus: 908 },
  { m: 9, total: 86546, l5p: 45202, l5c: 5423, erick: 29507, ecart: 6414, bus: 823 },
  { m: 10, total: 88569, l5p: 47260, l5c: 6868, erick: 27529, ecart: 6912, bus: 768 },
];
// 2025 e-3W split for the same months (EVreporter), for like-for-like comparison.
export const THREE_WHEELER_2025_SPLIT = [
  { m: 1, l5p: 12881, l5c: 2491, erick: 38823, ecart: 5762 }, { m: 2, l5p: 11907, l5c: 2448, erick: 32358, ecart: 6401 },
  { m: 3, l5p: 13539, l5c: 2701, erick: 36094, ecart: 7222 }, { m: 4, l5p: 13129, l5c: 2422, erick: 39522, ecart: 7460 },
  { m: 5, l5p: 14988, l5c: 2425, erick: 40635, ecart: 7969 }, { m: 6, l5p: 16329, l5c: 2016, erick: 35364, ecart: 6849 },
  { m: 7, l5p: 20448, l5c: 2092, erick: 39792, ecart: 6813 }, { m: 8, l5p: 18007, l5c: 2296, erick: 36961, ecart: 6212 },
  { m: 9, l5p: 18485, l5c: 2434, erick: 34078, ecart: 6031 }, { m: 10, l5p: 23954, l5c: 2560, erick: 37106, ecart: 6981 },
  { m: 11, l5p: 23994, l5c: 2707, erick: 48816, ecart: 8155 }, { m: 12, l5p: 20355, l5c: 2894, erick: 57434, ecart: 7607 },
];

export const CAVEATS = [
  "Figures are Vahan registrations as reported by each source. Sources differ slightly in coverage (for example Telangana, which runs its own portal, and armed-forces registrations), so totals from different publications can differ by up to about 3–4%.",
  "Year-end figures are often first published from a snapshot a few days before 31 December and restated later; we use the restated full-year figures where available.",
  "e-CV means electric buses plus light and heavy goods carriers. Electric cargo three-wheelers are counted under three-wheelers.",
  "Low-speed electric two-wheelers (25 km/h or less) don't need registration and aren't included.",
];
