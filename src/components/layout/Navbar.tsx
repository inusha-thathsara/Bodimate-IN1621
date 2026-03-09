'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Search, Bell, Menu, LogOut, LayoutDashboard, UserCog } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function Navbar() {
    const { user, setUser } = useUserStore()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        router.push('/')
    }

    return (
        <nav className="border-b bg-white sticky top-0 z-50">
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
                    <div className="hidden md:flex items-center border rounded-full pl-6 pr-2 py-1.5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center mr-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Location</span>
                                <span className="text-sm text-foreground font-medium">Moratuwa</span>
                            </div>
                        </div>
                        <div className="w-[1px] h-8 bg-border mx-2"></div>
                        <div className="flex items-center mx-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Price</span>
                                <span className="text-sm text-foreground font-medium">Any Price</span>
                            </div>
                        </div>
                        <div className="w-[1px] h-8 bg-border mx-2"></div>
                        <div className="flex items-center mx-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Distance</span>
                                <span className="text-sm text-foreground font-medium">Within 2km</span>
                            </div>
                        </div>
                        <Button size="icon" className="h-10 w-10 rounded-full ml-2">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex">
                            <Bell className="h-5 w-5" />
                        </Button>

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
                                        <Link href={user.role === 'OWNER' ? '/dashboard' : '/student/dashboard'} className="cursor-pointer">
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
