'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Star, Heart, Share2, ShieldCheck, Check, ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { getBoardingById, getReviewsByBoarding, createReview, createRequest, toggleSavedBoarding, checkIsSaved, getRequestForStudentBoarding } from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import QRCode from 'qrcode'

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
    const [saveError, setSaveError] = useState<string | null>(null)
    const [requestStatus, setRequestStatus] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED' | null>(null)
    const [isRequesting, setIsRequesting] = useState(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
    const [isShareOpen, setIsShareOpen] = useState(false)
    const [shareQrDataUrl, setShareQrDataUrl] = useState('')
    const [isGeneratingQr, setIsGeneratingQr] = useState(false)
    const [shareError, setShareError] = useState<string | null>(null)
    const [shareUrl, setShareUrl] = useState('')

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

                // Load user specific interactions if student and if boarding exists
                if (boardingData && user?.id && user?.role === 'STUDENT') {
                    const [savedResult, requestResult] = await Promise.all([
                        checkIsSaved(boardingData.id, user.id),
                        getRequestForStudentBoarding(boardingData.id, user.id)
                    ])
                    setIsSaved(savedResult)
                    setRequestStatus(requestResult?.status || null)
                }

            } catch (error) {
                console.error('Error loading data:', error)
                // Avoid infinite loading even on failure
                setBoarding(null)
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
        if (user.role !== 'STUDENT' || !boarding || isSaving) return

        const previousSaved = isSaved
        setIsSaving(true)
        setSaveError(null)
        setIsSaved(!previousSaved)

        try {
            const result = await Promise.race([
                toggleSavedBoarding(boarding.id, user.id),
                new Promise<never>((_, reject) => {
                    window.setTimeout(() => reject(new Error('Favorite update timed out. Please try again.')), 10000)
                }),
            ])

            setIsSaved(result.action === 'saved')
        } catch (error) {
            console.error('Error toggling save:', error)
            setIsSaved(previousSaved)
            setSaveError(error instanceof Error ? error.message : 'Unable to update favorites. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    async function handleRequestBook() {
        if (!user) return router.push('/login')
        if (user.role !== 'STUDENT' || !boarding || requestStatus) return

        setIsRequesting(true)
        try {
            await createRequest(boarding.id, user.id)
            setRequestStatus('PENDING')
            alert('Request sent successfully! The owner will be notified.')
        } catch (error) {
            console.error('Error creating request:', error)
            alert('Failed to send request. Please try again.')
        } finally {
            setIsRequesting(false)
        }
    }

    const galleryImages = boarding?.image_urls?.length > 0
        ? boarding.image_urls
        : (boarding?.image_url ? [boarding.image_url] : [])

    const hasMultipleImages = galleryImages.length > 1

    const showPrevImage = useCallback(() => {
        if (galleryImages.length === 0) return
        setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
    }, [galleryImages.length])

    const showNextImage = useCallback(() => {
        if (galleryImages.length === 0) return
        setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
    }, [galleryImages.length])

    useEffect(() => {
        if (!boarding?.id || typeof window === 'undefined') return
        setShareUrl(`${window.location.origin}/boardings/${boarding.id}`)
    }, [boarding?.id])

    const openShareModal = async () => {
        if (!boarding) return

        setIsShareOpen(true)
        setShareError(null)

        if (shareQrDataUrl) return
        if (!shareUrl) {
            setShareError('Unable to prepare the listing link right now.')
            return
        }

        setIsGeneratingQr(true)
        try {
            const dataUrl = await QRCode.toDataURL(shareUrl, {
                width: 720,
                margin: 2,
                errorCorrectionLevel: 'M',
                color: {
                    dark: '#0A1435',
                    light: '#FFFFFF',
                },
            })
            setShareQrDataUrl(dataUrl)
        } catch (error) {
            console.error('Error generating QR code:', error)
            setShareError('Unable to generate the QR code right now.')
        } finally {
            setIsGeneratingQr(false)
        }
    }

    const handleDownloadQr = () => {
        if (!shareQrDataUrl || !boarding) return

        const link = document.createElement('a')
        link.href = shareQrDataUrl
        link.download = `bodimate-${boarding.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    useEffect(() => {
        if (!isFullscreenOpen) return

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsFullscreenOpen(false)
            }
            if (event.key === 'ArrowLeft') {
                showPrevImage()
            }
            if (event.key === 'ArrowRight') {
                showNextImage()
            }
        }

        window.addEventListener('keydown', onKeyDown)
        document.body.style.overflow = 'hidden'

        return () => {
            window.removeEventListener('keydown', onKeyDown)
            document.body.style.overflow = ''
        }
    }, [isFullscreenOpen, showPrevImage, showNextImage])

    if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground font-medium">Loading property details...</div>
    if (!boarding) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground font-medium">Property not found.</div>

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return (
        <div className="bg-background min-h-screen pb-24">
            {/* Top Gallery Header (Multiple Images) */}
            <div className="w-full h-[300px] md:h-[450px] relative bg-gray-900 overflow-hidden">
                {galleryImages.length > 0 ? (
                    <div className="relative h-full w-full">
                        <button
                            type="button"
                            onClick={() => setIsFullscreenOpen(true)}
                            className="absolute bottom-4 right-4 z-20 h-10 px-3 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center gap-2 text-sm font-semibold"
                        >
                            <Expand className="h-4 w-4" />
                            Fullscreen
                        </button>

                        <Image
                            src={galleryImages[selectedImageIndex]}
                            alt={`Property view ${selectedImageIndex + 1}`}
                            fill
                            priority
                            sizes="100vw"
                            className="pointer-events-none select-none object-cover"
                        />

                        {hasMultipleImages && (
                            <>
                                <button
                                    type="button"
                                    onClick={showPrevImage}
                                    className="absolute left-4 top-1/2 z-30 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center transition-colors pointer-events-auto"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={showNextImage}
                                    className="absolute right-4 top-1/2 z-30 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center transition-colors pointer-events-auto"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}

                        {hasMultipleImages && (
                            <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-1">
                                {galleryImages.map((url: string, index: number) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`relative h-14 w-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImageIndex === index ? 'border-white' : 'border-white/40'}`}
                                        aria-label={`Show image ${index + 1}`}
                                    >
                                        <Image
                                            src={url}
                                            alt={`Thumbnail ${index + 1}`}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : boarding.image_url ? (
                    <Image src={boarding.image_url} alt={boarding.title} fill priority sizes="100vw" className="object-cover opacity-80" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-[#0A1435]"></div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>

                <div className="absolute top-4 sm:top-8 left-4 sm:left-8 right-4 sm:right-8 flex justify-between items-center z-10">
                    <Button variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-white/30 rounded-full" onClick={() => router.back()}>
                        &larr; Back
                    </Button>
                    <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-white/30 rounded-full h-10 w-10"
                                onClick={openShareModal}
                                aria-label="Share listing"
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                        {user?.role !== 'OWNER' && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className={`bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-white/30 rounded-full h-10 w-10 ${isSaved ? 'bg-red-500/30 hover:bg-red-500/40 border-red-300/40' : ''}`}
                                onClick={handleToggleSave}
                                disabled={isSaving}
                                aria-pressed={isSaved}
                                aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
                            >
                                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Main Content Column */}
                    <div className="flex-1 space-y-8">
                        {/* Header info card */}
                        <div className="bg-card text-card-foreground rounded-3xl p-8 shadow-sm border border-border">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 font-semibold shadow-none">Verified</Badge>
                                {!boarding.is_available && <Badge variant="destructive" className="px-3 shadow-none">Currently Unavailable</Badge>}
                                {boarding.preferred_gender && boarding.preferred_gender !== 'Any' && (
                                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none px-3 font-semibold shadow-none">
                                        {boarding.preferred_gender}s Only
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">{boarding.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-medium text-muted-foreground mb-6">
                                <div className="flex items-center gap-1.5 text-foreground/85">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    {boarding.address}
                                </div>
                                {boarding.number_of_beds && (
                                    <div className="flex items-center gap-1.5 text-foreground/85 sm:border-l sm:pl-6 border-border">
                                        <span className="font-bold">{boarding.number_of_beds}</span>
                                        {boarding.number_of_beds === 1 ? 'Bed' : 'Beds'}
                                    </div>
                                )}
                                {avgRating > 0 && (
                                    <div className="flex items-center gap-1.5 sm:border-l sm:pl-6 border-border">
                                        <Star className="h-4 w-4 text-[#F2994A] fill-current" />
                                        <span className="text-foreground font-bold">{avgRating.toFixed(1)}</span>
                                        <span>({reviews.length} reviews)</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-border">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                        {boarding.users?.full_name?.charAt(0) || 'O'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-sm">Listed by</h3>
                                        <p className="text-muted-foreground text-sm font-medium">{boarding.users?.full_name || 'Owner'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Distances */}
                        <div className="bg-card text-card-foreground rounded-3xl p-8 shadow-sm border border-border flex flex-col sm:flex-row gap-6">
                            <div className="flex-1">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Distance to University</h3>
                                <p className="text-xl font-bold text-foreground">{boarding.distance_university || 'Not specified'}</p>
                            </div>
                            {boarding.distance_supermarket && (
                                <div className="flex-1 sm:border-l sm:pl-6 border-border">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">To Supermarket</h3>
                                    <p className="text-xl font-bold text-foreground">{boarding.distance_supermarket}</p>
                                </div>
                            )}
                            {boarding.distance_town && (
                                <div className="flex-1 sm:border-l sm:pl-6 border-border">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">To Town</h3>
                                    <p className="text-xl font-bold text-foreground">{boarding.distance_town}</p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-card text-card-foreground rounded-3xl p-8 shadow-sm border border-border">
                            <h2 className="text-xl font-bold text-foreground mb-4">About this property</h2>
                            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                                {boarding.description || 'No description provided.'}
                            </div>
                        </div>

                        {/* Full Photo Gallery */}
                        {galleryImages.length > 0 && (
                            <div className="bg-card text-card-foreground rounded-3xl p-8 shadow-sm border border-border">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-foreground">Photo Gallery</h2>
                                    <span className="text-sm font-semibold text-muted-foreground">{galleryImages.length} photos</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {galleryImages.map((url: string, index: number) => (
                                        <button
                                            key={`${url}-${index}`}
                                            type="button"
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-primary shadow-sm' : 'border-border hover:border-foreground/30'}`}
                                            aria-label={`View property photo ${index + 1}`}
                                        >
                                            <Image
                                                src={url}
                                                alt={`Property photo ${index + 1}`}
                                                fill
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Facilities */}
                        <div className="bg-card text-card-foreground rounded-3xl p-8 shadow-sm border border-border">
                            <h2 className="text-xl font-bold text-foreground mb-6">Facilities & Amenities</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                <div className="flex items-center gap-3 font-medium text-foreground/85">
                                    <div className={`flex items-center justify-center h-6 w-6 rounded-full ${boarding.has_wifi ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {boarding.has_wifi ? <Check className="h-3 w-3" /> : <div className="h-1 w-1 rounded-full bg-current"></div>}
                                    </div>
                                    High-Speed WiFi
                                </div>
                                <div className="flex items-center gap-3 font-medium text-foreground/85">
                                    <div className={`flex items-center justify-center h-6 w-6 rounded-full ${boarding.has_ac ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {boarding.has_ac ? <Check className="h-3 w-3" /> : <div className="h-1 w-1 rounded-full bg-current"></div>}
                                    </div>
                                    Air Conditioning
                                </div>
                                <div className="flex items-center gap-3 font-medium text-foreground/85">
                                    <div className={`flex items-center justify-center h-6 w-6 rounded-full ${boarding.attached_bathroom ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {boarding.attached_bathroom ? <Check className="h-3 w-3" /> : <div className="h-1 w-1 rounded-full bg-current"></div>}
                                    </div>
                                    Attached Bathroom
                                </div>
                                {boarding.has_kitchen !== undefined && (
                                    <div className="flex items-center gap-3 font-medium text-foreground/85">
                                        <div className={`flex items-center justify-center h-6 w-6 rounded-full ${boarding.has_kitchen ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {boarding.has_kitchen ? <Check className="h-3 w-3" /> : <div className="h-1 w-1 rounded-full bg-current"></div>}
                                        </div>
                                        Kitchen area
                                    </div>
                                )}
                                {boarding.has_balcony !== undefined && (
                                    <div className="flex items-center gap-3 font-medium text-foreground/85">
                                        <div className={`flex items-center justify-center h-6 w-6 rounded-full ${boarding.has_balcony ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {boarding.has_balcony ? <Check className="h-3 w-3" /> : <div className="h-1 w-1 rounded-full bg-current"></div>}
                                        </div>
                                        Balcony access
                                    </div>
                                )}
                                {boarding.has_laundry !== undefined && (
                                    <div className="flex items-center gap-3 font-medium text-foreground/85">
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
                            <div className="bg-card text-card-foreground rounded-3xl p-8 shadow-sm border border-border">
                                <h2 className="text-xl font-bold text-foreground mb-4">House Rules</h2>
                                <div className="text-muted-foreground font-medium whitespace-pre-wrap leading-relaxed">
                                    {boarding.rules}
                                </div>
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div className="bg-card text-card-foreground rounded-3xl p-8 shadow-sm border border-border">
                            <h2 className="text-xl font-bold text-foreground mb-8 flex items-center gap-2">
                                <Star className="h-5 w-5 fill-[#F2994A] text-[#F2994A]" />
                                {avgRating > 0 ? avgRating.toFixed(1) : 'No Ratings'}
                                <span className="text-muted-foreground font-medium ml-1">· {reviews.length} reviews</span>
                            </h2>

                            {/* Add Review Form (Only for Students) */}
                            {user && user.role === 'STUDENT' && (
                                <form onSubmit={handleReviewSubmit} className="bg-muted/40 rounded-2xl p-6 mb-8 border border-border">
                                    <h3 className="font-bold text-foreground mb-4">Leave a Review</h3>
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
                                        className="w-full h-24 rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:ring-primary focus:border-primary mb-4 resize-none shadow-sm"
                                    ></textarea>
                                    <Button type="submit" disabled={isSubmittingReview} className="rounded-xl px-6 font-bold bg-[#0A1435]">
                                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                    </Button>
                                </form>
                            )}

                            <div className="space-y-6">
                                {reviews.length === 0 && <p className="text-muted-foreground italic">No reviews yet.</p>}
                                {reviews.map((review) => (
                                    <div key={review.id} className="pb-6 border-b border-border/50 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                                                    {review.users?.full_name?.charAt(0) || 'S'}
                                                </div>
                                                <div>

                                                    <h4 className="font-bold text-foreground text-sm">{review.users?.full_name || 'Student'}</h4>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-[#F2994A] text-[#F2994A]' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="text-muted-foreground font-medium text-sm mt-3 ml-13 leading-relaxed">
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
                        <div className="bg-card text-card-foreground rounded-[24px] p-6 shadow-xl shadow-blue-900/5 border border-border lg:sticky lg:top-24">
                            <div className="mb-6 border-b pb-6 border-border">
                                <span className="text-[32px] font-extrabold text-foreground">Rs {boarding.price.toLocaleString()}</span>
                                <span className="text-muted-foreground font-medium text-lg"> / month</span>
                                {boarding.rent_includes_bills && (
                                    <div className="mt-3 flex items-center bg-green-50 text-green-700 px-3 py-1.5 w-fit rounded-full text-xs font-bold border border-green-200">
                                        <Check className="w-3.5 h-3.5 mr-1.5" /> Utilities Included (Water/Electricity)
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-muted/40 rounded-2xl mb-6 border border-border">
                                <div className="flex items-start gap-3 text-sm">
                                    <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-muted-foreground font-medium">Protected against fraud. Only pay when you visit the property and sign the agreement.</p>
                                </div>
                            </div>

                            {boarding.google_maps_url && (
                                <Button
                                    variant="outline"
                                    className="w-full h-12 text-sm font-bold rounded-xl border-border text-foreground hover:bg-accent mb-3"
                                    onClick={() => window.open(boarding.google_maps_url, '_blank')}
                                >
                                    <MapPin className="w-4 h-4 mr-2" /> View on Google Maps
                                </Button>
                            )}

                            {user?.role === 'OWNER' ? (
                                <p className="text-muted-foreground text-sm text-center font-medium mt-4">You cannot book or save properties as an owner.</p>
                            ) : (
                                <>
                                    <Button
                                        onClick={handleRequestBook}
                                        disabled={!boarding.is_available || isRequesting || !!requestStatus}
                                        className={`w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-blue-900/20 mb-3 transition-all ${
                                            requestStatus === 'ACCEPTED'
                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                : requestStatus === 'REJECTED'
                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                    : requestStatus === 'PENDING'
                                                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                                        : 'bg-[#0A1435] hover:bg-[#0A1435]/90 text-white'
                                            }`}
                                    >
                                        {isRequesting
                                            ? 'Sending...'
                                            : requestStatus === 'ACCEPTED'
                                                ? 'Request Accepted'
                                                : requestStatus === 'REJECTED'
                                                    ? 'Request Rejected'
                                                    : requestStatus === 'PENDING'
                                                        ? 'Request Pending'
                                                        : 'Request to Book'}
                                    </Button>
                                    <Button
                                        variant={isSaved ? "default" : "outline"}
                                        onClick={handleToggleSave}
                                        disabled={isSaving}
                                        className={`w-full h-14 text-base font-bold rounded-2xl border-2 transition-all ${isSaved ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700' : ''}`}
                                    >
                                        {isSaving ? (isSaved ? 'Removing...' : 'Updating...') : isSaved ? 'Saved to Favorites' : 'Save to Favorites'}
                                    </Button>
                                    {saveError && (
                                        <p className="mt-3 text-sm font-medium text-destructive">{saveError}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {isFullscreenOpen && galleryImages.length > 0 && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm"
                    onClick={() => setIsFullscreenOpen(false)}
                >
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation()
                            setIsFullscreenOpen(false)
                        }}
                        className="absolute top-4 right-4 z-20 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                        aria-label="Close fullscreen gallery"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="absolute inset-0 flex items-center justify-center px-6 py-16" onClick={(event) => event.stopPropagation()}>
                        <div className="relative w-full max-w-6xl h-[70vh] sm:h-[75vh]">
                            <Image
                                src={galleryImages[selectedImageIndex]}
                                alt={`Fullscreen property view ${selectedImageIndex + 1}`}
                                fill
                                sizes="100vw"
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {hasMultipleImages && (
                        <>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    showPrevImage()
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    showNextImage()
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>

                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 max-w-[90vw] overflow-x-auto">
                                <div className="flex gap-2 bg-black/40 rounded-xl px-3 py-2">
                                    {galleryImages.map((url: string, index: number) => (
                                        <button
                                            key={`fullscreen-${url}-${index}`}
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                setSelectedImageIndex(index)
                                            }}
                                            className={`relative h-14 w-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${selectedImageIndex === index ? 'border-white' : 'border-white/40'}`}
                                            aria-label={`Select image ${index + 1}`}
                                        >
                                            <Image
                                                src={url}
                                                alt={`Fullscreen thumbnail ${index + 1}`}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {isShareOpen && (
                <div
                    className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8"
                    onClick={() => setIsShareOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <h2 className="text-2xl font-extrabold text-[#0A1435]">Share listing</h2>
                                <p className="text-sm text-gray-500 mt-1">Scan the QR code to open this property on any device.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsShareOpen(false)}
                                className="h-9 w-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
                                aria-label="Close share dialog"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {shareError ? (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                                {shareError}
                            </div>
                        ) : isGeneratingQr ? (
                            <div className="flex h-72 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-gray-500 font-medium">
                                Generating QR code...
                            </div>
                        ) : shareQrDataUrl ? (
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                    <Image
                                        src={shareQrDataUrl}
                                        alt={`QR code for ${boarding?.title || 'listing'}`}
                                        width={720}
                                        height={720}
                                        unoptimized
                                        className="mx-auto h-auto w-full max-w-sm rounded-xl bg-white p-3"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Listing Link</label>
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 break-all">
                                        {shareUrl}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={handleDownloadQr}
                                        className="flex-1 h-12 rounded-xl bg-[#0A1435] hover:bg-[#0A1435]/90 font-bold"
                                    >
                                        Download QR as Image
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigator.clipboard.writeText(shareUrl)}
                                        className="h-12 rounded-xl font-bold"
                                    >
                                        Copy Link
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    )
}
