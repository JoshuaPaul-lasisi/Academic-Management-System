const variants = {
  default:   'bg-gray-100 text-gray-700',
  burgundy:  'bg-burgundy-100 text-burgundy-800',
  gold:      'bg-gold-100 text-gold-800',
  green:     'bg-green-100 text-green-800',
  red:       'bg-red-100 text-red-800',
  blue:      'bg-blue-100 text-blue-800',
  orange:    'bg-orange-100 text-orange-800',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
