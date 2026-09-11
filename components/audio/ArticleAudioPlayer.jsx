'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Square, Volume2, ChevronDown,
  ChevronUp, Headphones, Languages, Loader2,
} from 'lucide-react'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

/* ─── All 22 scheduled Indian languages + English ───────────────── */
const INDIAN_LANGUAGES = [
  { code: 'en',  bcp47: 'en-IN',  name: 'English',   native: 'English'       },
  { code: 'hi',  bcp47: 'hi-IN',  name: 'Hindi',     native: 'हिंदी'         },
  { code: 'te',  bcp47: 'te-IN',  name: 'Telugu',    native: 'తెలుగు'        },
  { code: 'ta',  bcp47: 'ta-IN',  name: 'Tamil',     native: 'தமிழ்'         },
  { code: 'kn',  bcp47: 'kn-IN',  name: 'Kannada',   native: 'ಕನ್ನಡ'         },
  { code: 'ml',  bcp47: 'ml-IN',  name: 'Malayalam', native: 'മലയാളം'        },
  { code: 'mr',  bcp47: 'mr-IN',  name: 'Marathi',   native: 'मराठी'         },
  { code: 'gu',  bcp47: 'gu-IN',  name: 'Gujarati',  native: 'ગુજરાતી'       },
  { code: 'bn',  bcp47: 'bn-IN',  name: 'Bengali',   native: 'বাংলা'         },
  { code: 'pa',  bcp47: 'pa-IN',  name: 'Punjabi',   native: 'ਪੰਜਾਬੀ'        },
  { code: 'or',  bcp47: 'or-IN',  name: 'Odia',      native: 'ଓଡ଼ିଆ'         },
  { code: 'as',  bcp47: 'as-IN',  name: 'Assamese',  native: 'অসমীয়া'       },
  { code: 'ur',  bcp47: 'ur-IN',  name: 'Urdu',      native: 'اردو'          },
  { code: 'sa',  bcp47: 'sa-IN',  name: 'Sanskrit',  native: 'संस्कृतम्'     },
  { code: 'ne',  bcp47: 'ne-NP',  name: 'Nepali',    native: 'नेपाली'        },
  { code: 'mai', bcp47: 'hi-IN',  name: 'Maithili',  native: 'मैथिली'        },
  { code: 'kok', bcp47: 'kok-IN', name: 'Konkani',   native: 'कोंकणी'        },
  { code: 'sd',  bcp47: 'sd-PK',  name: 'Sindhi',    native: 'سنڌي'          },
  { code: 'ks',  bcp47: 'ks-IN',  name: 'Kashmiri',  native: 'کٲشُر'         },
  { code: 'doi', bcp47: 'hi-IN',  name: 'Dogri',     native: 'डोगरी'         },
  { code: 'mni', bcp47: 'mni-IN', name: 'Manipuri',  native: 'মৈতৈলোন্'     },
  { code: 'sat', bcp47: 'sat-IN', name: 'Santali',   native: 'ᱥᱟᱱᱛᱟᱲᱤ'    },
  { code: 'brx', bcp47: 'brx-IN', name: 'Bodo',      native: 'बड़ो'          },
]

const SPEEDS = [0.75, 1, 1.25, 1.5, 2]

/* ─── Strip HTML ────────────────────────────────────────────────── */
function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim()
}

function listenMin(text, rate = 1) {
  return Math.ceil(text.trim().split(/\s+/).length / (160 * rate))
}

