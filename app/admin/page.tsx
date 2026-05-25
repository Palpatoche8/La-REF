'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Episode } from '@/components/EpisodeCard'
import { Question } from '@/lib/questions'

type AuthView = 'login' | 'dashboard'
type DashTab = 'episodes' | 'questions'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL
const EMPTY_FORM = { title: '', description: '', date: '', duration: '', audioUrl: '', type: 'rediff' as 'rediff' | 'podcast' }

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return dateStr }
}

// ── Episode form fields ───────────────────────────────────────────────────────

function EpisodeFormFields({
  form,
  onChange,
}: {
  form: typeof EMPTY_FORM
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}) {
  return (
    <>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre <span className="text-[#E91E8C]">*</span></label>
        <input type="text" name="title" value={form.title} onChange={onChange} placeholder="Ex : L'Actu Étudiante #12"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C] text-sm transition-all" required />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-[#E91E8C]">*</span></label>
        <textarea name="description" value={form.description} onChange={onChange} placeholder="Présentation de l'émission…" rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C] text-sm transition-all resize-none" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Date <span className="text-[#E91E8C]">*</span></label>
        <input type="date" name="date" value={form.date} onChange={onChange}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C] text-sm transition-all" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Durée <span className="text-[#E91E8C]">*</span></label>
        <input type="text" name="duration" value={form.duration} onChange={onChange} placeholder="Ex : 45:00"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C] text-sm transition-all" required />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Type <span className="text-[#E91E8C]">*</span></label>
        <div className="flex gap-3">
          {(['rediff', 'podcast'] as const).map((t) => (
            <label key={t} className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${form.type === t ? 'border-[#E91E8C] bg-[#FCE4EC]/40' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="type" value={t} checked={form.type === t} onChange={onChange} className="accent-[#E91E8C]" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{t === 'rediff' ? 'Rediffusion' : 'Podcast'}</p>
                <p className="text-xs text-gray-400">{t === 'rediff' ? 'Émission complète du mardi' : 'Format court, best-of ou extrait'}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Lien audio Google Drive</label>
        <input type="url" name="audioUrl" value={form.audioUrl} onChange={onChange} placeholder="https://drive.google.com/file/d/…/view"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C] text-sm transition-all font-mono" />
        <div className="mt-3 bg-[#FAFAFA] border border-gray-100 rounded-xl p-3.5">
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Comment obtenir le lien Google Drive
          </p>
          <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
            <li>Ouvrez Google Drive et cliquez droit sur le fichier audio</li>
            <li>Sélectionnez <strong className="text-gray-500">Partager</strong> → <strong className="text-gray-500">Copier le lien</strong></li>
            <li>Dans les paramètres, choisissez <strong className="text-gray-500">Tous les internautes avec le lien</strong></li>
            <li>Collez le lien ci-dessus</li>
          </ol>
        </div>
      </div>
    </>
  )
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditModal({ episode, onClose, onSaved }: { episode: Episode; onClose: () => void; onSaved: (e: Episode) => void }) {
  const [form, setForm] = useState({
    title: episode.title, description: episode.description, date: episode.date,
    duration: episode.duration, audioUrl: episode.audioUrl ?? '',
    type: (episode.type ?? 'rediff') as 'rediff' | 'podcast',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      const res = await fetch(`/api/episodes/${episode.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) onSaved(await res.json())
      else setError((await res.json()).error || 'Erreur')
    } catch { setError('Erreur serveur') } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg font-black text-[#1A1A1A]" style={{ fontFamily: 'Syne, sans-serif' }}>Modifier l'émission</h3>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid md:grid-cols-2 gap-5">
          <EpisodeFormFields form={form} onChange={handleChange} />
          {error && <div className="md:col-span-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</div>}
          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium">Annuler</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#E91E8C] hover:bg-[#C2185B] text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-60 shadow-md">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [view, setView] = useState<AuthView>('login')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [dashTab, setDashTab] = useState<DashTab>('episodes')
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null)

  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [deletingQuestion, setDeletingQuestion] = useState<string | null>(null)
  const [banningUser, setBanningUser] = useState<string | null>(null)

  // ── Guard: check OAuth session + admin email ──────────────────────────────

  const isAdminCandidate = ADMIN_EMAIL
    ? session?.user?.email === ADMIN_EMAIL
    : true // If not configured, allow access (backward compat)

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen gradient-animated flex items-center justify-center">
        <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  if (ADMIN_EMAIL && !session) {
    return (
      <div className="min-h-screen gradient-animated flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl gradient-animated flex items-center justify-center mb-4 shadow-lg mx-auto">
            <span className="text-white font-black text-2xl" style={{ fontFamily: 'Syne, sans-serif' }}>R</span>
          </div>
          <h1 className="text-2xl font-black text-[#1A1A1A] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Accès restreint</h1>
          <p className="text-gray-400 text-sm mb-6">Connecte-toi avec ton compte Google pour accéder à l'administration.</p>
          <button onClick={() => signIn('google')} className="w-full flex items-center justify-center gap-3 bg-[#E91E8C] hover:bg-[#C2185B] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Se connecter avec Google
          </button>
          <div className="mt-4">
            <a href="/" className="text-sm text-gray-400 hover:text-[#E91E8C] transition-colors">← Retour au site</a>
          </div>
        </div>
      </div>
    )
  }

  if (ADMIN_EMAIL && session && !isAdminCandidate) {
    return (
      <div className="min-h-screen gradient-animated flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-[#1A1A1A] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Accès non autorisé</h2>
          <p className="text-gray-400 text-sm mb-6">Ce compte n'a pas les droits d'administration.</p>
          <a href="/" className="text-sm text-[#E91E8C] hover:underline">← Retour au site</a>
        </div>
      </div>
    )
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError(''); setLoginLoading(true)
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      if (res.ok) { setView('dashboard'); loadEpisodes() }
      else setLoginError((await res.json()).error || 'Mot de passe incorrect')
    } catch { setLoginError('Erreur de connexion') } finally { setLoginLoading(false) }
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setView('login'); setPassword(''); setEpisodes([])
  }

  const loadEpisodes = async () => {
    setLoadingEpisodes(true)
    try {
      const data = await (await fetch('/api/episodes')).json()
      setEpisodes(Array.isArray(data) ? data : [])
    } catch { } finally { setLoadingEpisodes(false) }
  }

  const loadQuestions = async () => {
    setLoadingQuestions(true)
    try {
      const data = await (await fetch('/api/questions')).json()
      if (Array.isArray(data)) {
        setQuestions(data)
        setUnreadCount(data.filter((q: Question) => !q.read).length)
        // Mark all as read
        fetch('/api/questions', { method: 'PATCH' })
      }
    } catch { } finally { setLoadingQuestions(false) }
  }

  const handleTabChange = (tab: DashTab) => {
    setDashTab(tab)
    if (tab === 'questions' && questions.length === 0) loadQuestions()
    else if (tab === 'questions') {
      setUnreadCount(0)
      fetch('/api/questions', { method: 'PATCH' })
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setFormSuccess('')
    if (!form.title || !form.description || !form.date || !form.duration) { setFormError('Tous les champs sont requis.'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/episodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { setFormSuccess('Émission ajoutée !'); setForm(EMPTY_FORM); loadEpisodes() }
      else setFormError((await res.json()).error || 'Erreur')
    } catch { setFormError('Erreur serveur') } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette émission ?')) return
    setDeletingId(id)
    try {
      if ((await fetch(`/api/episodes/${id}`, { method: 'DELETE' })).ok)
        setEpisodes((p) => p.filter((ep) => ep.id !== id))
    } catch { } finally { setDeletingId(null) }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Supprimer cette question ?')) return
    setDeletingQuestion(id)
    try {
      if ((await fetch(`/api/questions/${id}`, { method: 'DELETE' })).ok)
        setQuestions((p) => p.filter((q) => q.id !== id))
    } catch { } finally { setDeletingQuestion(null) }
  }

  const handleBanUser = async (userId: string, questionId: string) => {
    if (!confirm('Bannir cet utilisateur ? Il ne pourra plus poser de questions.')) return
    setBanningUser(questionId)
    try {
      await fetch(`/api/users/${encodeURIComponent(userId)}/ban`, { method: 'POST' })
    } catch { } finally { setBanningUser(null) }
  }

  // ── Login view ─────────────────────────────────────────────────────────────

  if (view === 'login') {
    return (
      <div className="min-h-screen gradient-animated flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl gradient-animated flex items-center justify-center mb-4 shadow-lg">
                <span className="text-white font-black text-2xl" style={{ fontFamily: 'Syne, sans-serif' }}>R</span>
              </div>
              {session?.user && (
                <div className="flex items-center gap-2 mb-3">
                  {session.user.image && <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />}
                  <span className="text-sm text-gray-500">{session.user.name}</span>
                </div>
              )}
              <h1 className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: 'Syne, sans-serif' }}>La REF — Admin</h1>
              <p className="text-gray-400 text-sm mt-1">Entrez le mot de passe administrateur</p>
            </div>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/40 focus:border-[#E91E8C] transition-all text-sm"
                  placeholder="••••••••" required autoFocus />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {loginError}
                </div>
              )}
              <button type="submit" disabled={loginLoading}
                className="w-full py-3 px-6 rounded-xl bg-[#E91E8C] hover:bg-[#C2185B] text-white font-bold transition-all disabled:opacity-60 shadow-md">
                {loginLoading ? 'Connexion...' : 'Accéder au tableau de bord'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <a href="/" className="text-sm text-gray-400 hover:text-[#E91E8C] transition-colors">← Retour au site</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {editingEpisode && (
        <EditModal episode={editingEpisode} onClose={() => setEditingEpisode(null)}
          onSaved={(updated) => { setEpisodes((p) => p.map((ep) => ep.id === updated.id ? updated : ep)); setEditingEpisode(null) }} />
      )}

      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-animated flex items-center justify-center">
            <span className="text-white font-black text-xs" style={{ fontFamily: 'Syne, sans-serif' }}>R</span>
          </div>
          <span className="font-black text-[#1A1A1A] text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>La REF Admin</span>
        </div>
        <div className="flex items-center gap-4">
          {session?.user?.image && <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />}
          <a href="/" className="text-sm text-gray-400 hover:text-[#E91E8C] transition-colors">Voir le site</a>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Déconnexion
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
          {(['episodes', 'questions'] as DashTab[]).map((tab) => (
            <button key={tab} onClick={() => handleTabChange(tab)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${dashTab === tab ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab === 'episodes' ? 'Émissions' : 'Questions'}
              {tab === 'questions' && unreadCount > 0 && (
                <span className="bg-[#E91E8C] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-10">

        {/* ── Episodes tab ── */}
        {dashTab === 'episodes' && (
          <>
            {/* Add form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-8">
              <h2 className="text-xl font-black text-[#1A1A1A] mb-6 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                <span className="w-8 h-8 rounded-lg bg-[#FCE4EC] text-[#E91E8C] flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </span>
                Ajouter une émission
              </h2>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
                <EpisodeFormFields form={form} onChange={handleFormChange} />
                {formError && <div className="md:col-span-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{formError}</div>}
                {formSuccess && <div className="md:col-span-2 text-green-600 text-sm bg-green-50 px-4 py-3 rounded-xl flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{formSuccess}</div>}
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" disabled={submitting}
                    className="flex items-center gap-2 bg-[#E91E8C] hover:bg-[#C2185B] text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-60 shadow-md hover:shadow-[#E91E8C]/30 hover:scale-[1.02] transition-all">
                    {submitting ? 'Enregistrement…' : '+ Ajouter l\'émission'}
                  </button>
                </div>
              </form>
            </div>

            {/* Episodes list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  <span className="w-8 h-8 rounded-lg bg-[#FCE4EC] text-[#E91E8C] flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  </span>
                  Émissions publiées
                </h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{episodes.length} émission{episodes.length !== 1 ? 's' : ''}</span>
              </div>
              {loadingEpisodes ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <svg className="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  Chargement…
                </div>
              ) : episodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                  </div>
                  <p className="text-gray-400 text-sm">Aucune émission pour l'instant</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {[...episodes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((ep) => (
                    <div key={ep.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#E91E8C]/20 hover:bg-[#FCE4EC]/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#FCE4EC] text-[#E91E8C] flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1A1A1A] text-sm truncate">{ep.title}</p>
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{ep.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-gray-400">{formatDate(ep.date)}</span>
                          <span className="text-xs text-[#E91E8C] bg-[#FCE4EC] px-2 py-0.5 rounded-full">{ep.duration}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(ep.type ?? 'rediff') === 'rediff' ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'}`}>
                            {(ep.type ?? 'rediff') === 'rediff' ? 'Rediffusion' : 'Podcast'}
                          </span>
                          {ep.audioUrl ? <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Audio lié</span>
                            : <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pas d'audio</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setEditingEpisode(ep)} className="p-2 rounded-lg text-gray-400 hover:text-[#E91E8C] hover:bg-[#FCE4EC] transition-colors" title="Modifier">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(ep.id)} disabled={deletingId === ep.id} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50" title="Supprimer">
                          {deletingId === ep.id
                            ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Questions tab ── */}
        {dashTab === 'questions' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                <span className="w-8 h-8 rounded-lg bg-[#FCE4EC] text-[#E91E8C] flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                Questions des auditeurs
              </h2>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
            </div>

            {loadingQuestions ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <svg className="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                Chargement…
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-gray-400 text-sm">Aucune question pour l'instant</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {questions.map((q) => (
                  <div key={q.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${!q.read ? 'border-[#E91E8C]/20 bg-[#FCE4EC]/10' : 'border-gray-100'}`}>
                    <div className="shrink-0">
                      {q.userImage ? (
                        <img src={q.userImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#FCE4EC] flex items-center justify-center text-[#E91E8C] font-bold text-sm">
                          {q.userName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-semibold ${!q.read ? 'text-[#1A1A1A]' : 'text-gray-600'}`}>{q.userName}</p>
                        {!q.read && <span className="w-2 h-2 rounded-full bg-[#E91E8C] shrink-0" />}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">{q.content}</p>
                      <p className="text-gray-400 text-xs">{formatDate(q.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleBanUser(q.userId, q.id)} disabled={banningUser === q.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors text-xs font-medium disabled:opacity-50" title="Bannir l'utilisateur">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                      </button>
                      <button onClick={() => handleDeleteQuestion(q.id)} disabled={deletingQuestion === q.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50" title="Supprimer">
                        {deletingQuestion === q.id
                          ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                          : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
