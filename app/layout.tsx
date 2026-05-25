import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'La REF - Radio Étudiante de France',
  description: 'La Radio Étudiante de France. Musique, culture, actualités par et pour les étudiants.',
  keywords: ['radio', 'étudiante', 'France', 'musique', 'podcast', 'émissions'],
  openGraph: {
    title: 'La REF - Radio Étudiante de France',
    description: 'La Radio Étudiante de France. Musique, culture, actualités par et pour les étudiants.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased"><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}
