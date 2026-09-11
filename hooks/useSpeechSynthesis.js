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

/* pick the best voice for a given BCP-47 lang code */
function pickVoice(all, bcp47) {
  if (!bcp47 || bcp47.startsWith('en')) {
    const en = all.filter(v => v.lang.startsWith('en'))
    return (
      en.find(v => /siri/i.test(v.name)) ||
      en.find(v => /enhanced|premium|natural/i.test(v.name)) ||
      en.find(v => v.lang === 'en-IN') ||
      en.find(v => v.lang === 'en-US' && v.localService) ||
      en.find(v => v.lang === 'en-US') ||
      en[0] || all[0]
    )
  }
  // exact match first, then lang prefix match
  const exact  = all.filter(v => v.lang === bcp47)
  const prefix = all.filter(v => v.lang.startsWith(bcp47.split('-')[0]))
  return exact[0] || prefix[0] || all[0]
}

export function useSpeechSynthesis(text, langBcp47 = 'en-IN') {
  const [status,    setStatus]    = useState('idle')
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
  const genRef    = useRef(0)
  const langRef   = useRef(langBcp47)

  const syncStatus = (s) => { statusRef.current = s; setStatus(s) }

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  // reload voices and reselect whenever langBcp47 changes
  useEffect(() => {
    langRef.current = langBcp47
    if (!supported) return
    const load = () => {
      const all  = window.speechSynthesis.getVoices()
      setVoices(all)
      const best = pickVoice(all, langRef.current)
      voiceRef.current = best
      setSelVoice(best)
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [supported, langBcp47])

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
    const gen   = genRef.current
    const total = chunks.current.join('').length
    const done  = chunks.current.slice(0, idx).join('').length

    const u = new SpeechSynthesisUtterance(chunks.current[idx])
    u.rate = rateRef.current
    u.lang = langRef.current
    if (voiceRef.current) u.voice = voiceRef.current

    u.onboundary = (e) => {
      if (e.name === 'word' && gen === genRef.current)
        setProgress(Math.min(99, ((done + e.charIndex) / total) * 100))
    }
    u.onend = () => {
      if (gen === genRef.current && statusRef.current === 'playing') {
        chunkIdx.current = idx + 1
        speakAt(idx + 1)
      }
    }
    u.onerror = (e) => {
      if (e.error !== 'interrupted' && gen === genRef.current)
        syncStatus('idle'); clearInterval(pingTimer.current)
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
      genRef.current++
      window.speechSynthesis.cancel()
      speakAt(idx)
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
