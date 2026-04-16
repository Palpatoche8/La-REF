'use client'

import AudioPlayer from './AudioPlayer'

export interface Episode {
  id: string
  title: string
  description: string
  date: string
  duration: string
  filename: string
}

interface EpisodeCardProps {
  episode: Episode
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const audioSrc = `/audio/${episode.filename}`

  return (
    <div className="episode-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Color accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#E91E8C] to-[#FF6B9D]" />

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-[#1A1A1A] text-lg leading-snug truncate"
              style={{ fontFamily: 'Syne, sans-serif' }}
              title={episode.title}
            >
              {episode.title}
            </h3>
          </div>
          <span className="shrink-0 flex items-center gap-1 text-xs text-[#E91E8C] bg-[#FCE4EC] px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {episode.duration}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
          {episode.description}
        </p>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(episode.date)}
        </div>

        {/* Audio Player */}
        <AudioPlayer src={audioSrc} title={episode.title} />
      </div>
    </div>
  )
}
