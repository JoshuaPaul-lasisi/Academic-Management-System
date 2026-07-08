import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import LogoSvg from '../../assets/logo.svg'
import { useAuth } from '../../contexts/AuthContext'

const NAV_LINKS = [
  { label: 'Home',       href: '/' },
  { label: 'About',      href: '/about' },
  { label: 'Programmes', href: '/programmes' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Gallery',    href: '/gallery' },
  { label: 'Contact',    href: '/contact' },
]

const WA_LINK = 'https://wa.me/2348012345678?text=Hello%2C%20I%27m%20interested%20in%20Debbyfield%20Schools'

export default function WebsiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-white shadow-md'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src={LogoSvg}
                alt="Debbyfield Schools"
                className={`h-9 transition-all ${scrolled || !isHome ? '' : 'brightness-0 invert'}`}
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 ml-6 flex-1">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  to={l.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === l.href
                      ? 'text-burgundy-700 bg-burgundy-50'
                      : scrolled || !isHome
                        ? 'text-gray-600 hover:text-burgundy-700 hover:bg-gray-50'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <button
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  scrolled || !isHome
                    ? 'border-burgundy-700 text-burgundy-700 hover:bg-burgundy-50'
                    : 'border-white text-white hover:bg-white/10'
                }`}
              >
                {user ? 'Dashboard' : 'Staff Portal'}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  scrolled || !isHome ? 'text-gray-700' : 'text-white'
                }`}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  to={l.href}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === l.href
                      ? 'text-burgundy-700 bg-burgundy-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 text-white text-sm font-medium px-3 py-2.5 rounded-lg mt-2"
              >
                <MessageCircle size={14} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <img src={LogoSvg} alt="Debbyfield Schools" className="h-10 brightness-0 invert mb-3" />
              <p className="text-sm text-gray-400 leading-relaxed">
                Nurturing young minds and shaping future leaders since 2003.
              </p>
              <p className="text-xs text-gold-500 italic mt-2">Achieving Life's Purpose</p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                {NAV_LINKS.map(l => (
                  <li key={l.href}>
                    <Link to={l.href} className="text-sm text-gray-400 hover:text-gold-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-2">
              <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Our Campuses</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gold-400 uppercase mb-1">Lagos Campus</p>
                  <div className="space-y-1.5 text-sm text-gray-400">
                    <p className="flex gap-2"><MapPin size={13} className="mt-0.5 flex-shrink-0 text-gold-500" />
                      12 Debbyfield Close, Lagos State
                    </p>
                    <a href="tel:+2348012345678" className="flex gap-2 hover:text-gold-400 transition-colors">
                      <Phone size={13} className="mt-0.5 flex-shrink-0" /> 080 1234 5678
                    </a>
                    <a href="mailto:lagos@debbyfield.sch.ng" className="flex gap-2 hover:text-gold-400 transition-colors">
                      <Mail size={13} className="mt-0.5 flex-shrink-0" /> lagos@debbyfield.sch.ng
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gold-400 uppercase mb-1">Mowe Campus</p>
                  <div className="space-y-1.5 text-sm text-gray-400">
                    <p className="flex gap-2"><MapPin size={13} className="mt-0.5 flex-shrink-0 text-gold-500" />
                      8 School Road, Mowe, Ogun State
                    </p>
                    <a href="tel:+2348087654321" className="flex gap-2 hover:text-gold-400 transition-colors">
                      <Phone size={13} className="mt-0.5 flex-shrink-0" /> 080 8765 4321
                    </a>
                    <a href="mailto:mowe@debbyfield.sch.ng" className="flex gap-2 hover:text-gold-400 transition-colors">
                      <Mail size={13} className="mt-0.5 flex-shrink-0" /> mowe@debbyfield.sch.ng
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Debbyfield Schools. All rights reserved.</p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors"
            >
              <MessageCircle size={13} /> Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
