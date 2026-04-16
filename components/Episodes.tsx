import { readFile } from 'fs/promises'
import path from 'path'
import EpisodeCard, { Episode } from './EpisodeCard'

async function getEpisodes(): Promise<Episode[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'episodes.json')
    const raw = await readFile(filePath, 'utf-8')
    const episodes: Episode[] = JSON.parse(raw)
    return episodes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch {
    return []
  }
}

export default async function Episodes() {
  const episodes = await getEpisodes()

  return (
    <section id="emissions" className="py-24 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-[#E91E8C] text-sm font-bold tracking-widest uppercase mb-4">
            Podcasts & Rediffusions
          </span>
          <h2
            className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-6 leading-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Nos émissions
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl">
            Retrouvez toutes nos émissions en replay — écoute gratuite, sans inscription.
          </p>
        </div>

        {/* Grid or empty state */}
        {episodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#FCE4EC] flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-[#E91E8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3
              className="text-xl font-bold text-[#1A1A1A] mb-2"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Bientôt disponible
            </h3>
            <p className="text-gray-400 text-sm max-w-sm">
              Les émissions seront disponibles très prochainement. Restez à l'écoute !
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {episodes.length > 0 && (
          <div className="flex justify-center mt-12">
            <p className="text-gray-400 text-sm">
              {episodes.length} émission{episodes.length > 1 ? 's' : ''} disponible{episodes.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
