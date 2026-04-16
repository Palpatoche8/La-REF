'use client'

import { useState, useEffect, useRef } from 'react'
import { Episode } from '@/components/EpisodeCard'

type View = 'login' | 'dashboard'

/** Injected at build time by Next.js — '1' when running on Vercel */
const IS_VERCEL = process.env.NEXT_PUBLIC_IS_VERCEL === '1'

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function AdminPage() {
  const [view, setView] = useState<View>('login')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)

  const [form, setForm] = useState({ title: '', description: '', date: '', duration: '' })
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setView('dashboard')
        loadEpisodes()
      } else {
        const data = await res.json()
        setLoginError(data.error || 'Mot de passe incorrect')
      }
    } catch {
      setLoginError('Erreur de connexion')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setView('login')
    setPassword('')
    setEpisodes([])
  }

  const loadEpisodes = async () => {
    setLoadingEpisodes(true)
    try {
      const res = await fetch('/api/episodes')
      const data = await res.json()
      setEpisodes(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    } finally {
      setLoadingEpisodes(false)
    }
  }

  useEffect(() => {
    // no-op: user must always enter password
  }, [])

  // ── Form ──────────────────────────────────────────────────────────────────

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!form.title || !form.description || !form.date || !form.duration) {
      setFormError('Tous les champs sont requis.')
      return
    }

    setSubmitting(true)
    try {
      let audioUrl = ''

      if (file && file.size > 0) {
        if (IS_VERCEL) {
          // ── Vercel production: client-side upload directly to Blob ──
          setUploadProgress('Envoi du fichier audio…')
          const { upload } = await import('@vercel/blob/client')
          const blob = await upload(`audio/${file.name}`, file, {
            access: 'public',
            handleUploadUrl: '/api/upload-audio',
          })
          audioUrl = blob.url
          setUploadProgress('Enregistrement des métadonnées…')
        }
        // Local dev: file goes as FormData below
      }

      if (IS_VERCEL) {
        // Production: send JSON with the blob URL
        const res = await fetch('/api/episodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, audioUrl }),
        })
        if (res.ok) {
          setFormSuccess('Émission ajoutée avec succès !')
          resetForm()
          loadEpisodes()
        } else {
          const data = await res.json()
          setFormError(data.error || "Erreur lors de l'ajout")
        }
      } else {
        // Local dev: multipart FormData
        const fd = new FormData()
        fd.append('title', form.title)
        fd.append('description', form.description)
        fd.append('date', form.date)
        fd.append('duration', form.duration)
        if (file) fd.append('file', file)

        const res = await fetch('/api/episodes', { method: 'POST', body: fd })
        if (res.ok) {
          setFormSuccess('Émission ajoutée avec succès !')
          resetForm()
          loadEpisodes()
        } else {
          const data = await res.json()
          setFormError(data.error || "Erreur lors de l'ajout")
        }
      }
    } catch (err) {
      setFormError('Erreur serveur')
      console.error(err)
    } finally {
      setSubmitting(false)
      setUploadProgress('')
    }
  }

  const resetForm = () => {
    setForm({ title: '', description: '', date: '', duration: '' })
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette émission ?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/episodes/${id}`, { method: 'DELETE' })
      if (res.ok) setEpisodes((prev) => prev.filter((ep) => ep.id !== id))
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  // ── Login view ────────────────────────────────────────────────────────────

  if (view === 'login') {
    return (
      <div className="min-h-screen gradient-animated flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl gradient-animated flex items-center justify-center mb-4 shadow-lg">
                <span className="text-white font-black text-2xl" style={{ fontFamily: 'Syne, sans-serif' }}>R</span>
              </div>
              <h1 className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: 'Syne, sans-serif' }}>
                La REF — Admin
              </h1>
              <p className="text-gray-400 text-sm mt-1">Espace d'administration</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mot de passe administrateur
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/40 focus:border-[#E91E8C] transition-all text-sm"
                  placeholder="••••••••"
                  required
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 px-6 rounded-xl bg-[#E91E8C] hover:bg-[#C2185B] text-white font-bold transition-all duration-200 disabled:opacity-60 shadow-md hover:shadow-[#E91E8C]/30 hover:scale-[1.02]"
              >
                {loginLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/" className="text-sm text-gray-400 hover:text-[#E91E8C] transition-colors">
                ← Retour au site
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-animated flex items-center justify-center">
            <span className="text-white font-black text-xs" style={{ fontFamily: 'Syne, sans-serif' }}>R</span>
          </div>
          <span className="font-black text-[#1A1A1A] text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
            La REF Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-gray-400 hover:text-[#E91E8C] transition-colors">
            Voir le site
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Add episode form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-10">
          <h2
            className="text-xl font-black text-[#1A1A1A] mb-6 flex items-center gap-2"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            <span className="w-8 h-8 rounded-lg bg-[#FCE4EC] text-[#E91E8C] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            Ajouter une émission
          </h2>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Titre <span className="text-[#E91E8C]">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Ex : L'Actu Étudiante #12"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C] text-sm transition-all"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-[#E91E8C]">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Présentation de l'émission…"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C] text-sm transition-all resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date <span className="text-[#E91E8C]">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C] text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Durée <span className="text-[#E91E8C]">*</span>
              </label>
              <input
                type="text"
                name="duration"
                value={form.duration}
                onChange={handleFormChange}
                placeholder="Ex : 45:00"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C] text-sm transition-all"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fichier audio
                {IS_VERCEL && (
                  <span className="ml-2 text-xs text-[#E91E8C] bg-[#FCE4EC] px-2 py-0.5 rounded-full">
                    Upload direct Vercel Blob — pas de limite de taille
                  </span>
                )}
              </label>
              <div
                className="relative border-2 border-dashed border-gray-200 hover:border-[#E91E8C]/50 rounded-xl px-6 py-8 text-center cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3 text-[#E91E8C]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span className="font-medium text-sm">{file.name}</span>
                    <span className="text-gray-400 text-xs">({(file.size / 1024 / 1024).toFixed(1)} Mo)</span>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-medium">Cliquez pour sélectionner un fichier audio</p>
                    <p className="text-xs mt-1">MP3, WAV, OGG, M4A, AAC, FLAC acceptés</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload progress */}
            {uploadProgress && (
              <div className="md:col-span-2 flex items-center gap-2 text-[#E91E8C] text-sm bg-[#FCE4EC] px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {uploadProgress}
              </div>
            )}

            {formError && (
              <div className="md:col-span-2 flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="md:col-span-2 flex items-center gap-2 text-green-600 text-sm bg-green-50 px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formSuccess}
              </div>
            )}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-[#E91E8C] hover:bg-[#C2185B] text-white font-bold px-6 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-60 shadow-md hover:shadow-[#E91E8C]/30 hover:scale-[1.02] text-sm"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {uploadProgress ? 'Upload en cours…' : 'Enregistrement…'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter l'émission
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Episodes list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-black text-[#1A1A1A] flex items-center gap-2"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              <span className="w-8 h-8 rounded-lg bg-[#FCE4EC] text-[#E91E8C] flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </span>
              Émissions publiées
            </h2>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {episodes.length} émission{episodes.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loadingEpisodes ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <svg className="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Chargement…
            </div>
          ) : episodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Aucune émission pour l'instant</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...episodes]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((ep) => (
                  <div
                    key={ep.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#E91E8C]/20 hover:bg-[#FCE4EC]/20 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FCE4EC] text-[#E91E8C] flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1A1A1A] text-sm truncate" title={ep.title}>
                        {ep.title}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{ep.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-400">{formatDate(ep.date)}</span>
                        <span className="text-xs text-[#E91E8C] bg-[#FCE4EC] px-2 py-0.5 rounded-full">
                          {ep.duration}
                        </span>
                        {ep.audioUrl && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            {ep.audioUrl.startsWith('http') ? 'Blob' : 'Audio local'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(ep.id)}
                      disabled={deletingId === ep.id}
                      className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deletingId === ep.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
