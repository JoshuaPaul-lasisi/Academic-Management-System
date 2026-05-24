import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users, GraduationCap, CreditCard, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

const levelColors = {
  nursery:   'gold',
  primary:   'burgundy',
  secondary: 'blue',
}

function Avatar({ name, photoUrl, size = 'md' }) {
  const s = size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
  if (photoUrl) return <img src={photoUrl} alt={name} className={`${s} rounded-full object-cover flex-shrink-0`} />
  return (
    <div className={`${s} rounded-full bg-burgundy-100 text-burgundy-700 font-bold flex items-center justify-center flex-shrink-0`}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export { Avatar }

export default function StudentsPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { currentTerm, classes, annexes, selectedAnnex, school } = useAppStore()

  const [students,   setStudents]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filterClass,setFilterClass]= useState('all')
  const [tab,        setTab]        = useState('active') // 'active' | 'alumni'
  const [applying,   setApplying]   = useState(false)

  const annexObj = annexes.find(a => a.name === selectedAnnex)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let q = supabase
        .from('students')
        .select('*, classes(id,name,level), annexes(name)')
        .eq('is_alumni', tab === 'alumni')
        .order('last_name')

      if (annexObj) q = q.eq('annex_id', annexObj.id)
      if (filterClass !== 'all') q = q.eq('class_id', filterClass)
      if (search.trim().length >= 2) {
        q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,admission_number.ilike.%${search}%`)
      }

      const { data } = await q
      setStudents(data ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [annexObj, filterClass, search, tab])

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  // Bulk apply term fees to all active students
  const applyTermFees = async () => {
    if (!currentTerm || !annexObj) return
    setApplying(true)
    try {
      const { data: allStudents } = await supabase
        .from('students')
        .select('id, class_id, annex_id, student_type')
        .eq('is_active', true)
        .eq('is_alumni', false)
        .eq('annex_id', annexObj.id)

      const { data: feeStructures } = await supabase
        .from('fee_structures')
        .select('*, fee_levies(*)')
        .eq('term_id', currentTerm.id)
        .eq('annex_id', annexObj.id)

      const getTotal = (fs) => {
        if (!fs) return 0
        const levies = fs.fee_levies?.reduce((s, l) => s + Number(l.amount || 0), 0) ?? 0
        return Number(fs.tuition_fee || 0) + levies
      }

      const accounts = []
      for (const s of allStudents ?? []) {
        const fs = feeStructures?.find(
          f => f.class_id === s.class_id && f.student_type === (s.student_type ?? 'returning')
        )
        const total = getTotal(fs)
        if (total > 0) {
          accounts.push({ student_id: s.id, term_id: currentTerm.id, total_owed: total, total_paid: 0 })
        }
      }

      if (accounts.length > 0) {
        await supabase.from('student_fee_accounts').upsert(accounts, { onConflict: 'student_id,term_id', ignoreDuplicates: true })
      }
      alert(`Fee accounts applied to ${accounts.length} students.`)
    } catch (err) {
      console.error(err)
      alert('Failed to apply fees: ' + err.message)
    } finally {
      setApplying(false)
    }
  }

  const canEdit = ['director','principal'].includes(profile?.role)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">{selectedAnnex} Annex · {students.length} shown</p>
        </div>
        {canEdit && (
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={applyTermFees} loading={applying} title="Create fee accounts for all students">
              <CreditCard size={14} /> Apply Fees
            </Button>
            <Button size="sm" onClick={() => navigate('/students/new')}>
              <Plus size={14} /> Add Student
            </Button>
          </div>
        )}
      </div>

      {/* Active / Alumni toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[['active','Active'],['alumni','Alumni']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === v ? 'bg-white text-burgundy-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >{l}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search name or admission no…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy-700"
          />
        </div>
        <Select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-36">
          <option value="all">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : students.length === 0 ? (
        <Card className="text-center py-12">
          <Users size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {tab === 'alumni' ? 'No alumni records found' : 'No students found'}
          </p>
          {canEdit && tab === 'active' && (
            <Button className="mt-4" size="sm" onClick={() => navigate('/students/new')}>
              <Plus size={14} /> Enrol first student
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-2">
          {students.map(s => (
            <Card
              key={s.id} padding={false}
              onClick={() => navigate(`/students/${s.id}`)}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 p-3">
                <Avatar
                  name={s.first_name}
                  photoUrl={s.photo_url}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {s.first_name} {s.middle_name ? s.middle_name + ' ' : ''}{s.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {s.admission_number} · {s.classes?.name}
                    {tab === 'alumni' && s.alumni_exit_year && ` · Class of ${s.alumni_exit_year}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={levelColors[s.classes?.level] ?? 'default'}>
                    {s.classes?.name}
                  </Badge>
                  {tab === 'active' && (
                    <Badge variant={s.student_type === 'new' ? 'gold' : 'default'}>
                      {s.student_type === 'new' ? 'New' : 'Returning'}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
