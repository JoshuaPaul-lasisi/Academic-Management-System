import { useState, useEffect, useCallback } from 'react'
import {
  UserPlus, Mail, Shield, Trash2, RefreshCw,
  Plus, RotateCcw, BookOpen, GraduationCap,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES, ROLE_LABELS, ANNEXES, DEFAULT_SUBJECTS } from '../../lib/constants'
import Card, { CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

// ─── Role badge colours ──────────────────────────────────────────────────────
const roleBadge = {
  director:        'burgundy',
  principal:       'gold',
  bursar:          'blue',
  class_teacher:   'green',
  subject_teacher: 'orange',
  pending:         'default',
}

// ─── Derive default subjects list for a class row ────────────────────────────
function defaultsForClass(cls) {
  if (!cls) return []
  if (cls.level === 'nursery') return DEFAULT_SUBJECTS.nursery
  if (cls.level === 'primary') return DEFAULT_SUBJECTS.primary
  if (cls.name.startsWith('JSS')) return DEFAULT_SUBJECTS.jss
  return DEFAULT_SUBJECTS.ss
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║  SUBJECTS TAB
// ╚══════════════════════════════════════════════════════════════════════════════
function SubjectsTab() {
  const [classes,  setClasses]  = useState([])
  const [annexes,  setAnnexes]  = useState([])
  const [subjects, setSubjects] = useState([])

  const [classId, setClassId] = useState('')
  const [annexId, setAnnexId] = useState('')

  const [newName,   setNewName]   = useState('')
  const [adding,    setAdding]    = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error,     setError]     = useState('')
  const [loadingSub, setLoadingSub] = useState(false)

  // Load classes and annexes once
  useEffect(() => {
    async function loadMeta() {
      const [cRes, aRes] = await Promise.all([
        supabase.from('classes').select('id, name, level').order('sort_order'),
        supabase.from('annexes').select('id, name').order('name'),
      ])
      const cls = cRes.data ?? []
      const anx = aRes.data ?? []
      setClasses(cls)
      setAnnexes(anx)
      if (cls.length) setClassId(cls[0].id)
      if (anx.length) setAnnexId(anx[0].id)
    }
    loadMeta()
  }, [])

  // Load subjects whenever class or annex changes
  const loadSubjects = useCallback(async () => {
    if (!classId || !annexId) return
    setLoadingSub(true)
    const { data } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('class_id', classId)
      .eq('annex_id', annexId)
      .order('name')
    setSubjects(data ?? [])
    setLoadingSub(false)
  }, [classId, annexId])

  useEffect(() => { loadSubjects() }, [loadSubjects])

  const handleAdd = async (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setAdding(true)
    setError('')
    const { error: err } = await supabase.from('subjects').insert({ name, class_id: classId, annex_id: annexId })
    if (err) {
      setError(err.code === '23505' ? `"${name}" already exists for this class.` : err.message)
    } else {
      setNewName('')
      loadSubjects()
    }
    setAdding(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('subjects').delete().eq('id', id)
    loadSubjects()
  }

  const handleReset = async () => {
    const cls = classes.find(c => c.id === classId)
    if (!cls) return
    if (!window.confirm(`Reset subjects for ${cls.name} to defaults? This will remove any custom additions.`)) return

    setResetting(true)
    await supabase.from('subjects').delete().eq('class_id', classId).eq('annex_id', annexId)
    const rows = defaultsForClass(cls).map(name => ({ name, class_id: classId, annex_id: annexId }))
    await supabase.from('subjects').insert(rows)
    loadSubjects()
    setResetting(false)
  }

  const selectedClass = classes.find(c => c.id === classId)
  const selectedAnnex = annexes.find(a => a.id === annexId)

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <Card>
        <CardHeader
          title="Select Class & Campus"
          subtitle="Choose which class and campus to manage subjects for"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Class"
            value={classId}
            onChange={e => setClassId(e.target.value)}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select
            label="Campus (Annex)"
            value={annexId}
            onChange={e => setAnnexId(e.target.value)}
          >
            {annexes.map(a => (
              <option key={a.id} value={a.id}>{a.name} Campus</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Subject list */}
      <Card>
        <CardHeader
          title={
            selectedClass && selectedAnnex
              ? `${selectedClass.name} — ${selectedAnnex.name} Subjects`
              : 'Subjects'
          }
          subtitle={`${subjects.length} subject${subjects.length !== 1 ? 's' : ''}`}
          action={
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadSubjects}
                title="Refresh"
              >
                <RefreshCw size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                loading={resetting}
                title="Reset to defaults"
              >
                <RotateCcw size={14} /> Reset defaults
              </Button>
            </div>
          }
        />

        {loadingSub ? (
          <div className="text-center py-6 text-gray-400 text-sm">Loading…</div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">No subjects yet</p>
            <p className="text-xs text-gray-400">Add subjects below or click "Reset defaults" to load the standard list.</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {subjects.map(s => (
              <li
                key={s.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 group"
              >
                <GraduationCap size={15} className="text-burgundy-400 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-800">{s.name}</span>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                  title="Remove subject"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add subject form */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {error && (
            <p className="text-xs text-red-600 mb-2">{error}</p>
          )}
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder="Add subject name…"
              value={newName}
              onChange={e => { setNewName(e.target.value); setError('') }}
              className="flex-1"
            />
            <Button type="submit" loading={adding} disabled={!newName.trim()}>
              <Plus size={15} /> Add
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║  USERS TAB
// ╚══════════════════════════════════════════════════════════════════════════════
function UsersTab() {
  const { profile } = useAuth()
  const [users,       setUsers]       = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteForm,  setInviteForm]  = useState({ email: '', role: 'class_teacher', annex_access: 'both' })
  const [inviting,    setInviting]    = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    const [usersRes, invRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('invitations').select('*').eq('accepted', false).order('created_at', { ascending: false }),
    ])
    setUsers(usersRes.data ?? [])
    setInvitations(invRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    setInviteSuccess('')

    const { error } = await supabase.from('invitations').upsert({
      email: inviteForm.email.trim().toLowerCase(),
      role: inviteForm.role,
      annex_access: inviteForm.annex_access,
      invited_by: profile?.id,
    }, { onConflict: 'email' })

    if (error) {
      setInviteError(error.message)
    } else {
      setInviteSuccess(`Invitation saved for ${inviteForm.email}. Share the app link so they can sign up.`)
      setInviteForm({ email: '', role: 'class_teacher', annex_access: 'both' })
      load()
    }
    setInviting(false)
  }

  const changeRole = async (userId, newRole) => {
    if (userId === profile?.id) return
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    load()
  }

  const cancelInvitation = async (id) => {
    await supabase.from('invitations').delete().eq('id', id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setInviteModal(true)}>
          <UserPlus size={16} /> Invite User
        </Button>
      </div>

      <Card>
        <CardHeader
          title="System Users"
          subtitle={`${users.length} registered`}
          action={<Button variant="ghost" size="sm" onClick={load}><RefreshCw size={14} /></Button>}
        />
        {loading ? (
          <div className="text-center py-6 text-gray-400 text-sm">Loading…</div>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-burgundy-100 flex items-center justify-center text-burgundy-700 text-sm font-bold flex-shrink-0">
                  {u.full_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <Badge variant={roleBadge[u.role]}>{ROLE_LABELS[u.role] ?? u.role}</Badge>
                {profile?.role === ROLES.DIRECTOR && u.id !== profile?.id && u.role !== 'director' && (
                  <Select
                    value={u.role}
                    onChange={e => changeRole(u.id, e.target.value)}
                    className="w-36"
                  >
                    {Object.entries(ROLE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </Select>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader title="Pending Invitations" subtitle="Awaiting sign-up" />
          <div className="space-y-2">
            {invitations.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                <Mail size={16} className="text-yellow-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{inv.email}</p>
                  <p className="text-xs text-gray-500">{ROLE_LABELS[inv.role]} · {inv.annex_access}</p>
                </div>
                <button
                  onClick={() => cancelInvitation(inv.id)}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        open={inviteModal}
        onClose={() => { setInviteModal(false); setInviteSuccess(''); setInviteError('') }}
        title="Invite a user"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          {inviteError && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{inviteError}</div>
          )}
          {inviteSuccess && (
            <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">{inviteSuccess}</div>
          )}
          <Input
            label="Email address"
            type="email"
            value={inviteForm.email}
            onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
            required
            placeholder="teacher@example.com"
          />
          <Select
            label="Role"
            value={inviteForm.role}
            onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
          >
            {Object.entries(ROLE_LABELS).filter(([v]) => v !== 'director').map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
          <Select
            label="Annex access"
            value={inviteForm.annex_access}
            onChange={e => setInviteForm(f => ({ ...f, annex_access: e.target.value }))}
          >
            <option value="both">Both Annexes</option>
            {ANNEXES.map(a => <option key={a} value={a}>{a} Only</option>)}
          </Select>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
            <Shield size={12} className="inline mr-1" />
            After saving, share the app link with this person. When they sign up using this email, they'll automatically receive this role.
          </div>
          <Button type="submit" loading={inviting} fullWidth>Save Invitation</Button>
        </form>
      </Modal>
    </div>
  )
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║  SETTINGS PAGE (tabbed)
// ╚══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'users',    label: 'Users',    icon: UserPlus  },
  { id: 'subjects', label: 'Subjects', icon: BookOpen  },
]

export default function Settings() {
  const [tab, setTab] = useState('users')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">User management and school configuration</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? 'border-burgundy-700 text-burgundy-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'users'    && <UsersTab />}
      {tab === 'subjects' && <SubjectsTab />}
    </div>
  )
}
