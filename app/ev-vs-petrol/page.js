'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Leaf, Fuel, Zap, TrendingDown, Clock, IndianRupee } from 'lucide-react'

const SITE_URL = "https://www.evradar.in"

function fmt(n, decimals = 0) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: decimals }).format(n)
}

const PRESETS = [
  { label: 'City commute',     km: 30  },
  { label: 'Office + weekend', km: 50  },
  { label: 'Long distance',    km: 80  },
]

export default function EVvsPetrolPage() {
  // Inputs
  const [evPrice,      setEvPrice]      = useState(1499000)
  const [petrolPrice,  setPetrolPrice]  = useState(1000000)
  const [dailyKm,      setDailyKm]      = useState(40)
  const [fuelPrice,    setFuelPrice]    = useState(106)    // ₹/litre
  const [fuelEff,      setFuelEff]      = useState(15)     // km/litre
  const [elecPrice,    setElecPrice]    = useState(8)      // ₹/kWh
  const [evEff,        setEvEff]        = useState(6)      // km/kWh (≈ 160 Wh/km)

  const monthly = useMemo(() => {
    const km = dailyKm * 30
    const petrolCost = (km / fuelEff) * fuelPrice
    const evCost     = (km / evEff)   * elecPrice
    const savings    = petrolCost - evCost
    const priceDiff  = evPrice - petrolPrice
    const breakEven  = savings > 0 ? priceDiff / savings : Infinity
    const co2Saved   = (km * 12) * (2.31 / fuelEff - 0) / 1000  // tonnes/year (rough: 2.31 kg CO2/L)
    return { petrolCost, evCost, savings, priceDiff, breakEven, co2Saved, km }
  }, [dailyKm, fuelPrice, fuelEff, elecPrice, evEff, evPrice, petrolPrice])

  const yr5Savings  = Math.max(0, monthly.savings * 60 - monthly.priceDiff)
  const yr10Savings = Math.max(0, monthly.savings * 120 - monthly.priceDiff)

  return (
    <>
      <head>
        <title>EV vs Petrol Cost Calculator India 2026 – Monthly Savings & Break-even | EV News India</title>
        <meta name="description" content="Calculate how much you save by switching from petrol to electric vehicle in India. Get monthly savings, break-even point and 10-year cost comparison. Free EV savings calculator." />
        <link rel="canonical" href={`${SITE_URL}/ev-vs-petrol`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "EV vs Petrol Cost Calculator India",
          "description": "Compare the total cost of ownership between electric vehicles and petrol cars in India. Calculate monthly savings, break-even point and long-term savings.",
          "url": `${SITE_URL}/ev-vs-petrol`,
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home",            "item": SITE_URL },
              { "@type": "ListItem", "position": 2, "name": "EV vs Petrol",   "item": `${SITE_URL}/ev-vs-petrol` }
            ]
          },
          "mainEntity": {
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is an electric vehicle cheaper than petrol in India?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, EVs are significantly cheaper to run than petrol cars in India. Charging an EV costs approximately ₹1–2 per km, while a petrol car costs ₹5–8 per km at current fuel prices. The higher upfront cost of an EV is typically recovered in 3–5 years through fuel savings."
                }
              }
            ]
          }
        })}} />
      </head>

      <main className="min-h-screen bg-gray-50 pb-16">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link href="/" className="hover:text-green-600">Home</Link>
              <ChevronRight size={12} />
              <Link href="/ev-vs-petrol" className="text-gray-800 font-semibold">EV vs Petrol Calculator</Link>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Hero */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 mb-4">
              <Leaf size={15} /> Free Calculator
            </div>
            <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">EV vs Petrol Savings Calculator</h1>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">Find out how much you save each month by switching to an electric vehicle — and when you break even on the higher upfront cost.</p>
          </div>

          {/* Daily km presets */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Daily Distance Presets</p>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => setDailyKm(p.km)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${dailyKm === p.km ? 'border-green-600 bg-green-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-green-400'}`}>
                  {p.label} ({p.km} km/day)
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Inputs */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-black text-gray-900 mb-6">Your Details</h2>

              {/* EV Price */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Zap size={13} className="text-green-500" /> EV Price</label>
                  <span className="text-sm font-bold text-gray-800">₹{fmt(evPrice)}</span>
                </div>
                <input type="range" min="50000" max="8000000" step="10000" value={evPrice}
                  onChange={e => setEvPrice(Number(e.target.value))} className="w-full accent-green-600" />
              </div>

              {/* Petrol Price */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Fuel size={13} className="text-orange-500" /> Comparable Petrol Car Price</label>
                  <span className="text-sm font-bold text-gray-800">₹{fmt(petrolPrice)}</span>
                </div>
                <input type="range" min="50000" max="8000000" step="10000" value={petrolPrice}
                  onChange={e => setPetrolPrice(Number(e.target.value))} className="w-full accent-orange-500" />
              </div>

              <div className="border-t border-gray-100 my-5" />

              {/* Daily KM */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">Daily Distance</label>
                  <span className="text-sm font-bold text-gray-800">{dailyKm} km/day</span>
                </div>
                <input type="range" min="5" max="200" step="5" value={dailyKm}
                  onChange={e => setDailyKm(Number(e.target.value))} className="w-full accent-green-600" />
              </div>

              {/* Petrol Price/L */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Fuel size={13} className="text-orange-500" /> Petrol Price</label>
                  <span className="text-sm font-bold text-gray-800">₹{fuelPrice}/litre</span>
                </div>
                <input type="range" min="80" max="150" step="1" value={fuelPrice}
                  onChange={e => setFuelPrice(Number(e.target.value))} className="w-full accent-orange-500" />
              </div>

              {/* Petrol car efficiency */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">Petrol Car Mileage</label>
                  <span className="text-sm font-bold text-gray-800">{fuelEff} km/litre</span>
                </div>
                <input type="range" min="8" max="30" step="0.5" value={fuelEff}
                  onChange={e => setFuelEff(Number(e.target.value))} className="w-full accent-orange-500" />
              </div>

              {/* Electricity price */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Zap size={13} className="text-green-500" /> Electricity Rate</label>
                  <span className="text-sm font-bold text-gray-800">₹{elecPrice}/kWh</span>
                </div>
                <input type="range" min="4" max="15" step="0.5" value={elecPrice}
                  onChange={e => setElecPrice(Number(e.target.value))} className="w-full accent-green-600" />
              </div>

              {/* EV efficiency */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">EV Efficiency</label>
                  <span className="text-sm font-bold text-gray-800">{evEff} km/kWh</span>
                </div>
                <input type="range" min="3" max="12" step="0.5" value={evEff}
                  onChange={e => setEvEff(Number(e.target.value))} className="w-full accent-green-600" />
                <p className="text-[10px] text-gray-400 mt-1">e.g. Tata Nexon EV ≈ 6 km/kWh, Ola S1 Pro ≈ 7 km/kWh</p>
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col gap-4">
              {/* Monthly savings hero */}
              <div className={`rounded-2xl p-6 text-center ${monthly.savings > 0 ? 'border border-green-200 bg-green-50' : 'border border-orange-200 bg-orange-50'}`}>
                <p className={`text-sm font-semibold mb-1 ${monthly.savings > 0 ? 'text-green-700' : 'text-orange-700'}`}>Monthly Fuel Savings</p>
                <p className={`text-5xl font-black ${monthly.savings > 0 ? 'text-green-700' : 'text-orange-600'}`}>
                  {monthly.savings > 0 ? '+' : ''}₹{fmt(monthly.savings)}
                </p>
                <p className="text-xs text-gray-500 mt-2">{fmt(monthly.km)} km/month · EV costs ₹{fmt(monthly.evCost)} vs Petrol ₹{fmt(monthly.petrolCost)}</p>
              </div>

              {/* Monthly cost comparison */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-black text-gray-800 mb-4">Monthly Running Cost</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-green-700 flex items-center gap-1"><Zap size={11} /> EV (electricity)</span>
                      <span className="font-bold text-green-700">₹{fmt(monthly.evCost)}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(100, monthly.evCost / monthly.petrolCost * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-orange-600 flex items-center gap-1"><Fuel size={11} /> Petrol car</span>
                      <span className="font-bold text-orange-600">₹{fmt(monthly.petrolCost)}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full w-full" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  EV costs ₹{fmt(monthly.evCost / monthly.km, 1)}/km · Petrol costs ₹{fmt(monthly.petrolCost / monthly.km, 1)}/km
                </p>
              </div>

              {/* Break-even & savings */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-black text-gray-800 mb-4">Total Cost of Ownership</h3>
                <div className="space-y-3">
                  {[
                    {
                      label: 'Price Difference (EV premium)',
                      value: monthly.priceDiff >= 0 ? `+₹${fmt(monthly.priceDiff)}` : `-₹${fmt(Math.abs(monthly.priceDiff))}`,
                      icon: IndianRupee, color: monthly.priceDiff >= 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                    },
                    {
                      label: 'Break-Even Point',
                      value: monthly.savings <= 0 ? 'Never' : monthly.priceDiff <= 0 ? 'Instant' : `${fmt(monthly.breakEven, 1)} months`,
                      icon: Clock, color: 'text-blue-600 bg-blue-50'
                    },
                    {
                      label: '5-Year Net Savings',
                      value: yr5Savings > 0 ? `₹${fmt(yr5Savings)}` : `-₹${fmt(Math.abs(yr5Savings))}`,
                      icon: TrendingDown, color: yr5Savings > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    },
                    {
                      label: '10-Year Net Savings',
                      value: yr10Savings > 0 ? `₹${fmt(yr10Savings)}` : `-₹${fmt(Math.abs(yr10Savings))}`,
                      icon: Leaf, color: yr10Savings > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${row.color}`}>
                          <row.icon size={14} />
                        </div>
                        <span className="text-xs text-gray-600">{row.label}</span>
                      </div>
                      <span className="font-bold text-sm text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CO2 */}
              {monthly.co2Saved > 0 && (
                <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-2xl">🌱</div>
                    <div>
                      <p className="text-sm font-black text-green-800">CO₂ Saved per Year</p>
                      <p className="text-2xl font-black text-green-700">{fmt(monthly.co2Saved, 2)} tonnes</p>
                      <p className="text-xs text-green-600">≈ {fmt(monthly.co2Saved * 45)} trees planted</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* How it works */}
          <section className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-5">How the Calculator Works</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-bold text-gray-800 mb-1">Monthly Petrol Cost</p>
                <code className="block rounded-lg bg-orange-50 px-3 py-2 text-xs font-mono text-orange-800">
                  (daily km × 30) ÷ mileage × petrol price
                </code>
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1">Monthly EV Charging Cost</p>
                <code className="block rounded-lg bg-green-50 px-3 py-2 text-xs font-mono text-green-800">
                  (daily km × 30) ÷ EV efficiency × electricity rate
                </code>
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1">Break-even Point</p>
                <code className="block rounded-lg bg-blue-50 px-3 py-2 text-xs font-mono text-blue-800">
                  price difference ÷ monthly savings (in months)
                </code>
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1">Net 5-Year Savings</p>
                <code className="block rounded-lg bg-purple-50 px-3 py-2 text-xs font-mono text-purple-800">
                  (monthly savings × 60) − price difference
                </code>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-400">Note: This calculator considers fuel/electricity costs only. For a complete TCO analysis, also account for maintenance savings (EVs have ~40% lower maintenance cost), insurance differences, and applicable government subsidies.</p>
          </section>

          {/* FAQ */}
          <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-5">EV vs Petrol FAQs</h2>
            {[
              {
                q: "How much cheaper is it to charge an EV vs fill petrol in India?",
                a: "At current prices (petrol ≈ ₹106/litre, electricity ≈ ₹8/kWh), an EV costs roughly ₹1.3–1.5 per km while a petrol car costs ₹5–8 per km. This means EV running costs are 70–80% lower than petrol for average Indian conditions."
              },
              {
                q: "What is the break-even point for an EV in India in 2026?",
                a: "For most Indian EV buyers driving 40–50 km daily, the break-even point (when fuel savings recover the higher EV purchase price) is typically 3–5 years. With state subsidies under PM E-DRIVE and FAME-III (expected), the break-even can reduce to 2–3 years."
              },
              {
                q: "Do EVs have lower maintenance costs than petrol cars?",
                a: "Yes, significantly. EVs have fewer moving parts — no engine oil changes, no spark plugs, no exhaust system, no gearbox servicing. Studies suggest EVs cost 30–50% less to maintain than petrol cars over 5 years. Battery replacement (typically needed after 8–10 years) is the largest EV-specific expense."
              },
              {
                q: "Is EV charging available everywhere in India?",
                a: "EV charging infrastructure in India is growing rapidly. As of 2026, India has over 12,000 public charging stations. EESL (Energy Efficiency Services Limited) and ChargeZone are expanding rapidly in Tier 2 cities. Most EV owners charge at home overnight using a standard 15A socket (slow charge) or a dedicated home charger (fast charge)."
              },
            ].map((faq, i) => (
              <details key={i} className="border-b border-gray-100 last:border-0 py-3">
                <summary className="cursor-pointer font-semibold text-gray-800 text-sm">{faq.q}</summary>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </section>

          {/* Related */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/emi-calculator" className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-green-300 transition">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl">🧮</div>
              <div>
                <p className="font-bold text-gray-800">EV EMI Calculator</p>
                <p className="text-xs text-gray-500">Calculate your monthly loan payment</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-gray-300" />
            </Link>
            <Link href="/ev-subsidy" className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-green-300 transition">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">🏛️</div>
              <div>
                <p className="font-bold text-gray-800">State EV Subsidies</p>
                <p className="text-xs text-gray-500">Reduce your EV price further</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-gray-300" />
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
