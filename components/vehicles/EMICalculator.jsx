"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const LENDERS = [
  {
    name: "HDFC Bank",
    rate: "8.5% – 12%",
    logo: "🏦",
    tag: "Most Popular",
    tagColor: "bg-blue-100 text-blue-700",
    url: "https://www.hdfcbank.com/content/bbp/repositories/723fb80a-2dde-42a3-9793-7ae1be57c87f/?folderPath=/OLB/assets/Common/pdfs/EV-car-loan.pdf",
    benefit: "Zero processing fee on EVs",
  },
  {
    name: "SBI",
    rate: "8.65% – 11%",
    logo: "🏛️",
    tag: "Lowest Rate",
    tagColor: "bg-green-100 text-green-700",
    url: "https://sbi.co.in/web/personal-banking/loans/auto-loans/green-car-loan",
    benefit: "Green Car Loan – 0.20% concession",
  },
  {
    name: "IDFC FIRST",
    rate: "9% – 14%",
    logo: "💳",
    tag: "Fast Approval",
    tagColor: "bg-purple-100 text-purple-700",
    url: "https://www.idfcfirstbank.com/personal-banking/loans/car-loan",
    benefit: "90% financing on ex-showroom",
  },
  {
    name: "Tata Capital",
    rate: "9.5% – 13%",
    logo: "⚡",
    tag: "EV Specialist",
    tagColor: "bg-orange-100 text-orange-700",
    url: "https://www.tatacapital.com/vehicle-loans/car-loan.html",
    benefit: "Special rates for Tata EVs",
  },
];

function parsePriceToNumber(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[₹,\s]/g, "").toLowerCase();
  const match = cleaned.match(/([\d.]+)\s*(lakh|l|cr|crore)?/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2] || "";
  if (unit.startsWith("cr")) return num * 10000000;
  if (unit === "lakh" || unit === "l") return num * 100000;
  return num;
}

export default function EMICalculator({ basePrice = "" }) {
  const [open, setOpen] = useState(false);
  const numericPrice = parsePriceToNumber(basePrice);

  const [loanAmount, setLoanAmount]     = useState(Math.round((numericPrice * 0.8) / 1000) * 1000 || 500000);
  const [downPayment, setDownPayment]   = useState(Math.round((numericPrice * 0.2) / 1000) * 1000 || 100000);
  const [tenure, setTenure]             = useState(60);
  const [interest, setInterest]         = useState(8.5);

  const principal = Math.max(0, loanAmount - downPayment);

  const emi = useMemo(() => {
    if (!principal || !tenure || !interest) return 0;
    const r = interest / 12 / 100;
    const n = tenure;
    return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }, [principal, tenure, interest]);

  const totalPayable = emi * tenure;
  const totalInterest = totalPayable - principal;

  const fmt = (n) => "₹" + n.toLocaleString("en-IN");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
      >
        <div className="flex items-center gap-2.5">
          <Calculator size={18} className="text-green-600" />
          <span className="font-bold text-gray-900">EMI Calculator</span>
          {!open && emi > 0 && (
            <span className="text-sm font-semibold text-green-600">~{fmt(emi)}/mo</span>
          )}
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-600">Vehicle Price</span>
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-400 mr-1">₹</span>
                <input type="number" value={loanAmount} onChange={e => setLoanAmount(+e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900" />
              </div>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-600">Down Payment</span>
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-400 mr-1">₹</span>
                <input type="number" value={downPayment} onChange={e => setDownPayment(+e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900" />
              </div>
            </label>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
              <span>Loan Tenure</span>
              <span className="text-green-600">{tenure} months ({tenure / 12} yr)</span>
            </div>
            <input type="range" min={12} max={84} step={12} value={tenure} onChange={e => setTenure(+e.target.value)}
              className="w-full accent-green-600" />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              {[12, 24, 36, 48, 60, 72, 84].map(t => <span key={t}>{t}</span>)}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
              <span>Interest Rate</span>
              <span className="text-green-600">{interest}% p.a.</span>
            </div>
            <input type="range" min={6} max={18} step={0.5} value={interest} onChange={e => setInterest(+e.target.value)}
              className="w-full accent-green-600" />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>6%</span><span>18%</span>
            </div>
          </div>

          <div className="rounded-xl bg-green-50 p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[11px] text-gray-500 mb-0.5">Monthly EMI</p>
              <p className="text-base font-black text-green-700">{fmt(emi)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 mb-0.5">Total Interest</p>
              <p className="text-sm font-bold text-orange-600">{fmt(totalInterest)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 mb-0.5">Total Payable</p>
              <p className="text-sm font-bold text-gray-800">{fmt(totalPayable)}</p>
            </div>
          </div>

          <p className="text-[10px] text-gray-400">* Indicative values only. Actual EMI may vary based on bank terms.</p>

          {/* Finance affiliate links */}
          <div className="pt-2">
            <p className="text-xs font-bold text-gray-700 mb-2.5">Get Loan Offers from Top Banks</p>
            <div className="grid grid-cols-2 gap-2">
              {LENDERS.map(l => (
                <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer sponsored"
                  className="flex flex-col rounded-xl border border-gray-200 p-3 hover:border-green-400 hover:shadow-sm transition group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{l.logo}</span>
                      <span className="text-xs font-bold text-gray-800">{l.name}</span>
                    </div>
                    <ExternalLink size={10} className="text-gray-300 group-hover:text-green-500 transition" />
                  </div>
                  <span className={`self-start rounded-full px-1.5 py-0.5 text-[9px] font-bold mb-1 ${l.tagColor}`}>{l.tag}</span>
                  <p className="text-[10px] text-green-600 font-semibold">{l.rate}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{l.benefit}</p>
                </a>
              ))}
            </div>
            <p className="text-[9px] text-gray-300 mt-2">* Affiliate links — rates indicative, subject to bank approval</p>
          </div>
        </div>
      )}
    </div>
  );
}
