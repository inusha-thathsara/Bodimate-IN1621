'use client'

import { Suspense, useEffect, useState } from 'react'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CheckCircle2, ChevronDown, Search, MapPin, Grid, List as ListIcon, Filter } from 'lucide-react'

function BoardingsFeedContent() {
    const searchParams = useSearchParams()
    const [boardings, setBoardings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Filter States
    const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 0])
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 0])
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

    const sortOptions = [
        { value: 'newest', label: 'Newest First', description: 'Recently posted listings first' },
        { value: 'price_asc', label: 'Price: Low to High', description: 'Budget-friendly options first' },
        { value: 'price_desc', label: 'Price: High to Low', description: 'Premium options first' },
        { value: 'rating_desc', label: 'Top Rated', description: 'Highest average rating first' },
        { value: 'reviews_desc', label: 'Most Reviewed', description: 'Listings with more feedback first' },
    ] as const

    const activeSort = sortOptions.find(option => option.value === sortBy) || sortOptions[0]

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

                const prices = data
                    .map((boarding: any) => Number(boarding.price))
                    .filter((price: number) => Number.isFinite(price))

                if (prices.length > 0) {
                    const minPrice = Math.min(...prices)
                    const maxPrice = Math.max(...prices)

                    setPriceBounds([minPrice, maxPrice])
                    setPriceRange([minPrice, maxPrice])
                } else {
                    setPriceBounds([0, 0])
                    setPriceRange([0, 0])
                }
            } catch (error) {
                console.error('Failed to fetch boardings:', error)
                setBoardings([])
                setPriceBounds([0, 0])
                setPriceRange([0, 0])
            } finally {
                setIsLoading(false)
            }
        }

        fetchBoardings()
    }, [])

    useEffect(() => {
        const [boundMin, boundMax] = priceBounds

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

        let nextMin = boundMin
        let nextMax = boundMax

        if (!Number.isNaN(parsedMin)) {
            nextMin = Math.max(boundMin, Math.min(parsedMin, boundMax))
        }

        if (!Number.isNaN(parsedMax)) {
            nextMax = Math.max(boundMin, Math.min(parsedMax, boundMax))
        }

        setPriceRange([Math.min(nextMin, nextMax), Math.max(nextMin, nextMax)])

        setCurrentPage(1)
    }, [searchParams, priceBounds])

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

        if (sortBy === 'rating_desc') {
            const aCount = a.reviews?.length || 0
            const bCount = b.reviews?.length || 0
            const aRating = aCount > 0 ? a.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / aCount : 0
            const bRating = bCount > 0 ? b.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / bCount : 0
            return bRating - aRating
        }

        if (sortBy === 'reviews_desc') {
            return (b.reviews?.length || 0) - (a.reviews?.length || 0)
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() // newest
    })

    const clearFilters = () => {
        setPriceRange([...priceBounds])
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
                    <div className="bg-card text-card-foreground rounded-[20px] p-6 shadow-sm border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">Filters</h2>
                            <button onClick={clearFilters} className="text-sm font-semibold text-foreground/80 hover:text-foreground">Clear All</button>
                        </div>

                        {/* Location Filter */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">LOCATION</h3>
                            <div className="relative">
                                <select 
                                    value={selectedLocation} 
                                    onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
                                    className="w-full appearance-none bg-muted/40 border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 font-medium outline-none"
                                >
                                    {locations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Distance Filter */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">DISTANCE TO UNI</h3>
                            <div className="relative">
                                <select 
                                    value={selectedDistance} 
                                    onChange={(e) => { setSelectedDistance(e.target.value); setCurrentPage(1); }}
                                    className="w-full appearance-none bg-muted/40 border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 font-medium outline-none"
                                >
                                    {distances.map(dist => (
                                        <option key={dist.value} value={dist.value}>{dist.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">PRICE RANGE (LKR)</h3>
                            <div className="px-2 mb-6">
                                <Slider
                                    value={priceRange}
                                    min={priceBounds[0]}
                                    max={priceBounds[1]}
                                    step={100}
                                    className="w-full"
                                    onValueChange={(val) => {
                                        const [min, max] = val
                                        if (typeof min === 'number' && typeof max === 'number') {
                                            setPriceRange([min, max])
                                            setCurrentPage(1)
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-muted/40 border border-border rounded-lg p-3">
                                    <label className="text-xs text-muted-foreground font-medium block mb-1">Min</label>
                                    <div className="text-sm font-bold text-foreground">Rs {priceRange[0].toLocaleString()}</div>
                                </div>
                                <div className="flex-1 bg-muted/40 border border-border rounded-lg p-3">
                                    <label className="text-xs text-muted-foreground font-medium block mb-1">Max</label>
                                    <div className="text-sm font-bold text-foreground">Rs {priceRange[1].toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Student Facilities */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">STUDENT FACILITIES</h3>
                            <div className="space-y-4">
                                {Object.keys(facilityMap).map((facility) => (
                                    <div key={facility} className="flex items-center space-x-3">
                                        <Checkbox 
                                            id={`facility-${facility}`} 
                                            checked={selectedFacilities.includes(facility)}
                                            onCheckedChange={() => toggleFacility(facility)}
                                            className="rounded border-border w-5 h-5" 
                                        />
                                        <label
                                            htmlFor={`facility-${facility}`}
                                            className="text-sm font-medium text-foreground/85 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {facility}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Gender Toggle */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">GENDER</h3>
                            <div className="flex bg-muted/50 p-1 rounded-full border border-border">
                                <button 
                                    onClick={() => { setSelectedGender('Male'); setCurrentPage(1); }}
                                    className={`flex-1 text-sm font-bold py-2 rounded-full transition-colors ${selectedGender === 'Male' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Male
                                </button>
                                <button 
                                    onClick={() => { setSelectedGender('Female'); setCurrentPage(1); }}
                                    className={`flex-1 text-sm font-bold py-2 rounded-full transition-colors ${selectedGender === 'Female' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Female
                                </button>
                                <button 
                                    onClick={() => { setSelectedGender('Any'); setCurrentPage(1); }}
                                    className={`flex-1 text-sm font-bold py-2 rounded-full transition-colors ${selectedGender === 'Any' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
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
                        <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                            Boarding Results <span className="text-base font-medium text-muted-foreground">({filteredBoardings.length} houses)</span>
                        </h1>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm shadow-sm hover:bg-accent transition-colors">
                                    <span className="font-medium text-muted-foreground">Sort:</span>
                                    <span className="font-bold text-foreground">{activeSort.label}</span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-72">
                                {sortOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => setSortBy(option.value)}
                                        className="cursor-pointer py-2"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{option.label}</span>
                                            <span className="text-xs text-muted-foreground">{option.description}</span>
                                        </div>
                                        {sortBy === option.value && <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Results Grid */}
                    {isLoading ? (
                        <div className="py-20 text-center text-muted-foreground font-medium">Loading boardings...</div>
                    ) : filteredBoardings.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground font-medium bg-card rounded-3xl border border-border">
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
                                            priority={index < 3} // Prioritize first row images to avoid LCP warning on whichever card becomes largest
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
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-card shadow-sm font-medium"
                            >
                                &lsaquo;
                            </button>

                            {Array.from({ length: Math.ceil(filteredBoardings.length / ITEMS_PER_PAGE) }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-sm transition-colors ${currentPage === i + 1
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-card border border-border text-foreground/80 hover:bg-accent'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredBoardings.length / ITEMS_PER_PAGE), p + 1))}
                                disabled={currentPage === Math.ceil(filteredBoardings.length / ITEMS_PER_PAGE)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-card shadow-sm font-medium"
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

export default function BoardingsFeed() {
    return (
        <Suspense fallback={<div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full text-center text-muted-foreground font-medium">Loading boardings...</div>}>
            <BoardingsFeedContent />
        </Suspense>
    )
}
