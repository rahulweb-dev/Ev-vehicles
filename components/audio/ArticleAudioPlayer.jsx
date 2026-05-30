'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Square, Volume2, ChevronDown,
  ChevronUp, Headphones, BookOpen, Clock,
} from 'lucide-react'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

/* ── helpers ─────────────────────────────────────────────────── */
function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim()
}

function calcTimes(text, rate = 1) {
  const words     = text.trim().split(/\s+/).length
  const readMins  = Math.ceil(words / 238)
  const listenMin = Math.ceil(words / (160 * rate))
  return { words, readMins, listenMin }
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2]

/* ── Animated waveform bars ─────────────────────────────────── */
function Waveform({ playing }) {
  const bars = [0.4, 0.8, 0.6, 1, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4]
  return (
    <div className="flex items-center gap-0.5 h-6">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-green-400"
          animate={playing
            ? { height: [`${h * 8}px`, `${h * 24}px`, `${h * 8}px`] }
            : { height: '4px' }
          }
          transition={playing
            ? { duration: 0.6 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }
            : { duration: 0.3 }
          }
        />
      ))}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────── */
export default function ArticleAudioPlayer({ title = '', content = '' }) {
  const [open,  setOpen]  = useState(true)
  const [showVoice, setShowVoice] = useState(false)

  const plainText = useMemo(() => `${title}. ${stripHtml(content)}`, [title, content])

  const {
    status, voices, selectedVoice, rate, progress, supported,
    play, pause, stop, setRate, setVoice,
  } = useSpeechSynthesis(plainText)

  const { readMins, listenMin } = useMemo(
    () => calcTimes(plainText, rate),
    [plainText, rate]
  )

  const isPlaying = status === 'playing'
  const isPaused  = status === 'paused'
  const isEnded   = status === 'ended'

  /* close voice dropdown when clicking outside */
  const voiceRef = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (voiceRef.current && !voiceRef.current.contains(e.target)) setShowVoice(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space' && e.shiftKey) {
        e.preventDefault()
        isPlaying ? pause() : play()
      }
      if (e.code === 'Escape') stop()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPlaying, play, pause, stop])

  if (!supported) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1a0e]/90 shadow-2xl shadow-green-900/20 backdrop-blur-xl"
      role="region"
      aria-label="Listen to article"
    >
      {/* ── Header row ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600/20 text-green-400">
            <Headphones size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Listen to Article</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <BookOpen size={10} /> {readMins} min read
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <Clock size={10} /> ~{listenMin} min listen
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(isPlaying || isPaused) && (
            <Waveform playing={isPlaying} />
          )}
          <button
            onClick={() => setOpen(o => !o)}
            className="ml-2 rounded-lg p-1 text-gray-500 hover:text-white transition"
            aria-label={open ? 'Collapse player' : 'Expand player'}
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">

              {/* ── Progress bar ─────────────────────────────── */}
              <div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                    style={{ width: `${isEnded ? 100 : progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                  <span>{isEnded ? 'Finished' : isPlaying || isPaused ? `${Math.round(progress)}%` : 'Ready'}</span>
                  <span>Shift+Space play · Esc stop</span>
                </div>
              </div>

              {/* ── Controls row ──────────────────────────────── */}
              <div className="flex flex-wrap items-center gap-3">

                {/* Play / Pause / Stop */}
                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={isPlaying ? pause : play}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg shadow-green-900/40 hover:bg-green-500 transition"
                    aria-label={isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={stop}
                    disabled={status === 'idle'}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-400 hover:border-red-500/50 hover:text-red-400 transition disabled:opacity-30"
                    aria-label="Stop"
                  >
                    <Square size={16} />
                  </motion.button>
                </div>

                <div className="h-6 w-px bg-white/10" />

                {/* Speed selector */}
                <div className="flex items-center gap-1">
                  {SPEEDS.map(s => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRate(s)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                        rate === s
                          ? 'bg-green-600 text-white'
                          : 'text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-label={`${s}x speed`}
                      aria-pressed={rate === s}
                    >
                      {s === 1 ? '1×' : `${s}×`}
                    </motion.button>
                  ))}
                </div>

                <div className="h-6 w-px bg-white/10" />

                {/* Voice selector */}
                {voices.length > 0 && (
                  <div ref={voiceRef} className="relative">
                    <button
                      onClick={() => setShowVoice(v => !v)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-gray-300 hover:border-white/20 hover:text-white transition"
                    >
                      <Volume2 size={12} className="text-green-400" />
                      <span className="max-w-[120px] truncate">
                        {selectedVoice?.name?.split(' ')[0] || 'Voice'}
                      </span>
                      <ChevronDown size={11} className={`transition ${showVoice ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showVoice && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-0 mb-2 z-50 max-h-48 w-56 overflow-y-auto rounded-xl border border-white/10 bg-[#0f1f13] shadow-2xl"
                        >
                          {voices.map(v => (
                            <button
                              key={v.name}
                              onClick={() => { setVoice(v); setShowVoice(false) }}
                              className={`flex w-full flex-col items-start px-3 py-2 text-left text-[11px] transition hover:bg-white/5 ${
                                selectedVoice?.name === v.name ? 'text-green-400' : 'text-gray-300'
                              }`}
                            >
                              <span className="font-semibold truncate">{v.name}</span>
                              <span className="text-gray-500">{v.lang}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Ended state */}
              {isEnded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 rounded-xl bg-green-900/20 border border-green-700/30 px-3 py-2 text-xs text-green-400"
                >
                  <span>✓</span> Finished reading. Click play to listen again.
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
