import Spinner from './Spinner'

const variants = {
  primary:   'bg-burgundy-700 hover:bg-burgundy-800 text-white shadow-sm',
  secondary: 'bg-gold-500 hover:bg-gold-600 text-white shadow-sm',
  outline:   'border border-burgundy-700 text-burgundy-700 hover:bg-burgundy-50',
  ghost:     'text-burgundy-700 hover:bg-burgundy-50',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm',
}
const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false,
  className = '', fullWidth = false, ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" color={variant === 'outline' || variant === 'ghost' ? 'burgundy' : 'white'} />}
      {children}
    </button>
  )
}
