/**
 * Storage abstraction layer.
 *
 * In local development (no VERCEL env):
 *   - Metadata → data/episodes.json on disk
 *   - Audio files → public/audio/ on disk
 *
 * In production (Vercel, VERCEL=1):
 *   - Metadata → Vercel KV  (env: KV_REST_API_URL + KV_REST_API_TOKEN)
 *   - Audio files → Vercel Blob (env: BLOB_READ_WRITE_TOKEN)
 *     Audio uploads go client-side via /api/upload-audio to bypass the
 *     4.5 MB serverless payload limit.
 */

export interface Episode {
  id: string
  title: string
  description: string
  date: string
  duration: string
  /** Local filename (dev) or full Vercel Blob URL (production) */
  audioUrl: string
}

const IS_VERCEL = process.env.VERCEL === '1'

// ── Metadata ────────────────────────────────────────────────────────────────

export async function readEpisodes(): Promise<Episode[]> {
  if (IS_VERCEL) {
    const { kv } = await import('@vercel/kv')
    return (await kv.get<Episode[]>('episodes')) ?? []
  }

  const { readFile } = await import('fs/promises')
  const { join } = await import('path')
  try {
    const raw = await readFile(join(process.cwd(), 'data', 'episodes.json'), 'utf-8')
    // Support legacy `filename` field from initial seed data
    const parsed = JSON.parse(raw)
    return parsed.map((ep: Episode & { filename?: string }) => ({
      ...ep,
      audioUrl: ep.audioUrl ?? (ep.filename ? `/audio/${ep.filename}` : ''),
    }))
  } catch {
    return []
  }
}

export async function writeEpisodes(episodes: Episode[]): Promise<void> {
  if (IS_VERCEL) {
    const { kv } = await import('@vercel/kv')
    await kv.set('episodes', episodes)
    return
  }

  const { writeFile, mkdir } = await import('fs/promises')
  const { join, dirname } = await import('path')
  const filePath = join(process.cwd(), 'data', 'episodes.json')
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(episodes, null, 2), 'utf-8')
}

// ── Audio files (local dev only — production uses client-side Blob upload) ──

export async function saveAudioLocally(file: File): Promise<string> {
  const { writeFile, mkdir } = await import('fs/promises')
  const { join } = await import('path')
  const { randomUUID } = await import('crypto')

  const AUDIO_DIR = join(process.cwd(), 'public', 'audio')
  await mkdir(AUDIO_DIR, { recursive: true })

  const ext = file.name.split('.').pop() || 'mp3'
  const safeName = `${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(AUDIO_DIR, safeName), buffer)

  return `/audio/${safeName}`
}

export async function deleteAudio(audioUrl: string): Promise<void> {
  if (!audioUrl) return

  if (audioUrl.startsWith('http')) {
    // Vercel Blob URL
    const { del } = await import('@vercel/blob')
    try {
      await del(audioUrl)
    } catch {
      // ignore — blob may already be gone
    }
    return
  }

  // Local file path like /audio/xxx.mp3
  if (audioUrl.startsWith('/audio/')) {
    const { unlink } = await import('fs/promises')
    const { join } = await import('path')
    try {
      await unlink(join(process.cwd(), 'public', audioUrl))
    } catch {
      // ignore
    }
  }
}
