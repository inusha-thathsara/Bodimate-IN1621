'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Star, Heart, Share2, ShieldCheck, Check } from 'lucide-react'
import { getBoardingById, getReviewsByBoarding, createReview, createRequest, toggleSavedBoarding, checkIsSaved, checkHasRequested } from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function BoardingDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useUserStore()

    const [boarding, setBoarding] = useState<any>(null)
    const [reviews, setReviews] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Review Form state
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)

    // Interaction state
    const [isSaved, setIsSaved] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [hasRequested, setHasRequested] = useState(false)
    const [isRequesting, setIsRequesting] = useState(false)

    useEffect(() => {
        async function loadData() {
            if (!params.id) return
            try {
                const [boardingData, reviewsData] = await Promise.all([
                    getBoardingById(params.id as string),
                    getReviewsByBoarding(params.id as string)
                ])
                setBoarding(boardingData)
                setReviews(reviewsData)

                // Load user specific interactions if student
                if (user?.id && user.role === 'STUDENT') {
                    const [savedResult, requestedResult] = await Promise.all([
                        checkIsSaved(boardingData.id, user.id),
                        checkHasRequested(boardingData.id, user.id)
                    ])
                    setIsSaved(savedResult)
                    setHasRequested(requestedResult)
                }

            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [params.id, user?.id, user?.role])

    async function handleReviewSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user || user.role !== 'STUDENT' || !boarding) return

        setIsSubmittingReview(true)
        try {
            const newReview = await createReview({
                boarding_id: boarding.id,
                student_id: user.id,
                rating,
                comment,
            })

            // Optistically add the review to the list
            const reviewWithUser = { ...newReview, users: { full_name: user.full_name || 'You' } }
            setReviews([reviewWithUser, ...reviews])
            setComment('')
            setRating(5)
        } catch (error) {
            console.error('Error submitting review:', error)
            alert('Failed to submit review.')
        } finally {
            setIsSubmittingReview(false)
        }
    }

    async function handleToggleSave() {
        if (!user) return router.push('/login')
        if (user.role !== 'STUDENT' || !boarding) return

        setIsSaving(true)
        try {
            const result = await toggleSavedBoarding(boarding.id, user.id)
            setIsSaved(result.action === 'saved')
        } catch (error) {
            console.error('Error toggling save:', error)
        } finally {
            setIsSaving(false)
        }
    }

    async function handleRequestBook() {
        if (!user) return router.push('/login')
        if (user.role !== 'STUDENT' || !boarding || hasRequested) return

        setIsRequesting(true)
        try {
            await createRequest(boarding.id, user.id)
            setHasRequested(true)
            alert('Request sent successfully! The owner will be notified.')
        } catch (error) {
            console.error('Error creating request:', error)
            alert('Failed to send request. Please try again.')
        } finally {
            setIsRequesting(false)
        }
    }

    if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500 font-medium">Loading property details...</div>
    if (!boarding) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500 font-medium">Property not found.</div>

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Top Gallery Header (Multiple Images) */}
            <div className="w-full h-[300px] md:h-[450px] relative bg-gray-900 overflow-hidden">
                {boarding.image_urls && boarding.image_urls.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 h-full w-full gap-1">
                        <div className="relative h-full col-span-1 md:col-span-2 row-span-2 cursor-pointer hover:opacity-95 transition-opacity">
                            <Image src={boarding.image_urls[0]} alt="Primary View" fill className="object-cover" />
                        </div>
                        {boarding.image_urls.slice(1, 5).map((url: string, index: number) => (
                            <div key={index} className="relative h-full hidden md:block cursor-pointer hover:opacity-95 transition-opacity">
                                <Image src={url} alt={`Property view ${index + 2}`} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                ) : boarding.image_url ? (
                    <Image src={boarding.image_url} alt={boarding.title} fill className="object-cover opacity-80" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-[#0A1435]"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>

                <div className="absolute top-4 sm:top-8 left-4 sm:left-8 right-4 sm:right-8 flex justify-between items-center z-10">
                    <Button variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-white/30 rounded-full" onClick={() => router.back()}>
                        &larr; Back
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" size="icon" className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-white/30 rounded-full h-10 w-10">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-white/30 rounded-full h-10 w-10">
                            <Heart className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Main Content Column */}
                    <div className="flex-1 space-y-8">
                        {/* Header info card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 font-semibold shadow-none">Verified</Badge>
                                {!boarding.is_available && <Badge variant="destructive" className="px-3 shadow-none">Currently Unavailable</Badge>}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A1435] mb-4 leading-tight">{boarding.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-medium text-gray-500 mb-6">
                                <div className="flex items-center gap-1.5 text-gray-700">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    {boarding.address}
                                </div>
                                {boarding.number_of_beds && (
                                    <div className="flex items-center gap-1.5 text-gray-700 sm:border-l sm:pl-6 border-gray-200">
                                        <span className="font-bold">{boarding.number_of_beds}</span>
                                        {boarding.number_of_beds === 1 ? 'Bed' : 'Beds'}
                                    </div>
                                )}
                                {avgRating > 0 && (
                                    <div className="flex items-center gap-1.5 sm:border-l sm:pl-6 border-gray-200">
                                        <Star className="h-4 w-4 text-[#F2994A] fill-current" />
                                        <span className="text-gray-900 font-bold">{avgRating.toFixed(1)}</span>
                                        <span>({reviews.length} reviews)</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                        {boarding.users?.full_name?.charAt(0) || 'O'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#0A1435] text-sm">Listed by</h3>
                                        <p className="text-gray-500 text-sm font-medium">{boarding.users?.full_name || 'Owner'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Distances */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6">
                            <div className="flex-1">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Distance to University</h3>
                                <p className="text-xl font-bold text-[#0A1435]">{boarding.distance_university || 'Not specified'}</p>
                            </div>
                            {boarding.distance_supermarket && (
                                <div className="flex-1 sm:border-l sm:pl-6 border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">To Supermarket</h3>
                                    <p className="text-xl font-bold text-[#0A1435]">{boarding.distance_supermarket}</p>
                                </div>
                            )}
                            {boarding.distance_town && (
                                <div className="flex-1 sm:border-l sm:pl-6 border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">To Town</h3>
                                    <p className="text-xl font-bold text-[#0A1435]">{boarding.distance_town}</p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-[#0A1435] mb-4">About this property</h2>
                            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                                {boarding.description || 'No description provided.'}
                            </div>
                        </div>

                        {/* Facilities */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-[#0A1435] mb-6">Facilities & Amenities</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                <div className="flex items-center gap-3 font-medium text-gray-700">
                                    <div className={`flex items-center justify-center h-6 w-6 rounded-full ${boarding.has_wifi ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {boarding.has_wifi ? <Check className="h-3 w-3" /> : <div className="h-1 w-1 rounded-full bg-current"></div>}
                                    </div>
                                    High-Speed WiFi
                                </div>
                                <div className="flex items-center gap-3 font-medium text-gray-700">
                                    <div className={`flex items-center justify-center h-6 w-6 rounded-full ${boarding.has_ac ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {boarding.has_ac ? <Check className="h-3 w-3" /> : <div className="h-1 w-1 rounded-full bg-current"></div>}
                                    </div>
                                    Air Conditioning
                                </div>
                                <div className="flex items-center gap-3 font-medium text-gray-700">
                                    <div className={`flex items-center justify-center h-6 w-6 rounded-full ${boarding.attached_bathroom ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {boarding.attached_bathroom ? <Check className="h-3 w-3" /> : <div className="h-1 w-1 rounded-full bg-current"></div>}
                                    </div>
                                    Attached Bathroom
                                </div>
                                {boarding.has_kitchen !== undefined && (
                                    <div className="flex items-center gap-3 font-medium text-gray-700">
                                        <div className={`flex items-center justify-center h-6 w-6 rounded-full ${boarding.has_kitchen ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {boarding.has_kitchen ? <Check className="h-3 w-3" /> : <div className="h-1 w-1 rounded-full bg-current"></div>}
                                        </div>
                                        Kitchen area
                                    </div>
                                )}
                                {boarding.has_balcony !== undefined && (
                                    <div className="flex items-center gap-3 font-medium text-gray-700">
                                        <div className={`flex items-center justify-center h-6 w-6 rounded-full ${boarding.has_balcony ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {boarding.has_balcony ? <Check className="h-3 w-3" /> : <div className="h-1 w-1 rounded-full bg-current"></div>}
                                        </div>
                                        Balcony access
                                    </div>
                                )}
                                {boarding.has_laundry !== undefined && (
                                    <div className="flex items-center gap-3 font-medium text-gray-700">
                                        <div className={`flex items-center justify-center h-6 w-6 rounded-full ${boarding.has_laundry ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {boarding.has_laundry ? <Check className="h-3 w-3" /> : <div className="h-1 w-1 rounded-full bg-current"></div>}
                                        </div>
                                        Laundry facilities
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rules */}
                        {boarding.rules && (
                            <div className="bg-[#FFF5EB] rounded-3xl p-8 shadow-sm border border-orange-100">
                                <h2 className="text-xl font-bold text-[#0A1435] mb-4">House Rules</h2>
                                <div className="text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">
                                    {boarding.rules}
                                </div>
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-[#0A1435] mb-8 flex items-center gap-2">
                                <Star className="h-5 w-5 fill-[#F2994A] text-[#F2994A]" />
                                {avgRating > 0 ? avgRating.toFixed(1) : 'No Ratings'}
                                <span className="text-gray-400 font-medium ml-1">· {reviews.length} reviews</span>
                            </h2>

                            {/* Add Review Form (Only for Students) */}
                            {user && user.role === 'STUDENT' && (
                                <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                    <h3 className="font-bold text-[#0A1435] mb-4">Leave a Review</h3>
                                    <div className="flex items-center gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`p-1 transition-colors ${rating >= star ? 'text-[#F2994A]' : 'text-gray-300 hover:text-gray-400'}`}
                                            >
                                                <Star className={`h-6 w-6 ${rating >= star ? 'fill-current' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        required
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your experience..."
                                        className="w-full h-24 rounded-xl border-gray-200 bg-white px-4 py-3 text-sm focus:ring-primary focus:border-primary mb-4 resize-none shadow-sm"
                                    ></textarea>
                                    <Button type="submit" disabled={isSubmittingReview} className="rounded-xl px-6 font-bold bg-[#0A1435]">
                                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                    </Button>
                                </form>
                            )}

                            <div className="space-y-6">
                                {reviews.length === 0 && <p className="text-gray-500 italic">No reviews yet.</p>}
                                {reviews.map((review) => (
                                    <div key={review.id} className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-[#0A1435] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                    {review.users?.full_name?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#0A1435] text-sm">{review.users?.full_name || 'Student'}</h4>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-[#F2994A] text-[#F2994A]' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-600 font-medium text-sm mt-3 ml-13 leading-relaxed">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar Widget (Sticky Pricing Info) */}
                    <div className="w-full lg:w-[360px] flex-shrink-0">
                        <div className="bg-white rounded-[24px] p-6 shadow-xl shadow-blue-900/5 border border-gray-100 lg:sticky lg:top-24">
                            <div className="mb-6 border-b pb-6 border-gray-100">
                                <span className="text-[32px] font-extrabold text-[#0A1435]">Rs {boarding.price.toLocaleString()}</span>
                                <span className="text-gray-500 font-medium text-lg"> / month</span>
                                {boarding.rent_includes_bills && (
                                    <div className="mt-3 flex items-center bg-green-50 text-green-700 px-3 py-1.5 w-fit rounded-full text-xs font-bold border border-green-200">
                                        <Check className="w-3.5 h-3.5 mr-1.5" /> Utilities Included (Water/Electricity)
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl mb-6 border border-gray-100">
                                <div className="flex items-start gap-3 text-sm">
                                    <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-600 font-medium">Protected against fraud. Only pay when you visit the property and sign the agreement.</p>
                                </div>
                            </div>

                            {boarding.google_maps_url && (
                                <Button
                                    variant="outline"
                                    className="w-full h-12 text-sm font-bold rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 mb-3"
                                    onClick={() => window.open(boarding.google_maps_url, '_blank')}
                                >
                                    <MapPin className="w-4 h-4 mr-2" /> View on Google Maps
                                </Button>
                            )}

                            {user?.role === 'OWNER' ? (
                                <p className="text-gray-500 text-sm text-center font-medium mt-4">You cannot book or save properties as an owner.</p>
                            ) : (
                                <>
                                    <Button
                                        onClick={handleRequestBook}
                                        disabled={!boarding.is_available || isRequesting || hasRequested}
                                        className={`w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-blue-900/20 mb-3 transition-all ${hasRequested ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#0A1435] hover:bg-[#0A1435]/90 text-white'}`}
                                    >
                                        {isRequesting ? 'Sending...' : hasRequested ? 'Request Sent' : 'Request to Book'}
                                    </Button>
                                    <Button
                                        variant={isSaved ? "default" : "outline"}
                                        onClick={handleToggleSave}
                                        disabled={isSaving}
                                        className={`w-full h-14 text-base font-bold rounded-2xl border-2 transition-all ${isSaved ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700' : ''}`}
                                    >
                                        {isSaving ? 'Updating...' : isSaved ? 'Saved to Favorites' : 'Save to Favorites'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
