'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
    const searchParams = useSearchParams()
    const [boardings, setBoardings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Filter States
    const [priceRange, setPriceRange] = useState([0, 50000])
    const [selectedLocation, setSelectedLocation] = useState('All')
    const [selectedDistance, setSelectedDistance] = useState('All')
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
    const [selectedGender, setSelectedGender] = useState('Any')
    const [sortBy, setSortBy] = useState('newest')

    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 6

    const facilityMap: Record<string, keyof any> = {
        'WiFi': 'has_wifi',
        'Attached Bathroom': 'attached_bathroom',
        'Kitchen': 'has_kitchen',
        'Balcony': 'has_balcony',
        'Laundry': 'has_laundry',
        'A/C': 'has_ac'
    }

    const locations = ['All', 'Moratuwa', 'Katubedda', 'Piliyandala', 'Ratmalana', 'Mount Lavinia']
    const distances = [
        { label: 'Any Distance', value: 'All' },
        { label: 'Less than 1 km', value: '1' },
        { label: 'Less than 2 km', value: '2' },
        { label: 'Less than 5 km', value: '5' },
    ]

    // Helper to extract numbers from distance string (e.g. "500m" -> 0.5, "2km" -> 2, "10mins walk" -> 0.83)
    const parseDistance = (distStr: string | null | undefined): number | null => {
        if (!distStr) return null;
        const lower = distStr.toLowerCase();
        const match = lower.match(/([0-9.]+)/);
        if (!match) return null;
        
        let val = parseFloat(match[1]);
        
        // If it specifies minutes, approximate distance assuming 12 mins per km (5km/h walking speed)
        if (lower.includes('min') || lower.includes('walk')) {
            val = val / 12; 
        } else if (lower.includes('m') && !lower.includes('km')) {
            val = val / 1000; // convert meters to km roughly
        }
        
        return val;
    }

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

    useEffect(() => {
        const locationParam = searchParams.get('location')
        const distanceParam = searchParams.get('distance')
        const minPriceParam = searchParams.get('minPrice')
        const maxPriceParam = searchParams.get('maxPrice')

        if (locationParam && locations.includes(locationParam)) {
            setSelectedLocation(locationParam)
        }

        if (distanceParam && distances.some((d) => d.value === distanceParam)) {
            setSelectedDistance(distanceParam)
        }

        const parsedMin = minPriceParam ? Number(minPriceParam) : NaN
        const parsedMax = maxPriceParam ? Number(maxPriceParam) : NaN
        if (!Number.isNaN(parsedMin) && !Number.isNaN(parsedMax)) {
            const min = Math.max(0, Math.min(parsedMin, 50000))
            const max = Math.max(0, Math.min(parsedMax, 50000))
            setPriceRange([Math.min(min, max), Math.max(min, max)])
        }

        setCurrentPage(1)
    }, [searchParams])

    const toggleFacility = (facility: string) => {
        setSelectedFacilities(prev =>
            prev.includes(facility)
                ? prev.filter(f => f !== facility)
                : [...prev, facility]
        )
        setCurrentPage(1)
    }

    const filteredBoardings = boardings.filter(boarding => {
        // Active Filter
        if (!boarding.is_available) return false

        // Price Filter
        if (boarding.price < priceRange[0] || boarding.price > priceRange[1]) return false

        // Location Filter
        if (selectedLocation !== 'All' && !boarding.address.toLowerCase().includes(selectedLocation.toLowerCase())) return false

        // Distance Filter
        if (selectedDistance !== 'All') {
            const boardingDist = parseDistance(boarding.distance_university);
            const maxDist = parseFloat(selectedDistance);
            if (boardingDist === null || boardingDist > maxDist) return false;
        }

        // Facilities Filter
        for (const facility of selectedFacilities) {
            const dbKey = facilityMap[facility]
            if (!boarding[dbKey]) return false
        }

        // Gender Filter
        if (selectedGender !== 'Any') {
            const pGender = boarding.preferred_gender || 'Any'
            if (pGender !== 'Any' && pGender !== selectedGender) return false
        }

        return true
    }).sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price
        if (sortBy === 'price_desc') return b.price - a.price
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() // newest
    })

    const clearFilters = () => {
        setPriceRange([0, 50000])
        setSelectedLocation('All')
        setSelectedDistance('All')
        setSelectedFacilities([])
        setSelectedGender('Any')
        setSortBy('newest')
        setCurrentPage(1)
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Sidebar Filters */}
                <div className="w-full lg:w-[280px] flex-shrink-0">
                    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                            <button onClick={clearFilters} className="text-sm font-semibold text-gray-900 hover:opacity-70">Clear All</button>
                        </div>

                        {/* Location Filter */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">LOCATION</h3>
                            <div className="relative">
                                <select 
                                    value={selectedLocation} 
                                    onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 font-medium outline-none"
                                >
                                    {locations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Distance Filter */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">DISTANCE TO UNI</h3>
                            <div className="relative">
                                <select 
                                    value={selectedDistance} 
                                    onChange={(e) => { setSelectedDistance(e.target.value); setCurrentPage(1); }}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 font-medium outline-none"
                                >
                                    {distances.map(dist => (
                                        <option key={dist.value} value={dist.value}>{dist.label}</option>
                                    ))}
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
                                    value={priceRange}
                                    max={50000}
                                    step={100}
                                    className="w-full"
                                    onValueChange={(val) => { setPriceRange(val); setCurrentPage(1); }}
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
                                {Object.keys(facilityMap).map((facility) => (
                                    <div key={facility} className="flex items-center space-x-3">
                                        <Checkbox 
                                            id={`facility-${facility}`} 
                                            checked={selectedFacilities.includes(facility)}
                                            onCheckedChange={() => toggleFacility(facility)}
                                            className="rounded border-gray-300 w-5 h-5" 
                                        />
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
                                <button 
                                    onClick={() => { setSelectedGender('Male'); setCurrentPage(1); }}
                                    className={`flex-1 text-sm font-bold py-2 rounded-full transition-colors ${selectedGender === 'Male' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Male
                                </button>
                                <button 
                                    onClick={() => { setSelectedGender('Female'); setCurrentPage(1); }}
                                    className={`flex-1 text-sm font-bold py-2 rounded-full transition-colors ${selectedGender === 'Female' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Female
                                </button>
                                <button 
                                    onClick={() => { setSelectedGender('Any'); setCurrentPage(1); }}
                                    className={`flex-1 text-sm font-bold py-2 rounded-full transition-colors ${selectedGender === 'Any' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Both
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {/* Top Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-3xl font-extrabold text-[#0A1435] flex items-center gap-3">
                            Boarding Results <span className="text-base font-medium text-gray-400">({filteredBoardings.length} houses)</span>
                        </h1>

                        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                            <span className="flex items-center gap-1 cursor-pointer">
                                Sort: 
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent font-bold text-[#0A1435] outline-none ml-1 cursor-pointer"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </span>
                        </div>
                    </div>

                    {/* Results Grid */}
                    {isLoading ? (
                        <div className="py-20 text-center text-gray-400 font-medium">Loading boardings...</div>
                    ) : filteredBoardings.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-medium bg-white rounded-3xl border border-gray-100">
                            No boardings match your filters.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBoardings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((boarding, index) => {
                                // Transform DB structure back to BoardingCard format
                                const tags = []
                                if (boarding.has_wifi) tags.push('WiFi')
                                if (boarding.has_ac) tags.push('AC')
                                if (boarding.attached_bathroom) tags.push('Attached Bath')
                                if (boarding.has_kitchen) tags.push('Kitchen')
                                if (boarding.has_balcony) tags.push('Balcony')
                                if (boarding.has_laundry) tags.push('Laundry')

                                // Fallback dummy styling since we don't have this in schema yet
                                const badgeText = boarding.preferred_gender && boarding.preferred_gender !== 'Any' ? `${boarding.preferred_gender} Only` : (boarding.price > 18000 ? 'PREMIUM' : '')

                                // Calculate real aggregate ratings
                                const reviewsCount = boarding.reviews?.length || 0
                                const rating = reviewsCount > 0
                                    ? boarding.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsCount
                                    : 0

                                return (
                                    <Link key={boarding.id} href={`/boardings/${boarding.id}`}>
                                        <BoardingCard
                                            id={boarding.id}
                                            title={boarding.title}
                                            location={boarding.address.split(',')[0]} // Simple parsing for the location tag
                                            distanceInfo={boarding.distance_university || "500m to Uni"}
                                            price={boarding.price}
                                            rating={rating}
                                            reviewsCount={reviewsCount}
                                            imageUrl={boarding.image_urls?.[0] || boarding.image_url || 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=600'}
                                            tags={tags.length > 0 ? tags : ['No specific amenities']}
                                            badgeText={badgeText}
                                            numberOfBeds={boarding.number_of_beds}
                                            rentIncludesBills={boarding.rent_includes_bills}
                                            priority={index === 0} // Only preload the absolute first card
                                        />
                                    </Link>
                                )
                            })}
                        </div>
                    )}

                    {/* Dynamic Pagination */}
                    {filteredBoardings.length > ITEMS_PER_PAGE && (
                        <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm font-medium"
                            >
                                &lsaquo;
                            </button>

                            {Array.from({ length: Math.ceil(filteredBoardings.length / ITEMS_PER_PAGE) }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-sm transition-colors ${currentPage === i + 1
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredBoardings.length / ITEMS_PER_PAGE), p + 1))}
                                disabled={currentPage === Math.ceil(filteredBoardings.length / ITEMS_PER_PAGE)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm font-medium"
                            >
                                &rsaquo;
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
