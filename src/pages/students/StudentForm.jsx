import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import { STUDENT_TYPES } from '../../lib/constants'
import Button from '../../components/ui/Button'
import Input, { Select, Textarea } from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'

const RELATIONSHIPS = ['Father','Mother','Guardian','Uncle','Aunt','Grandparent','Other']

async function genAdmissionNumber() {
  const year = new Date().getFullYear()
  const { count } = await supabase.from('students').select('*', { count: 'exact', head: true })
  return `DBS-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`
}

const emptyParent = () => ({ full_name: '', relationship: 'Father', phone: '', email: '', is_primary: false })

export default function StudentForm() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const isEdit    = !!id
  const { classes, annexes, selectedAnnex } = useAppStore()

  // Form state
  const [info, setInfo] = useState({
    first_name: '', last_name: '', middle_name: '',
    date_of_birth: '', gender: 'male',
    class_id: '', annex_id: '',
    admission_number: '', admission_date: new Date().toISOString().split('T')[0],
    student_type: 'new', medical_notes: '',
  })
  const [parents,  setParents]  = useState([{ ...emptyParent(), is_primary: true }])
  const [loading,  setLoading]  = useState(isEdit)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [step,     setStep]     = useState(0) // 0=Info 1=Parents 2=Medical

  const setI = (k, v) => setInfo(f => ({ ...f, [k]: v }))

  // Pre-fill annex and generate admission number on mount
  useEffect(() => {
    const init = async () => {
      const defaultAnnex = annexes.find(a => a.name === selectedAnnex)
      if (!isEdit) {
        const admNo = await genAdmissionNumber()
        setInfo(f => ({ ...f, admission_number: admNo, annex_id: defaultAnnex?.id ?? '' }))
      } else {
        // Load existing student
        const { data: s } = await supabase
          .from('students')
          .select('*, parent_guardians(*)')
          .eq('id', id)
          .single()
        if (s) {
          setInfo({
            first_name: s.first_name, last_name: s.last_name, middle_name: s.middle_name ?? '',
            date_of_birth: s.date_of_birth ?? '', gender: s.gender ?? 'male',
            class_id: s.class_id ?? '', annex_id: s.annex_id ?? '',
            admission_number: s.admission_number ?? '', admission_date: s.admission_date ?? '',
            student_type: s.student_type ?? 'new', medical_notes: s.medical_notes ?? '',
          })
          if (s.parent_guardians?.length) setParents(s.parent_guardians)
        }
        setLoading(false)
      }
    }
    init()
  }, [id, isEdit, annexes, selectedAnnex])

  const addParent   = () => setParents(p => [...p, emptyParent()])
  const removeParent = (i) => setParents(p => p.filter((_, idx) => idx !== i))
  const setParent   = (i, k, v) => setParents(p => p.map((pa, idx) => idx === i ? { ...pa, [k]: v } : pa))

  const save = async () => {
    if (!info.first_name.trim() || !info.last_name.trim()) {
      setError('First name and last name are required.')
      setStep(0); return
    }
    if (!info.class_id) { setError('Please select a class.'); setStep(0); return }
    if (!info.annex_id) { setError('Please select an annex.'); setStep(0); return }

    setSaving(true)
    setError('')
    try {
      let studentId = id
      const payload = {
        first_name: info.first_name.trim(),
        last_name:  info.last_name.trim(),
        middle_name: info.middle_name.trim() || null,
        date_of_birth: info.date_of_birth || null,
        gender: info.gender,
        class_id: info.class_id,
        annex_id: info.annex_id,
        admission_number: info.admission_number.trim() || null,
        admission_date: info.admission_date || null,
        student_type: info.student_type,
        medical_notes: info.medical_notes.trim() || null,
        updated_at: new Date().toISOString(),
      }

      if (isEdit) {
        const { error: e } = await supabase.from('students').update(payload).eq('id', id)
        if (e) throw e
      } else {
        const { data, error: e } = await supabase.from('students').insert({ ...payload, is_active: true, is_alumni: false }).select().single()
        if (e) throw e
        studentId = data.id
      }

      // Parents: delete and recreate (simplest approach)
      await supabase.from('parent_guardians').delete().eq('student_id', studentId)
      const validParents = parents.filter(p => p.full_name.trim())
      if (validParents.length > 0) {
        const { error: pe } = await supabase.from('parent_guardians').insert(
          validParents.map((p, i) => ({
            student_id: studentId,
            full_name: p.full_name.trim(),
            relationship: p.relationship,
            phone: p.phone.trim() || null,
            email: p.email.trim() || null,
            is_primary: i === 0,
          }))
        )
        if (pe) throw pe
      }

      navigate(`/students/${studentId}`)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to save student.')
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>

  const STEPS = ['Student Info', 'Parent / Guardian', 'Medical & Notes']

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Student' : 'Enrol New Student'}</h1>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {/* Step tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
              step === i ? 'bg-white text-burgundy-700 shadow-sm' : 'text-gray-500'
            }`}>{s}</button>
        ))}
      </div>

      {/* Step 0: Student Info */}
      {step === 0 && (
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={info.first_name} onChange={e => setI('first_name', e.target.value)} required />
              <Input label="Last name"  value={info.last_name}  onChange={e => setI('last_name', e.target.value)}  required />
            </div>
            <Input label="Middle name (optional)" value={info.middle_name} onChange={e => setI('middle_name', e.target.value)} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Date of birth" type="date" value={info.date_of_birth} onChange={e => setI('date_of_birth', e.target.value)} />
              <Select label="Gender" value={info.gender} onChange={e => setI('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select label="Class" value={info.class_id} onChange={e => setI('class_id', e.target.value)} required>
                <option value="">Select class…</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select label="Annex" value={info.annex_id} onChange={e => setI('annex_id', e.target.value)} required>
                <option value="">Select annex…</option>
                {annexes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Admission number" value={info.admission_number} onChange={e => setI('admission_number', e.target.value)} />
              <Input label="Admission date" type="date" value={info.admission_date} onChange={e => setI('admission_date', e.target.value)} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Student type</p>
              <div className="grid grid-cols-2 gap-2">
                {[['new','New Intake'],['returning','Returning Student']].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => setI('student_type', v)}
                    className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                      info.student_type === v
                        ? 'border-burgundy-700 bg-burgundy-50 text-burgundy-700'
                        : 'border-gray-200 text-gray-600 hover:border-burgundy-300'
                    }`}
                  >{l}</button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep(1)}>Next: Parent Info →</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 1: Parents */}
      {step === 1 && (
        <Card>
          <div className="space-y-4">
            {parents.map((p, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl space-y-3 relative">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-700">
                    {i === 0 ? 'Primary Contact' : `Contact ${i + 1}`}
                  </p>
                  {i > 0 && (
                    <button onClick={() => removeParent(i)} className="p-1 text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Full name" value={p.full_name} onChange={e => setParent(i,'full_name',e.target.value)}
                    className="col-span-2" required={i === 0} />
                  <Select label="Relationship" value={p.relationship} onChange={e => setParent(i,'relationship',e.target.value)}>
                    {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
                  </Select>
                  <Input label="Phone" type="tel" value={p.phone} onChange={e => setParent(i,'phone',e.target.value)} />
                  <Input label="Email (optional)" type="email" value={p.email} onChange={e => setParent(i,'email',e.target.value)} className="col-span-2" />
                </div>
              </div>
            ))}
            {parents.length < 3 && (
              <button onClick={addParent}
                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-burgundy-300 hover:text-burgundy-500 transition-colors flex items-center justify-center gap-2">
                <Plus size={15} /> Add another contact
              </button>
            )}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
              <Button onClick={() => setStep(2)}>Next: Medical →</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Medical & Save */}
      {step === 2 && (
        <Card>
          <div className="space-y-4">
            <Textarea
              label="Medical notes"
              placeholder="Any allergies, conditions, medications, or special needs the school should know about…"
              value={info.medical_notes}
              onChange={e => setI('medical_notes', e.target.value)}
              className="min-h-[120px]"
            />
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              This information is confidential and only visible to school management.
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={save} loading={saving}>
                <User size={15} /> {isEdit ? 'Save Changes' : 'Enrol Student'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
