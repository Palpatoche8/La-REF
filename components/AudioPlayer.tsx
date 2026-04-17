'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import WaveformAnimation from './WaveformAnimation'

interface AudioPlayerProps {
  src: string
  title: string
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function toStreamUrl(url: string): string {
  if (!url) return ''
  const fileId =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] ??
    (url.includes('drive.google.com') ? url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1] : null)
  if (fileId) return `/api/audio-proxy?id=${encodeURIComponent(fileId)}`
  return url
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [hasError, setHasError] = useState(false)

  const streamUrl = toStreamUrl(src)

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !streamUrl) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => setHasError(true))
    }
  }

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (audio) setCurrentTime(audio.currentTime)
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current
    if (audio) setDuration(audio.duration)
  }, [])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onError = () => setHasError(true)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
    }
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = progressRef.current
    if (!audio || !bar || !duration) return
    const ratio = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth
    audio.currentTime = ratio * duration
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (audioRef.current) {
      audioRef.current.volume = val
      setIsMuted(val === 0)
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isMuted) {
      audio.volume = volume || 0.7
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!streamUrl) {
    return (
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <span className="text-xs text-gray-400">Audio non disponible</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E91E8C]/10 p-4 shadow-sm">
      <audio ref={audioRef} src={streamUrl} preload="none" />

      {/* Waveform + title */}
      <div className="flex items-center gap-3 mb-3">
        <WaveformAnimation isPlaying={isPlaying} bars={9} />
        <span className="text-xs text-gray-400 font-medium truncate flex-1">{title}</span>
        {hasError && (
          <span className="text-xs text-red-400 shrink-0">Erreur de lecture</span>
        )}
      </div>

      {/* Progress bar */}
      <div
        ref={progressRef}
        className="relative h-2 bg-[#FCE4EC] rounded-full cursor-pointer mb-3 group"
        onClick={handleProgressClick}
      >
        <div
          className="absolute left-0 top-0 h-full bg-[#E91E8C] rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#E91E8C] rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Time labels */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
        <span className="text-xs text-gray-400">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 15) }}
          className="p-1.5 rounded-full text-gray-400 hover:text-[#E91E8C] hover:bg-[#FCE4EC] transition-colors" title="Reculer 15s">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        <button onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-[#E91E8C] hover:bg-[#C2185B] text-white flex items-center justify-center shadow-md hover:shadow-[#E91E8C]/40 transition-all duration-200 hover:scale-105"
          title={isPlaying ? 'Pause' : 'Lecture'}>
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 15) }}
          className="p-1.5 rounded-full text-gray-400 hover:text-[#E91E8C] hover:bg-[#FCE4EC] transition-colors" title="Avancer 15s">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>

        <div className="flex-1" />

        <button onClick={toggleMute}
          className="p-1.5 rounded-full text-gray-400 hover:text-[#E91E8C] hover:bg-[#FCE4EC] transition-colors"
          title={isMuted ? 'Activer le son' : 'Couper le son'}>
          {isMuted ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-16 h-1 accent-[#E91E8C] cursor-pointer" title="Volume" />
      </div>
    </div>
  )
}
