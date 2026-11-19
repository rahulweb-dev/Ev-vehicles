// Generates app/dark-theme.css: site-wide dark mode for the standard Tailwind light classes.
import fs from "fs";
const out = process.argv[2];
const esc = (c) => c.replace(/([:/\[\]#.%])/g, "\\$1");
const rules = [];
const add = (sel, decl) => rules.push(`${sel}{${decl}}`);
const D = (cls, decl, pseudo = "") => add(`.dark .${esc(cls)}${pseudo}`, decl);

// Neutral surfaces, text and borders
const SURF = { page: "#0b1120", card: "#121a2a", raised: "#1a2335", raised2: "#232e43", line: "#1f2a3d", line2: "#2a374d", line3: "#36445c" };
const TEXT = { 950: "#f8fafc", 900: "#f1f5f9", 800: "#e2e8f0", 700: "#cbd5e1", 600: "#a7b2c2", 500: "#94a3b8", 400: "#7c889b", 300: "#5d6a7e", 200: "#475467" };
for (const n of ["gray", "slate", "zinc", "neutral", "stone"]) {
  D(`bg-${n}-50`, `background-color:${SURF.page}`);
  D(`bg-${n}-100`, `background-color:${SURF.raised}`);
  D(`bg-${n}-200`, `background-color:${SURF.raised2}`);
  D(`bg-${n}-300`, `background-color:${SURF.line3}`);
  for (const [k, v] of Object.entries(TEXT)) D(`text-${n}-${k}`, `color:${v}`);
  D(`border-${n}-50`, `border-color:${SURF.line}`); D(`border-${n}-100`, `border-color:${SURF.line}`);
  D(`border-${n}-200`, `border-color:${SURF.line2}`); D(`border-${n}-300`, `border-color:${SURF.line3}`);
  for (const k of [50, 100, 200]) add(`.dark .${esc(`divide-${n}-${k}`)}>:not(:last-child)`, `border-color:${k === 200 ? SURF.line2 : SURF.line}`);
  for (const k of [100, 200]) D(`ring-${n}-${k}`, `--tw-ring-color:${SURF.line2}`);
  for (const o of [40, 50, 60, 70, 80]) {
    D(`border-${n}-100/${o}`, `border-color:${SURF.line}`); D(`border-${n}-200/${o}`, `border-color:${SURF.line2}`);
    D(`bg-${n}-50/${o}`, `background-color:rgb(11 17 32 / ${o}%)`); D(`bg-${n}-100/${o}`, `background-color:rgb(26 35 53 / ${o}%)`);
  }
  // hovers
  D(`hover:bg-${n}-50`, `background-color:${SURF.raised}`, ":hover");
  D(`hover:bg-${n}-100`, `background-color:${SURF.raised2}`, ":hover");
  D(`hover:bg-${n}-200`, `background-color:${SURF.line3}`, ":hover");
  for (const k of [700, 800, 900]) D(`hover:text-${n}-${k}`, `color:${TEXT[900]}`, ":hover");
  D(`hover:border-${n}-200`, `border-color:${SURF.line3}`, ":hover"); D(`hover:border-${n}-300`, `border-color:${SURF.line3}`, ":hover");
  // gradients
  D(`from-${n}-50`, `--tw-gradient-from:${SURF.page}`); D(`to-${n}-50`, `--tw-gradient-to:${SURF.page}`); D(`via-${n}-50`, `--tw-gradient-via:${SURF.page}`);
  D(`from-${n}-100`, `--tw-gradient-from:${SURF.raised}`); D(`to-${n}-100`, `--tw-gradient-to:${SURF.raised}`); D(`to-${n}-200`, `--tw-gradient-to:${SURF.raised2}`);
}
D("bg-white", `background-color:${SURF.card}`);
for (const o of [50, 60, 70, 75, 80, 85, 90, 95]) D(`bg-white/${o}`, `background-color:rgb(18 26 42 / ${o}%)`);
D("hover:bg-white", `background-color:${SURF.raised}`, ":hover");
D("focus:bg-white", `background-color:${SURF.card}`, ":focus");
D("focus-within:bg-white", `background-color:${SURF.card}`, ":focus-within");
D("text-black", `color:${TEXT[950]}`);
D("border-white", `border-color:${SURF.line2}`);
D("from-white", `--tw-gradient-from:${SURF.card}`); D("via-white", `--tw-gradient-via:${SURF.card}`); D("to-white", `--tw-gradient-to:${SURF.card}`);
D("bg-[#F5F7FA]", `background-color:${SURF.page}`);
D("placeholder-gray-400", `color:${TEXT[400]}`, "::placeholder");

// Accent palettes: tinted backgrounds, readable text, soft borders
const ACC = {
  green: ["34 197 94", "#4ade80", "#86efac"], emerald: ["16 185 129", "#34d399", "#6ee7b7"], teal: ["20 184 166", "#2dd4bf", "#5eead4"],
  cyan: ["6 182 212", "#22d3ee", "#67e8f9"], sky: ["14 165 233", "#38bdf8", "#7dd3fc"], blue: ["59 130 246", "#60a5fa", "#93c5fd"],
  indigo: ["99 102 241", "#818cf8", "#a5b4fc"], violet: ["139 92 246", "#a78bfa", "#c4b5fd"], purple: ["168 85 247", "#c084fc", "#d8b4fe"],
  fuchsia: ["217 70 239", "#e879f9", "#f0abfc"], pink: ["236 72 153", "#f472b6", "#f9a8d4"], rose: ["244 63 94", "#fb7185", "#fda4af"],
  red: ["239 68 68", "#f87171", "#fca5a5"], orange: ["249 115 22", "#fb923c", "#fdba74"], amber: ["245 158 11", "#fbbf24", "#fcd34d"],
  yellow: ["234 179 8", "#facc15", "#fde047"], lime: ["132 204 22", "#a3e635", "#bef264"],
};
for (const [c, [rgb, t4, t3]] of Object.entries(ACC)) {
  D(`bg-${c}-50`, `background-color:rgb(${rgb} / 0.10)`);
  D(`bg-${c}-100`, `background-color:rgb(${rgb} / 0.16)`);
  D(`bg-${c}-200`, `background-color:rgb(${rgb} / 0.24)`);
  for (const k of [50, 100]) D(`bg-${c}-${k}/50`, `background-color:rgb(${rgb} / 0.07)`);
  for (const k of [600, 700]) D(`text-${c}-${k}`, `color:${t4}`);
  for (const k of [800, 900, 950]) D(`text-${c}-${k}`, `color:${t3}`);
  for (const k of [100, 200, 300]) D(`border-${c}-${k}`, `border-color:rgb(${rgb} / ${k === 300 ? 0.45 : 0.28})`);
  for (const k of [100, 200]) D(`ring-${c}-${k}`, `--tw-ring-color:rgb(${rgb} / 0.3)`);
  D(`hover:bg-${c}-50`, `background-color:rgb(${rgb} / 0.16)`, ":hover");
  D(`hover:bg-${c}-100`, `background-color:rgb(${rgb} / 0.22)`, ":hover");
  for (const k of [600, 700, 800, 900]) D(`hover:text-${c}-${k}`, `color:${t3}`, ":hover");
  D(`hover:border-${c}-200`, `border-color:rgb(${rgb} / 0.45)`, ":hover"); D(`hover:border-${c}-300`, `border-color:rgb(${rgb} / 0.55)`, ":hover");
  D(`from-${c}-50`, `--tw-gradient-from:rgb(${rgb} / 0.10)`); D(`via-${c}-50`, `--tw-gradient-via:rgb(${rgb} / 0.10)`); D(`to-${c}-50`, `--tw-gradient-to:rgb(${rgb} / 0.10)`);
  D(`from-${c}-100`, `--tw-gradient-from:rgb(${rgb} / 0.16)`); D(`to-${c}-100`, `--tw-gradient-to:rgb(${rgb} / 0.16)`);
}

const css = `/* Site-wide dark theme (generated by scripts — edit scripts/gen-dark-theme.mjs, not by hand).
   Maps the standard light Tailwind classes used across the site and admin to a dark palette when <html> has .dark.
   Unlayered on purpose so it wins over the Tailwind utilities layer. Elements with .keep-light opt out. */
html.dark{color-scheme:dark}
.dark body{background-color:${SURF.page};color:${TEXT[800]}}
.dark .prose{--tw-prose-body:${TEXT[700]};--tw-prose-headings:${TEXT[900]};--tw-prose-lead:${TEXT[600]};--tw-prose-links:#4ade80;--tw-prose-bold:${TEXT[900]};--tw-prose-counters:${TEXT[500]};--tw-prose-bullets:${TEXT[400]};--tw-prose-hr:${SURF.line2};--tw-prose-quotes:${TEXT[800]};--tw-prose-quote-borders:${SURF.line3};--tw-prose-captions:${TEXT[500]};--tw-prose-code:${TEXT[900]};--tw-prose-pre-code:${TEXT[700]};--tw-prose-pre-bg:#0a0f1a;--tw-prose-th-borders:${SURF.line3};--tw-prose-td-borders:${SURF.line2}}
.dark .prose :is(h1,h2,h3,h4,h5,h6,strong,b,th,dt){color:${TEXT[900]} !important}
.dark .prose :is(p,li,ul,ol,td,dd,figcaption,blockquote){color:${TEXT[700]} !important}
.dark .prose a{color:#4ade80 !important}
.dark .prose [style*="color"]{color:inherit !important}
.dark .prose [style*="background"]{background-color:transparent !important}
.dark .prose table th,.dark .prose table td{border-color:${SURF.line2}}
.dark .prose table th,.dark .prose table tr:nth-child(even) td{background:${SURF.raised}}
.dark input:not([type=checkbox]):not([type=radio]):not([type=range]),.dark select,.dark textarea{color:${TEXT[900]}}
.dark ::placeholder{color:${TEXT[400]}}
/* Inline SVG charts drawn with light greys */
.dark [stroke="#f1f5f9"],.dark [stroke="#f0fdf4"]{stroke:${SURF.raised}}
.dark [stroke="#e5e7eb"],.dark [stroke="#e2e8f0"]{stroke:${SURF.line2}}
.dark [fill="#f0fdf4"],.dark [fill="#f1f5f9"]{fill:${SURF.raised}}
.dark text[fill="#111827"],.dark text[fill="#1f2937"]{fill:${TEXT[900]}}
.dark text[fill="#6b7280"],.dark text[fill="#9ca3af"]{fill:${TEXT[500]}}
${rules.join("\n")}
/* Logos: the EV Radar logo is dark green on a light background; brand logos are often dark on transparent */
.dark img[src*="logo.png"]{filter:invert(1) hue-rotate(180deg) brightness(1.1)}
.dark img[src*="brand-logos"]{background-color:#fff;border-radius:6px}
/* Opt-out: keep a light surface (e.g. brand logos that are dark on transparent) */
.dark .keep-light,.dark .keep-light *{color-scheme:light}
.dark .keep-light.bg-white,.dark .keep-light .bg-white{background-color:#fff}
`;
fs.writeFileSync(out, css);
console.log("rules:", rules.length, "bytes:", css.length);
