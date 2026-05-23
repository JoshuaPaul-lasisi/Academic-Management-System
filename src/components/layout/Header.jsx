import { LogOut, ChevronDown, Bell, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../lib/store'
import { ROLE_LABELS, ANNEXES } from '../../lib/constants'
import LogoSvg from '../../assets/logo.svg'

export default function Header({ onMenuToggle }) {
  const { profile, signOut } = useAuth()
  const { selectedAnnex, setSelectedAnnex, currentTerm, currentSession } = useAppStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const canSwitchAnnex = profile?.annex_access === 'both' || !profile?.annex_access

  return (
    <header className="h-14 bg-burgundy-700 flex items-center px-3 md:px-5 gap-3 relative z-30 flex-shrink-0">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 flex-1">
        <img src={LogoSvg} alt="Debbyfield Schools" className="h-8 w-auto brightness-0 invert" />
        <div className="hidden sm:block">
          <p className="text-xs text-white/60 leading-none mt-0.5">
            {currentSession?.name} · {currentTerm?.name ?? 'No term set'}
          </p>
        </div>
      </div>

      {/* Annex switcher */}
      {canSwitchAnnex && (
        <div className="flex bg-white/10 rounded-lg p-0.5 gap-0.5">
          {ANNEXES.map(a => (
            <button
              key={a}
              onClick={() => setSelectedAnnex(a)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedAnnex === a
                  ? 'bg-white text-burgundy-700'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {/* Notifications */}
      <button className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors relative">
        <Bell size={18} />
      </button>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-white leading-none">
              {profile?.full_name?.split(' ')[0] ?? 'User'}
            </p>
            <p className="text-[10px] text-white/60 leading-none mt-0.5">
              {ROLE_LABELS[profile?.role] ?? profile?.role}
            </p>
          </div>
          <ChevronDown size={14} className="text-white/60" />
        </button>

        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
              <button
                onClick={() => { signOut(); setUserMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
