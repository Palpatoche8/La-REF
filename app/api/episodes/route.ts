import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { readEpisodes, writeEpisodes, saveAudioLocally } from '@/lib/storage'


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
    let title: string, description: string, date: string, duration: string, audioUrl = '', type = 'rediff'

    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      const body = await request.json()
      title = body.title
      description = body.description
      date = body.date
      duration = body.duration
      audioUrl = body.audioUrl ?? ''
      type = body.type === 'podcast' ? 'podcast' : 'rediff'
    } else {
      const formData = await request.formData()
      title = formData.get('title') as string
      description = formData.get('description') as string
      date = formData.get('date') as string
      duration = formData.get('duration') as string
      type = formData.get('type') === 'podcast' ? 'podcast' : 'rediff'

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
      type: type as 'rediff' | 'podcast',
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
