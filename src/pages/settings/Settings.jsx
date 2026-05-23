import { useState, useEffect } from 'react'
import { UserPlus, Mail, Shield, Trash2, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ROLES, ROLE_LABELS, ANNEXES } from '../../lib/constants'
import Card, { CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const roleBadge = {
  director:       'burgundy',
  principal:      'gold',
  bursar:         'blue',
  class_teacher:  'green',
  subject_teacher:'orange',
  pending:        'default',
}

export default function Settings() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'class_teacher', annex_access: 'both' })
  const [inviting, setInviting] = useState(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">User management and school configuration</p>
        </div>
        <Button onClick={() => setInviteModal(true)}>
          <UserPlus size={16} /> Invite User
        </Button>
      </div>

      {/* Users */}
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

      {/* Pending invitations */}
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

      {/* Invite modal */}
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

          <Button type="submit" loading={inviting} fullWidth>
            Save Invitation
          </Button>
        </form>
      </Modal>
    </div>
  )
}
