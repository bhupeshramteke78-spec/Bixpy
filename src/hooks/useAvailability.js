import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAvailability(date, time) {
  const [statuses, setStatuses] = useState({}); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const load = useCallback(async () => {
    if (!supabase || !date || !time) { setStatuses({}); return }
    setLoading(true); setError('')
    const { data, error: queryError } = await supabase.rpc('get_table_availability', { p_date: date, p_time: time })
    if (queryError) setError(queryError.message)
    else setStatuses(Object.fromEntries((data || []).map(row => [row.table_number, row.table_status])))
    setLoading(false)
  }, [date, time])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!supabase || !date || !time) return
    const channel = supabase.channel(`availability:${date}:${time}`).on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, payload => {
      const row = payload.new?.booking_date ? payload.new : payload.old
      if (row?.booking_date === date && row?.booking_time?.slice(0,5) === time) load()
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [date, time, load])
  return { statuses, loading, error, refresh: load }
}
