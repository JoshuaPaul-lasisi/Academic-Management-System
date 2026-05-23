import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  UserCog, ClipboardCheck, Settings, CreditCard, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../lib/constants'
import LogoSvg from '../../assets/logo.svg'

const allNavItems = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, roles: ['director','principal','bursar','class_teacher','subject_teacher'] },
  { to: '/students',    label: 'Students',     icon: Users,           roles: ['director','principal','class_teacher'] },
  { to: '/fees',        label: 'Fees',         icon: CreditCard,      roles: ['director','principal','bursar'] },
  { to: '/academics',   label: 'Academics',    icon: BookOpen,        roles: ['director','principal','class_teacher','subject_teacher'] },
  { to: '/staff',       label: 'Staff',        icon: UserCog,         roles: ['director','principal','bursar'] },
  { to: '/attendance',  label: 'Attendance',   icon: ClipboardCheck,  roles: ['director','principal','class_teacher'] },
  { to: '/settings',    label: 'Settings',     icon: Settings,        roles: ['director'] },
]

function NavItem({ item, collapsed = false }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'bg-white/15 text-white'
          : 'text-white/70 hover:text-white hover:bg-white/10'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <Icon size={18} className="flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )
}

export default function Sidebar({ mobile = false, onClose }) {
  const { profile } = useAuth()
  const role = profile?.role

  const visibleItems = allNavItems.filter(item => item.roles.includes(role))

  return (
    <aside className={`
      ${mobile
        ? 'w-64 h-full'
        : 'hidden md:flex w-56 flex-col flex-shrink-0'
      }
      bg-burgundy-700 flex flex-col
    `}>
      {/* Logo area (only on mobile drawer; desktop has header) */}
      {mobile && (
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <img src={LogoSvg} alt="Debbyfield" className="h-8 brightness-0 invert" />
          <button onClick={onClose} className="ml-auto text-white/60 hover:text-white p-1">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map(item => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>

      {/* Bottom branding */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-[10px] text-white/40 text-center">Debbyfield Schools © {new Date().getFullYear()}</p>
      </div>
    </aside>
  )
}
