import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LogoSvg from '../../assets/logo.svg'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(form.email.trim(), form.password)
    if (err) {
      setError('Email or password is incorrect.')
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error: err } = await signUp(form.email.trim(), form.password, form.fullName.trim())
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setSuccessMsg('Account created! Check your email to confirm, then sign in below.')
      setMode('signin')
      setForm(f => ({ ...f, password: '', confirmPassword: '', fullName: '' }))
      setLoading(false)
    }
  }

  const switchMode = (m) => { setMode(m); setError(''); setSuccessMsg('') }

  return (
    <div className="min-h-screen bg-gradient-to-br from-burgundy-900 via-burgundy-700 to-burgundy-800 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
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

        {/* Tab switcher */}
        <div className="flex bg-white/10 rounded-xl p-1 mb-4">
          {[['signin','Sign in'],['signup','Create account']].map(([m, label]) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? 'bg-white text-burgundy-700' : 'text-white/70 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {mode === 'signin' ? (
            <>
              <h2 className="text-gray-900 text-lg font-semibold mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm mb-5">Enter your credentials to continue</p>
            </>
          ) : (
            <>
              <h2 className="text-gray-900 text-lg font-semibold mb-1">Create your account</h2>
              <p className="text-gray-500 text-sm mb-5">First time? Set up your access here</p>
            </>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
              {successMsg}
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <Input
                label="Email address" type="email" placeholder="your@email.com"
                value={form.email} onChange={e => set('email', e.target.value)}
                required autoComplete="email" autoFocus
              />
              <PasswordField
                label="Password" value={form.password}
                onChange={e => set('password', e.target.value)}
                show={showPassword} onToggle={() => setShowPassword(s => !s)}
                autoComplete="current-password"
              />
              <Button type="submit" loading={loading} fullWidth size="lg">Sign in</Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <Input
                label="Full name" type="text" placeholder="e.g. Joshua Lasisi"
                value={form.fullName} onChange={e => set('fullName', e.target.value)}
                required autoFocus
              />
              <Input
                label="Email address" type="email" placeholder="your@email.com"
                value={form.email} onChange={e => set('email', e.target.value)}
                required autoComplete="email"
              />
              <PasswordField
                label="Password" value={form.password}
                onChange={e => set('password', e.target.value)}
                show={showPassword} onToggle={() => setShowPassword(s => !s)}
                autoComplete="new-password"
              />
              <PasswordField
                label="Confirm password" value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                show={showPassword} onToggle={() => setShowPassword(s => !s)}
                autoComplete="new-password"
              />
              <Button type="submit" loading={loading} fullWidth size="lg">Create account</Button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">
            {mode === 'signin'
              ? 'Contact your administrator if you cannot access your account.'
              : 'Your role will be assigned automatically based on your email.'}
          </p>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">Achieving Life's Purpose</p>
      </div>
    </div>
  )
}

function PasswordField({ label, value, onChange, show, onToggle, autoComplete }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}<span className="text-red-500 ml-0.5">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          required
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm
            focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}
