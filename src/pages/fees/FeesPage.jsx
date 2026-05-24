import { useState } from 'react'
import FeeSchedule from './FeeSchedule'
import PaymentsTab from './PaymentsTab'
import OutstandingTab from './OutstandingTab'
import { useAppStore } from '../../lib/store'

const TABS = [
  { id: 'schedule',    label: 'Fee Schedule' },
  { id: 'payments',   label: 'Payments' },
  { id: 'outstanding',label: 'Outstanding' },
]

export default function FeesPage() {
  const [active, setActive] = useState('schedule')
  const { currentTerm, selectedAnnex } = useAppStore()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {currentTerm?.name ?? 'No active term'} · {selectedAnnex} Annex
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
              active === tab.id
                ? 'bg-white text-burgundy-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'schedule'    && <FeeSchedule />}
      {active === 'payments'    && <PaymentsTab />}
      {active === 'outstanding' && <OutstandingTab />}
    </div>
  )
}
