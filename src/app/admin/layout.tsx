import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    const { data: userData } = await supabase
        .from('users')
        .select('role, full_name, email')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'ADMIN') {
        if (userData?.role === 'OWNER') {
            redirect('/dashboard')
        }

        if (userData?.role === 'STUDENT') {
            redirect('/student/dashboard')
        }

        redirect('/')
    }

    return (
        <div className="flex-1 bg-background">
            <AdminTopbar
                userId={user.id}
                email={userData?.email || user.email || ''}
                fullName={userData?.full_name || null}
            />
            {children}
        </div>
    )
}
