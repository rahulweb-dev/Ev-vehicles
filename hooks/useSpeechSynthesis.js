'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* ── split text into ~250-char chunks at sentence boundaries ──
   Chrome has a ~15 s bug where speech stops on long utterances.
   Speaking chunk-by-chunk is the standard workaround.            */
function toChunks(text, max = 250) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text]
  const chunks = []
  let cur = ''
  for (const s of sentences) {
    if (cur.length + s.length > max && cur) { chunks.push(cur.trim()); cur = s }
    else cur += s
  }
  if (cur.trim()) chunks.push(cur.trim())
  return chunks.filter(Boolean)
}

export function useSpeechSynthesis(text) {
  const [status,  setStatus]  = useState('idle')   // idle | playing | paused | ended
  const [voices,  setVoices]  = useState([])
  const [selVoice, setSelVoice] = useState(null)
  const [rate,    setRateState] = useState(1)
  const [progress, setProgress] = useState(0)
  const [supported, setSupported] = useState(false)

  const chunks     = useRef([])
  const chunkIdx   = useRef(0)
  const rateRef    = useRef(1)
  const voiceRef   = useRef(null)
  const pingTimer  = useRef(null)
  const statusRef  = useRef('idle')

  /* ── keep statusRef in sync ──────────────────────────────── */
  const syncStatus = (s) => { statusRef.current = s; setStatus(s) }

  /* ── browser support check ───────────────────────────────── */
  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  /* ── load voices (Chrome fires voiceschanged async) ─────── */
  useEffect(() => {
    if (!supported) return
    const load = () => {
      const all = window.speechSynthesis.getVoices()
      const en  = all.filter(v => v.lang.startsWith('en'))
      setVoices(en)
      if (!voiceRef.current && en.length) {
        const pick =
          en.find(v => v.lang === 'en-IN') ||
          en.find(v => v.lang === 'en-US' && v.localService) ||
          en.find(v => v.lang === 'en-US') ||
          en[0]
        voiceRef.current = pick
        setSelVoice(pick)
      }
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [supported])

  /* ── prepare chunks whenever text changes ────────────────── */
  useEffect(() => { chunks.current = toChunks(text || '') }, [text])

  /* ── Chrome resume ping every 12 s to prevent silent stop ── */
  const startPing = useCallback(() => {
    clearInterval(pingTimer.current)
    pingTimer.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }
    }, 12000)
  }, [])

  /* ── speak one chunk ─────────────────────────────────────── */
  const speakAt = useCallback((idx) => {
    if (idx >= chunks.current.length) {
      syncStatus('ended'); setProgress(100); clearInterval(pingTimer.current); return
    }
    const total = chunks.current.join('').length
    const done  = chunks.current.slice(0, idx).join('').length

    const u = new SpeechSynthesisUtterance(chunks.current[idx])
    u.rate  = rateRef.current
    if (voiceRef.current) u.voice = voiceRef.current

    u.onboundary = (e) => {
      if (e.name === 'word') {
        setProgress(Math.min(99, ((done + e.charIndex) / total) * 100))
      }
    }
    u.onend = () => {
      if (statusRef.current === 'playing') { chunkIdx.current = idx + 1; speakAt(idx + 1) }
    }
    u.onerror = (e) => {
      if (e.error !== 'interrupted') { syncStatus('idle'); clearInterval(pingTimer.current) }
    }
    window.speechSynthesis.speak(u)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── controls ────────────────────────────────────────────── */
  const play = useCallback(() => {
    if (!supported) return
    if (statusRef.current === 'paused') {
      window.speechSynthesis.resume(); syncStatus('playing'); startPing(); return
    }
    window.speechSynthesis.cancel()
    chunkIdx.current = 0; setProgress(0)
    syncStatus('playing'); startPing(); speakAt(0)
  }, [supported, startPing, speakAt])

  const pause = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.pause(); syncStatus('paused'); clearInterval(pingTimer.current)
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    syncStatus('idle'); setProgress(0); chunkIdx.current = 0; clearInterval(pingTimer.current)
  }, [supported])

  const setRate = useCallback((r) => {
    rateRef.current = r; setRateState(r)
    if (statusRef.current === 'playing') {
      const idx = chunkIdx.current
      window.speechSynthesis.cancel()
      speakAt(idx)
    }
  }, [speakAt])

  const setVoice = useCallback((v) => {
    voiceRef.current = v; setSelVoice(v)
    if (statusRef.current === 'playing') {
      const idx = chunkIdx.current
      window.speechSynthesis.cancel()
      speakAt(idx)
    }
  }, [speakAt])

  /* ── cleanup ─────────────────────────────────────────────── */
  useEffect(() => () => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
    clearInterval(pingTimer.current)
  }, [])

  return { status, voices, selectedVoice: selVoice, rate, progress, supported,
           play, pause, stop, setRate, setVoice }
}
