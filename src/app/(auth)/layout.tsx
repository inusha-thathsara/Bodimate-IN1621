import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        // Fetch user role to determine where to redirect
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role === 'OWNER') {
            redirect('/dashboard')
        } else if (userData?.role === 'STUDENT') {
            redirect('/student/dashboard')
        } else {
            redirect('/') // Fallback
        }
    }

    // If not authenticated, allow access to the auth pages (login/register)
    return <>{children}</>
}
