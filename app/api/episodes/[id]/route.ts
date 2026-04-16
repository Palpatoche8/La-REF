import { NextRequest, NextResponse } from 'next/server'
import { readEpisodes, writeEpisodes, deleteAudio } from '@/lib/storage'

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
  const index = episodes.findIndex((e) => e.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Émission introuvable' }, { status: 404 })
  }

  const episode = episodes[index]
  await deleteAudio(episode.audioUrl)

  episodes.splice(index, 1)
  await writeEpisodes(episodes)

  return NextResponse.json({ success: true })
}
