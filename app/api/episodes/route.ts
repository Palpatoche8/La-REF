import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { readEpisodes, writeEpisodes, saveAudioLocally } from '@/lib/storage'

const IS_VERCEL = process.env.VERCEL === '1'

function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

export async function GET() {
  const episodes = await readEpisodes()
  return NextResponse.json(episodes)
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const date = formData.get('date') as string
    const duration = formData.get('duration') as string
    
    let audioUrl = ''

    if (IS_VERCEL) {
      // En production, on récupère l'URL que le client a déjà envoyé au Blob
      // Ou si tu envoies le fichier, il faut le traiter ici avec 'put' de @vercel/blob
      audioUrl = formData.get('audioUrl') as string ?? ''
    } else {
      // Local dev
      const file = formData.get('file') as File | null
      if (file && file.size > 0) {
        audioUrl = await saveAudioLocally(file)
      }
    }

    if (!title || !description || !date || !duration) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const episode = {
      id: randomUUID(),
      title: title.trim(),
      description: description.trim(),
      date,
      duration: duration.trim(),
      audioUrl,
    }

    const episodes = await readEpisodes()
    episodes.push(episode)
    await writeEpisodes(episodes)

    return NextResponse.json(episode, { status: 201 })
  } catch (err) {
    console.error('POST /api/episodes error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