/* ─── Google Translate (unofficial gtx endpoint, no key needed) ── */
async function translateChunk(text, targetCode) {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`
  const res  = await fetch(url)
  const data = await res.json()
  return data[0].map(x => x[0]).join('')
}

async function translateFull(text, targetCode) {
  // split into ≤800-char chunks at sentence boundaries
  const sentences = text.match(/[^.!?।]+[.!?।]+|[^.!?।]+$/g) || [text]
  const chunks = []
  let cur = ''
  for (const s of sentences) {
    if (cur.length + s.length > 800 && cur) { chunks.push(cur.trim()); cur = s }
    else cur += s
  }
  if (cur.trim()) chunks.push(cur.trim())
  const parts = await Promise.all(chunks.map(c => translateChunk(c, targetCode)))
  return parts.join(' ')
}

/* ─── Waveform animation ────────────────────────────────────────── */
function Waveform({ playing }) {
  const bars = [0.5, 1, 0.65, 0.9, 0.6]
  return (
    <div className="flex items-center gap-0.5 h-3.5">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full bg-green-400"
          animate={playing
            ? { height: [`${h * 3}px`, `${h * 13}px`, `${h * 3}px`] }
            : { height: '2px' }
          }
          transition={playing
            ? { duration: 0.5 + i * 0.07, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }
            : { duration: 0.2 }
          }
        />
      ))}
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────────── */
export default function ArticleAudioPlayer({ title = '', content = '' }) {
  const [open,         setOpen]         = useState(true)
  const [showLang,     setShowLang]     = useState(false)
  const [showVoice,    setShowVoice]    = useState(false)
  const [selectedLang, setSelectedLang] = useState(INDIAN_LANGUAGES[0])   // English default
  const [translating,  setTranslating]  = useState(false)
  const [translated,   setTranslated]   = useState('')   // '' = use original

  const rawText = useMemo(() => `${title}. ${stripHtml(content)}`, [title, content])

  // when language changes, translate (unless English)
  useEffect(() => {
    if (selectedLang.code === 'en') { setTranslated(''); return }
    let cancelled = false
    setTranslating(true)
    translateFull(rawText, selectedLang.code)
      .then(t  => { if (!cancelled) { setTranslated(t); setTranslating(false) } })
      .catch(() => { if (!cancelled) { setTranslated(''); setTranslating(false) } })
    return () => { cancelled = true }
  }, [selectedLang, rawText])

  const playText = translated || rawText

  const {
    status, voices, selectedVoice, rate, progress, supported,
    play, pause, stop, setRate, setVoice,
  } = useSpeechSynthesis(playText, selectedLang.bcp47)

  const mins      = useMemo(() => listenMin(playText, rate), [playText, rate])
  const isPlaying = status === 'playing'
  const isPaused  = status === 'paused'
  const isEnded   = status === 'ended'
  const isActive  = isPlaying || isPaused

  // close dropdowns on outside click
  const langDropRef  = useRef(null)
  const voiceDropRef = useRef(null)
  useEffect(() => {
    const h = (e) => {
      if (langDropRef.current  && !langDropRef.current.contains(e.target))  setShowLang(false)
      if (voiceDropRef.current && !voiceDropRef.current.contains(e.target)) setShowVoice(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space' && e.shiftKey) { e.preventDefault(); isPlaying ? pause() : play() }
      if (e.code === 'Escape') stop()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPlaying, play, pause, stop])

  if (!supported) return null

  const statusLabel = isEnded ? '✓ Done' : isActive ? `${Math.round(progress)}%` : `~${mins} min`

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-24 z-40 my-3 rounded-xl border border-white/10 bg-[#0a1a0e]/95 shadow-xl shadow-green-900/20 backdrop-blur-xl overflow-hidden"
      role="region"
      aria-label="Listen to article"
    >
      {/* ── Compact header row ─────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2">
        <Headphones size={14} className="shrink-0 text-green-400" />
        <span className="text-[11px] font-semibold text-white shrink-0">Listen to Article</span>
        {translating && <Loader2 size={11} className="animate-spin text-green-400 shrink-0" />}
        {isActive && !translating && <Waveform playing={isPlaying} />}
        {selectedLang.code !== 'en' && !translating && (
          <span className="text-[10px] text-green-400 shrink-0 font-medium">
            {selectedLang.native}
          </span>
        )}
        <span className="ml-auto text-[10px] text-gray-500 shrink-0 tabular-nums">{statusLabel}</span>
        <button
          onClick={() => setOpen(o => !o)}
          className="shrink-0 rounded p-0.5 text-gray-500 hover:text-white transition"
          aria-label={open ? 'Collapse player' : 'Expand player'}
        >
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {/* Progress bar */}
            <div className="h-0.5 w-full bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${isEnded ? 100 : progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-t border-white/5">

              {/* Play / Pause */}
              <button
                onClick={isPlaying ? pause : play}
                disabled={translating}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-500 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'}
              >
                {translating
                  ? <Loader2 size={11} className="animate-spin" />
                  : isPlaying
                    ? <Pause size={12} />
                    : <Play  size={12} className="ml-0.5" />
                }
              </button>

              {/* Stop */}
              <button
                onClick={stop}
                disabled={status === 'idle' || translating}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:border-red-400/50 hover:text-red-400 active:scale-95 transition disabled:opacity-25 disabled:pointer-events-none"
                aria-label="Stop"
              >
                <Square size={10} />
              </button>

              <div className="h-4 w-px bg-white/10 shrink-0" />

              {/* Speed */}
              <div className="flex items-center gap-0.5">
                {SPEEDS.map(s => (
                  <button
                    key={s}
                    onClick={() => setRate(s)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition ${
                      rate === s
                        ? 'bg-green-600 text-white'
                        : 'text-gray-500 hover:text-white hover:bg-white/10'
                    }`}
                    aria-pressed={rate === s}
                  >
                    {s === 1 ? '1×' : `${s}×`}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-white/10 shrink-0" />

              {/* ── Language selector ─────────────────────────── */}
              <div ref={langDropRef} className="relative">
                <button
                  onClick={() => { setShowLang(v => !v); setShowVoice(false) }}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-400 hover:text-white hover:border-green-400/40 transition"
                  title="Select language"
                >
                  <Languages size={9} className="text-green-400 shrink-0" />
                  <span className="max-w-[60px] truncate">{selectedLang.native}</span>
                  <ChevronDown size={9} className={`shrink-0 transition-transform ${showLang ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showLang && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute bottom-full left-0 mb-1.5 z-50 max-h-56 w-48 overflow-y-auto rounded-xl border border-white/10 bg-[#0f1f13] shadow-2xl"
                    >
                      {INDIAN_LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            stop()
                            setSelectedLang(lang)
                            setShowLang(false)
                          }}
                          className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[10px] transition hover:bg-white/5 ${
                            selectedLang.code === lang.code ? 'text-green-400' : 'text-gray-300'
                          }`}
                        >
                          <span className="font-semibold">{lang.name}</span>
                          <span className="text-gray-500 text-right">{lang.native}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Voice selector ────────────────────────────── */}
              {voices.length > 0 && (
                <>
                  <div ref={voiceDropRef} className="relative">
                    <button
                      onClick={() => { setShowVoice(v => !v); setShowLang(false) }}
                      className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-400 hover:text-white hover:border-white/20 transition"
                    >
                      <Volume2 size={9} className="text-green-400 shrink-0" />
                      <span className="max-w-[80px] truncate">
                        {selectedVoice?.name?.replace(/\s*\(.*?\)/g, '').trim() || 'Voice'}
                      </span>
                      <ChevronDown size={9} className={`shrink-0 transition-transform ${showVoice ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showVoice && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.97 }}
                          transition={{ duration: 0.12 }}
                          className="absolute bottom-full left-0 mb-1.5 z-50 max-h-40 w-52 overflow-y-auto rounded-xl border border-white/10 bg-[#0f1f13] shadow-2xl"
                        >
                          {voices.map(v => (
                            <button
                              key={v.name}
                              onClick={() => { setVoice(v); setShowVoice(false) }}
                              className={`flex w-full flex-col items-start px-3 py-1.5 text-left text-[10px] transition hover:bg-white/5 ${
                                selectedVoice?.name === v.name ? 'text-green-400' : 'text-gray-300'
                              }`}
                            >
                              <span className="font-semibold truncate w-full">{v.name}</span>
                              <span className="text-gray-500">{v.lang}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            {/* Translation status message */}
            {translating && (
              <div className="px-3 pb-2 text-[10px] text-green-400/70 flex items-center gap-1">
                <Loader2 size={9} className="animate-spin" />
                Translating to {selectedLang.name}…
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
