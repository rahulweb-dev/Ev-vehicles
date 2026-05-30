'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* split text into ~250-char chunks at sentence boundaries —
   Chrome silently stops on long utterances; chunks work around it */
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
  const [status,    setStatus]    = useState('idle')   // idle | playing | paused | ended
  const [voices,    setVoices]    = useState([])
  const [selVoice,  setSelVoice]  = useState(null)
  const [rate,      setRateState] = useState(1)
  const [progress,  setProgress]  = useState(0)
  const [supported, setSupported] = useState(false)

  const chunks    = useRef([])
  const chunkIdx  = useRef(0)
  const rateRef   = useRef(1)
  const voiceRef  = useRef(null)
  const pingTimer = useRef(null)
  const statusRef = useRef('idle')
  /* generation counter: incremented before every cancel() so that
     stale onend callbacks from the previous utterance are ignored   */
  const genRef    = useRef(0)

  const syncStatus = (s) => { statusRef.current = s; setStatus(s) }

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  useEffect(() => {
    if (!supported) return
    const load = () => {
      const all = window.speechSynthesis.getVoices()
      const en  = all.filter(v => v.lang.startsWith('en'))
      setVoices(en)
      if (!voiceRef.current && en.length) {
        /* priority: Siri → Enhanced/Premium → en-IN → local en-US → any en-US → first */
        const pick =
          en.find(v => /siri/i.test(v.name)) ||
          en.find(v => /enhanced|premium|natural/i.test(v.name)) ||
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

  useEffect(() => { chunks.current = toChunks(text || '') }, [text])

  /* Chrome resume ping every 12 s to prevent silent stop */
  const startPing = useCallback(() => {
    clearInterval(pingTimer.current)
    pingTimer.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }
    }, 12000)
  }, [])

  const speakAt = useCallback((idx) => {
    if (idx >= chunks.current.length) {
      syncStatus('ended'); setProgress(100); clearInterval(pingTimer.current); return
    }
    /* capture generation so this utterance's callbacks are tied to the current run */
    const gen   = genRef.current
    const total = chunks.current.join('').length
    const done  = chunks.current.slice(0, idx).join('').length

    const u = new SpeechSynthesisUtterance(chunks.current[idx])
    u.rate  = rateRef.current
    if (voiceRef.current) u.voice = voiceRef.current

    u.onboundary = (e) => {
      if (e.name === 'word' && gen === genRef.current) {
        setProgress(Math.min(99, ((done + e.charIndex) / total) * 100))
      }
    }
    u.onend = () => {
      /* only advance if this utterance belongs to the current generation */
      if (gen === genRef.current && statusRef.current === 'playing') {
        chunkIdx.current = idx + 1
        speakAt(idx + 1)
      }
    }
    u.onerror = (e) => {
      if (e.error !== 'interrupted' && gen === genRef.current) {
        syncStatus('idle'); clearInterval(pingTimer.current)
      }
    }
    window.speechSynthesis.speak(u)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const play = useCallback(() => {
    if (!supported) return
    if (statusRef.current === 'paused') {
      window.speechSynthesis.resume(); syncStatus('playing'); startPing(); return
    }
    genRef.current++
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
    genRef.current++
    window.speechSynthesis.cancel()
    syncStatus('idle'); setProgress(0); chunkIdx.current = 0; clearInterval(pingTimer.current)
  }, [supported])

  const setRate = useCallback((r) => {
    rateRef.current = r; setRateState(r)
    if (statusRef.current === 'playing') {
      const idx = chunkIdx.current
      genRef.current++                  /* invalidate the old utterance's onend */
      window.speechSynthesis.cancel()
      speakAt(idx)                      /* resume from same chunk at new speed  */
    }
  }, [speakAt])

  const setVoice = useCallback((v) => {
    voiceRef.current = v; setSelVoice(v)
    if (statusRef.current === 'playing') {
      const idx = chunkIdx.current
      genRef.current++
      window.speechSynthesis.cancel()
      speakAt(idx)
    }
  }, [speakAt])

  useEffect(() => () => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
    clearInterval(pingTimer.current)
  }, [])

  return { status, voices, selectedVoice: selVoice, rate, progress, supported,
           play, pause, stop, setRate, setVoice }
}
