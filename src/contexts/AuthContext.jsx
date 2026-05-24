import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../lib/store'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [schoolSetup, setSchoolSetup] = useState(null) // null = loading, false = not done, true = done
  const [loading, setLoading] = useState(true)

  const { setSchool, setCurrentSession, setCurrentTerm, setClasses, setAnnexes, clearStore } = useAppStore()

  const loadAppData = useCallback(async () => {
    try {
      const [schoolRes, sessionRes, classesRes, annexesRes] = await Promise.all([
        supabase.from('schools').select('*').limit(1).maybeSingle(),
        supabase.from('academic_sessions').select('*, terms(*)').eq('is_current', true).maybeSingle(),
        supabase.from('classes').select('*').order('sort_order'),
        supabase.from('annexes').select('*'),
      ])

      if (schoolRes.data) {
        setSchool(schoolRes.data)
        setSchoolSetup(schoolRes.data.setup_complete)
      } else {
        setSchoolSetup(false)
      }

      if (sessionRes.data) {
        setCurrentSession(sessionRes.data)
        const currentTerm = sessionRes.data.terms?.find(t => t.is_current)
        if (currentTerm) setCurrentTerm(currentTerm)
      }

      if (classesRes.data) setClasses(classesRes.data)
      if (annexesRes.data) setAnnexes(annexesRes.data)
    } catch (err) {
      console.error('loadAppData error:', err)
      setSchoolSetup(false)
    }
  }, [setSchool, setCurrentSession, setCurrentTerm, setClasses, setAnnexes])

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) console.error('fetchProfile error:', error)
    setProfile(data ?? null)
    return data
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          await Promise.all([fetchProfile(session.user.id), loadAppData()])
        } catch (err) {
          console.error('Session load error:', err)
          setSchoolSetup(false)
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await Promise.all([fetchProfile(session.user.id), loadAppData()])
      } else {
        setProfile(null)
        clearStore()
        setSchoolSetup(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile, loadAppData, clearStore])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = (email, password, fullName) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = () => user && fetchProfile(user.id)
  const refreshAppData = () => loadAppData()

  return (
    <AuthContext.Provider value={{
      user, profile, schoolSetup, loading,
      signIn, signUp, signOut,
      refreshProfile, refreshAppData,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
