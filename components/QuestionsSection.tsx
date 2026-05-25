'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'

export default function QuestionsSection() {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [toast, setToast] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3500)
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  const handleFocus = () => {
    if (!session) {
      textareaRef.current?.blur()
      showToast('Connecte-toi pour poser une question')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) { showToast('Connecte-toi pour poser une question'); return }
    if (!content.trim()) return
    setStatus('sending')
    try {
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      setStatus('sent')
      setContent('')
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section id="questions" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#E91E8C]/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#FF6B9D]/5 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[#E91E8C] text-sm font-bold tracking-widest uppercase mb-4">
            Interagis avec nous
          </span>
          <h2
            className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-5 leading-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Posez vos questions
          </h2>
          <p className="text-gray-500 text-lg max-w-xl">
            Une question pour l'équipe ? On vous répond à l'antenne lors de notre prochaine émission.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 md:p-10">
          {status === 'sent' ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-bold text-[#1A1A1A] text-lg mb-1">Question envoyée !</p>
                <p className="text-gray-400 text-sm">L'équipe vous répondra peut-être en direct.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {session ? (
                <div className="flex items-center gap-3">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#FCE4EC] flex items-center justify-center text-[#E91E8C] font-bold text-sm">
                      {session.user?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{session.user?.name}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-[#FAFAFA] rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-sm text-gray-500">Connecte-toi pour poser une question</p>
                  <button
                    type="button"
                    onClick={() => signIn('google')}
                    className="flex items-center gap-2 bg-[#E91E8C] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#C2185B] transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                    </svg>
                    Se connecter
                  </button>
                </div>
              )}

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={handleFocus}
                  placeholder={session ? 'Écris ta question ici…' : 'Connecte-toi pour écrire ta question'}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C] text-sm transition-all resize-none"
                  readOnly={!session}
                />
                {content.length > 400 && (
                  <span className="absolute bottom-3 right-3 text-xs text-gray-400">{content.length}/500</span>
                )}
              </div>

              {status === 'error' && (
                <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">
                  Une erreur s'est produite. Réessaie.
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!session || !content.trim() || status === 'sending'}
                  className="flex items-center gap-2 bg-[#E91E8C] hover:bg-[#C2185B] text-white font-bold px-7 py-3 rounded-xl transition-all duration-200 disabled:opacity-40 shadow-md hover:shadow-[#E91E8C]/30 hover:scale-[1.02] text-sm"
                >
                  {status === 'sending' ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Envoi…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Envoyer la question
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
          <svg className="w-4 h-4 text-[#E91E8C] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {toast}
        </div>
      )}
    </section>
  )
}
