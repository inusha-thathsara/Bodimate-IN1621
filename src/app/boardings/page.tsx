'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BoardingCard } from '@/components/boardings/BoardingCard'
import { getBoardings } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ChevronDown, Search, MapPin, Grid, List as ListIcon, Filter } from 'lucide-react'

export default function BoardingsFeed() {
    const [boardings, setBoardings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [priceRange, setPriceRange] = useState([5000, 25000])

    useEffect(() => {
        const fetchBoardings = async () => {
            setIsLoading(true)
            try {
                const data = await getBoardings()
                setBoardings(data)
            } catch (error) {
                console.error('Failed to fetch boardings:', error)
                setBoardings([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchBoardings()
    }, [])

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Sidebar Filters */}
                <div className="w-full lg:w-[280px] flex-shrink-0">
                    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                            <button className="text-sm font-semibold text-gray-900 hover:opacity-70">Clear All</button>
                        </div>

                        {/* Location Filter */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">LOCATION</h3>
                            <div className="relative">
                                <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 font-medium outline-none">
                                    <option>Near University of Moratuwa</option>
                                    <option>Dalugama</option>
                                    <option>Kiribathgoda</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">PRICE RANGE (LKR)</h3>
                            <div className="px-2 mb-6">
                                <Slider
                                    defaultValue={[5000, 25000]}
                                    max={50000}
                                    step={100}
                                    className="w-full"
                                    onValueChange={(val) => setPriceRange(val)}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-3">
                                    <label className="text-xs text-gray-500 font-medium block mb-1">Min</label>
                                    <div className="text-sm font-bold text-gray-900">Rs {priceRange[0].toLocaleString()}</div>
                                </div>
                                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-3">
                                    <label className="text-xs text-gray-500 font-medium block mb-1">Max</label>
                                    <div className="text-sm font-bold text-gray-900">Rs {priceRange[1].toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Student Facilities */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">STUDENT FACILITIES</h3>
                            <div className="space-y-4">
                                {[
                                    'WiFi',
                                    'Attached Bathroom',
                                    'Meals Included',
                                    'Security',
                                    'Parking'
                                ].map((facility) => (
                                    <div key={facility} className="flex items-center space-x-3">
                                        <Checkbox id={`facility-${facility}`} className="rounded border-gray-300 w-5 h-5" />
                                        <label
                                            htmlFor={`facility-${facility}`}
                                            className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {facility}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Gender Toggle */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">GENDER</h3>
                            <div className="flex bg-gray-50 p-1 rounded-full border border-gray-100">
                                <button className="flex-1 bg-primary text-white text-sm font-bold py-2 rounded-full shadow-sm">
                                    Male
                                </button>
                                <button className="flex-1 text-gray-600 hover:text-gray-900 text-sm font-bold py-2 rounded-full transition-colors">
                                    Female
                                </button>
                                <button className="flex-1 text-gray-600 hover:text-gray-900 text-sm font-bold py-2 rounded-full transition-colors">
                                    Both
                                </button>
                            </div>
                        </div>

                        <Button className="w-full py-6 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md">
                            Apply Filters
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {/* Top Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-3xl font-extrabold text-[#0A1435] flex items-center gap-3">
                            Boarding Results <span className="text-base font-medium text-gray-400">({boardings.length} houses)</span>
                        </h1>

                        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                            <span className="flex items-center gap-1 cursor-pointer hover:text-[#0A1435]">
                                Sort: <strong className="text-[#0A1435]">Price: Low to High</strong> <ChevronDown className="h-4 w-4" />
                            </span>
                        </div>
                    </div>

                    {/* Results Grid */}
                    {isLoading ? (
                        <div className="py-20 text-center text-gray-400 font-medium">Loading boardings...</div>
                    ) : boardings.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-medium bg-white rounded-3xl border border-gray-100">
                            No boardings available at the moment.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {boardings.map((boarding) => {
                                // Transform DB structure back to BoardingCard format
                                const tags = []
                                if (boarding.has_wifi) tags.push('WiFi')
                                if (boarding.has_ac) tags.push('AC')
                                if (boarding.attached_bathroom) tags.push('Attached Bath')

                                // Fallback dummy styling since we don't have this in schema yet
                                const badgeText = boarding.price > 18000 ? 'PREMIUM' : ''

                                return (
                                    <Link key={boarding.id} href={`/boardings/${boarding.id}`}>
                                        <BoardingCard
                                            id={boarding.id}
                                            title={boarding.title}
                                            location={boarding.address.split(',')[0]} // Simple parsing for the location tag
                                            distanceInfo="0.5KM AWAY" // Mock distance for DB rows
                                            price={boarding.price}
                                            rating={4.5} // Mock rating until we implement actual aggregates
                                            reviewsCount={0}
                                            imageUrl={boarding.image_url || 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=600'}
                                            tags={tags.length > 0 ? tags : ['No specific amenities']}
                                            badgeText={badgeText}
                                        />
                                    </Link>
                                )
                            })}
                        </div>
                    )}

                    {/* Pagination Placeholder */}
                    <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors bg-white shadow-sm font-medium">
                            &lsaquo;
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white font-bold shadow-md">
                            1
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold shadow-sm transition-colors">
                            2
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold shadow-sm transition-colors">
                            3
                        </button>
                        <span className="px-2 text-gray-400 font-bold">...</span>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold shadow-sm transition-colors">
                            8
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors bg-white shadow-sm font-medium">
                            &rsaquo;
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
