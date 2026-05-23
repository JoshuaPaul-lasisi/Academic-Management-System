import { useState } from 'react'
import { Check, ChevronRight, ChevronLeft, Plus, Trash2, School } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { DEFAULT_CLASSES, ANNEXES, TERM_NAMES } from '../../lib/constants'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LogoSvg from '../../assets/logo.svg'

const STEPS = ['Welcome', 'School Info', 'Academic Year', 'Classes', 'Complete']

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className={`
            w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${i < current ? 'bg-gold-500 text-white' : i === current ? 'bg-burgundy-700 text-white' : 'bg-gray-200 text-gray-400'}
          `}>
            {i < current ? <Check size={12} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-8 h-0.5 ${i < current ? 'bg-gold-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Step 0: Welcome ──────────────────────────────────────────
function StepWelcome({ profile, onNext }) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-burgundy-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <School size={36} className="text-burgundy-700" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Welcome, {profile?.full_name?.split(' ')[0] ?? 'Director'}!
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Let's get Debbyfield Schools set up. This takes about 2 minutes and you can always change settings later.
      </p>
      <Button onClick={onNext} size="lg" fullWidth>
        Let's begin <ChevronRight size={16} />
      </Button>
    </div>
  )
}

// ── Step 1: School Info ──────────────────────────────────────
function StepSchoolInfo({ data, onChange, onNext, onBack }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">School information</h2>
        <p className="text-sm text-gray-500">Confirm your school name and annexes.</p>
      </div>

      <Input
        label="School name"
        value={data.schoolName}
        onChange={e => onChange('schoolName', e.target.value)}
        required
      />

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Annexes</p>
        <p className="text-xs text-gray-500 mb-3">Both annexes are pre-configured. You can add more in Settings later.</p>
        <div className="space-y-2">
          {data.annexes.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-burgundy-50 rounded-lg border border-burgundy-100">
              <div className="w-2 h-2 rounded-full bg-burgundy-500" />
              <Input
                value={a}
                onChange={e => {
                  const updated = [...data.annexes]; updated[i] = e.target.value
                  onChange('annexes', updated)
                }}
                className="flex-1"
                inputClassName="bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} fullWidth disabled={!data.schoolName.trim()}>
          Continue <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

// ── Step 2: Academic Year ────────────────────────────────────
function StepAcademicYear({ data, onChange, onNext, onBack }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Academic year</h2>
        <p className="text-sm text-gray-500">Set the current session and term.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start year"
          type="number"
          value={data.startYear}
          onChange={e => {
            const y = parseInt(e.target.value)
            onChange('startYear', y)
            onChange('endYear', y + 1)
          }}
          min={2020}
          max={2040}
        />
        <Input
          label="End year"
          type="number"
          value={data.endYear}
          disabled
          hint="Auto-calculated"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Current term</p>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(t => (
            <button
              key={t}
              onClick={() => onChange('termNumber', t)}
              className={`
                py-3 rounded-lg border-2 text-sm font-medium transition-colors text-center
                ${data.termNumber === t
                  ? 'border-burgundy-700 bg-burgundy-50 text-burgundy-700'
                  : 'border-gray-200 text-gray-600 hover:border-burgundy-300'
                }
              `}
            >
              {TERM_NAMES[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Term start date"
          type="date"
          value={data.termStart}
          onChange={e => onChange('termStart', e.target.value)}
        />
        <Input
          label="Term end date"
          type="date"
          value={data.termEnd}
          onChange={e => onChange('termEnd', e.target.value)}
        />
      </div>

      <div className="bg-gold-50 border border-gold-200 rounded-lg p-3">
        <p className="text-sm font-medium text-gold-800">
          {data.startYear}/{data.endYear} Session — {TERM_NAMES[data.termNumber]}
        </p>
        <p className="text-xs text-gold-600 mt-0.5">This will be marked as the current active term.</p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} fullWidth>
          Continue <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

// ── Step 3: Classes ──────────────────────────────────────────
function StepClasses({ data, onChange, onNext, onBack, saving }) {
  const [newClass, setNewClass] = useState('')

  const addClass = () => {
    if (!newClass.trim()) return
    onChange('classes', [...data.classes, { name: newClass.trim(), level: 'primary', sort_order: data.classes.length + 1 }])
    setNewClass('')
  }

  const removeClass = (i) => {
    onChange('classes', data.classes.filter((_, idx) => idx !== i))
  }

  const levels = { nursery: 'Nursery', primary: 'Primary', secondary: 'Secondary' }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Class list</h2>
        <p className="text-sm text-gray-500">All standard classes are pre-loaded. Remove or add as needed.</p>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
        {data.classes.map((cls, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <span className="flex-1 text-sm text-gray-800">{cls.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
              {levels[cls.level]}
            </span>
            <button
              onClick={() => removeClass(i)}
              className="p-1 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add custom class..."
          value={newClass}
          onChange={e => setNewClass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addClass())}
          className="flex-1"
        />
        <Button variant="outline" onClick={addClass}>
          <Plus size={16} /> Add
        </Button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} disabled={saving}>Back</Button>
        <Button onClick={onNext} fullWidth loading={saving} disabled={data.classes.length === 0}>
          {saving ? 'Setting up…' : `Complete Setup`} {!saving && <ChevronRight size={16} />}
        </Button>
      </div>
    </div>
  )
}

// ── Step 4: Complete ─────────────────────────────────────────
function StepComplete() {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check size={36} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">All set!</h2>
      <p className="text-gray-500 text-sm mb-2">
        Debbyfield Schools Management System is ready to use.
      </p>
      <p className="text-gray-400 text-xs mb-6">Taking you to the dashboard…</p>
      <div className="flex justify-center">
        <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-burgundy-700 animate-pulse w-1/2" />
        </div>
      </div>
    </div>
  )
}

// ── Main SetupFlow Component ─────────────────────────────────
export default function SetupFlow() {
  const { profile, refreshAppData } = useAuth()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [data, setData] = useState({
    schoolName: 'Debbyfield Schools',
    annexes: ['Lagos', 'Mowe'],
    startYear: 2026,
    endYear: 2027,
    termNumber: 1,
    termStart: '2026-09-07',
    termEnd:   '2026-12-19',
    classes: [...DEFAULT_CLASSES],
  })

  const update = (key, value) => setData(d => ({ ...d, [key]: value }))

  const runSetup = async () => {
    setSaving(true)
    setError('')
    try {
      // 1 — School
      const { data: school, error: schoolErr } = await supabase
        .from('schools')
        .insert({ name: data.schoolName, setup_complete: true })
        .select()
        .single()
      if (schoolErr) throw schoolErr

      // 2 — Annexes
      const { data: annexRows, error: annexErr } = await supabase
        .from('annexes')
        .insert(data.annexes.filter(Boolean).map(n => ({ school_id: school.id, name: n })))
        .select()
      if (annexErr) throw annexErr

      // 3 — Academic session
      const sessionName = `${data.startYear}/${data.endYear}`
      const { data: session, error: sessionErr } = await supabase
        .from('academic_sessions')
        .insert({ name: sessionName, start_year: data.startYear, end_year: data.endYear, is_current: true })
        .select()
        .single()
      if (sessionErr) throw sessionErr

      // 4 — Current term
      const { error: termErr } = await supabase
        .from('terms')
        .insert({
          session_id: session.id,
          term_number: data.termNumber,
          name: TERM_NAMES[data.termNumber],
          start_date: data.termStart || null,
          end_date: data.termEnd || null,
          is_current: true,
        })
      if (termErr) throw termErr

      // 5 — Classes
      const { data: classRows, error: classErr } = await supabase
        .from('classes')
        .insert(data.classes)
        .select()
      if (classErr) throw classErr

      // 6 — Link all classes to all annexes
      const links = classRows.flatMap(cls =>
        annexRows.map(annex => ({ class_id: cls.id, annex_id: annex.id }))
      )
      const { error: linkErr } = await supabase.from('class_annexes').insert(links)
      if (linkErr) throw linkErr

      await refreshAppData()
      setStep(4)

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (err) {
      console.error('Setup error:', err)
      setError(err.message ?? 'Setup failed. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-burgundy-900 via-burgundy-700 to-burgundy-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={LogoSvg} alt="Debbyfield Schools" className="h-12 brightness-0 invert" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <StepIndicator current={step} total={STEPS.length} />

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 0 && <StepWelcome profile={profile} onNext={() => setStep(1)} />}
          {step === 1 && <StepSchoolInfo data={data} onChange={update} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && <StepAcademicYear data={data} onChange={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <StepClasses data={data} onChange={update} onNext={runSetup} onBack={() => setStep(2)} saving={saving} />}
          {step === 4 && <StepComplete />}
        </div>
      </div>
    </div>
  )
}
