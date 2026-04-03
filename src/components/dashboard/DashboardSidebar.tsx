'use client'

import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function DashboardSidebar() {
    const pathname = usePathname()

    const navItems = [
        {
            label: 'My Listings',
            href: '/dashboard',
            icon: LayoutDashboard,
            exact: true
        },
        {
            label: 'Add New Boarding',
            href: '/dashboard/boardings/new',
            icon: PlusCircle,
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
        return pathname.startsWith(path)
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-full lg:w-[260px] flex-shrink-0 hidden lg:block">
                <div className="bg-card text-card-foreground rounded-2xl p-4 shadow-sm border border-border sticky top-24">
                    <div className="mb-6 px-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Owner Portal</h2>
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
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground font-medium'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-border px-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Account</h2>
                        <nav className="space-y-2">
                            {accountItems.map((item) => {
                                const active = isActive(item.href)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 py-2 transition-all duration-200 ${active
                                                ? 'text-primary font-bold'
                                                : 'text-muted-foreground hover:text-foreground font-medium'
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
            <div className="lg:hidden w-full flex overflow-x-auto gap-2 pb-4 mb-4 border-b border-border">
                {navItems.map((item) => {
                    const active = isActive(item.href, item.exact)
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={active ? "secondary" : "outline"}
                                className={active ? "bg-primary/10 text-primary border-none font-bold" : "text-muted-foreground border-border font-medium"}
                            >
                                {item.label}
                            </Button>
                        </Link>
                    )
                })}
            </div>
        </>
    )
}
