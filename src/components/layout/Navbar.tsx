'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Search, Bell, Menu, LogOut, LayoutDashboard, UserCog, MapPin, Wallet, Ruler, ChevronDown, Check, MessageSquareMore, ClipboardCheck, Bookmark, RefreshCcw } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { createClient } from '@/lib/supabase/client'
import { getNotificationsByUser, markAllNotificationsRead, markNotificationRead } from '@/lib/api'
import { Database } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

export function Navbar() {
    const { user, setUser } = useUserStore()
    const router = useRouter()
    const supabase = createClient()
    const [searchLocation, setSearchLocation] = useState('All')
    const [searchPriceRange, setSearchPriceRange] = useState('0-50000')
    const [searchDistance, setSearchDistance] = useState('All')
    const [notifications, setNotifications] = useState<NotificationRow[]>([])
    const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)

    const priceOptions = [
        { label: 'Any Price', value: '0-50000' },
        { label: 'Under Rs 10,000', value: '0-10000' },
        { label: 'Rs 10,000 - 20,000', value: '10000-20000' },
        { label: 'Rs 20,000+', value: '20000-50000' },
    ]

    const distanceOptions = [
        { label: 'Any Distance', value: 'All' },
        { label: 'Within 1km', value: '1' },
        { label: 'Within 2km', value: '2' },
        { label: 'Within 5km', value: '5' },
    ]

    const locationOptions = [
        { label: 'Any Location', value: 'All' },
        { label: 'Moratuwa', value: 'Moratuwa' },
        { label: 'Katubedda', value: 'Katubedda' },
        { label: 'Piliyandala', value: 'Piliyandala' },
        { label: 'Ratmalana', value: 'Ratmalana' },
        { label: 'Mount Lavinia', value: 'Mount Lavinia' },
    ]

    const getSelectedLabel = (options: { label: string, value: string }[], value: string) => {
        return options.find((option) => option.value === value)?.label || options[0].label
    }

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const [minPrice, maxPrice] = searchPriceRange.split('-')
        const params = new URLSearchParams({
            location: searchLocation,
            distance: searchDistance,
            minPrice,
            maxPrice,
        })
        router.push(`/boardings?${params.toString()}`)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        router.push('/')
    }

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.is_read).length,
        [notifications]
    )

    const getNotificationTimeLabel = (timestamp: string) => {
        const created = new Date(timestamp).getTime()
        const now = Date.now()
        const diffMs = now - created
        const mins = Math.floor(diffMs / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        if (days < 7) return `${days}d ago`
        return new Date(timestamp).toLocaleDateString()
    }

    const getNotificationVisual = (type: NotificationRow['type']) => {
        if (type === 'REVIEW_CREATED') {
            return {
                icon: <MessageSquareMore className="h-4 w-4" />,
                containerClass: 'bg-orange-100 text-orange-600',
            }
        }
        if (type === 'REQUEST_STATUS_UPDATED') {
            return {
                icon: <RefreshCcw className="h-4 w-4" />,
                containerClass: 'bg-emerald-100 text-emerald-600',
            }
        }
        if (type === 'LISTING_SAVED') {
            return {
                icon: <Bookmark className="h-4 w-4" />,
                containerClass: 'bg-pink-100 text-pink-600',
            }
        }
        return {
            icon: <ClipboardCheck className="h-4 w-4" />,
            containerClass: 'bg-blue-100 text-blue-600',
        }
    }

    const fetchNotifications = async () => {
        if (!user?.id) {
            setNotifications([])
            return
        }

        setIsNotificationsLoading(true)
        try {
            const data = await getNotificationsByUser(user.id, 15)
            setNotifications(data)
        } catch (error) {
            console.error('Failed to load notifications:', error)
            setNotifications([])
        } finally {
            setIsNotificationsLoading(false)
        }
    }

    useEffect(() => {
        if (!user?.id) {
            setNotifications([])
            return
        }

        fetchNotifications()

        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${user.id}`,
                },
                () => {
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user?.id])

    const handleNotificationClick = async (notification: NotificationRow) => {
        try {
            if (!notification.is_read) {
                await markNotificationRead(notification.id)
                setNotifications((prev) => prev.map((item) => item.id === notification.id ? { ...item, is_read: true } : item))
            }

            if (notification.boarding_id) {
                router.push(`/boardings/${notification.boarding_id}`)
            } else if (user?.role === 'OWNER') {
                router.push('/dashboard')
            }
        } catch (error) {
            console.error('Failed to open notification:', error)
        }
    }

    const handleMarkAllRead = async () => {
        if (!user?.id || unreadCount === 0) return
        try {
            await markAllNotificationsRead(user.id)
            setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))
        } catch (error) {
            console.error('Failed to mark notifications as read:', error)
        }
    }

    if (user?.role === 'ADMIN') {
        return null
    }

    return (
        <nav className="border-b border-border bg-background/90 backdrop-blur sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-[72px] items-center">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-primary">BodiMate</span>
                        </Link>
                    </div>

                    {/* Center Search Pill */}
                    <form
                        onSubmit={handleSearchSubmit}
                        className="hidden lg:flex items-center rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.45)] backdrop-blur"
                    >
                        <div className="group flex items-center rounded-xl px-3 py-1.5 hover:bg-accent/70 transition-colors">
                            <MapPin className="h-4 w-4 text-muted-foreground mr-2.5" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Location</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button type="button" className="flex items-center gap-1 text-sm text-foreground font-semibold outline-none cursor-pointer">
                                            <span>{getSelectedLabel(locationOptions, searchLocation)}</span>
                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44 p-1.5 rounded-xl border-border">
                                        {locationOptions.map((option) => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                onClick={() => setSearchLocation(option.value)}
                                                className="rounded-lg font-medium text-foreground/90 cursor-pointer"
                                            >
                                                <Check className={`mr-2 h-3.5 w-3.5 ${searchLocation === option.value ? 'opacity-100 text-primary' : 'opacity-0'}`} />
                                                {option.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="w-px h-9 bg-border mx-1"></div>

                        <div className="group flex items-center rounded-xl px-3 py-1.5 hover:bg-accent/70 transition-colors">
                            <Wallet className="h-4 w-4 text-muted-foreground mr-2.5" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Price</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button type="button" className="flex items-center gap-1 text-sm text-foreground font-semibold outline-none cursor-pointer">
                                            <span>{getSelectedLabel(priceOptions, searchPriceRange)}</span>
                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-48 p-1.5 rounded-xl border-border">
                                        {priceOptions.map((option) => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                onClick={() => setSearchPriceRange(option.value)}
                                                className="rounded-lg font-medium text-foreground/90 cursor-pointer"
                                            >
                                                <Check className={`mr-2 h-3.5 w-3.5 ${searchPriceRange === option.value ? 'opacity-100 text-primary' : 'opacity-0'}`} />
                                                {option.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="w-px h-9 bg-border mx-1"></div>

                        <div className="group flex items-center rounded-xl px-3 py-1.5 hover:bg-accent/70 transition-colors">
                            <Ruler className="h-4 w-4 text-muted-foreground mr-2.5" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">Distance</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button type="button" className="flex items-center gap-1 text-sm text-foreground font-semibold outline-none cursor-pointer">
                                            <span>{getSelectedLabel(distanceOptions, searchDistance)}</span>
                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44 p-1.5 rounded-xl border-border">
                                        {distanceOptions.map((option) => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                onClick={() => setSearchDistance(option.value)}
                                                className="rounded-lg font-medium text-foreground/90 cursor-pointer"
                                            >
                                                <Check className={`mr-2 h-3.5 w-3.5 ${searchDistance === option.value ? 'opacity-100 text-primary' : 'opacity-0'}`} />
                                                {option.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="icon"
                            className="h-11 w-11 rounded-xl ml-1.5 bg-[#0A1435] hover:bg-[#0A1435]/90 shadow-[0_6px_14px_-8px_rgba(10,20,53,0.9)]"
                        >
                            <Search className="h-4.5 w-4.5" />
                        </Button>
                    </form>

                    {/* Right Section */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <ThemeToggle />
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex relative">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[360px] p-0 rounded-2xl overflow-hidden border border-border bg-card shadow-xl shadow-black/20">
                                    <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Notifications</p>
                                            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleMarkAllRead}
                                            disabled={unreadCount === 0}
                                            className="text-xs font-semibold text-primary disabled:text-muted-foreground"
                                        >
                                            Mark all as read
                                        </button>
                                    </div>

                                    <div className="max-h-[360px] overflow-y-auto p-2">
                                        {isNotificationsLoading ? (
                                            <div className="py-8 text-center text-sm text-muted-foreground">Loading notifications...</div>
                                        ) : notifications.length === 0 ? (
                                            <div className="py-10 text-center text-sm text-muted-foreground">No notifications yet.</div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <button
                                                    key={notification.id}
                                                    type="button"
                                                    onClick={() => handleNotificationClick(notification)}
                                                    className={`w-full text-left rounded-xl px-3 py-3 transition-colors border ${notification.is_read
                                                        ? 'border-transparent hover:bg-accent/70'
                                                        : 'border-primary/20 bg-primary/10 hover:bg-primary/15'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getNotificationVisual(notification.type).containerClass}`}>
                                                            {getNotificationVisual(notification.type).icon}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                                <p className="text-sm font-semibold text-foreground truncate">{notification.title}</p>
                                                                {!notification.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0"></span>}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">{notification.message}</p>
                                                            <p className="text-[11px] text-muted-foreground mt-1.5">{getNotificationTimeLabel(notification.created_at)}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="rounded-full gap-2 px-3 h-11 hover:shadow-md transition-shadow">
                                        <Menu className="h-4 w-4 text-muted-foreground" />
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name || user.email}`} />
                                            <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.full_name || 'User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={user.role === 'OWNER' ? '/dashboard' : user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <UserCog className="mr-2 h-4 w-4" />
                                            <span>Edit Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/boardings" className="cursor-pointer">
                                            <Search className="mr-2 h-4 w-4" />
                                            <span>Browse Boardings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" className="font-semibold text-sm">Log in</Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="rounded-full font-semibold px-5">Sign up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
