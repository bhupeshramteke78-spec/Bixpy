import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session) {
        const { data: allowed } = await supabase.rpc('is_admin')
        setIsAdmin(Boolean(allowed))
      }
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession) {
        setLoading(true)
        // Run role lookup outside Supabase Auth's callback lock.
        setTimeout(async () => {
          const { data: allowed } = await supabase.rpc('is_admin')
          setIsAdmin(Boolean(allowed))
          setLoading(false)
        }, 0)
      } else {
        setIsAdmin(false)
        setLoading(false)
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const value = useMemo(() => ({ session, user: session?.user ?? null, isAdmin, loading, signOut }), [session, isAdmin, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
