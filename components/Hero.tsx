'use client'

import { useEffect, useState } from 'react'
import REFLogo from './REFLogo'

export default function Hero() {
  const streamUrl = process.env.NEXT_PUBLIC_STREAM_URL || '#'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden gradient-animated">
      {/* Background noise/texture overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl" />

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 md:px-12 py-6 z-10">
        <REFLogo variant="nav" color="white" />
        <div className="flex items-center gap-6">
          <a href="#about" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
            À propos
          </a>
          <a href="#emissions" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
            Émissions
          </a>
          <a
            href="/admin"
            className="text-white/60 hover:text-white text-sm font-medium transition-colors"
          >
            Admin
          </a>
        </div>
      </nav>

      {/* Main content */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-6 transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* ON AIR badge */}
        <div className="flex items-center gap-2 mb-8">
          <span className="on-air-badge flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            On Air
          </span>
        </div>

        {/* REF Logo — replaces plain text title */}
        <h1 className="mb-2" style={{ filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.15))' }}>
          <REFLogo variant="hero" color="white" />
        </h1>

        {/* Waveform decoration */}
        <div className="flex items-end gap-1 my-4 h-8">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="wave-bar-white"
              style={{ animationDelay: `${i * 0.07}s` }}
            />
          ))}
        </div>

        {/* Tagline */}
        <p className="text-white/70 text-sm md:text-base mb-10 max-w-lg mt-2">
          La voix des étudiants — musique, culture, débats, et bien plus encore.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-white text-[#E91E8C] font-bold px-8 py-4 rounded-full text-base hover:bg-pink-50 transition-all duration-200 shadow-2xl hover:shadow-white/20 hover:scale-105"
          >
            <span className="w-3 h-3 rounded-full bg-[#E91E8C] animate-pulse" />
            Écouter en direct
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="#emissions"
            className="flex items-center gap-2 text-white/80 hover:text-white font-medium px-6 py-4 rounded-full border border-white/30 hover:border-white/60 transition-all duration-200 backdrop-blur-sm text-base"
          >
            Nos émissions
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
