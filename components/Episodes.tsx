import { readEpisodes } from '@/lib/storage'
import EpisodeCard, { Episode } from './EpisodeCard'

async function getEpisodes(): Promise<{ rediffs: Episode[]; podcasts: Episode[] }> {
  const raw = await readEpisodes()
  const all = raw.map((ep) => ({ ...ep, type: ep.type ?? 'rediff' })) as Episode[]
  const sorted = all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return {
    rediffs: sorted.filter((ep) => ep.type === 'rediff'),
    podcasts: sorted.filter((ep) => ep.type === 'podcast'),
  }
}

function SectionHeader({ label, title, desc }: { label: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center mb-12">
      <span className="text-[#E91E8C] text-sm font-bold tracking-widest uppercase mb-4">{label}</span>
      <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-4 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
        {title}
      </h2>
      <p className="text-gray-500 text-base max-w-xl">{desc}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#FCE4EC] flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-[#E91E8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  )
}

export default async function Episodes() {
  const { rediffs, podcasts } = await getEpisodes()
  const total = rediffs.length + podcasts.length

  return (
    <section id="emissions" className="py-24 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto px-6 md:px-12">

        {/* Page header */}
        <div className="flex flex-col items-center text-center mb-20">
          <span className="text-[#E91E8C] text-sm font-bold tracking-widest uppercase mb-4">
            Podcasts & Rediffusions
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-6 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Nos émissions
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl">
            Retrouvez toutes nos émissions en replay — écoute gratuite, sans inscription.
          </p>
        </div>

        {total === 0 ? (
          <EmptyState message="Les émissions seront disponibles très prochainement. Restez à l'écoute !" />
        ) : (
          <>
            {/* ── Rediffusions ── */}
            <div className="mb-20">
              <SectionHeader
                label="Rediffusions"
                title="Émissions complètes"
                desc="Les radios du mardi en version intégrale — rien ne coupe, rien ne manque."
              />
              {rediffs.length === 0 ? (
                <EmptyState message="Aucune rediffusion pour l'instant." />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rediffs.map((ep) => <EpisodeCard key={ep.id} episode={ep} />)}
                </div>
              )}
            </div>

            {/* ── Podcasts ── */}
            <div>
              <SectionHeader
                label="Podcasts"
                title="Formats courts"
                desc="Best-of, extraits et pépites sélectionnés pour vous — à écouter en quelques minutes."
              />
              {podcasts.length === 0 ? (
                <EmptyState message="Aucun podcast pour l'instant." />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {podcasts.map((ep) => <EpisodeCard key={ep.id} episode={ep} />)}
                </div>
              )}
            </div>
          </>
        )}

        {total > 0 && (
          <div className="flex justify-center mt-12">
            <p className="text-gray-400 text-sm">
              {total} contenu{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
