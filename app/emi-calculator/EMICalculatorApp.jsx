'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Calculator, ChevronRight, IndianRupee, TrendingDown, Clock, Percent } from 'lucide-react'

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(Math.round(n))
}

function calcEMI(principal, annualRate, months) {
  if (!principal || !months) return 0
  if (annualRate === 0) return principal / months
  const r = annualRate / 12 / 100
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function buildSchedule(principal, annualRate, months) {
  const emi = calcEMI(principal, annualRate, months)
  const r   = annualRate / 12 / 100
  const rows = []
  let balance = principal
  for (let i = 1; i <= months; i++) {
    const interest      = balance * r
    const principal_paid = emi - interest
    balance -= principal_paid
    rows.push({ month: i, emi, principal: principal_paid, interest, balance: Math.max(0, balance) })
  }
  return rows
}

const POPULAR = [
  { name: 'Tata Nexon EV', price: 1499000 },
  { name: 'Mahindra BE 6', price: 2199000 },
  { name: 'BYD Atto 3',    price: 2499000 },
  { name: 'Ola S1 Pro',    price:  149999 },
  { name: 'Ather 450X',    price:  139900 },
]

export default function EMICalculatorApp() {
  const [vehiclePrice, setVehiclePrice] = useState(1499000)
  const [downPct,      setDownPct]      = useState(20)
  const [rate,         setRate]         = useState(9)
  const [tenure,       setTenure]       = useState(60)
  const [showAll,      setShowAll]      = useState(false)

  const downAmt    = Math.round(vehiclePrice * downPct / 100)
  const loanAmt    = vehiclePrice - downAmt
  const emi        = useMemo(() => calcEMI(loanAmt, rate, tenure), [loanAmt, rate, tenure])
  const totalPaid  = emi * tenure
  const totalInt   = totalPaid - loanAmt
  const schedule   = useMemo(() => buildSchedule(loanAmt, rate, tenure), [loanAmt, rate, tenure])
  const displayRows = showAll ? schedule : schedule.slice(0, 12)

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <ChevronRight size={12} />
            <Link href="/emi-calculator" className="text-gray-800 font-semibold">EMI Calculator</Link>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 mb-4">
            <Calculator size={15} /> Free Tool
          </div>
          <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">EV Loan EMI Calculator</h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">Calculate your monthly EMI for any electric vehicle in India. Adjust down payment, interest rate and tenure to find the best deal.</p>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Quick Select</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map(v => (
              <button key={v.name} onClick={() => setVehiclePrice(v.price)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${vehiclePrice === v.price ? 'border-green-600 bg-green-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-green-400'}`}>
                {v.name} — ₹{fmt(v.price)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-6">Loan Details</h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Vehicle Price (Ex-Showroom)</label>
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5">
                  <IndianRupee size={13} className="text-gray-400" />
                  <input type="number" value={vehiclePrice} onChange={e => setVehiclePrice(Number(e.target.value))}
                    className="w-28 text-sm font-bold text-gray-800 outline-none" />
                </div>
              </div>
              <input type="range" min="50000" max="10000000" step="10000" value={vehiclePrice}
                onChange={e => setVehiclePrice(Number(e.target.value))} className="w-full accent-green-600" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>₹50K</span><span>₹1 Cr</span></div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Down Payment</label>
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5">
                  <input type="number" min="0" max="90" value={downPct} onChange={e => setDownPct(Number(e.target.value))}
                    className="w-10 text-sm font-bold text-gray-800 outline-none text-right" />
                  <Percent size={13} className="text-gray-400" />
                </div>
              </div>
              <input type="range" min="0" max="90" step="5" value={downPct}
                onChange={e => setDownPct(Number(e.target.value))} className="w-full accent-green-600" />
              <p className="text-xs text-gray-500 mt-1">= ₹{fmt(downAmt)} &nbsp;|&nbsp; Loan amount: ₹{fmt(loanAmt)}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Interest Rate (per annum)</label>
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5">
                  <input type="number" min="0" max="30" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))}
                    className="w-12 text-sm font-bold text-gray-800 outline-none text-right" />
                  <Percent size={13} className="text-gray-400" />
                </div>
              </div>
              <input type="range" min="5" max="20" step="0.5" value={rate}
                onChange={e => setRate(Number(e.target.value))} className="w-full accent-green-600" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>5%</span><span>20%</span></div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Loan Tenure</label>
              <div className="grid grid-cols-3 gap-2">
                {[12, 24, 36, 48, 60, 84].map(m => (
                  <button key={m} onClick={() => setTenure(m)}
                    className={`rounded-xl py-2.5 text-sm font-bold transition ${tenure === m ? 'bg-green-600 text-white' : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-green-400'}`}>
                    {m} mo
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
              <p className="text-sm font-semibold text-green-700 mb-1">Monthly EMI</p>
              <p className="text-5xl font-black text-green-700">₹{fmt(emi)}</p>
              <p className="text-xs text-green-600 mt-2">for {tenure} months</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-black text-gray-800 mb-4">Loan Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Principal Amount', value: `₹${fmt(loanAmt)}`,   icon: IndianRupee, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Total Interest',   value: `₹${fmt(totalInt)}`,  icon: TrendingDown, color: 'text-red-600 bg-red-50' },
                  { label: 'Total Payment',    value: `₹${fmt(totalPaid)}`, icon: Clock, color: 'text-purple-600 bg-purple-50' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${row.color}`}><row.icon size={14} /></div>
                      <span className="text-sm text-gray-600">{row.label}</span>
                    </div>
                    <span className="font-bold text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Principal {Math.round(loanAmt / totalPaid * 100)}%</span>
                <span>Interest {Math.round(totalInt / totalPaid * 100)}%</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                <div className="bg-green-500 transition-all duration-500" style={{ width: `${loanAmt / totalPaid * 100}%` }} />
                <div className="bg-red-400 transition-all duration-500" style={{ width: `${totalInt / totalPaid * 100}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">Lower tenure = less interest paid</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-black text-gray-900">Repayment Schedule</h2>
            <span className="text-xs text-gray-400">{tenure} installments</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-right">EMI</th>
                  <th className="px-4 py-3 text-right">Principal</th>
                  <th className="px-4 py-3 text-right">Interest</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, i) => (
                  <tr key={row.month} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-2.5 font-semibold text-gray-700">{row.month}</td>
                    <td className="px-4 py-2.5 text-right text-gray-800">₹{fmt(row.emi)}</td>
                    <td className="px-4 py-2.5 text-right text-green-700">₹{fmt(row.principal)}</td>
                    <td className="px-4 py-2.5 text-right text-red-500">₹{fmt(row.interest)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">₹{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {schedule.length > 12 && (
            <div className="border-t border-gray-100 px-6 py-4">
              <button onClick={() => setShowAll(!showAll)} className="text-sm font-semibold text-green-600 hover:underline">
                {showAll ? 'Show less' : `Show all ${schedule.length} months`}
              </button>
            </div>
          )}
        </div>

        <section className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-5">EV Loan FAQs</h2>
          {[
            { q: "What is the typical interest rate for an EV loan in India?", a: "EV loan interest rates in India range from 7.5% to 12% per annum in 2026. Banks like SBI, HDFC, and ICICI offer preferential rates for EVs. Some state governments offer an additional 2–3% interest subsidy under their EV policies. Union Bank of India's 'Green Car Loan' offers rates starting at 7.5% for EVs." },
            { q: "How much down payment is required for an EV loan?", a: "Most banks require a minimum down payment of 15–20% of the vehicle's ex-showroom price for EV loans. A higher down payment reduces your EMI and total interest paid. Under FAME-II and state subsidy schemes, the effective on-road price may be lower, reducing the loan amount needed." },
            { q: "What is the maximum tenure for an EV car loan?", a: "EV car loans in India are typically available for tenures up to 7 years (84 months). For two-wheelers and e-bikes, the maximum tenure is usually 3–5 years. Longer tenure means lower EMI but higher total interest outflow." },
            { q: "Are there any tax benefits on EV loans in India?", a: "Yes. Under Section 80EEB of the Income Tax Act, you can claim a deduction of up to ₹1.5 lakh per year on the interest paid on an EV loan. This benefit is available to individual taxpayers (not companies) who purchase EVs for personal use. The loan must be from a bank or NBFC registered in India." },
          ].map((faq, i) => (
            <details key={i} className="border-b border-gray-100 last:border-0 py-3">
              <summary className="cursor-pointer font-semibold text-gray-800 text-sm">{faq.q}</summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </section>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/ev-vs-petrol" className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-green-300 transition">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50"><span className="text-2xl">🍃</span></div>
            <div>
              <p className="font-bold text-gray-800">EV vs Petrol Calculator</p>
              <p className="text-xs text-gray-500">How much you save switching to EV</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-300" />
          </Link>
          <Link href="/ev-subsidy" className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-green-300 transition">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50"><span className="text-2xl">🏛️</span></div>
            <div>
              <p className="font-bold text-gray-800">State EV Subsidies</p>
              <p className="text-xs text-gray-500">Check subsidies in your state</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-300" />
          </Link>
        </div>
      </div>
    </main>
  )
}
