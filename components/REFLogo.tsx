interface REFLogoProps {
  variant?: 'hero' | 'nav' | 'footer'
  color?: 'white' | 'pink'
}

export default function REFLogo({ variant = 'hero', color = 'white' }: REFLogoProps) {
  const fill = color === 'white' ? '#ffffff' : '#E91E8C'
  const taglineFill = color === 'white' ? 'rgba(255,255,255,0.9)' : '#1A1A2E'

  if (variant === 'nav') {
    return (
      <div className="inline-block -rotate-12">
        <svg
          viewBox="0 0 180 60"
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-auto"
        >
          <text
            x="0"
            y="42"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '44px',
              letterSpacing: '0.18em', // ✨ plus espacé
            }}
            fill={fill}
          >
            REF
          </text>

          <text
            x="4"
            y="58"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '11px',
              letterSpacing: '0.12em',
            }}
            fill={taglineFill}
          >
            Radio Étudiante de France
          </text>
        </svg>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className="inline-block -rotate-12">
        <svg
          viewBox="0 0 150 55"
          xmlns="http://www.w3.org/2000/svg"
          className="h-9 w-auto"
        >
          <text
            x="0"
            y="6"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '36px',
              letterSpacing: '0.2em',
            }}
            fill={fill}
          >
            REF
          </text>

          <text
            x="3"
            y="22"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '10px',
              letterSpacing: '0.1em',
            }}
            fill={taglineFill}
          >
            Radio Étudiante de France
          </text>
        </svg>
      </div>
    )
  }

  // HERO (déjà bon mais on ajuste légèrement)
  return (
  <div className="inline-block -rotate-12">
    <svg
      viewBox="0 0 1200 400" // 🔥 PLUS GRAND
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[min(520px,80vw)] h-auto"
    >
      {/* R */}
      <text
        x="0"
        y="260"
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: '360px',
        }}
        fill={fill}
      >
        R
      </text>

      {/* E */}
      <text
        x="410"
        y="260"
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: '360px',
        }}
        fill={fill}
      >
        E
      </text>

      {/* F */}
      <text
        x="800"
        y="260"
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: '360px',
        }}
        fill={fill}
      >
        F
      </text>

      {/* Tagline */}
      <text
        x="20"
        y="380"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '90px',
          letterSpacing: '2px',
        }}
        fill={taglineFill}
      >
        Radio Étudiante de France
      </text>
    </svg>
  </div>
)
}