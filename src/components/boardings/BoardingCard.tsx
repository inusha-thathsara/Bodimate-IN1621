 'use client'

import Image from 'next/image'
import { Heart, MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/useUserStore'

export interface BoardingCardProps {
    id: string
    title: string
    location: string
    distanceInfo: string
    price: number
    rating: number
    reviewsCount: number
    imageUrl: string | null
    tags: string[]
    badgeText?: string
    badgeVariant?: 'default' | 'topRated' | 'femaleOnly'
    numberOfBeds?: number
    rentIncludesBills?: boolean
    priority?: boolean
}

export function BoardingCard({
    id,
    title,
    location,
    distanceInfo,
    price,
    rating,
    reviewsCount,
    imageUrl,
    tags,
    badgeText,
    badgeVariant = 'default',
    numberOfBeds,
    rentIncludesBills,
    priority = false
}: BoardingCardProps) {
    const { user } = useUserStore()

    const formattedPrice = new Intl.NumberFormat('si-LK').format(price)

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full">
            {/* Image Container */}
            <div className="relative h-[220px] w-full bg-gray-100">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        priority={priority}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    {badgeText && (
                        <div className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm text-white ${badgeVariant === 'topRated' ? 'bg-[#F2994A]' : 'bg-[#0A1435]'
                            }`}>
                            {badgeText.toUpperCase()}
                        </div>
                    )}
                    {!badgeText && <div />} {/* Spacer if no badge */}

                    {user?.role !== 'OWNER' && (
                        <button className="h-8 w-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors shadow-sm">
                            <Heart className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                {/* Location Info */}
                <div className="flex items-center gap-1 text-[11px] font-bold tracking-wider text-gray-500 uppercase mb-2">
                    <MapPin className="h-3 w-3" />
                    <span>{location} ({distanceInfo})</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#0A1435] leading-tight mb-2 line-clamp-2">
                    {title}
                </h3>

                {/* Facilities Summary */}
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-gray-500">
                    {numberOfBeds && <span>{numberOfBeds} {numberOfBeds === 1 ? 'Bed' : 'Beds'}</span>}
                    {numberOfBeds && rentIncludesBills && <span className="text-gray-300">•</span>}
                    {rentIncludesBills && <span className="text-green-600">Bills Included</span>}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    {reviewsCount > 0 ? (
                        <>
                            <div className="flex items-center gap-1 bg-[#FFF5EB] text-[#F2994A] px-1.5 py-0.5 rounded text-sm font-semibold border border-orange-100">
                                <Star className="h-3 w-3 fill-current" />
                                <span>{rating.toFixed(1)}</span>
                            </div>
                            <span className="text-sm text-gray-400 font-medium">({reviewsCount} reviews)</span>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-1 bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded text-sm font-semibold border border-gray-100">
                                <Star className="h-3 w-3" />
                                <span>New</span>
                            </div>
                            <span className="text-sm text-gray-400 font-medium whitespace-nowrap">No reviews yet</span>
                        </>
                    )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {tags.map((tag, i) => (
                        <span key={i} className="bg-gray-100/70 text-gray-600 px-2.5 py-1 rounded-full text-[11px] font-bold border border-gray-200/50">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Bottom Section: Price & CTA */}
                <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-5">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-[#0A1435]">Rs {formattedPrice}</span>
                            <span className="text-[13px] text-gray-400 font-medium">/ month</span>
                        </div>
                    </div>
                    <Button className="rounded-xl px-4 py-2 bg-[#0A1435] hover:bg-opacity-90 text-white font-bold h-10 shadow-lg shadow-blue-900/10">
                        View Details
                    </Button>
                </div>
            </div>
        </div>
    )
}
