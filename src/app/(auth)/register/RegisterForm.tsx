'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Phone } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'

export function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State for all form fields to allow controlled inputs and dynamic rendering
    const [role, setRole] = useState<'STUDENT' | 'OWNER'>(searchParams.get('role') === 'owner' ? 'OWNER' : 'STUDENT')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [gender, setGender] = useState('Male')
    const [university, setUniversity] = useState('')
    const [age, setAge] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [agreedToTerms, setAgreedToTerms] = useState(false)

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const { setUser } = useUserStore()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        // Basic client-side validation
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            setIsLoading(false)
            return
        }

        if (!agreedToTerms) {
            setError('You must agree to the Terms and Conditions.')
            setIsLoading(false)
            return
        }

        try {
            // Include role-specific metadata
            const metadataPayload = {
                full_name: fullName,
                role: role,
                phone_number: phone,
                gender: gender,
                ...(role === 'STUDENT' ? { university } : {}),
                ...(role === 'OWNER' ? { age: parseInt(age) || null } : {})
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadataPayload,
                    // Email confirmation is optional but recommended in production
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (signUpError) throw signUpError

            // Sync with public users table
            if (data.user) {
                const newUser = {
                    id: data.user.id,
                    email: data.user.email!,
                    ...metadataPayload
                }

                const { error: insertError } = await supabase.from('users').insert(newUser)

                if (insertError) {
                    console.error('Error inserting user data', insertError)
                } else {
                    setUser(newUser as any)
                }
            }

            if (role === 'OWNER') {
                router.push('/dashboard')
            } else if (role === 'STUDENT') {
                router.push('/student/dashboard')
            } else {
                router.push('/')
            }
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'An error occurred during registration.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium break-words">
                    {error}
                </div>
            )}

            <div className="space-y-5">
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <label className="cursor-pointer">
                        <input
                            type="radio"
                            name="role"
                            value="STUDENT"
                            className="peer sr-only"
                            checked={role === 'STUDENT'}
                            onChange={() => setRole('STUDENT')}
                        />
                        <div className="rounded-xl border-2 border-gray-100 p-4 text-center text-sm font-bold peer-checked:border-primary peer-checked:bg-primary/5 hover:border-gray-200 transition-all text-gray-500 peer-checked:text-primary">
                            I'm a Student
                        </div>
                    </label>
                    <label className="cursor-pointer">
                        <input
                            type="radio"
                            name="role"
                            value="OWNER"
                            className="peer sr-only"
                            checked={role === 'OWNER'}
                            onChange={() => setRole('OWNER')}
                        />
                        <div className="rounded-xl border-2 border-gray-100 p-4 text-center text-sm font-bold peer-checked:border-primary peer-checked:bg-primary/5 hover:border-gray-200 transition-all text-gray-500 peer-checked:text-primary">
                            I'm an Owner
                        </div>
                    </label>
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name</Label>
                        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <Phone className="h-4 w-4" />
                            </span>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" required className="h-12 pl-10 bg-gray-50 border-gray-200 focus-visible:ring-primary" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-700 font-medium mb-1 block">Gender</Label>
                        <RadioGroup
                            value={gender}
                            onValueChange={setGender}
                            className="flex space-x-4 h-12 items-center px-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Male" id="r1" />
                                <Label htmlFor="r1" className="cursor-pointer font-normal text-gray-700">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Female" id="r2" />
                                <Label htmlFor="r2" className="cursor-pointer font-normal text-gray-700">Female</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                {/* Role Specific Fields */}
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">
                        {role === 'STUDENT' ? 'Student Details' : 'Owner Details'}
                    </h3>

                    {role === 'STUDENT' ? (
                        <div className="space-y-1.5">
                            <Label htmlFor="university" className="text-gray-700 font-medium">University / Institute</Label>
                            <select
                                id="university"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                required
                                className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 font-medium outline-none h-12"
                            >
                                <option value="" disabled>Select your university</option>
                                <option value="University of Moratuwa">University of Moratuwa</option>
                                <option value="University of Kelaniya">University of Kelaniya</option>
                                <option value="University of Colombo">University of Colombo</option>
                            </select>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <Label htmlFor="age" className="text-gray-700 font-medium">Age</Label>
                            <Input id="age" type="number" min="18" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 45" required className="h-12 bg-white border-gray-200 focus-visible:ring-primary" />
                        </div>
                    )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary" />
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3 pt-4 border-t border-gray-100">
                    <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(c) => setAgreedToTerms(c as boolean)} className="mt-1 flex-shrink-0" />
                    <Label htmlFor="terms" className="text-sm font-normal text-gray-600 leading-relaxed cursor-pointer inline-block">
                        I agree to the <a href="#" className="font-bold text-primary hover:underline">Terms &amp; Conditions</a> and acknowledge that my data will be used in accordance with the <a href="#" className="font-bold text-primary hover:underline">Privacy Policy</a>.
                    </Label>
                </div>
            </div>

            <Button className="w-full h-12 text-base font-bold bg-[#0A1435] hover:bg-[#0A1435]/90 rounded-xl shadow-md" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create account
            </Button>
        </form>
    )
}
