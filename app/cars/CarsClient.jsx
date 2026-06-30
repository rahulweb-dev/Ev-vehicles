'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BatteryCharging, Gauge, Zap, Star,
  ChevronDown, X, SlidersHorizontal,
  Search, ArrowUpDown,
} from 'lucide-react'

/* ─── Price/Range/Battery parsers ────────────────────────────────── */
function parsePriceLakh(str) {
  if (!str) return null
  // take first price if range like "₹7.99L – ₹14.49L"
  const first = str.split(/[-–]/)[0]
  let s = first.replace(/[₹\s]/g, '').toLowerCase().trim()
  // "18.90 lakh" form
  const lm = s.match(/([\d,]+(?:\.\d+)?)\s*lakh/)
  if (lm) return parseFloat(lm[1].replace(/,/g, ''))
  // "1 crore" form
  const cm = s.match(/([\d,]+(?:\.\d+)?)\s*(?:cr|crore)/)
  if (cm) return parseFloat(cm[1].replace(/,/g, '')) * 100
  // raw rupees "55,90,000" or "5590000"
  const numStr = s.replace(/,/g, '')
  if (/^\d+(\.\d+)?$/.test(numStr)) {
    const n = parseFloat(numStr)
    return n > 100 ? n / 100000 : n   // convert rupees → lakhs
  }
  return null
}

function parseRangeKm(str) {
  if (!str) return null
  const m = str.match(/(\d+)/)
  return m ? parseInt(m[1]) : null
}

function parseBatteryKwh(str) {
  if (!str) return null
  const m = str.match(/([\d.]+)\s*kwh/i)
  return m ? parseFloat(m[1]) : null
}

/* ─── Filter options ─────────────────────────────────────────────── */
const BUDGETS = [
  { key: 'under5l',  label: 'Under ₹5 Lakh',   min: 0,  max: 5        },
  { key: '5-10l',    label: '₹5 – 10 Lakh',     min: 5,  max: 10       },
  { key: '10-20l',   label: '₹10 – 20 Lakh',    min: 10, max: 20       },
  { key: '20-35l',   label: '₹20 – 35 Lakh',    min: 20, max: 35       },
  { key: '35-60l',   label: '₹35 – 60 Lakh',    min: 35, max: 60       },
  { key: 'above60l', label: 'Above ₹60 Lakh',   min: 60, max: Infinity },
]

const RANGES = [
  { key: 'under250', label: 'Under 250 km',  min: 0,   max: 250      },
  { key: '250-350',  label: '250 – 350 km',  min: 250, max: 350      },
  { key: '350-500',  label: '350 – 500 km',  min: 350, max: 500      },
  { key: 'above500', label: 'Above 500 km',  min: 500, max: Infinity },
]

const BATTERIES = [
  { key: 'under30',  label: 'Under 30 kWh', min: 0,  max: 30       },
  { key: '30-50',    label: '30 – 50 kWh',  min: 30, max: 50       },
  { key: '50-75',    label: '50 – 75 kWh',  min: 50, max: 75       },
  { key: 'above75',  label: 'Above 75 kWh', min: 75, max: Infinity },
]

const SORT_OPTIONS = [
  { key: 'featured',   label: 'Featured First'       },
  { key: 'price-asc',  label: 'Price: Low → High'    },
  { key: 'price-desc', label: 'Price: High → Low'    },
  { key: 'range-desc', label: 'Best Range'            },
  { key: 'name',       label: 'Name A – Z'           },
]

/* ─── Map API vehicle → UI shape ──────────────────────────────────── */
function mapVehicle(v) {
  const first  = v.variants?.[0]
  const last   = v.variants?.[v.variants?.length - 1]
  const priceDisplay =
    first?.exShowroomPrice
      ? first.exShowroomPrice !== last?.exShowroomPrice
        ? `${first.exShowroomPrice} – ${last.exShowroomPrice}`
        : first.exShowroomPrice
      : 'Price TBA'
  const rangeStr   = v.performance?.drivingRange  || first?.range            || ''
  const batteryStr = v.performance?.batteryCapacity || first?.batteryCapacity || ''
  return {
    slug:           v.slug,
    name:           v.name,
    brand:          v.brand,
    image:          v.featuredImage || '',
    priceDisplay,
    priceRaw:       parsePriceLakh(first?.exShowroomPrice),
    rangeRaw:       parseRangeKm(rangeStr),
    batteryRaw:     parseBatteryKwh(batteryStr),
    rangeDisplay:   rangeStr,
    motorDisplay:   v.performance?.power    || '—',
    speedDisplay:   v.performance?.topSpeed || '—',
    featured:       !!v.featured,
    tag:            v.featured ? 'Featured' : v.category === 'upcoming' ? 'Coming Soon' : 'Popular',
    colors:         (v.colors || []).map(c =>
      typeof c === 'string' ? { name: c, hex: '#888' } : { name: c.name, hex: c.hexCode || '#888' }
    ),
  }
}

