interface REFLogoProps {
  /** Controls overall size. Hero = fills the hero block. */
  variant?: 'hero' | 'nav' | 'footer'
  /** Color scheme */
  color?: 'white' | 'pink'
}

/**
 * Inline SVG recreation of the La REF logo.
 * Uses Syne (loaded via Google Fonts) for a faithful match.
 * White variant is for use on the gradient hero / dark backgrounds.
 */
export default function REFLogo({ variant = 'hero', color = 'white' }: REFLogoProps) {
  const fill = color === 'white' ? '#ffffff' : '#E91E8C'
  const taglineFill = color === 'white' ? 'rgba(255,255,255,0.9)' : '#1A1A2E'

  if (variant === 'nav') {
    return (
      <svg
        viewBox="0 0 160 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-9 w-auto"
        aria-label="La REF — Radio Étudiante de France"
      >
        {/* REF on one line for compact nav */}
        <text
          x="0" y="36"
          style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '38px', letterSpacing: '-1px' }}
          fill={fill}
        >
          REF
        </text>
      </svg>
    )
  }

  if (variant === 'footer') {
    return (
      <svg
        viewBox="0 0 110 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-auto"
        aria-label="La REF"
      >
        <text
          x="0" y="28"
          style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '30px', letterSpacing: '-1px' }}
          fill={fill}
        >
          REF
        </text>
      </svg>
    )
  }

  /* ── Hero variant — staggered R / E / F staircase + tagline ── */
  return (
    <svg
      viewBox="0 0 520 310"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[min(520px,80vw)] h-auto"
      aria-label="La REF — Radio Étudiante de France"
    >
      {/*
        Each letter is the same size (~160px) but offset vertically
        to create the rising staircase: R low, E mid, F high.
        Based on the original La REF brand mark.
      */}
      {/* R — bottom of staircase */}
      <text
        x="0" y="240"
        style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '195px', letterSpacing: '0px' }}
        fill={fill}
      >
        R
      </text>
      {/* E — middle */}
      <text
        x="168" y="195"
        style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '195px', letterSpacing: '0px' }}
        fill={fill}
      >
        E
      </text>
      {/* F — top */}
      <text
        x="336" y="150"
        style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '195px', letterSpacing: '0px' }}
        fill={fill}
      >
        F
      </text>
      {/* Tagline */}
      <text
        x="162" y="290"
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '22px', letterSpacing: '0.5px' }}
        fill={taglineFill}
      >
        Radio Étudiante de France
      </text>
    </svg>
  )
}
