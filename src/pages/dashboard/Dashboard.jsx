import { useEffect, useState } from 'react'
import {
  Users, GraduationCap, CreditCard, ClipboardCheck,
  UserCog, TrendingUp, AlertCircle, Calendar
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../lib/store'
import { supabase } from '../../lib/supabase'
import { ROLES } from '../../lib/constants'
import Card, { StatCard } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

// ── Director / Principal Dashboard ──────────────────────────
function AdminDashboard() {
  const { currentSession, currentTerm, selectedAnnex } = useAppStore()
  const [stats, setStats] = useState({ students: 0, staff: 0, totalPaid: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, staffRes, paymentsRes] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'pending'),
          currentTerm
            ? supabase.from('fee_payments').select('amount').eq('term_id', currentTerm.id)
            : Promise.resolve({ data: [], error: null }),
        ])
        const totalPaid = paymentsRes.data?.reduce((s, p) => s + Number(p.amount || 0), 0) ?? 0
        setStats({
          students: studentsRes.count ?? 0,
          staff:    staffRes.count ?? 0,
          totalPaid,
        })
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentTerm])

  if (loading) return (
    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {currentSession?.name ?? '—'} · {currentTerm?.name ?? 'No term set'} · {selectedAnnex} Annex
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active Students" value={stats.students} icon={Users} color="burgundy" />
        <StatCard label="Staff Members"   value={stats.staff}    icon={UserCog} color="gold" />
        <StatCard
          label="Fees Collected"
          value={`₦${(stats.totalPaid / 1000).toFixed(0)}k`}
          icon={CreditCard}
          color="green"
          sub={currentTerm?.name ?? 'This term'}
        />
        <StatCard label="Attendance"  value="—"  icon={ClipboardCheck} color="blue" sub="Mark today's" />
      </div>

      {/* Quick actions */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Add Student',      icon: Users,         href: '/students/new',      color: 'burgundy' },
            { label: 'Record Payment',   icon: CreditCard,    href: '/fees/payment',      color: 'green' },
            { label: 'Mark Attendance',  icon: ClipboardCheck,href: '/attendance',        color: 'blue' },
            { label: 'View Timetable',   icon: Calendar,      href: '/academics/timetable', color: 'orange' },
          ].map(a => {
            const Icon = a.icon
            const colors = {
              burgundy: 'bg-burgundy-50 text-burgundy-700 hover:bg-burgundy-100',
              green:    'bg-green-50 text-green-700 hover:bg-green-100',
              blue:     'bg-blue-50 text-blue-700 hover:bg-blue-100',
              orange:   'bg-orange-50 text-orange-700 hover:bg-orange-100',
            }
            return (
              <a
                key={a.label}
                href={a.href}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-medium transition-colors ${colors[a.color]}`}
              >
                <Icon size={20} />
                {a.label}
              </a>
            )
          })}
        </div>
      </Card>

      {/* Setup reminder if modules not yet used */}
      <Card className="border-gold-200 bg-gold-50">
        <div className="flex gap-3">
          <AlertCircle size={20} className="text-gold-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gold-800">Getting started</p>
            <p className="text-xs text-gold-600 mt-1">
              Next steps: Set your fee structure, enrol students, and invite staff. Each module is accessible from the menu.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── Bursar Dashboard ─────────────────────────────────────────
function BursarDashboard() {
  const { currentTerm } = useAppStore()
  const [stats, setStats] = useState({ totalOwed: 0, totalPaid: 0, outstanding: 0, recentPayments: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        if (!currentTerm) return
        const [accountsRes, paymentsRes] = await Promise.all([
          supabase.from('student_fee_accounts').select('total_owed, total_paid').eq('term_id', currentTerm.id),
          supabase.from('fee_payments').select('amount, payment_date').eq('term_id', currentTerm.id).order('payment_date', { ascending: false }).limit(5),
        ])
        const totalOwed = accountsRes.data?.reduce((s, a) => s + Number(a.total_owed || 0), 0) ?? 0
        const totalPaid = accountsRes.data?.reduce((s, a) => s + Number(a.total_paid || 0), 0) ?? 0
        setStats({ totalOwed, totalPaid, outstanding: totalOwed - totalPaid, recentPayments: paymentsRes.data ?? [] })
      } catch (err) {
        console.error('Bursar dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentTerm])

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>

  const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Financial Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">{currentTerm?.name ?? 'No active term'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Billed"    value={fmt(stats?.totalOwed)}      icon={TrendingUp}    color="blue" />
        <StatCard label="Collected"        value={fmt(stats?.totalPaid)}      icon={CreditCard}    color="green" />
        <StatCard label="Outstanding"      value={fmt(stats?.outstanding)}    icon={AlertCircle}   color="orange" />
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent payments</h3>
        {stats?.recentPayments?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No payments recorded yet</p>
        ) : (
          <div className="space-y-2">
            {stats.recentPayments.map((p, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{p.payment_date}</span>
                <span className="text-sm font-medium text-green-700">{fmt(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Teacher Dashboard ────────────────────────────────────────
function TeacherDashboard() {
  const { profile } = useAuth()
  const { currentTerm } = useAppStore()
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('teacher_assignments')
        .select('*, classes(name), subjects(name), annexes(name)')
        .eq('teacher_id', profile?.id)
      setAssignments(data ?? [])
    }
    if (profile?.id) load()
  }, [profile])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {profile?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{currentTerm?.name ?? 'Term not set'}</p>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">My assignments</h3>
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No classes assigned yet. Contact your administrator.
          </p>
        ) : (
          <div className="space-y-2">
            {assignments.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.classes?.name}</p>
                  {a.subjects && <p className="text-xs text-gray-500">{a.subjects.name}</p>}
                </div>
                {a.is_class_teacher && (
                  <Badge variant="burgundy" className="ml-auto">Class Teacher</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <a href="/attendance" className="block">
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <ClipboardCheck size={24} className="text-burgundy-700 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-800">Mark Attendance</p>
          </Card>
        </a>
        <a href="/academics" className="block">
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <GraduationCap size={24} className="text-gold-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-800">Scheme of Work</p>
          </Card>
        </a>
      </div>
    </div>
  )
}

// ── Root Dashboard ───────────────────────────────────────────
export default function Dashboard() {
  const { profile } = useAuth()
  const role = profile?.role

  if (!profile) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>

  if (role === ROLES.DIRECTOR || role === ROLES.PRINCIPAL) return <AdminDashboard />
  if (role === ROLES.BURSAR) return <BursarDashboard />
  return <TeacherDashboard />
}
