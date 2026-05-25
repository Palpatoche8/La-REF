export interface AppUser {
  id: string
  email: string
  name: string
  image: string
  provider: string
  banned: boolean
  createdAt: string
}

const IS_VERCEL = process.env.VERCEL === '1'
const KV_KEY = 'users'

export async function readUsers(): Promise<AppUser[]> {
  if (IS_VERCEL) {
    const { kv } = await import('@vercel/kv')
    return (await kv.get<AppUser[]>(KV_KEY)) ?? []
  }
  const { readFile } = await import('fs/promises')
  const { join } = await import('path')
  try {
    const raw = await readFile(join(process.cwd(), 'data', 'users.json'), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export async function writeUsers(users: AppUser[]): Promise<void> {
  if (IS_VERCEL) {
    const { kv } = await import('@vercel/kv')
    await kv.set(KV_KEY, users)
    return
  }
  const { writeFile, mkdir } = await import('fs/promises')
  const { join, dirname } = await import('path')
  const p = join(process.cwd(), 'data', 'users.json')
  await mkdir(dirname(p), { recursive: true })
  await writeFile(p, JSON.stringify(users, null, 2), 'utf-8')
}

export async function saveUser(data: Omit<AppUser, 'banned' | 'createdAt'>): Promise<void> {
  const users = await readUsers()
  if (!users.find((u) => u.id === data.id)) {
    users.push({ ...data, banned: false, createdAt: new Date().toISOString() })
    await writeUsers(users)
  }
}

export async function banUser(userId: string): Promise<void> {
  const users = await readUsers()
  const user = users.find((u) => u.id === userId)
  if (user) {
    user.banned = true
    await writeUsers(users)
  }
}

export async function isUserBanned(userId: string): Promise<boolean> {
  const users = await readUsers()
  return users.find((u) => u.id === userId)?.banned ?? false
}
