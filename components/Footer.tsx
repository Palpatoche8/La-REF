import REFLogo from './REFLogo'

export default function Footer() {
  const year = new Date().getFullYear()

  const socials: any[] = [
    // inchangé
  ]

  const links = [
    { label: 'À propos', href: '#about' },
    { label: 'Émissions', href: '#emissions' },
    { label: 'Administration', href: '/admin' },
  ]

  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <REFLogo variant="footer" color="white" />

            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Radio Étudiante de France — la voix des étudiant·e·s, 24h/24, 7j/7.
            </p>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E91E8C] animate-pulse" />
              <span className="text-[#E91E8C] text-xs font-bold tracking-widest uppercase">
                On Air
              </span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase text-white/40 mb-5">
              Navigation
            </h4>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-[#E91E8C] transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase text-white/40 mb-5">
              Nous suivre
            </h4>

            <div className="flex flex-wrap gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#E91E8C] text-white/60 hover:text-white flex items-center justify-center transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <p className="mt-6 text-white/40 text-xs">
              Contact:{' '}
              <a
                href="mailto:contact@laref.fr"
                className="hover:text-[#E91E8C] transition-colors"
              >
                contact@laref.fr
              </a>
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-white/30 text-sm">
            © {year} La REF — Radio Étudiante de France. Tous droits réservés.
          </p>
          <p className="text-white/20 text-xs">
            Fait avec passion par des étudiants
          </p>
        </div>
      </div>
    </footer>
  )
}