import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function fetchAudio(fileId: string, rangeHeader: string | null): Promise<Response> {
  const reqHeaders: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }
  if (rangeHeader) reqHeaders['Range'] = rangeHeader

  // Try the newer usercontent.google.com endpoint first (handles large files better)
  const urls = [
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t`,
    `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`,
  ]

  for (const url of urls) {
    const res = await fetch(url, { headers: reqHeaders, redirect: 'follow' })
    const ct = res.headers.get('content-type') ?? ''

    if (!ct.includes('text/html')) return res

    // Got a virus-scan confirmation page — extract the confirm link and cookies
    const html = await res.text()
    const cookie = res.headers.get('set-cookie') ?? ''

    const confirmPath =
      html.match(/href="(\/uc\?export=download[^"]*confirm=[^"]+)"/)?.[1] ??
      html.match(/action="(https:\/\/drive\.google\.com\/uc\?[^"]*confirm=[^"]+)"/)?.[1]

    if (confirmPath) {
      const confirmUrl = confirmPath.startsWith('http')
        ? confirmPath.replace(/&amp;/g, '&')
        : 'https://drive.google.com' + confirmPath.replace(/&amp;/g, '&')
      const confirmHeaders: Record<string, string> = { ...reqHeaders }
      if (cookie) confirmHeaders['Cookie'] = cookie
      const confirmed = await fetch(confirmUrl, { headers: confirmHeaders, redirect: 'follow' })
      const cct = confirmed.headers.get('content-type') ?? ''
      if (!cct.includes('text/html')) return confirmed
    }
  }

  throw new Error('Unable to fetch audio from Google Drive')
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? ''

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new NextResponse('Invalid file ID', { status: 400 })
  }

  const rangeHeader = request.headers.get('range')

  try {
    const upstream = await fetchAudio(id, rangeHeader)

    const headers = new Headers()
    headers.set('Content-Type', upstream.headers.get('content-type') ?? 'audio/mpeg')
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Cache-Control', 'public, max-age=3600')

    const cl = upstream.headers.get('content-length')
    if (cl) headers.set('Content-Length', cl)

    const cr = upstream.headers.get('content-range')
    if (cr) headers.set('Content-Range', cr)

    return new NextResponse(upstream.body as ReadableStream, {
      status: upstream.status === 206 ? 206 : 200,
      headers,
    })
  } catch (err) {
    console.error('audio-proxy error:', err)
    return new NextResponse("Impossible de charger l'audio", { status: 502 })
  }
}