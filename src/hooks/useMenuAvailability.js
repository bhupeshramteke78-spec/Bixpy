import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { orderMenuItems } from '../data/orderMenu'
import { supabase } from '../lib/supabase'

const allAvailable = Object.fromEntries(orderMenuItems.map(item => [item.id, true]))

export function useMenuAvailability() {
  const instanceId=useId().replace(/:/g,'')
  const [availability,setAvailability] = useState(allAvailable)
  const [loading,setLoading] = useState(Boolean(supabase))
  const [error,setError] = useState('')

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true); setError('')
    const {data,error:queryError}=await supabase.from('menu_items').select('product_id,is_available')
    if (queryError) {
      setError(queryError.message)
      setAvailability(allAvailable)
    } else {
      const next=Object.fromEntries(orderMenuItems.map(item=>[item.id,false]))
      for(const item of data||[]) next[item.product_id]=item.is_available !== false
      setAvailability(next)
    }
    setLoading(false)
  },[])

  useEffect(()=>{
    load()
    if(!supabase)return undefined
    const onFocus=()=>load()
    window.addEventListener('focus',onFocus)
    const channel=supabase.channel(`customer-menu-availability-${instanceId}`).on('postgres_changes',{event:'UPDATE',schema:'public',table:'menu_items'},()=>load()).subscribe()
    return()=>{window.removeEventListener('focus',onFocus);supabase.removeChannel(channel)}
  },[load,instanceId])

  const unavailableIds=useMemo(()=>new Set(Object.entries(availability).filter(([,available])=>!available).map(([id])=>id)),[availability])
  const isItemAvailable=useCallback(id=>availability[id] !== false,[availability])
  return {availability,unavailableIds,isItemAvailable,loading,error,refresh:load}
}
