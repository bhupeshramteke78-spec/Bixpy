import { Mail } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase'

export default function ForgotPassword(){const [email,setEmail]=useState('');const [loading,setLoading]=useState(false);const [sent,setSent]=useState(false);async function submit(event){event.preventDefault();setLoading(true);try{const {error}=await requireSupabase().auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/auth/reset-password`});if(error)throw error;setSent(true)}catch(error){toast.error(error.message)}finally{setLoading(false)}}return <AuthShell title={sent?'Check your inbox':'Reset your password'} text={sent?'If an account exists for that email, Supabase has sent a secure reset link.':'Enter the email used for your customer account.'}>{sent?<Link to="/customer/login" className="btn-primary w-full">Return to login</Link>:<form onSubmit={submit} className="space-y-5"><label><span className="label">Email</span><div className="relative"><Mail className="absolute left-4 top-3.5 text-muted" size={17}/><input required type="email" autoComplete="email" className="input pl-11" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div></label><button disabled={loading||!isSupabaseConfigured} className="btn-primary w-full">{loading?'Sending link…':'Send reset link'}</button></form>}</AuthShell>}
