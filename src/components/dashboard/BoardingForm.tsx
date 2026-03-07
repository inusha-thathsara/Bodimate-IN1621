'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createBoarding } from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'
import { Loader2 } from 'lucide-react'

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
    })

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!user) return

        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)

        try {
            await createBoarding({
                owner_id: user.id,
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                price: Number(formData.get('price')),
                address: formData.get('address') as string,
                image_url: formData.get('imageUrl') as string,
                has_wifi: facilities.has_wifi,
                has_ac: facilities.has_ac,
                attached_bathroom: facilities.attached_bathroom,
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
        <form onSubmit={onSubmit} className="max-w-2xl bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium mb-6">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-900 font-bold">Property Title</Label>
                    <Input id="title" name="title" placeholder="e.g. Modern Annex near Kelaniya UNI" required className="h-12 bg-gray-50 border-gray-200" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-900 font-bold">Description</Label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        className="w-full flex min-h-[80px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Describe the property, rules, and environment..."
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="price" className="text-gray-900 font-bold">Monthly Rent (Rs)</Label>
                        <Input id="price" name="price" type="number" min="0" placeholder="e.g. 15000" required className="h-12 bg-gray-50 border-gray-200" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-gray-900 font-bold">Address / Location</Label>
                        <Input id="address" name="address" placeholder="e.g. 123 Main St, Kelaniya" required className="h-12 bg-gray-50 border-gray-200" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="imageUrl" className="text-gray-900 font-bold">Cover Image URL (Optional)</Label>
                    <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://unsplash.com/..." className="h-12 bg-gray-50 border-gray-200" />
                    <p className="text-xs text-gray-500 font-medium">In a real app this would be a file upload to Supabase Storage.</p>
                </div>

                {/* Facilities Section */}
                <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-gray-900 font-bold mb-4">Facilities Included</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <Checkbox
                                id="wifi"
                                checked={facilities.has_wifi}
                                onCheckedChange={(c) => setFacilities(prev => ({ ...prev, has_wifi: !!c }))}
                            />
                            <Label htmlFor="wifi" className="font-medium cursor-pointer">WiFi</Label>
                        </div>

                        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <Checkbox
                                id="ac"
                                checked={facilities.has_ac}
                                onCheckedChange={(c) => setFacilities(prev => ({ ...prev, has_ac: !!c }))}
                            />
                            <Label htmlFor="ac" className="font-medium cursor-pointer">Air Conditioning</Label>
                        </div>

                        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <Checkbox
                                id="bathroom"
                                checked={facilities.attached_bathroom}
                                onCheckedChange={(c) => setFacilities(prev => ({ ...prev, attached_bathroom: !!c }))}
                            />
                            <Label htmlFor="bathroom" className="font-medium cursor-pointer">Attached Bath</Label>
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
