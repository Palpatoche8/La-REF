import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
  }

  const blob = await put(`audio/${file.name}`, file, { access: 'public' })

  return NextResponse.json({ url: blob.url })
}
