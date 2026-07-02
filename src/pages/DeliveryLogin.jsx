import { Bike, LockKeyhole, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase'

export default function DeliveryLogin(){
  const {user,isAdmin,loading:sessionLoading,signOut}=useAuth()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [checking,setChecking]=useState(Boolean(user))
  const [denied,setDenied]=useState(false)
  const navigate=useNavigate()
  const location=useLocation()

  useEffect(()=>{
    let current=true
    if(!user||isAdmin){setChecking(false);return()=>{current=false}}
    setChecking(true)
    requireSupabase().rpc('is_delivery_user').then(({data})=>{
      if(!current)return
      if(data)navigate('/delivery',{replace:true})
      else{setDenied(true);setChecking(false)}
    })
    return()=>{current=false}
  },[user,isAdmin,navigate])

  if(!sessionLoading&&isAdmin)return <Navigate to="/admin" replace/>

  async function submit(event){
    event.preventDefault();setLoading(true)
    try{
      const client=requireSupabase()
      const {error}=await client.auth.signInWithPassword({email:email.trim(),password})
      if(error)throw error
      const {data:allowed,error:roleError}=await client.rpc('is_delivery_user')
      if(roleError||!allowed){await client.auth.signOut();throw new Error(roleError?.code==='PGRST202'?'Delivery access is not configured yet. Run the manual delivery SQL.':'This account is not registered as an active delivery partner.')}
      toast.success('Delivery partner access confirmed.')
      navigate('/delivery',{replace:true})
    }catch(error){toast.error(error.message)}finally{setLoading(false)}
  }

  if(sessionLoading||checking)return <div className="grid min-h-screen place-items-center bg-[#11110f] text-sm text-amber-300">Checking delivery access…</div>
  if(user&&denied)return <AuthShell eyebrow="Delivery partner" title="Access not available" text={location.state?.message||'This signed-in account is not registered as an active delivery partner.'}><div className="space-y-3"><button onClick={signOut} className="btn-warm w-full">Use another account</button><Link to="/" className="btn-ghost w-full">Return to restaurant</Link></div></AuthShell>

  return <AuthShell eyebrow="Delivery partner" title="Delivery login" text="Sign in with the Supabase account authorized by the restaurant for delivery operations."><form onSubmit={submit} className="space-y-5"><div className="mb-7 flex items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-4 text-sm text-amber-200"><Bike size={20}/>Ready orders, pickup, and delivery updates.</div><label><span className="label">Email</span><div className="relative"><Mail className="absolute left-4 top-3.5 text-muted" size={17}/><input required type="email" autoComplete="email" className="input pl-11" value={email} onChange={event=>setEmail(event.target.value)} placeholder="partner@example.com"/></div></label><label><span className="label">Password</span><div className="relative"><LockKeyhole className="absolute left-4 top-3.5 text-muted" size={17}/><input required type="password" autoComplete="current-password" className="input pl-11" value={password} onChange={event=>setPassword(event.target.value)} placeholder="••••••••"/></div></label><button disabled={loading||!isSupabaseConfigured} className="btn-warm w-full">{loading?'Verifying…':'Open Delivery Panel'}</button></form></AuthShell>
}
