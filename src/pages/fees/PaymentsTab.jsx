import { useState, useEffect, useCallback } from 'react'
import { Search, Receipt, User, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import { useAuth } from '../../contexts/AuthContext'
import { PAYMENT_METHODS } from '../../lib/constants'
import { generateReceipt } from '../../lib/pdf'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`

function genReceiptNumber() {
  const now = new Date()
  const yy  = now.getFullYear().toString().slice(-2)
  const mm  = String(now.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `REC-${yy}${mm}-${rand}`
}

// ── Student search ───────────────────────────────────────────
function StudentSearch({ onSelect, annexId }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase
        .from('students')
        .select('id, first_name, last_name, admission_number, classes(name), annex_id')
        .eq('is_active', true)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,admission_number.ilike.%${query}%`)
        .limit(8)
      setResults(data ?? [])
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="relative">
      <Input
        label="Search student"
        placeholder="Type name or admission number…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        required
      />
      {searching && (
        <div className="absolute right-3 top-9"><Spinner size="sm" /></div>
      )}
      {results.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-52 overflow-y-auto">
          {results.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => { onSelect(s); setQuery(''); setResults([]) }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-burgundy-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-burgundy-100 flex items-center justify-center text-burgundy-700 text-xs font-bold flex-shrink-0">
                {s.first_name?.[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{s.first_name} {s.last_name}</p>
                <p className="text-xs text-gray-500">{s.classes?.name} · {s.admission_number}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Record Payment Modal ─────────────────────────────────────
function RecordPaymentModal({ onClose, onSaved, preselectedStudent }) {
  const { profile } = useAuth()
  const { currentTerm, annexes, selectedAnnex, school } = useAppStore()

  const [student, setStudent]   = useState(preselectedStudent ?? null)
  const [feeAccount, setFeeAccount] = useState(null)
  const [amount, setAmount]     = useState('')
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [method, setMethod]     = useState('Cash')
  const [notes, setNotes]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const loadFeeAccount = useCallback(async (s) => {
    if (!s || !currentTerm) return
    const { data } = await supabase
      .from('student_fee_accounts')
      .select('*')
      .eq('student_id', s.id)
      .eq('term_id', currentTerm.id)
      .maybeSingle()
    setFeeAccount(data)
    if (data) {
      const balance = Number(data.total_owed) - Number(data.total_paid)
      if (balance > 0) setAmount(balance.toString())
    }
  }, [currentTerm])

  useEffect(() => {
    if (student) loadFeeAccount(student)
  }, [student, loadFeeAccount])

  const handleSelectStudent = (s) => {
    setStudent(s)
    setFeeAccount(null)
    setAmount('')
  }

  const save = async () => {
    if (!student || !amount || Number(amount) <= 0) {
      setError('Please select a student and enter a valid amount.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const receiptNumber = genReceiptNumber()

      // Insert payment
      const { data: payment, error: payErr } = await supabase
        .from('fee_payments')
        .insert({
          student_id: student.id,
          term_id: currentTerm?.id,
          amount: Number(amount),
          payment_date: date,
          payment_method: method,
          recorded_by: profile?.id,
          receipt_number: receiptNumber,
          notes: notes || null,
        })
        .select()
        .single()
      if (payErr) throw payErr

      // Update or create fee account
      if (feeAccount) {
        await supabase
          .from('student_fee_accounts')
          .update({
            total_paid: Number(feeAccount.total_paid) + Number(amount),
            updated_at: new Date().toISOString(),
          })
          .eq('id', feeAccount.id)
      } else {
        // Create a basic fee account if none exists
        await supabase.from('student_fee_accounts').upsert({
          student_id: student.id,
          term_id: currentTerm?.id,
          total_owed: 0,
          total_paid: Number(amount),
        }, { onConflict: 'student_id,term_id' })
      }

      // Generate and open receipt PDF
      const annex = annexes.find(a => a.id === student.annex_id) ?? { name: selectedAnnex }
      const doc = generateReceipt({
        payment: { ...payment },
        student,
        schoolName: school?.name,
        annexName: annex.name,
        termName: currentTerm?.name,
        recordedBy: profile?.full_name,
      })
      window.open(URL.createObjectURL(doc.output('blob')), '_blank')

      onSaved()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to record payment.')
      setSaving(false)
    }
  }

  const balance = feeAccount ? Number(feeAccount.total_owed) - Number(feeAccount.total_paid) : null

  return (
    <Modal open onClose={onClose} title="Record Payment" size="md"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving} fullWidth>
            <Receipt size={15} /> Save & Generate Receipt
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <div className="px-3 py-2 rounded-lg bg-red-50 text-sm text-red-700">{error}</div>}

        {/* Student */}
        {!student ? (
          <StudentSearch onSelect={handleSelectStudent} />
        ) : (
          <div className="flex items-center gap-3 p-3 bg-burgundy-50 rounded-xl border border-burgundy-100">
            <div className="w-10 h-10 rounded-full bg-burgundy-200 flex items-center justify-center text-burgundy-800 font-bold flex-shrink-0">
              {student.first_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{student.first_name} {student.last_name}</p>
              <p className="text-xs text-gray-500">{student.classes?.name} · {student.admission_number}</p>
            </div>
            <button onClick={() => { setStudent(null); setFeeAccount(null); setAmount('') }}
              className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
        )}

        {/* Fee account summary */}
        {feeAccount && (
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Total Billed', val: fmt(feeAccount.total_owed), color: 'text-gray-700' },
              { label: 'Paid',         val: fmt(feeAccount.total_paid), color: 'text-green-700' },
              { label: 'Balance',      val: fmt(balance),               color: balance > 0 ? 'text-red-600' : 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-2">
                <p className={`text-sm font-bold ${s.color}`}>{s.val}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {!feeAccount && student && (
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            No fee account found for this student this term. Payment will still be recorded.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount" type="number" min="1" prefix="₦"
            value={amount} onChange={e => setAmount(e.target.value)} required
          />
          <Input
            label="Date" type="date"
            value={date} onChange={e => setDate(e.target.value)} required
          />
        </div>

        <Select label="Payment method" value={method} onChange={e => setMethod(e.target.value)}>
          {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
        </Select>

        <Input
          label="Notes (optional)" placeholder="e.g. Part payment, cheque no."
          value={notes} onChange={e => setNotes(e.target.value)}
        />
      </div>
    </Modal>
  )
}

// ── Main Payments Tab ────────────────────────────────────────
export default function PaymentsTab() {
  const { currentTerm } = useAppStore()
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async () => {
    if (!currentTerm) { setLoading(false); return }
    setLoading(true)
    try {
      const { data } = await supabase
        .from('fee_payments')
        .select('*, students(first_name, last_name, admission_number, classes(name)), profiles(full_name)')
        .eq('term_id', currentTerm.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setPayments(data ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [currentTerm])

  useEffect(() => { load() }, [load])

  const methodBadge = { Cash: 'green', 'Bank Transfer': 'blue', POS: 'gold', Cheque: 'orange' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{payments.length} payments this term</p>
        <Button onClick={() => setShowModal(true)}>
          <Receipt size={15} /> Record Payment
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : payments.length === 0 ? (
        <Card className="text-center py-12">
          <Receipt size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No payments recorded yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Record Payment" to add one</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {payments.map(p => (
            <Card key={p.id} padding={false}>
              <div className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Receipt size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {p.students?.first_name} {p.students?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.students?.classes?.name} · {p.receipt_number}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-green-700">₦{Number(p.amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{p.payment_date}</p>
                </div>
                <Badge variant={methodBadge[p.payment_method] ?? 'default'} className="hidden sm:inline-flex">
                  {p.payment_method}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <RecordPaymentModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}
