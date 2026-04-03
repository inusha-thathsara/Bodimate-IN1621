'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, Bookmark, ClipboardCheck, LogOut, MessageSquareMore, RefreshCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getNotificationsByUser, markAllNotificationsRead, markNotificationRead } from '@/lib/api'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Database } from '@/types/database.types'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

interface AdminTopbarProps {
    userId: string
    email: string
    fullName: string | null
}

export function AdminTopbar({ userId, email, fullName }: AdminTopbarProps) {
    const router = useRouter()
    const supabase = createClient()
    const [notifications, setNotifications] = useState<NotificationRow[]>([])
    const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)

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
        setIsNotificationsLoading(true)
        try {
            const data = await getNotificationsByUser(userId, 15)
            setNotifications(data)
        } catch (error) {
            console.error('Failed to load notifications:', error)
            setNotifications([])
        } finally {
            setIsNotificationsLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()

        const channel = supabase
            .channel(`notifications:admin:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${userId}`,
                },
                () => {
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const handleNotificationClick = async (notification: NotificationRow) => {
        try {
            if (!notification.is_read) {
                await markNotificationRead(notification.id)
                setNotifications((prev) => prev.map((item) => item.id === notification.id ? { ...item, is_read: true } : item))
            }
        } catch (error) {
            console.error('Failed to update notification:', error)
        }
    }

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return
        try {
            await markAllNotificationsRead(userId)
            setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))
        } catch (error) {
            console.error('Failed to mark notifications as read:', error)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
            <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/80">Admin Workspace</p>
                    <h2 className="text-lg font-bold text-foreground">BodiMate Dashboard</h2>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
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

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-full gap-2 px-3 h-11">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${fullName || email}`} />
                                    <AvatarFallback>{fullName?.charAt(0) || email.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{fullName || 'Admin'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
