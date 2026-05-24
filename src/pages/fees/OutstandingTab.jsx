import { useState, useEffect, useCallback } from 'react'
import { Download, Filter, AlertCircle, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import { generateOutstandingReport, generateInvoice } from '../../lib/pdf'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`

export default function OutstandingTab() {
  const { currentTerm, classes, annexes, selectedAnnex, school } = useAppStore()
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterClass, setFilterClass] = useState('all')
  const [invoiceStudent, setInvoiceStudent] = useState(null)

  const annexObj = annexes.find(a => a.name === selectedAnnex)

  const load = useCallback(async () => {
    if (!currentTerm) { setLoading(false); return }
    setLoading(true)
    try {
      let q = supabase
        .from('student_fee_accounts')
        .select(`
          *,
          students(
            id, first_name, last_name, admission_number, student_type,
            classes(id, name),
            annexes(name)
          )
        `)
        .eq('term_id', currentTerm.id)

      if (annexObj) {
        q = q.eq('students.annex_id', annexObj.id)
      }

      const { data } = await q
      let filtered = (data ?? []).filter(r => r.students)

      if (filterClass !== 'all') {
        filtered = filtered.filter(r => r.students.classes?.id === filterClass)
      }

      setRows(filtered.map(r => ({
        id: r.id,
        studentId: r.students.id,
        name: `${r.students.first_name} ${r.students.last_name}`,
        admission_number: r.students.admission_number,
        class_name: r.students.classes?.name,
        class_id: r.students.classes?.id,
        annex_name: r.students.annexes?.name,
        student_type: r.students.student_type,
        total_owed: Number(r.total_owed),
        total_paid: Number(r.total_paid),
        balance: Number(r.total_owed) - Number(r.total_paid),
        raw: r,
      })).sort((a, b) => b.balance - a.balance))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [currentTerm, annexObj, filterClass])

  useEffect(() => { load() }, [load])

  const outstanding = rows.filter(r => r.balance > 0)
  const totalOut    = outstanding.reduce((s, r) => s + r.balance, 0)

  const downloadReport = () => {
    if (outstanding.length === 0) return
    const doc = generateOutstandingReport({
      rows: outstanding,
      filters: filterClass !== 'all'
        ? classes.find(c => c.id === filterClass)?.name
        : 'All Classes',
      schoolName: school?.name,
      annexName: selectedAnnex,
      termName: currentTerm?.name,
    })
    doc.save(`outstanding-${selectedAnnex}-${currentTerm?.name}.pdf`)
  }

  const openInvoice = async (row) => {
    // Load full student + fee structure for invoice
    const { data: student } = await supabase
      .from('students')
      .select('*, classes(name), annexes(name)')
      .eq('id', row.studentId)
      .single()

    const { data: feeStruct } = await supabase
      .from('fee_structures')
      .select('*, fee_levies(*)')
      .eq('class_id', student.classes?.id ?? row.class_id)
      .eq('term_id', currentTerm.id)
      .eq('student_type', student.student_type ?? 'returning')
      .maybeSingle()

    const feeItems = feeStruct ? [
      { name: 'Tuition Fee', amount: feeStruct.tuition_fee },
      ...(feeStruct.fee_levies ?? []).map(l => ({ name: l.levy_name, amount: l.amount })),
    ] : [{ name: 'Fees', amount: row.total_owed }]

    const doc = generateInvoice({
      student,
      feeItems,
      totalOwed: row.total_owed,
      totalPaid: row.total_paid,
      schoolName: school?.name,
      annexName: student.annexes?.name ?? selectedAnnex,
      termName: currentTerm?.name,
    })
    window.open(URL.createObjectURL(doc.output('blob')), '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Summary + filters */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center col-span-1">
          <p className="text-xl font-bold text-gray-900">{rows.length}</p>
          <p className="text-xs text-gray-500">Billed students</p>
        </Card>
        <Card className="text-center col-span-1">
          <p className="text-xl font-bold text-red-600">{outstanding.length}</p>
          <p className="text-xs text-gray-500">With balance</p>
        </Card>
        <Card className="text-center col-span-1">
          <p className="text-lg font-bold text-red-700">{fmt(totalOut)}</p>
          <p className="text-xs text-gray-500">Total outstanding</p>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
          className="flex-1 max-w-xs"
        >
          <option value="all">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Button variant="outline" size="sm" onClick={downloadReport} disabled={outstanding.length === 0}>
          <Download size={14} /> Export PDF
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : rows.length === 0 ? (
        <Card className="text-center py-12">
          <AlertCircle size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No fee accounts found for this term</p>
          <p className="text-xs text-gray-400 mt-1">Apply fees to students from the Fee Schedule tab or enrol students first.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {rows.map(row => (
            <Card key={row.id} padding={false}>
              <div className="flex items-center gap-3 p-3">
                <div className={`w-2 self-stretch rounded-full flex-shrink-0 ${row.balance > 0 ? 'bg-red-400' : 'bg-green-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                  <p className="text-xs text-gray-500">{row.class_name} · {row.admission_number}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400">Billed / Paid</p>
                  <p className="text-xs text-gray-600">{fmt(row.total_owed)} / {fmt(row.total_paid)}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  {row.balance > 0 ? (
                    <p className="text-sm font-bold text-red-600">{fmt(row.balance)}</p>
                  ) : (
                    <Badge variant="green">Paid</Badge>
                  )}
                </div>
                <button
                  onClick={() => openInvoice(row)}
                  className="p-2 text-gray-300 hover:text-burgundy-700 transition-colors flex-shrink-0"
                  title="View invoice"
                >
                  <FileText size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
