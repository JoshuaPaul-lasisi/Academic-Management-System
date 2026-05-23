import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, BookOpen, ClipboardCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const allItems = [
  { to: '/dashboard',  label: 'Home',       icon: LayoutDashboard, roles: ['director','principal','bursar','class_teacher','subject_teacher'] },
  { to: '/students',   label: 'Students',   icon: Users,           roles: ['director','principal','class_teacher'] },
  { to: '/fees',       label: 'Fees',       icon: CreditCard,      roles: ['director','principal','bursar'] },
  { to: '/academics',  label: 'Academics',  icon: BookOpen,        roles: ['director','principal','class_teacher','subject_teacher'] },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck,  roles: ['director','principal','class_teacher'] },
]

export default function BottomNav() {
  const { profile } = useAuth()
  const role = profile?.role
  const items = allItems.filter(i => i.roles.includes(role)).slice(0, 5)

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom">
      <div className="flex">
        {items.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex-1 flex flex-col items-center gap-0.5 py-2 px-1
                text-[10px] font-medium transition-colors
                ${isActive ? 'text-burgundy-700' : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-burgundy-50' : ''}`}>
                    <Icon size={20} />
                  </div>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
