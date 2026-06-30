"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, RotateCcw, Star, Zap, BatteryCharging } from "lucide-react";

const QUESTIONS = [
  {
    id: "use",
    question: "How will you mainly use the EV?",
    options: [
      { label: "Daily city commute",      value: "city",     icon: "🏙️" },
      { label: "Highway / inter-city",    value: "highway",  icon: "🛣️" },
      { label: "Mix of city + highway",   value: "mixed",    icon: "🗺️" },
      { label: "Family outings & trips",  value: "family",   icon: "👨‍👩‍👧" },
    ],
  },
  {
    id: "budget",
    question: "What is your budget?",
    options: [
      { label: "Under ₹10 Lakh",    value: "budget",   icon: "💚" },
      { label: "₹10 – ₹15 Lakh",   value: "mid",      icon: "💛" },
      { label: "₹15 – ₹25 Lakh",   value: "premium",  icon: "🧡" },
      { label: "Above ₹25 Lakh",    value: "luxury",   icon: "❤️" },
    ],
  },
  {
    id: "range",
    question: "Minimum daily range you need?",
    options: [
      { label: "Under 100 km",   value: "short",  icon: "🔋" },
      { label: "100 – 200 km",   value: "medium", icon: "⚡" },
      { label: "200 – 350 km",   value: "long",   icon: "🚀" },
      { label: "350 km+",        value: "ultra",  icon: "🛸" },
    ],
  },
  {
    id: "type",
    question: "What type of vehicle do you prefer?",
    options: [
      { label: "Hatchback / Small",  value: "hatch",   icon: "🚗" },
      { label: "SUV / Crossover",    value: "suv",     icon: "🚙" },
      { label: "Sedan",              value: "sedan",   icon: "🚘" },
      { label: "Electric Scooter",   value: "scooter", icon: "🛵" },
    ],
  },
  {
    id: "charging",
    question: "Do you have home charging access?",
    options: [
      { label: "Yes – own home with parking", value: "home",    icon: "🏠" },
      { label: "Apartment with common parking", value: "apt",   icon: "🏢" },
      { label: "No, rely on public chargers",  value: "public", icon: "⚡" },
      { label: "Not sure yet",                 value: "unsure", icon: "🤷" },
    ],
  },
  {
    id: "priority",
    question: "What matters most to you?",
    options: [
      { label: "Lowest running cost",    value: "economy",  icon: "💰" },
      { label: "Maximum range",          value: "range",    icon: "📏" },
      { label: "Brand / Premium feel",   value: "brand",    icon: "⭐" },
      { label: "Fast charging speed",    value: "charging", icon: "⚡" },
    ],
  },
];

const RESULTS = [
  {
    match: (a) => a.budget === "budget" && a.type === "scooter",
    vehicles: [
      { name: "Ather 450X",      slug: "ather-450x",      type: "bike", price: "₹1.39 L", range: "150 km", badge: "Best Scooter Under ₹1.5L" },
      { name: "Ola S1 Air",      slug: "ola-s1-air",      type: "bike", price: "₹1.10 L", range: "101 km", badge: "Most Affordable" },
      { name: "TVS iQube ST",    slug: "tvs-iqube-st",    type: "bike", price: "₹1.58 L", range: "145 km", badge: "Best Build Quality" },
    ],
    heading: "Best Electric Scooters for You",
    reason: "Based on your budget and preference for a two-wheeler, these are India's top-rated electric scooters.",
  },
  {
    match: (a) => a.budget === "budget",
    vehicles: [
      { name: "Tata Tiago EV",   slug: "tata-tiago-ev",   type: "car", price: "₹7.99 L", range: "315 km", badge: "Best Value EV" },
      { name: "MG Comet EV",     slug: "mg-comet-ev",     type: "car", price: "₹6.99 L", range: "230 km", badge: "Smallest & Cheapest" },
      { name: "Citroën ë-C3",    slug: "citroen-ec3",     type: "car", price: "₹11.5 L", range: "320 km", badge: "City Car" },
    ],
    heading: "Best Budget Electric Cars for You",
    reason: "You want an affordable EV — these deliver great value without compromising on features.",
  },
  {
    match: (a) => a.budget === "mid" && (a.use === "city" || a.use === "mixed"),
    vehicles: [
      { name: "Tata Nexon EV",   slug: "tata-nexon-ev",   type: "car", price: "₹13.99 L", range: "465 km", badge: "India's Best Seller" },
      { name: "Tata Punch EV",   slug: "tata-punch-ev",   type: "car", price: "₹9.99 L",  range: "421 km", badge: "Best SUV Under ₹15L" },
      { name: "MG Windsor EV",   slug: "mg-windsor-ev",   type: "car", price: "₹13.5 L",  range: "331 km", badge: "Biggest Cabin" },
    ],
    heading: "Perfect Mid-Range EVs for You",
    reason: "Ideal for daily mixed driving — great range, proven reliability, and packed with features.",
  },
  {
    match: (a) => a.budget === "premium" || (a.range === "long" || a.range === "ultra"),
    vehicles: [
      { name: "Hyundai Creta EV", slug: "hyundai-creta-electric", type: "car", price: "₹17.99 L", range: "473 km", badge: "Premium Midsize SUV" },
      { name: "Tata Curvv EV",   slug: "tata-curvv-ev",          type: "car", price: "₹17.49 L", range: "585 km", badge: "Best Range" },
      { name: "MG ZS EV",        slug: "mg-zs-ev",               type: "car", price: "₹18.98 L", range: "461 km", badge: "Feature Rich" },
    ],
    heading: "Premium EVs with Long Range",
    reason: "You need premium comfort and long range — these top the charts in India's premium EV segment.",
  },
  {
    match: (a) => a.budget === "luxury",
    vehicles: [
      { name: "Mahindra BE 6",   slug: "mahindra-be-6",        type: "car", price: "₹26.9 L",  range: "682 km", badge: "Best Indian Luxury EV" },
      { name: "Kia EV6",         slug: "kia-ev6",              type: "car", price: "₹60.95 L", range: "528 km", badge: "Global Award Winner" },
      { name: "BMW i4",          slug: "bmw-i4",               type: "car", price: "₹72 L",    range: "590 km", badge: "Ultimate EV Experience" },
    ],
    heading: "Luxury EVs for the Discerning Buyer",
    reason: "You want the best — these are the most aspirational electric vehicles available in India.",
  },
  {
    match: () => true,
    vehicles: [
      { name: "Tata Nexon EV",   slug: "tata-nexon-ev",   type: "car", price: "₹13.99 L", range: "465 km", badge: "India's Best Seller" },
      { name: "Tata Punch EV",   slug: "tata-punch-ev",   type: "car", price: "₹9.99 L",  range: "421 km", badge: "Best SUV Under ₹15L" },
      { name: "Hyundai Creta EV",slug: "hyundai-creta-electric", type: "car", price: "₹17.99 L", range: "473 km", badge: "Premium Choice" },
    ],
    heading: "Top EV Picks for India",
    reason: "Based on your preferences, these are the most popular and well-reviewed EVs in India right now.",
  },
];

