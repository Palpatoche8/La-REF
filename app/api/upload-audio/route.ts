/**
 * POST /api/upload-audio
 *
 * Handles Vercel Blob client-side upload token exchange.
 * The browser POSTs a signed request to this route, gets a token,
 * then uploads the file *directly* to Vercel Blob (bypassing the
 * 4.5 MB serverless payload limit).
 *
 * Only used in production (VERCEL=1). In local dev, the file goes
 * through /api/episodes as a normal multipart FormData upload.
 */

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'

function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => ({
      maximumSizeInBytes: 200 * 1024 * 1024, // 200 MB
      allowedContentTypes: [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/m4a',
        'audio/aac',
        'audio/flac',
        'audio/x-wav',
      ],
      tokenPayload: '',
    }),
    onUploadCompleted: async () => {
      // Nothing to do — the admin page sends the blob URL to /api/episodes
    },
  })

  return NextResponse.json(jsonResponse)
}
