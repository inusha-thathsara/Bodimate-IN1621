'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, ClipboardList, Clock, Home, MapPin, CheckCircle2, Trash2 } from 'lucide-react'
import { getRequestsByStudent, getSavedBoardingsByStudent, toggleSavedBoarding, deleteRequest } from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function StudentDashboardPage() {
    const { user } = useUserStore()
    const [savedBoardings, setSavedBoardings] = useState<any[]>([])
    const [requests, setRequests] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'SAVED' | 'REQUESTS'>('SAVED')

    useEffect(() => {
        async function fetchData() {
            if (!user?.id || user.role !== 'STUDENT') return
            try {
                const [savedData, requestsData] = await Promise.all([
                    getSavedBoardingsByStudent(user.id),
                    getRequestsByStudent(user.id)
                ])
                setSavedBoardings(savedData)
                setRequests(requestsData)
            } catch (error) {
                console.error('Error fetching student dashboard data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [user?.id, user?.role])

    async function handleRemoveSaved(boardingId: string) {
        if (!user?.id) return
        try {
            await toggleSavedBoarding(boardingId, user.id)
            setSavedBoardings(savedBoardings.filter(s => s.boarding_id !== boardingId))
        } catch (error) {
            console.error('Error removing saved boarding:', error)
            alert('Failed to remove from saved places.')
        }
    }

    async function handleDeleteRequest(requestId: string, e: React.MouseEvent) {
        e.preventDefault() // prevent navigating to boarding detail page
        if (!confirm('Are you sure you want to cancel this request?')) return
        try {
            await deleteRequest(requestId)
            setRequests(requests.filter(r => r.id !== requestId))
        } catch (error) {
            console.error('Error deleting request:', error)
            alert('Failed to delete request.')
        }
    }

    if (isLoading) {
        return <div className="py-12 text-center text-gray-500 font-medium">Loading your dashboard...</div>
    }

    const pendingRequests = requests.filter(r => r.status === 'PENDING').length
    const acceptedRequests = requests.filter(r => r.status === 'ACCEPTED').length

    return (
        <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A1435]">My Hub</h1>
                    <p className="text-gray-500 font-medium mt-2">Manage your saved places and booking requests.</p>
                </div>
                <Link href="/boardings">
                    <Button className="rounded-xl px-6 font-bold h-12 bg-[#0A1435] hover:bg-[#0A1435]/90 text-white shadow-lg shadow-blue-900/20">
                        Explore Boardings
                    </Button>
                </Link>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <Bookmark className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Saved Places</p>
                        <p className="text-3xl font-extrabold text-[#0A1435]">{savedBoardings.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                        <ClipboardList className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Requests</p>
                        <p className="text-3xl font-extrabold text-[#0A1435]">{requests.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                        <Clock className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending</p>
                        <p className="text-3xl font-extrabold text-[#0A1435]">{pendingRequests}</p>
                    </div>
                </div>
                <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Accepted</p>
                        <p className="text-3xl font-extrabold text-[#0A1435]">{acceptedRequests}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('SAVED')}
                    className={`px-8 py-4 font-bold whitespace-nowrap border-b-[3px] transition-colors ${activeTab === 'SAVED' ? 'border-[#0A1435] text-[#0A1435]' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
                >
                    Saved Places
                </button>
                <button
                    onClick={() => setActiveTab('REQUESTS')}
                    className={`px-8 py-4 font-bold whitespace-nowrap border-b-[3px] transition-colors gap-3 flex items-center ${activeTab === 'REQUESTS' ? 'border-[#0A1435] text-[#0A1435]' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
                >
                    My Requests
                    {pendingRequests > 0 && (
                        <Badge className="bg-primary hover:bg-primary text-white shadow-none px-2.5 rounded-full text-xs">
                            {pendingRequests}
                        </Badge>
                    )}
                </button>
            </div>

            {activeTab === 'SAVED' && (
                <div>
                    {savedBoardings.length === 0 ? (
                        <div className="bg-white border text-center border-gray-100 rounded-3xl p-12 shadow-sm">
                            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bookmark className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0A1435] mb-2">No saved places yet</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Explore available boarding places and save your favorites to easily find them later.</p>
                            <Link href="/boardings">
                                <Button className="rounded-xl px-6 font-bold h-12">Explore Boardings</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedBoardings.map(({ id, boardings: boarding }) => boarding && (
                                <div key={id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group relative">
                                    <div className="relative h-48 bg-gray-100 block">
                                        <Link href={`/boardings/${boarding.id}`}>
                                            {boarding.image_url ? (
                                                <Image src={boarding.image_url} alt={boarding.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                            )}
                                        </Link>
                                        <div className="absolute top-4 right-4 z-10">
                                            <button
                                                onClick={() => handleRemoveSaved(boarding.id)}
                                                className="h-10 w-10 bg-white/90 hover:bg-red-50 flex items-center justify-center rounded-full shadow-sm text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <Bookmark className="h-5 w-5 fill-current" />
                                            </button>
                                        </div>
                                    </div>
                                    <Link href={`/boardings/${boarding.id}`} className="p-5 flex flex-col flex-1 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-[#0A1435] line-clamp-1">{boarding.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 line-clamp-1">
                                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                            {boarding.address}
                                        </div>
                                        <div className="mt-auto border-t pt-4">
                                            <div className="text-lg font-bold text-primary">Rs {boarding.price.toLocaleString()} <span className="text-xs text-gray-400 font-medium">/ month</span></div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'REQUESTS' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {requests.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-[#0A1435] mb-2">No Requests Found</h3>
                            <p className="max-w-sm mx-auto">When you request to book a property, you can track its status here.</p>
                            <Link href="/boardings">
                                <Button className="mt-6 rounded-xl px-6 font-bold">Find a Place</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {requests.map((request) => request.boardings && (
                                <Link key={request.id} href={`/boardings/${request.boardings.id}`} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors block">
                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-[#0A1435]">{request.boardings.title}</h3>
                                        </div>
                                        <p className="text-gray-500 font-medium text-sm flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {request.boardings.address}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">Requested on {new Date(request.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-[#0A1435]">Rs {request.boardings.price.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">/ month</p>
                                        </div>
                                        <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                                        <div className="w-[100px] text-center">
                                            {request.status === 'PENDING' && (
                                                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 font-bold px-3 py-1 shadow-none">Pending</Badge>
                                            )}
                                            {request.status === 'ACCEPTED' && (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold px-3 py-1 shadow-none">Accepted</Badge>
                                            )}
                                            {request.status === 'REJECTED' && (
                                                <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none font-bold px-3 py-1 shadow-none">Declined</Badge>
                                            )}
                                            <button
                                                onClick={(e) => handleDeleteRequest(request.id, e)}
                                                className="mt-2 text-red-500 hover:text-red-700 flex items-center justify-center w-full gap-1 text-xs font-semibold"
                                                title="Cancel Request"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
