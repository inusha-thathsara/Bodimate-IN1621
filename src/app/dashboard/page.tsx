'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, MoreVertical, Edit2, Trash2, Home, BarChart3, Users, Star, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { getBoardingsByOwner, deleteBoarding, getRequestsByOwner, getReviewsByOwner, updateRequestStatus } from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export default function DashboardPage() {
    const { user } = useUserStore()
    const [boardings, setBoardings] = useState<any[]>([])
    const [requests, setRequests] = useState<any[]>([])
    const [reviews, setReviews] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'LISTINGS' | 'REQUESTS' | 'REVIEWS'>('LISTINGS')

    useEffect(() => {
        async function fetchData() {
            if (!user?.id) return
            try {
                const [boardingsData, requestsData, reviewsData] = await Promise.all([
                    getBoardingsByOwner(user.id),
                    getRequestsByOwner(user.id),
                    getReviewsByOwner(user.id)
                ])
                setBoardings(boardingsData)
                setRequests(requestsData)
                setReviews(reviewsData)
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [user?.id])

    async function handleRequestStatus(requestId: string, newStatus: 'ACCEPTED' | 'REJECTED') {
        try {
            await updateRequestStatus(requestId, newStatus)
            setRequests(requests.map(r => r.id === requestId ? { ...r, status: newStatus } : r))
        } catch (error) {
            console.error('Error updating request status:', error)
            alert('Failed to update request status.')
        }
    }

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
        return <div className="py-12 text-center text-gray-500 font-medium">Loading your dashboard...</div>
    }

    const activeListingsCount = boardings.filter(b => b.is_available).length
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return (
        <div className="max-w-[1400px] mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A1435]">Owner Dashboard</h1>
                    <p className="text-gray-500 font-medium mt-2">Overview of your properties, requests, and performance.</p>
                </div>
                <Link href="/dashboard/boardings/new">
                    <Button className="rounded-xl px-6 font-bold h-12 bg-[#0A1435] hover:bg-[#0A1435]/90 text-white shadow-lg shadow-blue-900/20">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add Property
                    </Button>
                </Link>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                        <Home className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Listings</p>
                        <p className="text-3xl font-extrabold text-[#0A1435]">{boardings.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Listings</p>
                        <p className="text-3xl font-extrabold text-[#0A1435]">{activeListingsCount}</p>
                    </div>
                </div>
                <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                        <Users className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Requests</p>
                        <p className="text-3xl font-extrabold text-[#0A1435]">{requests.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
                        <Star className="h-7 w-7 fill-current" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg Rating</p>
                        <p className="text-3xl font-extrabold text-[#0A1435]">{avgRating.toFixed(1)}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('LISTINGS')}
                    className={`px-8 py-4 font-bold whitespace-nowrap border-b-[3px] transition-colors ${activeTab === 'LISTINGS' ? 'border-[#0A1435] text-[#0A1435]' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
                >
                    My Listings
                </button>
                <button
                    onClick={() => setActiveTab('REQUESTS')}
                    className={`px-8 py-4 font-bold whitespace-nowrap border-b-[3px] transition-colors gap-3 flex items-center ${activeTab === 'REQUESTS' ? 'border-[#0A1435] text-[#0A1435]' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
                >
                    Student Requests
                    {requests.filter(r => r.status === 'PENDING').length > 0 && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white shadow-none px-2.5 rounded-full text-xs">
                            {requests.filter(r => r.status === 'PENDING').length}
                        </Badge>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('REVIEWS')}
                    className={`px-8 py-4 font-bold whitespace-nowrap border-b-[3px] transition-colors ${activeTab === 'REVIEWS' ? 'border-[#0A1435] text-[#0A1435]' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
                >
                    Property Reviews
                </button>
            </div>

            {activeTab === 'LISTINGS' && (
                <>
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
                </>
            )}

            {activeTab === 'REQUESTS' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {requests.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-[#0A1435] mb-2">No Requests Yet</h3>
                            <p>When students request to book your properties, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {requests.map((request) => (
                                <div key={request.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-[#0A1435]">{request.users?.full_name || 'Student'}</h3>
                                            <span className="text-gray-400 text-sm">{request.users?.email}</span>
                                        </div>
                                        <p className="text-gray-600 font-medium text-sm">Requested: <span className="text-primary font-bold">{request.boardings?.title}</span></p>
                                        <p className="text-xs text-gray-400 mt-1">Sent on {new Date(request.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {request.status === 'PENDING' ? (
                                            <>
                                                <Button onClick={() => handleRequestStatus(request.id, 'ACCEPTED')} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold px-6 shadow-none">Accept</Button>
                                                <Button onClick={() => handleRequestStatus(request.id, 'REJECTED')} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold px-6 border-2">Reject</Button>
                                            </>
                                        ) : request.status === 'ACCEPTED' ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-4 py-1.5 font-bold shadow-none text-sm">Accepted</Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-4 py-1.5 font-bold shadow-none text-sm">Rejected</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'REVIEWS' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
                    {reviews.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-[#0A1435] mb-2">No Reviews Yet</h3>
                            <p>When students leave feedback, it will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {reviews.map((review) => (
                                <div key={review.id} className="pb-8 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-bold text-lg text-[#0A1435]">{review.users?.full_name || 'Student'}</h4>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-[#F2994A] text-[#F2994A]' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium">For <span className="text-primary font-bold">{review.boardings?.title}</span> · {new Date(review.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-700 font-medium text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            "{review.comment}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}
