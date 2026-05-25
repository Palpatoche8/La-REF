export interface Question {
  id: string
  userId: string
  userName: string
  userImage: string
  content: string
  createdAt: string
  read: boolean
}

const IS_VERCEL = process.env.VERCEL === '1'
const KV_KEY = 'questions'

export async function readQuestions(): Promise<Question[]> {
  if (IS_VERCEL) {
    const { kv } = await import('@vercel/kv')
    return (await kv.get<Question[]>(KV_KEY)) ?? []
  }
  const { readFile } = await import('fs/promises')
  const { join } = await import('path')
  try {
    const raw = await readFile(join(process.cwd(), 'data', 'questions.json'), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export async function writeQuestions(questions: Question[]): Promise<void> {
  if (IS_VERCEL) {
    const { kv } = await import('@vercel/kv')
    await kv.set(KV_KEY, questions)
    return
  }
  const { writeFile, mkdir } = await import('fs/promises')
  const { join, dirname } = await import('path')
  const p = join(process.cwd(), 'data', 'questions.json')
  await mkdir(dirname(p), { recursive: true })
  await writeFile(p, JSON.stringify(questions, null, 2), 'utf-8')
}
