'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { getBoardingsByOwner, deleteBoarding } from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export default function DashboardPage() {
    const { user } = useUserStore()
    const [boardings, setBoardings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchBoardings() {
            if (!user?.id) return
            try {
                const data = await getBoardingsByOwner(user.id)
                setBoardings(data)
            } catch (error) {
                console.error('Error fetching boardings:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBoardings()
    }, [user?.id])

    async function handleDelete(id: string) {
        if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return

        try {
            await deleteBoarding(id)
            setBoardings(boardings.filter(b => b.id !== id))
        } catch (error) {
            console.error('Error deleting boarding:', error)
            alert('Failed to delete listing. Please try again.')
        }
    }

    if (isLoading) {
        return <div className="py-12 text-center text-gray-500">Loading your listings...</div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0A1435]">My Listings</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage all your boarding properties in one place.</p>
                </div>
                <Link href="/dashboard/boardings/new">
                    <Button className="rounded-xl px-5 bg-primary hover:bg-primary/90 text-white font-bold h-11 hidden sm:flex gap-2">
                        <PlusCircle className="h-5 w-5" />
                        Add Property
                    </Button>
                </Link>
            </div>

            {boardings.length === 0 ? (
                <div className="bg-white border text-center border-gray-100 rounded-3xl p-12 shadow-sm">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Home className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0A1435] mb-2">No listings found</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't added any boarding properties yet. Get started by creating your first listing to reach thousands of students.</p>
                    <Link href="/dashboard/boardings/new">
                        <Button className="rounded-xl px-6 font-bold h-12">Create First Listing</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {boardings.map((boarding) => (
                        <div key={boarding.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group">
                            <div className="relative h-48 bg-gray-100">
                                {boarding.image_url ? (
                                    <Image src={boarding.image_url} alt={boarding.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full shadow-sm">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <MoreVertical className="h-4 w-4 text-gray-600" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/boardings/${boarding.id}/edit`} className="cursor-pointer font-medium">
                                                    <Edit2 className="mr-2 h-4 w-4" /> Edit Listing
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(boarding.id)}
                                                className="text-red-600 focus:text-red-700 cursor-pointer font-medium"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-[#0A1435] line-clamp-1">{boarding.title}</h3>
                                    <Badge variant={boarding.is_available ? 'default' : 'secondary'} className={boarding.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-none' : ''}>
                                        {boarding.is_available ? 'Active' : 'Draft'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-1">{boarding.address}</p>
                                <div className="mt-auto border-t pt-4">
                                    <div className="text-lg font-bold text-[#0A1435]">Rs {boarding.price.toLocaleString()} <span className="text-xs text-gray-400 font-medium">/ month</span></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
