import { Construction } from 'lucide-react'

export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-burgundy-50 rounded-2xl flex items-center justify-center mb-4">
        <Construction size={28} className="text-burgundy-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-sm text-gray-400 max-w-xs">
        This module is being built. Check back in the next update.
      </p>
    </div>
  )
}
