import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          primary: '#E91E8C',
          light: '#FCE4EC',
          dark: '#C2185B',
          600: '#E91E8C',
          700: '#C2185B',
        },
        charcoal: '#1A1A1A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'Syne', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-shift': 'gradientShift 6s ease infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.2s linear infinite',
        'wave-delay-1': 'wave 1.2s linear 0.1s infinite',
        'wave-delay-2': 'wave 1.2s linear 0.2s infinite',
        'wave-delay-3': 'wave 1.2s linear 0.3s infinite',
        'wave-delay-4': 'wave 1.2s linear 0.4s infinite',
        'wave-delay-5': 'wave 1.2s linear 0.5s infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
}
export default config
