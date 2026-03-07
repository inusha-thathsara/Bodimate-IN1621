'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/useUserStore'
import { LayoutDashboard, PlusCircle, Home, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { user, isLoading } = useUserStore()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        } else if (!isLoading && user && user.role !== 'OWNER') {
            router.push('/')
        }
    }, [user, isLoading, router])

    if (isLoading || !user || user.role !== 'OWNER') {
        return <div className="flex-1 flex items-center justify-center min-h-[500px]">Loading dashboard...</div>
    }

    return (
        <div className="flex-1 flex max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-[260px] flex-shrink-0 hidden lg:block">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 sticky top-24">
                    <div className="mb-6 px-4">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Owner Portal</h2>
                    </div>
                    <nav className="space-y-2">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 text-primary font-bold">
                            <LayoutDashboard className="h-5 w-5" />
                            My Listings
                        </Link>
                        <Link href="/dashboard/boardings/new" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
                            <PlusCircle className="h-5 w-5" />
                            Add New Boarding
                        </Link>
                    </nav>

                    <div className="mt-8 pt-8 border-t border-gray-100 px-4">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account</h2>
                        <nav className="space-y-2">
                            <Link href="#" className="flex items-center gap-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                <Settings className="h-5 w-5" />
                                Settings
                            </Link>
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Mobile Nav Header */}
            <div className="lg:hidden w-full flex overflow-x-auto gap-2 pb-4 mb-4 border-b">
                <Link href="/dashboard">
                    <Button variant="secondary" className="bg-primary/5 text-primary">
                        My Listings
                    </Button>
                </Link>
                <Link href="/dashboard/boardings/new">
                    <Button variant="outline">
                        Add New
                    </Button>
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    )
}
