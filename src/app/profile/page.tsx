'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, ArrowLeft, Save, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function ProfilePage() {
    const { user, setUser } = useUserStore()
    const router = useRouter()
    const supabase = createClient()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

    // Form State
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [gender, setGender] = useState('Male')
    const [university, setUniversity] = useState('')
    const [age, setAge] = useState('')

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (error) {
                setMessage({ type: 'error', text: 'Could not load profile data.' })
                setIsLoading(false)
                return
            }

            if (profile) {
                setFullName(profile.full_name || '')
                setPhone(profile.phone_number || '')
                setGender(profile.gender || 'Male')
                setUniversity(profile.university || '')
                setAge(profile.age ? profile.age.toString() : '')
                setUser(profile as any)
            }
            setIsLoading(false)
        }

        loadProfile()
    }, [router, supabase, setUser])

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!user) return

        setIsSaving(true)
        setMessage(null)

        const updates = {
            full_name: fullName,
            phone_number: phone,
            gender: gender,
            ...(user.role === 'STUDENT' ? { university } : {}),
            ...(user.role === 'OWNER' ? { age: parseInt(age) || null } : {})
        }

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)

        if (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile.' })
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            setUser({ ...user, ...updates } as any)
        }
        setIsSaving(false)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) return null // Handled by redirect inside useEffect

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#0A1435] tracking-tight">Edit Profile</h1>
                    <p className="text-gray-500 font-medium mt-2">Manage your personal information and account settings.</p>
                </div>
                <Link href={user.role === 'OWNER' ? '/dashboard' : '/student/dashboard'}>
                    <Button variant="outline" className="gap-2 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50 h-11">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl border border-primary/20 shadow-inner">
                            {fullName.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-2xl text-[#0A1435]">{fullName || 'User'}</h3>
                            <p className="text-gray-500 font-medium">{user.email}</p>
                            <div className="mt-3">
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 font-bold shadow-none text-xs">
                                    {user.role === 'OWNER' ? 'BOARDING OWNER' : 'STUDENT'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                            <Label htmlFor="fullName" className="text-gray-900 font-bold ml-1">Full Name</Label>
                            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="space-y-2.5">
                            <Label htmlFor="phone" className="text-gray-900 font-bold ml-1">Phone Number</Label>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-primary focus:border-primary" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-gray-900 font-bold ml-1 uppercase text-xs tracking-wider">Gender Preference</Label>
                        <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 w-fit">
                            <div className="flex items-center space-x-2.5">
                                <RadioGroupItem value="Male" id="r1" className="text-primary border-gray-300" />
                                <Label htmlFor="r1" className="cursor-pointer font-bold text-gray-700">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2.5">
                                <RadioGroupItem value="Female" id="r2" className="text-primary border-gray-300" />
                                <Label htmlFor="r2" className="cursor-pointer font-bold text-gray-700">Female</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {user.role === 'STUDENT' && (
                        <div className="space-y-2.5 pt-4 border-t border-gray-50">
                            <Label htmlFor="university" className="text-gray-900 font-bold ml-1">University / Institute</Label>
                            <div className="relative">
                                <select
                                    id="university"
                                    value={university}
                                    onChange={(e) => setUniversity(e.target.value)}
                                    required
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-3.5 pr-10 font-bold outline-none h-12 transition-all"
                                >
                                    <option value="" disabled>Select your university</option>
                                    <option value="University of Moratuwa">University of Moratuwa</option>
                                    <option value="University of Kelaniya">University of Kelaniya</option>
                                    <option value="University of Colombo">University of Colombo</option>
                                    <option value="University of Sri Jayewardenepura">University of Sri Jayewardenepura</option>
                                    <option value="SLIIT">SLIIT</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    )}

                    {user.role === 'OWNER' && (
                        <div className="space-y-2.5 pt-4 border-t border-gray-50">
                            <Label htmlFor="age" className="text-gray-900 font-bold ml-1">Age</Label>
                            <Input id="age" type="number" min="18" value={age} onChange={(e) => setAge(e.target.value)} required className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-primary focus:border-primary md:w-1/3 font-bold" />
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-50">
                        <Button type="submit" disabled={isSaving} className="w-full sm:w-auto h-14 px-10 rounded-2xl font-bold bg-[#0A1435] hover:bg-[#0A1435]/90 text-white shadow-lg shadow-blue-900/10 transition-all ml-auto block">
                            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
