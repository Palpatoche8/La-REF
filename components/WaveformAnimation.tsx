'use client'

interface WaveformAnimationProps {
  isPlaying: boolean
  color?: 'pink' | 'white'
  bars?: number
}

export default function WaveformAnimation({
  isPlaying,
  color = 'pink',
  bars = 7,
}: WaveformAnimationProps) {
  const barClass = color === 'white' ? 'wave-bar-white' : 'wave-bar'
  const heights = [12, 20, 28, 20, 16, 24, 18]

  return (
    <div
      className="flex items-end gap-[3px]"
      aria-hidden="true"
      style={{ height: '32px' }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={barClass}
          style={{
            height: `${heights[i % heights.length]}px`,
            animationPlayState: isPlaying ? 'running' : 'paused',
            animationDelay: `${i * 0.07}s`,
            background: color === 'white' ? 'white' : '#E91E8C',
            width: '3px',
            borderRadius: '2px',
            transformOrigin: 'bottom',
            animation: isPlaying
              ? `wave 1.2s ease-in-out ${i * 0.07}s infinite`
              : 'none',
            transform: isPlaying ? undefined : 'scaleY(0.3)',
            transition: 'transform 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}
