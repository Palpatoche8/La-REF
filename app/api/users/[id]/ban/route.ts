import { NextRequest, NextResponse } from 'next/server'
import { banUser } from '@/lib/users'

function isAdmin(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  await banUser(decodeURIComponent(params.id))
  return NextResponse.json({ success: true })
}
