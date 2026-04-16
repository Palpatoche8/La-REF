export default function About() {
  const stats = [
    { value: '10+', label: 'Émissions par semaine' },
    { value: '50+', label: 'Membres actifs' },
    { value: '24/7', label: 'En ligne' },
    { value: '100%', label: 'Fait par des étudiants' },
  ]

  const values = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      title: 'Expression libre',
      desc: 'Un espace pour donner sa voix, partager ses idées et faire entendre les perspectives étudiantes.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      title: 'Musique & Culture',
      desc: 'De la pop à l\'électro, du jazz au hip-hop — une programmation musicale éclectique et sans frontières.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Communauté',
      desc: 'Une team soudée de passionné·e·s qui apprennent ensemble les métiers de la radio et du podcast.',
    },
  ]

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <span className="text-[#E91E8C] text-sm font-bold tracking-widest uppercase mb-4">
            Qui sommes-nous ?
          </span>
          <h2
            className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-6 leading-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            La radio{' '}
            <span className="text-[#E91E8C]">par et pour</span>
            <br />
            les étudiants
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
            La REF, c'est la Radio Étudiante de France — une station 100% portée par des étudiant·e·s
            passionné·e·s. Depuis nos studios, on vous parle de musique, d'actu, de culture et de
            tout ce qui fait vibrer la vie étudiante.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#FCE4EC]/40 border border-[#E91E8C]/10 hover:border-[#E91E8C]/30 transition-colors"
            >
              <span
                className="text-3xl md:text-4xl font-black text-[#E91E8C] mb-2"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {stat.value}
              </span>
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-[#E91E8C]/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FCE4EC] text-[#E91E8C] flex items-center justify-center mb-5 group-hover:bg-[#E91E8C] group-hover:text-white transition-colors duration-300">
                {v.icon}
              </div>
              <h3
                className="text-xl font-bold text-[#1A1A1A] mb-3"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {v.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Mission statement */}
        <div className="mt-20 relative overflow-hidden rounded-3xl gradient-animated p-10 md:p-14 text-center">
          <div className="relative z-10">
            <p
              className="text-white text-2xl md:text-3xl font-bold leading-relaxed max-w-3xl mx-auto"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              "Notre mission ? Donner une voix aux étudiant·e·s de France,
              créer du lien et faire rayonner la culture étudiante."
            </p>
            <p className="text-white/70 mt-4 text-sm font-medium">— L'équipe La REF</p>
          </div>
        </div>
      </div>
    </section>
  )
}
