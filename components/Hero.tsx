'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import REFLogo from './REFLogo'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function Hero() {
  const streamUrl = process.env.NEXT_PUBLIC_STREAM_URL || '#'
  const [mounted, setMounted] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  useEffect(() => { setMounted(true) }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAuthOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  const isAdmin = ADMIN_EMAIL && session?.user?.email === ADMIN_EMAIL

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden gradient-animated">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl" />

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 md:px-12 py-6 z-10">
        <REFLogo variant="nav" color="white" />

        <div className="flex items-center gap-6">
          <a href="#about" className="text-white/80 hover:text-white text-sm font-medium transition-colors hidden sm:block">
            À propos
          </a>
          <a href="#emissions" className="text-white/80 hover:text-white text-sm font-medium transition-colors hidden sm:block">
            Émissions
          </a>

          {isAdmin && (
            <a href="/admin" className="text-white/70 hover:text-white text-sm font-medium transition-colors hidden sm:block">
              Admin
            </a>
          )}

          {/* Auth area */}
          <div className="relative" ref={dropdownRef}>
            {session ? (
              <button
                onClick={() => setAuthOpen((o) => !o)}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1.5 transition-all"
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">
                    {session.user?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <span className="text-white text-xs font-medium max-w-[100px] truncate hidden sm:block">
                  {session.user?.name?.split(' ')[0]}
                </span>
                <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen((o) => !o)}
                className="flex items-center gap-2 bg-white text-[#E91E8C] font-bold text-sm px-4 py-2 rounded-full hover:bg-pink-50 transition-all shadow-lg hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Se connecter
              </button>
            )}

            {/* Dropdown */}
            {authOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                {session ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400 mb-0.5">Connecté en tant que</p>
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">{session.user?.email}</p>
                    </div>
                    {isAdmin && (
                      <a href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#FCE4EC] hover:text-[#E91E8C] transition-colors"
                        onClick={() => setAuthOpen(false)}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Administration
                      </a>
                    )}
                    <button
                      onClick={() => { signOut(); setAuthOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Se déconnecter
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Connexion</p>
                    </div>
                    <button
                      onClick={() => { signIn('google'); setAuthOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continuer avec Google
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-6 transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex items-center gap-2 mb-8">
          <span className="on-air-badge flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            On Air
          </span>
        </div>

        <h1
          className="text-white font-black leading-none mb-4"
          style={{
            fontFamily: 'INTER',
            fontSize: 'clamp(5rem, 18vw, 14rem)',
            textShadow: '0 0 80px rgba(255,255,255,0.2)',
            letterSpacing: '-0.02em',
          }}
        >
          LA REF
        </h1>

        <div className="flex items-end gap-1 my-4 h-8">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="wave-bar-white" style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>

        <p className="text-white/90 text-lg md:text-2xl font-light mt-4 mb-2 max-w-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
          Radio Étudiante de France
        </p>
        <p className="text-white/70 text-sm md:text-base mb-10 max-w-lg">
          La voix des étudiants - musique, culture, débats, et bien plus encore.
        </p>

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

      {/* Clickable scroll arrow */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors animate-bounce cursor-pointer"
        aria-label="Faire défiler vers le bas"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </section>
  )
}
