'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setIsLoading } = useUserStore()
    const supabase = createClient()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) throw sessionError

                if (session?.user) {
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    if (!userError && userData) {
                        setUser(userData)
                    } else {
                        setUser(null)
                    }
                } else {
                    setUser(null)
                }
            } catch (error) {
                console.error('Error fetching user:', error)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (userData) setUser(userData)
                else setUser(null)
            } else {
                setUser(null)
            }
            setIsLoading(false)
        })

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [setUser, setIsLoading, supabase])

    return <>{children}</>
}
