import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Zap, Eye, EyeOff, ArrowRight, ShieldCheck, User } from 'lucide-react'
import clsx from 'clsx'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', adminKey: '' })
  const [showPass, setShowPass] = useState(false)
  const [showAdminKey, setShowAdminKey] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let data

      if (form.adminKey.trim()) {
        // Try admin registration with the key
        const res = await api.post('/auth/admin/register',
          { name: form.name, email: form.email, password: form.password },
          { headers: { 'X-Admin-Key': form.adminKey.trim() } }
        )
        data = res.data
        toast.success(`Welcome, Admin ${data.user.name}! 🛡️`)
      } else {
        // Normal user registration
        const res = await api.post('/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
        })
        data = res.data
        toast.success(`Account created! Welcome, ${data.user.name}!`)
      }

      login(data.access_token, data.user)
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed'
      if (err.response?.status === 403) {
        toast.error('Invalid admin key. Registered as regular user instead.')
        // Retry as normal user
        try {
          const res = await api.post('/auth/register', {
            name: form.name,
            email: form.email,
            password: form.password,
          })
          login(res.data.access_token, res.data.user)
          navigate('/dashboard')
        } catch (err2) {
          toast.error(err2.response?.data?.detail || 'Registration failed')
        }
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const hasAdminKey = form.adminKey.trim().length > 0

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #b4ff39, transparent)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #4facfe, transparent)' }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-volt-400 mb-4 volt-glow">
            <Zap size={28} className="text-obsidian-950" fill="currentColor" />
          </div>
          <h1 className="font-display text-4xl text-white" style={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
            AssessIQ
          </h1>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        {/* Role indicator */}
        <div className={clsx(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 border text-sm font-mono transition-all duration-300',
          hasAdminKey
            ? 'bg-volt-400/10 border-volt-400/30 text-volt-400'
            : 'bg-white/5 border-white/10 text-gray-500'
        )}>
          {hasAdminKey
            ? <><ShieldCheck size={15} /> Registering as <strong>Admin</strong></>
            : <><User size={15} /> Registering as <strong>Candidate</strong></>
          }
        </div>

        {/* Form card */}
        <div className="glass rounded-3xl p-8">
          <h2 className="font-display text-xl text-white mb-6" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Jane Smith"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="jane@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="input-field pr-12"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-600 text-xs font-mono">OPTIONAL</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Admin Key field */}
            <div>
              <label className="block text-sm mb-1.5 flex items-center gap-1.5">
                <ShieldCheck size={13} className={hasAdminKey ? 'text-volt-400' : 'text-gray-500'} />
                <span className={hasAdminKey ? 'text-volt-400' : 'text-gray-400'}>
                  Admin Key <span className="text-gray-600 text-xs">(leave blank for candidate account)</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showAdminKey ? 'text' : 'password'}
                  className={clsx(
                    'input-field pr-12 transition-all duration-200',
                    hasAdminKey && 'border-volt-400/40 bg-volt-400/5'
                  )}
                  placeholder="Enter admin key if you have one"
                  value={form.adminKey}
                  onChange={e => setForm(p => ({ ...p, adminKey: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminKey(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showAdminKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full flex items-center justify-center gap-2 mt-2 py-3 px-6 rounded-lg font-bold transition-all duration-200 active:scale-95 disabled:opacity-40',
                hasAdminKey
                  ? 'bg-volt-400 text-obsidian-950 hover:bg-volt-500'
                  : 'bg-volt-400 text-obsidian-950 hover:bg-volt-500'
              )}
              style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-obsidian-950/30 border-t-obsidian-950 animate-spin" />
              ) : (
                <>
                  {hasAdminKey ? <ShieldCheck size={16} /> : <ArrowRight size={16} />}
                  {hasAdminKey ? 'Register as Admin' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-volt-400 hover:text-volt-500 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}