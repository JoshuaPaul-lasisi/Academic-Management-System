import { useState, useEffect, useCallback } from 'react'
import { Edit2, Plus, Trash2, Download, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import { generateFeeSchedule } from '../../lib/pdf'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

const fmt = (n) => n != null ? `₦${Number(n).toLocaleString()}` : '—'

export default function FeeSchedule() {
  const { currentTerm, classes, annexes, selectedAnnex, school } = useAppStore()
  const [structures, setStructures] = useState({}) // { classId: { new: {...}, returning: {...} } }
  const [loading, setLoading] = useState(true)
  const [editClass, setEditClass] = useState(null) // { id, name }
  const [expandedClass, setExpandedClass] = useState(null)
  const [billing, setBilling] = useState({})   // { [classId]: 'loading' | 'done' | number }


  const annexId = annexes.find(a => a.name === selectedAnnex)?.id

  const load = useCallback(async () => {
    if (!currentTerm || !annexId) { setLoading(false); return }
    setLoading(true)
    try {
      const { data } = await supabase
        .from('fee_structures')
        .select('*, fee_levies(*)')
        .eq('term_id', currentTerm.id)
        .eq('annex_id', annexId)

      const map = {}
      for (const row of data ?? []) {
        if (!map[row.class_id]) map[row.class_id] = {}
        map[row.class_id][row.student_type] = row
      }
      setStructures(map)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [currentTerm, annexId])

  useEffect(() => { load() }, [load])

  const getTotal = (structure) => {
    if (!structure) return 0
    const levies = structure.fee_levies?.reduce((s, l) => s + Number(l.amount || 0), 0) ?? 0
    return Number(structure.tuition_fee || 0) + levies
  }

  const billStudents = async (cls) => {
    if (!currentTerm || !annexId) return
    setBilling(prev => ({ ...prev, [cls.id]: 'loading' }))
    try {
      // 1. Fetch all active students in this class for this annex
      const { data: students, error: stuErr } = await supabase
        .from('students')
        .select('id, student_type')
        .eq('class_id', cls.id)
        .eq('annex_id', annexId)
        .eq('is_active', true)
      if (stuErr) throw stuErr
      if (!students?.length) {
        setBilling(prev => ({ ...prev, [cls.id]: 0 }))
        return
      }

      const classStructures = structures[cls.id]

      // 2. Compute total_owed per student using their student_type
      const billingData = students.map(s => {
        const struct = classStructures?.[s.student_type] ?? classStructures?.new ?? classStructures?.returning
        const leviesTotal = struct?.fee_levies?.reduce((sum, l) => sum + Number(l.amount || 0), 0) ?? 0
        const total_owed = Number(struct?.tuition_fee || 0) + leviesTotal
        return { student_id: s.id, total_owed }
      })

      // 3. Find which students already have an account this term
      const studentIds = students.map(s => s.id)
      const { data: existing } = await supabase
        .from('student_fee_accounts')
        .select('id, student_id')
        .eq('term_id', currentTerm.id)
        .in('student_id', studentIds)

      const existingMap = new Map((existing ?? []).map(a => [a.student_id, a.id]))

      // 4. Insert new accounts for unbilled students
      const toInsert = billingData
        .filter(d => !existingMap.has(d.student_id))
        .map(d => ({ ...d, term_id: currentTerm.id, total_paid: 0 }))

      if (toInsert.length > 0) {
        const { error: insErr } = await supabase.from('student_fee_accounts').insert(toInsert)
        if (insErr) throw insErr
      }

      // 5. Update total_owed for already-billed students (preserve total_paid)
      for (const d of billingData.filter(d => existingMap.has(d.student_id))) {
        await supabase
          .from('student_fee_accounts')
          .update({ total_owed: d.total_owed, updated_at: new Date().toISOString() })
          .eq('id', existingMap.get(d.student_id))
      }

      setBilling(prev => ({ ...prev, [cls.id]: students.length }))
      setTimeout(() => setBilling(prev => ({ ...prev, [cls.id]: undefined })), 4000)
    } catch (err) {
      console.error(err)
      setBilling(prev => ({ ...prev, [cls.id]: undefined }))
    }
  }

  const handleDownload = () => {
    const rows = classes.map(cls => {
      const s = structures[cls.id]
      return {
        class_name: cls.name,
        new_tuition: s?.new?.tuition_fee ?? 0,
        new_total: getTotal(s?.new),
        returning_tuition: s?.returning?.tuition_fee ?? 0,
        returning_total: getTotal(s?.returning),
      }
    })
    const doc = generateFeeSchedule({
      rows, termName: currentTerm?.name,
      schoolName: school?.name, annexName: selectedAnnex,
    })
    doc.save(`fee-schedule-${selectedAnnex}-${currentTerm?.name}.pdf`)
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>

  if (!currentTerm) return (
    <div className="text-center py-12 text-gray-400 text-sm">No active term set. Complete school setup first.</div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {currentTerm.name} · {selectedAnnex} Annex
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download size={14} /> Export PDF
        </Button>
      </div>

      <div className="space-y-2">
        {classes.map(cls => {
          const s = structures[cls.id]
          const newTotal       = getTotal(s?.new)
          const returningTotal = getTotal(s?.returning)
          const configured     = s?.new || s?.returning
          const isExpanded     = expandedClass === cls.id

          return (
            <Card key={cls.id} padding={false}>
              <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{cls.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{cls.level}</p>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500">New intake</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {configured ? fmt(newTotal) : <span className="text-gray-300">Not set</span>}
                  </p>
                </div>
                <div className="text-right hidden sm:block mx-4">
                  <p className="text-xs text-gray-500">Returning</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {configured ? fmt(returningTotal) : <span className="text-gray-300">Not set</span>}
                  </p>
                </div>

                {!configured && (
                  <Badge variant="default" className="hidden sm:inline-flex">Not configured</Badge>
                )}

                {configured && billing[cls.id] === 'loading' && (
                  <Button size="sm" variant="outline" disabled>
                    <Spinner size="sm" /> Billing…
                  </Button>
                )}
                {configured && typeof billing[cls.id] === 'number' && (
                  <Badge variant="green">{billing[cls.id]} billed</Badge>
                )}
                {configured && !billing[cls.id] && (
                  <Button
                    size="sm" variant="outline"
                    onClick={e => { e.stopPropagation(); billStudents(cls) }}
                    title="Apply fee structure to all active students in this class"
                  >
                    <Users size={13} /> Bill
                  </Button>
                )}

                <Button
                  size="sm" variant="outline"
                  onClick={e => { e.stopPropagation(); setEditClass(cls) }}
                >
                  <Edit2 size={13} /> Edit
                </Button>

                {isExpanded ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
              </div>

              {/* Expanded levy details */}
              {isExpanded && configured && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {['new', 'returning'].map(type => {
                      const st = s?.[type]
                      if (!st) return null
                      return (
                        <div key={type}>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            {type === 'new' ? 'New Intake' : 'Returning Student'}
                          </p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tuition</span>
                              <span className="font-medium">{fmt(st.tuition_fee)}</span>
                            </div>
                            {st.fee_levies?.map(l => (
                              <div key={l.id} className="flex justify-between text-gray-500">
                                <span>{l.levy_name}</span>
                                <span>{fmt(l.amount)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between border-t border-gray-100 pt-1 font-semibold text-burgundy-700">
                              <span>Total</span>
                              <span>{fmt(getTotal(st))}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {editClass && (
        <FeeEditModal
          cls={editClass}
          existing={structures[editClass.id]}
          termId={currentTerm.id}
          annexId={annexId}
          onClose={() => setEditClass(null)}
          onSaved={() => { setEditClass(null); load() }}
        />
      )}
    </div>
  )
}

// ── Fee Edit Modal ───────────────────────────────────────────
function FeeEditModal({ cls, existing, termId, annexId, onClose, onSaved }) {
  const [newTuition, setNewTuition]       = useState(existing?.new?.tuition_fee ?? '')
  const [retTuition, setRetTuition]       = useState(existing?.returning?.tuition_fee ?? '')
  const [levies, setLevies]               = useState(
    // Pre-populate from 'new' structure if available, else 'returning'
    (existing?.new?.fee_levies ?? existing?.returning?.fee_levies ?? [])
      .map(l => ({ name: l.levy_name, amount: l.amount }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const addLevy   = () => setLevies(ls => [...ls, { name: '', amount: '' }])
  const removeLevy = (i) => setLevies(ls => ls.filter((_, idx) => idx !== i))
  const updateLevy = (i, key, val) => setLevies(ls => ls.map((l, idx) => idx === i ? { ...l, [key]: val } : l))

  const newTotal = Number(newTuition || 0) + levies.reduce((s, l) => s + Number(l.amount || 0), 0)
  const retTotal = Number(retTuition || 0) + levies.reduce((s, l) => s + Number(l.amount || 0), 0)

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      for (const studentType of ['new', 'returning']) {
        const tuition = studentType === 'new' ? newTuition : retTuition

        // Upsert fee structure
        const { data: fs, error: fsErr } = await supabase
          .from('fee_structures')
          .upsert({
            class_id: cls.id, term_id: termId, annex_id: annexId,
            student_type: studentType, tuition_fee: Number(tuition || 0),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'class_id,term_id,annex_id,student_type' })
          .select()
          .single()
        if (fsErr) throw fsErr

        // Replace levies
        await supabase.from('fee_levies').delete().eq('fee_structure_id', fs.id)
        if (levies.length > 0) {
          const validLevies = levies.filter(l => l.name.trim())
          if (validLevies.length > 0) {
            const { error: levyErr } = await supabase.from('fee_levies').insert(
              validLevies.map(l => ({
                fee_structure_id: fs.id,
                levy_name: l.name.trim(),
                amount: Number(l.amount || 0),
              }))
            )
            if (levyErr) throw levyErr
          }
        }
      }
      onSaved()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`${cls.name} — Fee Structure`}
      size="md"
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            New: <strong className="text-gray-800">₦{newTotal.toLocaleString()}</strong>
            <span className="mx-2">·</span>
            Returning: <strong className="text-gray-800">₦{retTotal.toLocaleString()}</strong>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save Fees</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {error && <div className="px-3 py-2 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>}

        {/* Tuition */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Tuition Fee</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="New intake"
              type="number"
              min="0"
              value={newTuition}
              onChange={e => setNewTuition(e.target.value)}
              prefix="₦"
            />
            <Input
              label="Returning student"
              type="number"
              min="0"
              value={retTuition}
              onChange={e => setRetTuition(e.target.value)}
              prefix="₦"
            />
          </div>
        </div>

        {/* Levies */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Levies <span className="font-normal text-gray-400">(same for all students)</span></p>
            <Button size="sm" variant="outline" onClick={addLevy}>
              <Plus size={13} /> Add levy
            </Button>
          </div>
          {levies.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-lg">
              No levies yet. Click "Add levy" to add items like PTA, Development levy, etc.
            </p>
          ) : (
            <div className="space-y-2">
              {levies.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Levy name (e.g. PTA levy)"
                    value={l.name}
                    onChange={e => updateLevy(i, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={l.amount}
                    onChange={e => updateLevy(i, 'amount', e.target.value)}
                    className="w-28"
                    prefix="₦"
                  />
                  <button
                    onClick={() => removeLevy(i)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
