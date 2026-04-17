import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Redirect the browser directly to Google Drive's CDN.
// The audio element (no crossOrigin attr) follows redirects natively,
// so the browser streams straight from Google Drive — no size or timeout limits.
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? ''

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new NextResponse('Invalid file ID', { status: 400 })
  }

  // drive.usercontent.google.com bypasses the virus-scan confirmation page
  // for publicly shared files of any size.
  const url = `https://drive.usercontent.google.com/download?id=${id}&export=download&authuser=0&confirm=t`
  return NextResponse.redirect(url, 302)
}
