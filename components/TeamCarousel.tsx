'use client'

import { useState, useRef, useCallback } from 'react'

const TEAM = [
  {
    name: 'Julien',
    role: 'Animateur principal · Team du J',
    bio: "Chef de file de la Team du J, Julien est l'animateur qui donne le ton dès les premières secondes. Son énergie communicative et son sens de la formule sont uniques : avec lui en cabine, l'envie d'écouter, de rester et de revenir s'impose naturellement. La REF vue par Julien, c'est une radio qui vibre en permanence.",
    initials: 'J',
  },
  {
    name: 'Thomas',
    role: 'Chroniqueur & Maître des jeux',
    bio: "Thomas, c'est la polyvalence incarnée : chroniqueur sur des sujets aussi variés qu'inattendus, grand comique avant tout et cerveau derrière les jeux cultes de l'émission. Son plus célèbre ? Trouve La Ref - un moment de radio que personne ne veut manquer.",
    initials: 'T',
  },
  {
    name: 'Idrissa',
    role: 'Chroniqueur & Expert actualité',
    bio: "Idrissa creuse là où les autres s'arrêtent. Ses chroniques sont le fruit de recherches approfondies, toujours sourcées, toujours utiles. Décryptage des arnaques, conseils pratiques, actu chaude - si vous voulez être vraiment à jour, c'est lui qu'il faut écouter.",
    initials: 'I',
  },
  {
    name: 'Lenny',
    role: 'Spécialiste musical',
    bio: "Lenny vit pour la musique. Des sorties de la semaine aux pépites oubliées, il navigue dans tous les genres avec une maîtrise qui force le respect. Son antenne est perpétuellement branchée sur les dernières actus musicales - et il partage chaque découverte avec vous.",
    initials: 'L',
  },
  {
    name: 'Jules',
    role: 'Chroniqueur & Moteur de l\'équipe',
    bio: "Jules ne fait pas les choses à moitié. Sa bonne humeur est contagieuse, ses anecdotes sont folles et son énergie booste toute l'équipe. Chroniqueur endiablé, il s'assure que la dynamique de l'émission ne retombe jamais - et ça s'entend à chaque seconde.",
    initials: 'Ju',
  },
]

const COLORS = [
  'from-[#E91E8C] to-[#FF6B9D]',
  'from-[#9C27B0] to-[#E91E8C]',
  'from-[#FF6B35] to-[#E91E8C]',
  'from-[#00BCD4] to-[#9C27B0]',
  'from-[#E91E8C] to-[#FF9800]',
]

export default function TeamCarousel() {
  const [current, setCurrent] = useState(0)
  const [dir, setDir] = useState<'left' | 'right' | null>(null)
  const [animating, setAnimating] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const goTo = useCallback((next: number, direction: 'left' | 'right') => {
    if (animating) return
    setDir(direction)
    setAnimating(true)
    setTimeout(() => {
      setCurrent(next)
      setAnimating(false)
      setDir(null)
    }, 300)
  }, [animating])

  const prev = () => goTo((current - 1 + TEAM.length) % TEAM.length, 'right')
  const next = () => goTo((current + 1) % TEAM.length, 'left')

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev()
    touchStartX.current = null
  }

  const member = TEAM[current]
  const photoLeft = current % 2 === 0

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-[#E91E8C] text-sm font-bold tracking-widest uppercase mb-4">
            L'équipe
          </span>
          <h2
            className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-6 leading-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Vos chroniqueurs
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl">
            Derrière chaque émission, une équipe passionnée. Découvrez les voix qui font La REF.
          </p>
        </div>

        {/* Card */}
        <div
          className="relative"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={`
              transition-all duration-300 ease-in-out
              ${animating
                ? dir === 'left'
                  ? '-translate-x-8 opacity-0'
                  : 'translate-x-8 opacity-0'
                : 'translate-x-0 opacity-100'
              }
            `}
          >
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
              <div className={`flex flex-col ${photoLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                {/* Photo placeholder */}
                <div className={`md:w-80 lg:w-96 shrink-0 flex items-center justify-center bg-gradient-to-br ${COLORS[current]} p-12 md:p-16 min-h-[260px] md:min-h-[380px]`}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center">
                      <span className="text-white font-black text-4xl md:text-5xl" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {member.initials}
                      </span>
                    </div>
                    <span className="text-white/70 text-xs font-medium tracking-wider uppercase"> </span>
                    { /* Photo à venir */}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="mb-2">
                    <span className="text-xs font-bold tracking-widest uppercase text-[#E91E8C]">
                      {member.role}
                    </span>
                  </div>
                  <h3
                    className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-5"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    {member.name}
                  </h3>
                  <p className="text-gray-500 text-base md:text-lg leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow buttons */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#E91E8C] hover:border-[#E91E8C]/30 hover:shadow-[#E91E8C]/20 transition-all duration-200 z-10"
            aria-label="Précédent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#E91E8C] hover:border-[#E91E8C]/30 hover:shadow-[#E91E8C]/20 transition-all duration-200 z-10"
            aria-label="Suivant"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {TEAM.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 'left' : 'right')}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2.5 bg-[#E91E8C]'
                  : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
              }`}
              aria-label={`Aller à ${TEAM[i].name}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
