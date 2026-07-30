"use client";

/**
 * CompareButton — add/remove a vehicle from the comparison tray.
 *
 * Usage (on any vehicle card):
 *   <CompareButton vehicleSlug="tata-nexon-ev" vehicleName="Tata Nexon EV" />
 *
 * The component includes a built-in floating tray that renders once via
 * a module-level singleton so it's safe to mount on every card in a listing.
 *
 * State is persisted in localStorage under `_ev_compare` as a JSON array of
 * { slug, name } objects (max 3 entries).
 *
 * The "Compare Now →" button navigates to:
 *   /compare?v0=slug1&v1=slug2        (2 vehicles)
 *   /compare?v0=slug1&v1=slug2&v2=slug3  (3 vehicles)
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { BarChart2, X, ArrowRight, GitCompare } from "lucide-react";

const STORAGE_KEY  = "_ev_compare";
const MAX_COMPARE  = 3;

/* ── localStorage helpers ───────────────────────────────────────────── */
function readList() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeList(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  // Notify other components on the same page
  window.dispatchEvent(new Event("_ev_compare_change"));
}

/* ── Singleton tray counter ─────────────────────────────────────────── */
// Only the first mounted CompareButton renders the floating tray.
// All subsequent buttons listen to the same storage events and re-render
// their toggle state, but they do NOT render an extra tray.
let _trayOwner = false;

/* ── FloatingTray (portal, renders once) ───────────────────────────── */
function FloatingTray({ list, onRemove, onClear, onCompare }) {
  if (list.length === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      role="status"
      aria-live="polite"
      aria-label="EV comparison tray"
    >
      <div className="w-full max-w-3xl mx-3 mb-3">
        <div className="rounded-2xl border border-green-200 bg-white shadow-2xl ring-1 ring-green-100 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between bg-green-700 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <GitCompare size={15} className="text-green-200" />
              <span className="text-xs font-bold text-white">
                Compare EVs
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-black">
                  {list.length}/{MAX_COMPARE}
                </span>
              </span>
            </div>
            <button
              onClick={onClear}
              aria-label="Clear all comparisons"
              className="rounded-full p-1 text-green-200 hover:bg-white/10 hover:text-white transition"
            >
              <X size={14} />
            </button>
          </div>

          {/* Vehicles + CTA */}
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex flex-1 flex-wrap gap-2 min-w-0">
              {list.map((v) => (
                <div
                  key={v.slug}
                  className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800 shrink-0 max-w-[48%]"
                >
                  <span className="truncate">{v.name}</span>
                  <button
                    onClick={() => onRemove(v.slug)}
                    aria-label={`Remove ${v.name}`}
                    className="shrink-0 rounded-full text-green-500 hover:text-green-700 transition"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}

              {Array.from({ length: MAX_COMPARE - list.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex h-7 w-20 items-center justify-center rounded-full border border-dashed border-gray-200 text-[10px] text-gray-400 shrink-0"
                >
                  + Add
                </div>
              ))}
            </div>

            <button
              onClick={onCompare}
              disabled={list.length < 2}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow transition hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Compare
              <ArrowRight size={14} />
            </button>
          </div>

          {list.length === 1 && (
            <p className="pb-2.5 text-center text-[10px] text-gray-400">
              Select at least 2 EVs to compare
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── CompareButton ──────────────────────────────────────────────────── */
export default function CompareButton({
  vehicleSlug,
  vehicleName,
  compact = false,
}) {
  const router  = useRouter();
  const isTrayOwner = useRef(false);

  // null = not yet hydrated (avoids SSR mismatch)
  const [list, setList]       = useState(null);
  const [mounted, setMounted] = useState(false);

  // Claim singleton tray ownership on first mount
  useEffect(() => {
    if (!_trayOwner) {
      _trayOwner = true;
      isTrayOwner.current = true;
    }
  }, []);

  // Read initial state + subscribe to cross-component updates
  useEffect(() => {
    setList(readList());
    setMounted(true);

    const sync = () => setList(readList());
    window.addEventListener("_ev_compare_change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("_ev_compare_change", sync);
      window.removeEventListener("storage", sync);

      // Release tray ownership when this component unmounts
      if (isTrayOwner.current) {
        _trayOwner = false;
        isTrayOwner.current = false;
      }
    };
  }, []);

  /* Actions */
  const toggle = useCallback(() => {
    const current = readList();
    let next;
    if (current.some((v) => v.slug === vehicleSlug)) {
      next = current.filter((v) => v.slug !== vehicleSlug);
    } else if (current.length < MAX_COMPARE) {
      next = [...current, { slug: vehicleSlug, name: vehicleName }];
    } else {
      return; // tray full
    }
    writeList(next);
    setList(next);
  }, [vehicleSlug, vehicleName]);

  const remove = useCallback((slug) => {
    const next = readList().filter((v) => v.slug !== slug);
    writeList(next);
    setList(next);
  }, []);

  const clear = useCallback(() => {
    writeList([]);
    setList([]);
  }, []);

  const compare = useCallback(() => {
    const current = readList();
    if (current.length < 2) return;
    const params = current
      .slice(0, MAX_COMPARE)
      .map((v, i) => `v${i}=${encodeURIComponent(v.slug)}`)
      .join("&");
    router.push(`/compare?${params}`);
  }, [router]);

  const safeList  = list ?? [];
  const isInList  = safeList.some((v) => v.slug === vehicleSlug);
  const isFull    = safeList.length >= MAX_COMPARE && !isInList;

  // Render a static placeholder before hydration to avoid mismatch
  if (!mounted) {
    return (
      <button
        disabled
        aria-hidden="true"
        className={`flex items-center gap-1.5 rounded-full border border-gray-200 bg-white text-gray-400
          ${compact ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs"}`}
      >
        <BarChart2 size={compact ? 11 : 13} />
        {!compact && <span>Compare</span>}
      </button>
    );
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggle}
        disabled={isFull}
        aria-pressed={isInList}
        aria-label={
          isInList
            ? `Remove ${vehicleName} from comparison`
            : `Add ${vehicleName} to comparison`
        }
        title={
          isFull
            ? `Comparison tray is full (max ${MAX_COMPARE})`
            : isInList
            ? "Remove from comparison"
            : "Add to comparison"
        }
        className={`flex items-center gap-1.5 rounded-full border font-semibold transition active:scale-95
          ${compact ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs"}
          ${
            isInList
              ? "border-green-400 bg-green-50 text-green-700 hover:bg-green-100"
              : isFull
              ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300"
              : "border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-600"
          }`}
      >
        <BarChart2 size={compact ? 11 : 13} className={isInList ? "text-green-600" : ""} />
        {!compact && (
          <span>
            {isInList ? "Added" : isFull ? "Tray Full" : "Compare"}
          </span>
        )}
      </button>

      {/* Floating tray — only rendered by the first mounted CompareButton */}
      {isTrayOwner.current &&
        typeof document !== "undefined" &&
        createPortal(
          <FloatingTray
            list={safeList}
            onRemove={remove}
            onClear={clear}
            onCompare={compare}
          />,
          document.body
        )}
    </>
  );
}
