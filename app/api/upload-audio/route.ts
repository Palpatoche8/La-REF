import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!request.body) {
      return NextResponse.json({ error: 'Corps de requête manquant' }, { status: 400 })
    }

    const rawFilename = request.headers.get('x-filename') ?? 'audio.mp3'
    const filename = decodeURIComponent(rawFilename)
    const contentType = request.headers.get('x-content-type') ?? 'audio/mpeg'

    const blob = await put(`audio/${filename}`, request.body, {
      access: 'public',
      contentType,
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('upload-audio error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
