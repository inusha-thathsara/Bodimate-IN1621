'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserStore } from '@/store/useUserStore'
import { LayoutDashboard, Compass, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function StudentDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isLoading } = useUserStore()

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login')
            } else if (user.role !== 'STUDENT') {
                router.push('/')
            }
        }
    }, [user, isLoading, router])

    if (isLoading || !user || user.role !== 'STUDENT') {
        return <div className="flex-1 flex items-center justify-center min-h-[500px]">Loading student hub...</div>
    }

    const navItems = [
        {
            label: 'Dashboard',
            href: '/student/dashboard',
            icon: LayoutDashboard,
            exact: true
        },
        {
            label: 'Find Boardings',
            href: '/boardings',
            icon: Compass,
        }
    ]

    const accountItems = [
        {
            label: 'Settings',
            href: '/profile',
            icon: Settings,
        }
    ]

    const isActive = (path: string, exact = false) => {
        if (exact) return pathname === path
        return pathname === path || (path !== '/' && pathname.startsWith(path))
    }

    return (
        <div className="flex-1 flex max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-[260px] flex-shrink-0 hidden lg:block">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 sticky top-24">
                    <div className="mb-6 px-4">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Student Hub</h2>
                    </div>
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const active = isActive(item.href, item.exact)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                                            ? 'bg-primary/10 text-primary font-bold shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-gray-100 px-4">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account</h2>
                        <nav className="space-y-2">
                            {accountItems.map((item) => {
                                const active = isActive(item.href)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 py-2 transition-all duration-200 ${active
                                                ? 'text-primary font-bold'
                                                : 'text-gray-500 hover:text-gray-900 font-medium'
                                            }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Mobile Nav Header */}
            <div className="lg:hidden w-full flex overflow-x-auto gap-2 pb-4 mb-4 border-b">
                {navItems.map((item) => {
                    const active = isActive(item.href, item.exact)
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={active ? "secondary" : "outline"}
                                className={active ? "bg-primary/10 text-primary border-none font-bold" : "text-gray-600 border-gray-200 font-medium"}
                            >
                                {item.label}
                            </Button>
                        </Link>
                    )
                })}
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    )
}

