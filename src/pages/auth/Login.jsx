import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LogoSvg from '../../assets/logo.svg'

export default function Login() {
  const { signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(form.email.trim(), form.password)
    if (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email or password is incorrect.'
        : err.message)
      setLoading(false)
    }
    // On success, AuthContext updates and App re-routes automatically
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-burgundy-900 via-burgundy-700 to-burgundy-800 flex flex-col items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px'
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <img src={LogoSvg} alt="Debbyfield Schools" className="h-20 w-auto brightness-0 invert" />
          </div>
          <h1 className="text-white font-serif text-2xl font-bold tracking-wide">DEBBYFIELD SCHOOLS</h1>
          <p className="text-gold-400 text-sm mt-1 tracking-wider font-light">Management System</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-gray-900 text-lg font-semibold mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm mb-5">Enter your credentials to continue</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
              autoFocus
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Password<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm
                    focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Sign in
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Contact your administrator if you cannot access your account.
          </p>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Achieving Life's Purpose
        </p>
      </div>
    </div>
  )
}
