'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { getBoardingById, updateBoarding } from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'
import { Loader2, UploadCloud, X, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function EditBoardingPage() {
    const router = useRouter()
    const params = useParams()
    const { user } = useUserStore()

    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [boarding, setBoarding] = useState<any>(null)

    // Form State
    const [facilities, setFacilities] = useState({
        has_wifi: false,
        has_ac: false,
        attached_bathroom: false,
        has_kitchen: false,
        has_balcony: false,
        has_laundry: false,
    })
    const [rentIncludesBills, setRentIncludesBills] = useState(false)
    const [preferredGender, setPreferredGender] = useState('Any')
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
    const [newImages, setNewImages] = useState<File[]>([])
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

    useEffect(() => {
        async function fetchBoarding() {
            try {
                const data = await getBoardingById(params.id as string)
                setBoarding(data)
                setFacilities({
                    has_wifi: !!data.has_wifi,
                    has_ac: !!data.has_ac,
                    attached_bathroom: !!data.attached_bathroom,
                    has_kitchen: !!data.has_kitchen,
                    has_balcony: !!data.has_balcony,
                    has_laundry: !!data.has_laundry,
                })
                setRentIncludesBills(!!data.rent_includes_bills)
                setPreferredGender(data.preferred_gender || 'Any')
                setExistingImageUrls(data.image_urls || (data.image_url ? [data.image_url] : []))
            } catch (err) {
                console.error(err)
                setError('Failed to load boarding details.')
            } finally {
                setIsFetching(false)
            }
        }
        if (params.id) fetchBoarding()
    }, [params.id])

    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            const totalCount = existingImageUrls.length + newImages.length + newFiles.length

            if (totalCount > 5) {
                alert('You can only have a maximum of 5 images.')
                return
            }

            const updatedNewFiles = [...newImages, ...newFiles]
            setNewImages(updatedNewFiles)

            const previews = updatedNewFiles.map(file => URL.createObjectURL(file))
            setNewImagePreviews(previews)
        }
    }

    const removeExistingImage = (index: number) => {
        const updated = [...existingImageUrls]
        updated.splice(index, 1)
        setExistingImageUrls(updated)
    }

    const removeNewImage = (index: number) => {
        const updatedFiles = [...newImages]
        updatedFiles.splice(index, 1)
        setNewImages(updatedFiles)

        const updatedPreviews = [...newImagePreviews]
        URL.revokeObjectURL(updatedPreviews[index])
        updatedPreviews.splice(index, 1)
        setNewImagePreviews(updatedPreviews)
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!user || !boarding) return

        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)

        try {
            const supabase = createClient()
            const uploadedUrls: string[] = [...existingImageUrls]

            // Upload new images
            if (newImages.length > 0) {
                for (const file of newImages) {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
                    const filePath = `${user.id}/${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('boarding_images')
                        .upload(filePath, file)

                    if (uploadError) throw new Error('Failed to upload images.')

                    const { data: { publicUrl } } = supabase.storage
                        .from('boarding_images')
                        .getPublicUrl(filePath)

                    uploadedUrls.push(publicUrl)
                }
            }

            await updateBoarding(boarding.id, {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                price: Number(formData.get('price')),
                rent_includes_bills: rentIncludesBills,
                address: formData.get('address') as string,
                number_of_beds: Number(formData.get('numberOfBeds')),
                google_maps_url: formData.get('googleMapsUrl') as string || null,
                distance_university: formData.get('distanceUniversity') as string,
                distance_supermarket: formData.get('distanceSupermarket') as string || null,
                rules: formData.get('rules') as string || null,
                preferred_gender: preferredGender,
                // Primary image
                image_url: uploadedUrls.length > 0 ? uploadedUrls[0] : null,
                image_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
                has_wifi: facilities.has_wifi,
                has_ac: facilities.has_ac,
                attached_bathroom: facilities.attached_bathroom,
                has_kitchen: facilities.has_kitchen,
                has_balcony: facilities.has_balcony,
                has_laundry: facilities.has_laundry,
            })

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to update boarding listing.')
            setIsLoading(false)
        }
    }

    if (isFetching) return <div className="py-12 text-center text-gray-500 font-medium">Loading listing details...</div>
    if (!boarding) return <div className="py-12 text-center text-gray-500 font-medium">Boarding not found.</div>

    return (
        <div className="max-w-4xl mx-auto px-4 w-full">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/dashboard" className="text-sm font-bold text-primary flex items-center gap-2 mb-2 hover:opacity-70 transition-opacity">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-extrabold text-[#0A1435]">Edit Property</h1>
                    <p className="text-gray-500 font-medium mt-1">Update your property information.</p>
                </div>
            </div>

            <form onSubmit={onSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-12">
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium mb-6">
                        {error}
                    </div>
                )}

                <div className="space-y-10">
                    {/* Basic Details */}
                    <div>
                        <h3 className="text-lg font-bold text-[#0A1435] border-b pb-2 mb-6">Basic Details</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-gray-900 font-bold">Property Title</Label>
                                <Input id="title" name="title" defaultValue={boarding.title} required className="h-12 bg-gray-50 border-gray-200" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-gray-900 font-bold">Monthly Rent (Rs)</Label>
                                    <Input id="price" name="price" type="number" min="0" defaultValue={boarding.price} required className="h-12 bg-gray-50 border-gray-200" />
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Checkbox id="rentIncludesBills" checked={rentIncludesBills} onCheckedChange={(c) => setRentIncludesBills(!!c)} />
                                        <Label htmlFor="rentIncludesBills" className="text-sm cursor-pointer text-gray-600">Rent includes bills</Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="numberOfBeds" className="text-gray-900 font-bold">Number of Beds</Label>
                                    <Input id="numberOfBeds" name="numberOfBeds" type="number" min="1" defaultValue={boarding.number_of_beds || 1} required className="h-12 bg-gray-50 border-gray-200" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-gray-900 font-bold">Description</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    defaultValue={boarding.description || ''}
                                    rows={4}
                                    className="w-full flex min-h-[80px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="text-lg font-bold text-[#0A1435] border-b pb-2 mb-6">Location & Access</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-gray-900 font-bold">Address</Label>
                                <Input id="address" name="address" defaultValue={boarding.address} required className="h-12 bg-gray-50 border-gray-200" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="googleMapsUrl" className="text-gray-900 font-bold">Google Maps URL</Label>
                                <Input id="googleMapsUrl" name="googleMapsUrl" type="url" defaultValue={boarding.google_maps_url || ''} className="h-12 bg-gray-50 border-gray-200" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="distanceUniversity" className="text-gray-900 font-bold">Distance to Uni *</Label>
                                    <Input id="distanceUniversity" name="distanceUniversity" defaultValue={boarding.distance_university || ''} required className="h-12 bg-gray-50 border-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="distanceSupermarket" className="text-gray-900 font-bold text-sm">To Supermarket</Label>
                                    <Input id="distanceSupermarket" name="distanceSupermarket" defaultValue={boarding.distance_supermarket || ''} className="h-12 bg-gray-50 border-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="distanceTown" className="text-gray-900 font-bold text-sm">To Town</Label>
                                    <Input id="distanceTown" name="distanceTown" defaultValue={boarding.distance_town || ''} className="h-12 bg-gray-50 border-gray-200" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Photos */}
                    <div>
                        <h3 className="text-lg font-bold text-[#0A1435] border-b pb-2 mb-6">Photos ({existingImageUrls.length + newImages.length}/5)</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                            {/* Existing Images */}
                            {existingImageUrls.map((url, index) => (
                                <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary/20 group">
                                    <Image src={url} alt={`Existing ${index}`} fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] py-0.5 text-center font-bold">CURRENT</div>
                                </div>
                            ))}

                            {/* New Image Previews */}
                            {newImagePreviews.map((preview, index) => (
                                <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-green-500/20 group">
                                    <Image src={preview} alt={`New ${index}`} fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-[10px] py-0.5 text-center font-bold">NEW</div>
                                </div>
                            ))}

                            {/* Upload Trigger */}
                            {(existingImageUrls.length + newImages.length) < 5 && (
                                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                                    <span className="text-[10px] font-bold text-gray-500">ADD PHOTO</span>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleNewImageChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Facilities & Rules */}
                    <div>
                        <h3 className="text-lg font-bold text-[#0A1435] border-b pb-2 mb-6">Facilities & Rules</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <Checkbox id="wifi" checked={facilities.has_wifi} onCheckedChange={(c) => setFacilities(prev => ({ ...prev, has_wifi: !!c }))} />
                                <Label htmlFor="wifi" className="font-medium cursor-pointer">WiFi</Label>
                            </div>
                            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <Checkbox id="ac" checked={facilities.has_ac} onCheckedChange={(c) => setFacilities(prev => ({ ...prev, has_ac: !!c }))} />
                                <Label htmlFor="ac" className="font-medium cursor-pointer">A/C</Label>
                            </div>
                            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <Checkbox id="bathroom" checked={facilities.attached_bathroom} onCheckedChange={(c) => setFacilities(prev => ({ ...prev, attached_bathroom: !!c }))} />
                                <Label htmlFor="bathroom" className="font-medium cursor-pointer">Attached Bath</Label>
                            </div>
                            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <Checkbox id="kitchen" checked={facilities.has_kitchen} onCheckedChange={(c) => setFacilities(prev => ({ ...prev, has_kitchen: !!c }))} />
                                <Label htmlFor="kitchen" className="font-medium cursor-pointer">Kitchen</Label>
                            </div>
                            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <Checkbox id="balcony" checked={facilities.has_balcony} onCheckedChange={(c) => setFacilities(prev => ({ ...prev, has_balcony: !!c }))} />
                                <Label htmlFor="balcony" className="font-medium cursor-pointer">Balcony</Label>
                            </div>
                            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <Checkbox id="laundry" checked={facilities.has_laundry} onCheckedChange={(c) => setFacilities(prev => ({ ...prev, has_laundry: !!c }))} />
                                <Label htmlFor="laundry" className="font-medium cursor-pointer">Laundry</Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rules" className="text-gray-900 font-bold">House Rules</Label>
                            <textarea
                                id="rules"
                                name="rules"
                                defaultValue={boarding.rules || ''}
                                rows={3}
                                className="w-full flex min-h-[80px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                placeholder="Any specific rules students should follow..."
                            ></textarea>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            <Label className="text-gray-900 font-bold">Preferred Tenant Gender</Label>
                            <RadioGroup value={preferredGender} onValueChange={setPreferredGender} className="flex space-x-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100 w-fit">
                                <div className="flex items-center space-x-2.5">
                                    <RadioGroupItem value="Any" id="gender-any" className="text-primary border-gray-300" />
                                    <Label htmlFor="gender-any" className="cursor-pointer font-bold text-gray-700">Any</Label>
                                </div>
                                <div className="flex items-center space-x-2.5">
                                    <RadioGroupItem value="Male" id="gender-male" className="text-primary border-gray-300" />
                                    <Label htmlFor="gender-male" className="cursor-pointer font-bold text-gray-700">Boys Only</Label>
                                </div>
                                <div className="flex items-center space-x-2.5">
                                    <RadioGroupItem value="Female" id="gender-female" className="text-primary border-gray-300" />
                                    <Label htmlFor="gender-female" className="cursor-pointer font-bold text-gray-700">Girls Only</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button className="w-full h-14 text-lg font-extrabold bg-[#0A1435] hover:bg-[#0A1435]/90 rounded-2xl shadow-xl shadow-blue-900/10" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Update Property Listing
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

