import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const EPISODES_PATH = path.join(process.cwd(), 'data', 'episodes.json')
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio')

async function readEpisodes() {
  try {
    const raw = await readFile(EPISODES_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function writeEpisodes(episodes: unknown[]) {
  await mkdir(path.dirname(EPISODES_PATH), { recursive: true })
  await writeFile(EPISODES_PATH, JSON.stringify(episodes, null, 2), 'utf-8')
}

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
    const file = formData.get('file') as File | null

    if (!title || !description || !date || !duration) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    let filename = ''

    if (file && file.size > 0) {
      await mkdir(AUDIO_DIR, { recursive: true })
      const ext = file.name.split('.').pop() || 'mp3'
      const safeName = `${randomUUID()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(path.join(AUDIO_DIR, safeName), buffer)
      filename = safeName
    }

    const episode = {
      id: randomUUID(),
      title: title.trim(),
      description: description.trim(),
      date,
      duration: duration.trim(),
      filename,
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
