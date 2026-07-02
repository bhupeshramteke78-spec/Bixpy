import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { requireSupabase } from '../lib/supabase'

export default function ProtectedDelivery({children}){
  const {user,isAdmin,loading}=useAuth()
  const location=useLocation()
  const [allowed,setAllowed]=useState(null)
  const [message,setMessage]=useState('')

  useEffect(()=>{
    let current=true
    if(loading){setAllowed(null);return()=>{current=false}}
    if(!user||isAdmin){setAllowed(false);return()=>{current=false}}
    setAllowed(null);setMessage('')
    requireSupabase().rpc('is_delivery_user').then(({data,error})=>{
      if(!current)return
      setAllowed(Boolean(data)&&!error)
      if(error)setMessage(error.code==='PGRST202'?'Delivery access is not configured yet. Run the manual delivery SQL.':error.message)
      else if(!data)setMessage('This account is not registered as an active delivery partner.')
    })
    return()=>{current=false}
  },[user,isAdmin,loading])

  if(loading||allowed===null)return <div className="grid min-h-screen place-items-center bg-[#11110f] text-sm text-amber-300">Checking delivery access…</div>
  if(!user)return <Navigate to="/delivery/login" replace state={{from:location.pathname}}/>
  if(isAdmin)return <Navigate to="/admin" replace/>
  return allowed?children:<Navigate to="/delivery/login" replace state={{message}}/>
}
