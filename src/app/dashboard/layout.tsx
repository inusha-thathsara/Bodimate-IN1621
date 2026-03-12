import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({
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
        .select('role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'OWNER') {
        redirect('/')
    }

    return (
        <div className="flex-1 flex flex-col lg:flex-row max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 gap-4 lg:gap-8">
            <DashboardSidebar />

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    )
}
