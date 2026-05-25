import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { randomUUID } from 'crypto'
import { authOptions } from '@/lib/auth'
import { readQuestions, writeQuestions } from '@/lib/questions'
import { isUserBanned } from '@/lib/users'

function isAdmin(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const questions = await readQuestions()
  return NextResponse.json(questions.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { content } = await request.json()
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Question vide' }, { status: 400 })
  }

  // Silently ignore banned users
  if (await isUserBanned(session.user.id)) {
    return NextResponse.json({ success: true })
  }

  const questions = await readQuestions()
  questions.push({
    id: randomUUID(),
    userId: session.user.id,
    userName: session.user.name ?? session.user.email,
    userImage: session.user.image ?? '',
    content: content.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  })
  await writeQuestions(questions)
  return NextResponse.json({ success: true })
}

// Mark all questions as read (admin)
export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const questions = await readQuestions()
  const updated = questions.map((q) => ({ ...q, read: true }))
  await writeQuestions(updated)
  return NextResponse.json({ success: true })
}
