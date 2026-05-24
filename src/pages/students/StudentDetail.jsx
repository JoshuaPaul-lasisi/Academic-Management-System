import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, GraduationCap, Phone, Mail, CreditCard, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import { useAuth } from '../../contexts/AuthContext'
import { generateInvoice } from '../../lib/pdf'
import { Avatar } from './StudentsPage'
import Card, { CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input, { Select, Textarea } from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`

export default function StudentDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { profile } = useAuth()
  const { currentTerm, annexes, school } = useAppStore()

  const [student,    setStudent]    = useState(null)
  const [parents,    setParents]    = useState([])
  const [feeAccount, setFeeAccount] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState('profile')
  const [alumniModal,setAlumniModal]= useState(false)
  const [alumniForm, setAlumniForm] = useState({ exit_year: new Date().getFullYear(), destination: '' })
  const [markingSaving,setMarkingSaving]= useState(false)

  const canEdit = ['director','principal'].includes(profile?.role)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from('students').select('*, classes(name,level), annexes(name)').eq('id', id).single(),
        supabase.from('parent_guardians').select('*').eq('student_id', id).order('is_primary', { ascending: false }),
      ])
      setStudent(s)
      setParents(p ?? [])

      if (currentTerm) {
        const { data: fa } = await supabase
          .from('student_fee_accounts')
          .select('*')
          .eq('student_id', id)
          .eq('term_id', currentTerm.id)
          .maybeSingle()
        setFeeAccount(fa)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id, currentTerm])

  useEffect(() => { load() }, [load])

  const markAsAlumni = async () => {
    setMarkingSaving(true)
    try {
      await supabase.from('students').update({
        is_alumni: true,
        is_active: false,
        alumni_exit_year: alumniForm.exit_year,
        alumni_next_destination: alumniForm.destination.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
      setAlumniModal(false)
      navigate('/students')
    } catch (err) {
      console.error(err)
    } finally {
      setMarkingSaving(false)
    }
  }

  const applyFees = async () => {
    if (!currentTerm || !student) return
    try {
      const annexObj = annexes.find(a => a.id === student.annex_id)
      const { data: fs } = await supabase
        .from('fee_structures')
        .select('*, fee_levies(*)')
        .eq('class_id', student.class_id)
        .eq('term_id', currentTerm.id)
        .eq('annex_id', student.annex_id)
        .eq('student_type', student.student_type ?? 'returning')
        .maybeSingle()

      if (!fs) { alert('No fee structure found for this class and term. Set it up in Fee Management first.'); return }

      const levies = fs.fee_levies?.reduce((s, l) => s + Number(l.amount || 0), 0) ?? 0
      const total  = Number(fs.tuition_fee || 0) + levies

      await supabase.from('student_fee_accounts').upsert({
        student_id: id, term_id: currentTerm.id,
        total_owed: total, total_paid: feeAccount?.total_paid ?? 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'student_id,term_id' })

      load()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const openInvoice = async () => {
    if (!feeAccount || !student) return
    const { data: fs } = await supabase
      .from('fee_structures')
      .select('*, fee_levies(*)')
      .eq('class_id', student.class_id)
      .eq('term_id', currentTerm?.id)
      .eq('student_type', student.student_type ?? 'returning')
      .maybeSingle()

    const feeItems = fs ? [
      { name: 'Tuition Fee', amount: fs.tuition_fee },
      ...(fs.fee_levies ?? []).map(l => ({ name: l.levy_name, amount: l.amount })),
    ] : [{ name: 'Total Fees', amount: feeAccount.total_owed }]

    const doc = generateInvoice({
      student: { ...student, classes: student.classes },
      feeItems,
      totalOwed: feeAccount.total_owed,
      totalPaid: feeAccount.total_paid,
      schoolName: school?.name,
      annexName: student.annexes?.name,
      termName: currentTerm?.name,
    })
    window.open(URL.createObjectURL(doc.output('blob')), '_blank')
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  if (!student) return <div className="text-center py-12 text-gray-400">Student not found.</div>

  const balance = feeAccount ? Number(feeAccount.total_owed) - Number(feeAccount.total_paid) : null

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/students')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1" />
        {canEdit && !student.is_alumni && (
          <>
            <Button variant="outline" size="sm" onClick={() => setAlumniModal(true)}>
              <GraduationCap size={14} /> Mark Alumni
            </Button>
            <Button size="sm" onClick={() => navigate(`/students/${id}/edit`)}>
              <Edit2 size={14} /> Edit
            </Button>
          </>
        )}
      </div>

      {/* Profile card */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={student.first_name} photoUrl={student.photo_url} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">
              {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
            </h2>
            <p className="text-sm text-gray-500">{student.admission_number} · {student.classes?.name}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge variant={student.student_type === 'new' ? 'gold' : 'default'}>
                {student.student_type === 'new' ? 'New Intake' : 'Returning'}
              </Badge>
              <Badge variant={student.is_alumni ? 'blue' : 'green'}>
                {student.is_alumni ? `Alumni ${student.alumni_exit_year ?? ''}` : 'Active'}
              </Badge>
              <Badge variant="default">{student.annexes?.name} Annex</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {['profile','parents','medical','fees'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              tab === t ? 'bg-white text-burgundy-700 shadow-sm' : 'text-gray-500'
            }`}
          >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <Card>
          <CardHeader title="Student Information" />
          <dl className="space-y-3">
            {[
              ['Full Name',       `${student.first_name} ${student.middle_name ?? ''} ${student.last_name}`.replace(/\s+/g,' ')],
              ['Date of Birth',   student.date_of_birth ?? '—'],
              ['Gender',          student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : '—'],
              ['Class',           student.classes?.name ?? '—'],
              ['Annex',           (student.annexes?.name ?? '—') + ' Annex'],
              ['Admission No.',   student.admission_number ?? '—'],
              ['Admission Date',  student.admission_date ?? '—'],
              ['Student Type',    student.student_type === 'new' ? 'New Intake' : 'Returning Student'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                <dt className="text-sm text-gray-500">{label}</dt>
                <dd className="text-sm font-medium text-gray-900 text-right">{value}</dd>
              </div>
            ))}
            {student.is_alumni && student.alumni_next_destination && (
              <div className="flex justify-between py-1">
                <dt className="text-sm text-gray-500">Next Destination</dt>
                <dd className="text-sm font-medium text-gray-900">{student.alumni_next_destination}</dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      {/* Parents tab */}
      {tab === 'parents' && (
        <div className="space-y-3">
          {parents.length === 0 ? (
            <Card className="text-center py-8 text-gray-400 text-sm">No parent/guardian records added.</Card>
          ) : parents.map((p, i) => (
            <Card key={p.id}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-bold text-sm flex-shrink-0">
                  {p.full_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{p.full_name}</p>
                    {p.is_primary && <Badge variant="burgundy">Primary</Badge>}
                  </div>
                  <p className="text-xs text-gray-500">{p.relationship}</p>
                  <div className="mt-2 space-y-1">
                    {p.phone && <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-sm text-burgundy-700"><Phone size={13} />{p.phone}</a>}
                    {p.email && <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-sm text-burgundy-700"><Mail size={13} />{p.email}</a>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Medical tab */}
      {tab === 'medical' && (
        <Card>
          <CardHeader title="Medical Notes" />
          {student.medical_notes ? (
            <p className="text-sm text-gray-700 leading-relaxed">{student.medical_notes}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No medical notes recorded.</p>
          )}
        </Card>
      )}

      {/* Fees tab */}
      {tab === 'fees' && (
        <Card>
          <CardHeader title={`Fees — ${currentTerm?.name ?? 'No active term'}`}
            action={canEdit && feeAccount && (
              <Button size="sm" variant="outline" onClick={openInvoice}>
                Invoice PDF
              </Button>
            )}
          />
          {!currentTerm ? (
            <p className="text-sm text-gray-400">No active term configured.</p>
          ) : !feeAccount ? (
            <div className="text-center py-6 space-y-3">
              <AlertCircle size={28} className="text-amber-400 mx-auto" />
              <p className="text-sm text-gray-500">No fee account for this term yet.</p>
              {canEdit && (
                <Button size="sm" onClick={applyFees}>
                  <CreditCard size={14} /> Apply Term Fees
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Total Billed', value: fmt(feeAccount.total_owed),  color: 'text-gray-800' },
                  { label: 'Paid',          value: fmt(feeAccount.total_paid),  color: 'text-green-700' },
                  { label: 'Balance',       value: fmt(balance),                 color: balance > 0 ? 'text-red-600' : 'text-green-600' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                    <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
              {balance > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle size={15} />
                  Outstanding balance of {fmt(balance)} — payment pending.
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Alumni modal */}
      <Modal open={alumniModal} onClose={() => setAlumniModal(false)} title="Mark as Alumni"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setAlumniModal(false)}>Cancel</Button>
            <Button onClick={markAsAlumni} loading={markingSaving}>Confirm</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            This will mark <strong>{student.first_name}</strong> as an alumnus and remove them from active class lists.
          </div>
          <Input
            label="Exit year" type="number"
            value={alumniForm.exit_year}
            onChange={e => setAlumniForm(f => ({ ...f, exit_year: parseInt(e.target.value) }))}
          />
          <Input
            label="Next destination (optional)"
            placeholder="e.g. University of Lagos, Federal Government College…"
            value={alumniForm.destination}
            onChange={e => setAlumniForm(f => ({ ...f, destination: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  )
}
