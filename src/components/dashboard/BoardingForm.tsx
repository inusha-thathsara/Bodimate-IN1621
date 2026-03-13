'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createBoarding } from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'
import { Loader2, UploadCloud, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function BoardingForm() {
    const router = useRouter()
    const { user } = useUserStore()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

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
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            if (images.length + newFiles.length > 5) {
                alert('You can only upload a maximum of 5 images.')
                return
            }

            const updatedFiles = [...images, ...newFiles].slice(0, 5)
            setImages(updatedFiles)

            // Create previews
            const previews = updatedFiles.map(file => URL.createObjectURL(file))
            setImagePreviews(previews)
        }
    }

    const removeImage = (index: number) => {
        const newImages = [...images]
        newImages.splice(index, 1)
        setImages(newImages)

        const newPreviews = [...imagePreviews]
        URL.revokeObjectURL(newPreviews[index])
        newPreviews.splice(index, 1)
        setImagePreviews(newPreviews)
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!user) return

        setIsLoading(true)
        setError(null)

        if (images.length !== 5) {
            setError('Please upload exactly 5 images of the property before publishing.')
            setIsLoading(false)
            return
        }

        const formData = new FormData(event.currentTarget)

        try {
            const supabase = createClient()
            const uploadedUrls: string[] = []

            // Upload images
            if (images.length > 0) {
                for (const file of images) {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
                    const filePath = `${user.id}/${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('boarding_images')
                        .upload(filePath, file)

                    if (uploadError) {
                        console.error('Upload error', uploadError)
                        throw new Error('Failed to upload one or more images. Make sure the storage bucket is properly configured.')
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('boarding_images')
                        .getPublicUrl(filePath)

                    uploadedUrls.push(publicUrl)
                }
            }

            await createBoarding({
                owner_id: user.id,
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
                // Keep the first image as the primary image_url for backwards compatibility in lists
                image_url: uploadedUrls.length > 0 ? uploadedUrls[0] : null,
                image_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
                has_wifi: facilities.has_wifi,
                has_ac: facilities.has_ac,
                attached_bathroom: facilities.attached_bathroom,
                has_kitchen: facilities.has_kitchen,
                has_balcony: facilities.has_balcony,
                has_laundry: facilities.has_laundry,
                is_available: true,
            })

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to create boarding listing.')
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="max-w-3xl bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mx-auto">
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium mb-6">
                    {error}
                </div>
            )}

            <div className="space-y-8">
                {/* Basic Details */}
                <div>
                    <h3 className="text-lg font-bold text-[#0A1435] border-b pb-2 mb-4">Basic Details</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-gray-900 font-bold">Property Title</Label>
                            <Input id="title" name="title" placeholder="e.g. Modern Annex near Moratuwa UNI" required className="h-12 bg-gray-50 border-gray-200" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-gray-900 font-bold">Monthly Rent (Rs)</Label>
                                <Input id="price" name="price" type="number" min="0" placeholder="e.g. 15000" required className="h-12 bg-gray-50 border-gray-200" />
                                <div className="flex items-center space-x-2 mt-2">
                                    <Checkbox id="rentIncludesBills" checked={rentIncludesBills} onCheckedChange={(c) => setRentIncludesBills(!!c)} />
                                    <Label htmlFor="rentIncludesBills" className="text-sm cursor-pointer text-gray-600">Rent includes bills (water, electricity, etc.)</Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="numberOfBeds" className="text-gray-900 font-bold">Number of Beds</Label>
                                <Input id="numberOfBeds" name="numberOfBeds" type="number" min="1" placeholder="e.g. 2" required className="h-12 bg-gray-50 border-gray-200" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-gray-900 font-bold">Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                className="w-full flex min-h-[80px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                placeholder="Describe the property, environment..."
                                required
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Location & Distances */}
                <div>
                    <h3 className="text-lg font-bold text-[#0A1435] border-b pb-2 mb-4">Location & Distances</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-gray-900 font-bold">Address</Label>
                            <Input id="address" name="address" placeholder="e.g. 123 Main St, Moratuwa" required className="h-12 bg-gray-50 border-gray-200" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="googleMapsUrl" className="text-gray-900 font-bold">Google Maps URL (Optional)</Label>
                            <Input id="googleMapsUrl" name="googleMapsUrl" type="url" placeholder="https://maps.google.com/..." className="h-12 bg-gray-50 border-gray-200" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="distanceUniversity" className="text-gray-900 font-bold">Distance to University *</Label>
                                <Input id="distanceUniversity" name="distanceUniversity" placeholder="e.g. 500m or 10 mins walk" required className="h-12 bg-gray-50 border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="distanceSupermarket" className="text-gray-900 font-bold text-sm">Distance to Supermarket (Optional)</Label>
                                <Input id="distanceSupermarket" name="distanceSupermarket" placeholder="e.g. 1km" className="h-12 bg-gray-50 border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="distanceTown" className="text-gray-900 font-bold text-sm">Distance to Town (Optional)</Label>
                                <Input id="distanceTown" name="distanceTown" placeholder="e.g. 2km" className="h-12 bg-gray-50 border-gray-200" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div>
                    <h3 className="text-lg font-bold text-[#0A1435] border-b pb-2 mb-4">Photos (Required: 5)</h3>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 font-medium">Upload 5 clear photos so students can review the full property before requesting.</p>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> images</p>
                                    <p className="text-xs text-gray-500">PNG, JPG or WEBP (Exactly 5)</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} disabled={images.length >= 5} />
                            </label>
                        </div>

                        <p className="text-xs font-semibold text-gray-500">Uploaded: {images.length}/5</p>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
                                        <Image src={preview} alt={`Preview ${index}`} fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Facilities & Rules */}
                <div>
                    <h3 className="text-lg font-bold text-[#0A1435] border-b pb-2 mb-4">Facilities & Rules</h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                            <Label htmlFor="rules" className="text-gray-900 font-bold">House Rules (Optional)</Label>
                            <textarea
                                id="rules"
                                name="rules"
                                rows={3}
                                className="w-full flex min-h-[80px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                placeholder="e.g. No smoking, visitors allowed until 9 PM..."
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
                </div>

                <div className="pt-6">
                    <Button className="w-full h-12 text-base font-bold bg-[#0A1435] hover:bg-[#0A1435]/90 rounded-xl" type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish Listing
                    </Button>
                </div>
            </div>
        </form>
    )
}