/* ─── Sub-components ──────────────────────────────────────────────── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0 pb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <span className="text-sm font-bold text-gray-800">{title}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  )
}

function RadioGroup({ items, value, onChange }) {
  return (
    <div className="space-y-2">
      {[{ key: '', label: 'Any' }, ...items].map(item => (
        <label key={item.key} className="flex items-center gap-2.5 cursor-pointer group">
          <span
            onClick={() => onChange(item.key)}
            className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
              value === item.key ? 'border-green-600 bg-green-600' : 'border-gray-300 group-hover:border-green-400'
            }`}
          >
            {value === item.key && <span className="h-1.5 w-1.5 rounded-full bg-white block" />}
          </span>
          <span className={`text-sm transition ${value === item.key ? 'font-semibold text-green-700' : 'text-gray-600'}`}>
            {item.label}
          </span>
        </label>
      ))}
    </div>
  )
}

function CheckGroup({ items, values, onChange }) {
  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {items.map(item => {
        const checked = values.includes(item)
        return (
          <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
            <span
              onClick={() => onChange(item)}
              className={`h-4 w-4 rounded border-2 flex items-center justify-center transition shrink-0 ${
                checked ? 'border-green-600 bg-green-600' : 'border-gray-300 group-hover:border-green-400'
              }`}
            >
              {checked && (
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor">
                  <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              )}
            </span>
            <span className={`text-sm transition ${checked ? 'font-semibold text-green-700' : 'text-gray-600'}`}>
              {item}
            </span>
          </label>
        )
      })}
    </div>
  )
}

/* ─── Main export ─────────────────────────────────────────────────── */
export default function CarsClient({ initialBrand, initialBudget, initialSearch }) {
  const [allCars,      setAllCars]      = useState([])
  const [brandLogos,   setBrandLogos]   = useState({})
  const [loading,      setLoading]      = useState(true)
  const [showDrawer,   setShowDrawer]   = useState(false)
  const [searchQ,      setSearchQ]      = useState(initialSearch || '')
  const [sort,         setSort]         = useState('featured')
  const [filters,      setFilters]      = useState({
    brands:  initialBrand  ? [initialBrand]  : [],
    budget:  initialBudget || '',
    range:   '',
    battery: '',
  })

  useEffect(() => {
    /* fetch vehicles and brand logos in parallel */
    Promise.all([
      fetch('/api/vehicles?vehicleType=car&status=published&limit=200').then(r => r.json()),
      fetch('/api/brands').then(r => r.json()),
    ])
      .then(([vehicleData, brandData]) => {
        /* build slug→logo map */
        const logoMap = {}
        for (const b of brandData.brands || []) {
          if (b.logo) logoMap[b.slug] = b.logo
        }
        setBrandLogos(logoMap)
        setAllCars((vehicleData.vehicles || []).map(mapVehicle))
      })
      .catch(() => setAllCars([]))
      .finally(() => setLoading(false))
  }, [])

  /* brands available in current data */
  const availableBrands = useMemo(
    () => Array.from(new Set(allCars.map(c => c.brand))).sort(),
    [allCars]
  )

  /* apply all filters + sort */
  const filtered = useMemo(() => {
    let list = allCars

    if (searchQ.trim()) {
      const q = searchQ.toLowerCase()
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q))
    }
    if (filters.brands.length > 0)
      list = list.filter(c => filters.brands.includes(c.brand))

    if (filters.budget) {
      const b = BUDGETS.find(x => x.key === filters.budget)
      if (b) list = list.filter(c => c.priceRaw !== null && c.priceRaw >= b.min && (b.max === Infinity || c.priceRaw <= b.max))
    }
    if (filters.range) {
      const r = RANGES.find(x => x.key === filters.range)
      if (r) list = list.filter(c => c.rangeRaw !== null && c.rangeRaw >= r.min && (r.max === Infinity || c.rangeRaw <= r.max))
    }
    if (filters.battery) {
      const b = BATTERIES.find(x => x.key === filters.battery)
      if (b) list = list.filter(c => c.batteryRaw !== null && c.batteryRaw >= b.min && (b.max === Infinity || c.batteryRaw <= b.max))
    }

    switch (sort) {
      case 'price-asc':  return [...list].sort((a, b) => (a.priceRaw  ?? 9999) - (b.priceRaw  ?? 9999))
      case 'price-desc': return [...list].sort((a, b) => (b.priceRaw  ?? 0)    - (a.priceRaw  ?? 0))
      case 'range-desc': return [...list].sort((a, b) => (b.rangeRaw  ?? 0)    - (a.rangeRaw  ?? 0))
      case 'name':       return [...list].sort((a, b) => a.name.localeCompare(b.name))
      default:           return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }
  }, [allCars, filters, searchQ, sort])

  const activeCount =
    (filters.brands.length > 0 ? 1 : 0) +
    (filters.budget  ? 1 : 0) +
    (filters.range   ? 1 : 0) +
    (filters.battery ? 1 : 0)

  function clearAll() { setFilters({ brands: [], budget: '', range: '', battery: '' }); setSearchQ('') }
  function toggleBrand(b) {
    setFilters(f => ({
      ...f,
      brands: f.brands.includes(b) ? f.brands.filter(x => x !== b) : [...f.brands, b],
    }))
  }

  /* ── filter panel (reused in sidebar + drawer) ─────────────────── */
  const panel = (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-black text-gray-900 text-base">Filters</h3>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs font-semibold text-red-500 hover:text-red-700 transition">
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <FilterSection title="Budget">
        <RadioGroup items={BUDGETS} value={filters.budget}
          onChange={v => setFilters(f => ({ ...f, budget: v }))} />
      </FilterSection>

      <FilterSection title="Brand" defaultOpen={filters.brands.length > 0}>
        {loading
          ? <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="h-4 rounded bg-gray-100 animate-pulse" />)}</div>
          : <CheckGroup items={availableBrands} values={filters.brands} onChange={toggleBrand} />
        }
      </FilterSection>

      <FilterSection title="Range (km)" defaultOpen={false}>
        <RadioGroup items={RANGES} value={filters.range}
          onChange={v => setFilters(f => ({ ...f, range: v }))} />
      </FilterSection>

      <FilterSection title="Battery (kWh)" defaultOpen={false}>
        <RadioGroup items={BATTERIES} value={filters.battery}
          onChange={v => setFilters(f => ({ ...f, battery: v }))} />
      </FilterSection>
    </div>
  )

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="flex flex-1 min-w-52 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 focus-within:border-green-500 transition shadow-sm">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search electric cars…"
            className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 bg-transparent"
          />
          {searchQ && (
            <button onClick={() => setSearchQ('')}>
              <X size={13} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white pl-3 pr-8 py-2.5 text-sm font-semibold text-gray-700 outline-none cursor-pointer hover:border-green-500 transition shadow-sm"
          >
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <ArrowUpDown size={12} className="pointer-events-none absolute right-2.5 top-3.5 text-gray-400" />
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setShowDrawer(true)}
          className={`lg:hidden flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
            activeCount > 0
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-green-500'
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-black text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Active filter chips ──────────────────────────────────────── */}
      {activeCount > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.brands.map(b => (
            <span key={b} className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {b} <button onClick={() => toggleBrand(b)}><X size={10} /></button>
            </span>
          ))}
          {filters.budget && (
            <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {BUDGETS.find(b => b.key === filters.budget)?.label}
              <button onClick={() => setFilters(f => ({ ...f, budget: '' }))}><X size={10} /></button>
            </span>
          )}
          {filters.range && (
            <span className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              {RANGES.find(r => r.key === filters.range)?.label}
              <button onClick={() => setFilters(f => ({ ...f, range: '' }))}><X size={10} /></button>
            </span>
          )}
          {filters.battery && (
            <span className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              {BATTERIES.find(b => b.key === filters.battery)?.label}
              <button onClick={() => setFilters(f => ({ ...f, battery: '' }))}><X size={10} /></button>
            </span>
          )}
        </div>
      )}

      {/* Result count */}
      <p className="mb-5 text-sm text-gray-500">
        {loading ? 'Loading…' : (
          <><span className="font-bold text-gray-800">{filtered.length}</span> {filtered.length === 1 ? 'car' : 'cars'} found
          {activeCount > 0 && <span className="text-gray-400"> with active filters</span>}</>
        )}
      </p>

      {/* ── Main layout: sidebar + grid ─────────────────────────────── */}
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {panel}
          </div>
        </aside>

        {/* Vehicle grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse rounded-3xl bg-gray-200 h-72" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-lg font-black text-gray-700">No cars found</p>
              <p className="mt-1 text-sm text-gray-400">Try a different filter combination</p>
              <button onClick={clearAll}
                className="mt-4 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(car => <CarCard key={car.slug} car={car} brandLogos={brandLogos} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile filter bottom drawer ──────────────────────────────── */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDrawer(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8">
            {/* Handle bar */}
            <div className="sticky top-0 bg-white pt-4 pb-2 mb-2">
              <div className="mx-auto h-1 w-10 rounded-full bg-gray-200 mb-4" />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900">Filter Cars</h3>
                <button onClick={() => setShowDrawer(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition">
                  <X size={16} />
                </button>
              </div>
            </div>
            {panel}
            <button
              onClick={() => setShowDrawer(false)}
              className="mt-6 w-full rounded-2xl bg-green-600 py-4 text-sm font-black text-white hover:bg-green-700 transition shadow-lg"
            >
              Show {filtered.length} {filtered.length === 1 ? 'car' : 'cars'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── CarCard ─────────────────────────────────────────────────────── */
function CarCard({ car, brandLogos = {} }) {
  const brandSlug = car.brand?.toLowerCase().replace(/\s+/g, '-')
  const logo = brandLogos[brandSlug] || ''
  return (
    <Link href={`/cars/${car.slug}`} className="group block">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {car.image ? (
            <Image src={car.image} alt={car.name} fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-gray-200">⚡</div>
          )}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold text-white shadow">
              {car.tag}
            </span>
          </div>
          {logo && (
            <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 bg-white/95 shadow-md">
              <Image src={logo} alt={car.brand} width={28} height={28} className="object-contain" />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1.5">
            {logo && (
              <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-sm border border-gray-100">
                <Image src={logo} alt={car.brand} width={16} height={16} className="object-contain" />
              </div>
            )}
            <p className="text-[11px] font-semibold text-green-600">{car.brand}</p>
          </div>
          <h3 className="mt-0.5 text-base font-black text-gray-900 group-hover:text-green-600 transition line-clamp-1">
            {car.name}
          </h3>
          <p className="mt-1 text-lg font-black text-green-600">{car.priceDisplay}</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <SpecPill icon={<BatteryCharging size={12} className="text-green-600" />}
              label="Range" value={car.rangeDisplay?.split(' (')[0] || '—'} bg="bg-green-50" />
            <SpecPill icon={<Zap size={12} className="text-blue-600" />}
              label="Motor" value={car.motorDisplay?.split(' /')[0] || '—'}  bg="bg-blue-50" />
            <SpecPill icon={<Gauge size={12} className="text-purple-600" />}
              label="Speed" value={car.speedDisplay || '—'}                  bg="bg-purple-50" />
          </div>
          {car.colors?.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">{car.colors.length} Colors:</span>
              {car.colors.slice(0, 5).map((c, i) => (
                <div key={i} title={c.name} className="h-4 w-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: c.hex || '#888' }} />
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700">—</span>
            </div>
            <span className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white group-hover:bg-green-500 transition">
              Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function SpecPill({ icon, label, value, bg }) {
  return (
    <div className={`rounded-xl ${bg} p-2 text-center`}>
      <div className="mb-0.5 flex justify-center">{icon}</div>
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-[11px] font-black text-gray-800 leading-tight">{value}</p>
    </div>
  )
}
