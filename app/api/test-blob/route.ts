import { NextRequest, NextResponse } from 'next/server'

function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return NextResponse.json({ ok: false, error: 'BLOB_READ_WRITE_TOKEN is not set' })
  }

  const parts = token.split('_')
  const storeId = parts[3] ?? '(not found)'

  try {
    const { list } = await import('@vercel/blob')
    const result = await list({ limit: 1 })
    return NextResponse.json({
      ok: true,
      storeId,
      tokenPrefix: token.substring(0, 30) + '...',
      blobCount: result.blobs.length,
      hasMore: result.hasMore,
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      storeId,
      tokenPrefix: token.substring(0, 30) + '...',
      error: String(err),
    })
  }
}
