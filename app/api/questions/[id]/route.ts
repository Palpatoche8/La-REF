import { NextRequest, NextResponse } from 'next/server'
import { readQuestions, writeQuestions } from '@/lib/questions'

function isAdmin(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const questions = await readQuestions()
  const filtered = questions.filter((q) => q.id !== params.id)
  await writeQuestions(filtered)
  return NextResponse.json({ success: true })
}
