export default function Card({ children, className = '', padding = true, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-card border border-gray-100
        ${padding ? 'p-4 md:p-5' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-2 flex-shrink-0">{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, color = 'burgundy', sub }) {
  const colors = {
    burgundy: 'bg-burgundy-50 text-burgundy-700',
    gold:     'bg-gold-50 text-gold-600',
    green:    'bg-green-50 text-green-700',
    blue:     'bg-blue-50 text-blue-700',
    orange:   'bg-orange-50 text-orange-700',
  }
  return (
    <Card className="flex items-center gap-4">
      {Icon && (
        <div className={`p-3 rounded-lg ${colors[color]} flex-shrink-0`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </Card>
  )
}
