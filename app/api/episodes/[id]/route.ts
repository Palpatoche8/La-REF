import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, unlink } from 'fs/promises'
import path from 'path'

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
  await writeFile(EPISODES_PATH, JSON.stringify(episodes, null, 2), 'utf-8')
}

function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = params

  const episodes = await readEpisodes()
  const index = episodes.findIndex((e: { id: string }) => e.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Émission introuvable' }, { status: 404 })
  }

  const episode = episodes[index]

  // Delete audio file if it exists
  if (episode.filename) {
    try {
      await unlink(path.join(AUDIO_DIR, episode.filename))
    } catch {
      // File may not exist, ignore
    }
  }

  episodes.splice(index, 1)
  await writeEpisodes(episodes)

  return NextResponse.json({ success: true })
}
