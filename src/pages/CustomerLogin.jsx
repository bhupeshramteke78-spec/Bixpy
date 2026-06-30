import { LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase'

export default function CustomerLogin() {
  const { user, isAdmin, loading: sessionLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.from || '/account'
  const loginNotice = location.state?.message || ''

  if (!sessionLoading && user) return <Navigate to={isAdmin ? '/admin' : returnTo} replace />

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const client = requireSupabase()
      const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
      const { data: admin } = await client.rpc('is_admin')
      if (admin) {
        await client.auth.signOut()
        throw new Error('This is an administrator account. Please use Admin Login.')
      }
      toast.success('Welcome back!')
      navigate(returnTo, { replace: true })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return <AuthShell title="Welcome back" text="Sign in to manage your Corn Bite customer account." footer={<>New to Corn Bite? <Link className="font-semibold text-lime hover:underline" to="/customer/signup">Create an account</Link></>}>
    <>
      {loginNotice && <div className="mb-5 rounded-xl border border-lime/20 bg-lime/[.06] p-4 text-sm text-lime">{loginNotice}</div>}
      <form onSubmit={submit} className="space-y-5">
        <label><span className="label">Email</span><div className="relative"><Mail className="absolute left-4 top-3.5 text-muted" size={17} /><input required autoComplete="email" type="email" className="input pl-11" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div></label>
        <label><span className="label">Password</span><div className="relative"><LockKeyhole className="absolute left-4 top-3.5 text-muted" size={17} /><input required autoComplete="current-password" type="password" className="input pl-11" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div></label>
        <div className="text-right"><Link to="/auth/forgot-password" className="text-xs text-muted hover:text-lime">Forgot password?</Link></div>
        <button disabled={loading || !isSupabaseConfigured} className="btn-primary w-full">{loading ? 'Signing in…' : 'Customer Login'}</button>
      </form>
    </>
  </AuthShell>
}