function getResult(answers) {
  return RESULTS.find(r => r.match(answers)) || RESULTS[RESULTS.length - 1];
}

export default function EVQuizClient() {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState({});
  const [result,  setResult]  = useState(null);

  function answer(qid, value) {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      setResult(getResult(next));
    }
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  const progress = ((step) / QUESTIONS.length) * 100;
  const q = QUESTIONS[step];

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 mb-4">
              <Star size={14} fill="currentColor" /> Your EV Match
            </div>
            <h1 className="text-3xl font-black text-gray-900">{result.heading}</h1>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">{result.reason}</p>
          </div>

          <div className="space-y-4 mb-8">
            {result.vehicles.map((v, i) => (
              <Link key={v.slug}
                href={`/${v.type === "bike" ? "bikes" : "cars"}/${v.slug}`}
                className={`flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm hover:border-green-400 hover:shadow-md transition ${i === 0 ? "border-green-400 ring-1 ring-green-200" : "border-gray-200"}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white font-black">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-gray-900">{v.name}</p>
                    {i === 0 && <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">Top Pick</span>}
                  </div>
                  <p className="text-xs text-green-600 font-semibold mt-0.5">{v.badge}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-bold text-gray-700">{v.price}</span>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><BatteryCharging size={10} /> {v.range}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 shrink-0" />
              </Link>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={restart}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              <RotateCcw size={15} /> Retake Quiz
            </button>
            <Link href="/compare"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-bold text-white hover:bg-green-700 transition">
              Compare These EVs <ChevronRight size={15} />
            </Link>
          </div>

          {/* Schema for SEO */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Quiz",
            name: "Which EV is Right for You?",
            description: "6-question EV recommendation quiz for India",
            url: "https://www.evradar.in/ev-quiz",
          }) }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 mb-4">
            <Zap size={14} /> EV Finder Quiz
          </div>
          <h1 className="text-3xl font-black text-gray-900">Which EV is Right for You?</h1>
          <p className="mt-2 text-gray-500">Answer {QUESTIONS.length} quick questions to find your perfect EV</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Question {step + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full bg-green-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question card */}
        <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-5">
            <p className="text-white font-black text-xl">{q.question}</p>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {q.options.map(opt => (
              <button key={opt.value} onClick={() => answer(q.id, opt.value)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition hover:border-green-400 hover:bg-green-50 ${
                  answers[q.id] === opt.value ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}>
                <span className="text-3xl">{opt.icon}</span>
                <span className="text-sm font-semibold text-gray-800 leading-tight">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Back button */}
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="mt-4 mx-auto flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition">
            ← Previous question
          </button>
        )}
      </div>
    </div>
  );
}
