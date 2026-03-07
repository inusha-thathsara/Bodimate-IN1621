'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const defaultRole = searchParams.get('role') === 'owner' ? 'OWNER' : 'STUDENT'

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string
        const role = formData.get('role') as 'STUDENT' | 'OWNER'

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                    // Email confirmation is optional but recommended in production
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (signUpError) throw signUpError

            // Since we disable email confirmation to make it easier for testing,
            // manually insert user data into our public users table
            if (data.user) {
                const { error: insertError } = await supabase.from('users').insert({
                    id: data.user.id,
                    email: data.user.email!,
                    full_name: fullName,
                    role: role,
                })

                if (insertError) {
                    console.error('Error inserting user data', insertError)
                }
            }

            router.push('/')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'An error occurred during registration.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <label className="cursor-pointer">
                        <input
                            type="radio"
                            name="role"
                            value="STUDENT"
                            className="peer sr-only"
                            defaultChecked={defaultRole === 'STUDENT'}
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
                            defaultChecked={defaultRole === 'OWNER'}
                        />
                        <div className="rounded-xl border-2 border-gray-100 p-4 text-center text-sm font-bold peer-checked:border-primary peer-checked:bg-primary/5 hover:border-gray-200 transition-all text-gray-500 peer-checked:text-primary">
                            I'm an Owner
                        </div>
                    </label>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name</Label>
                    <Input id="fullName" name="fullName" placeholder="John Doe" required className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" required className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                    <Input id="password" name="password" type="password" required minLength={6} className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary" />
                </div>
            </div>

            <Button className="w-full h-12 text-base font-bold bg-[#0A1435] hover:bg-[#0A1435]/90 rounded-xl mt-2" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create account
            </Button>
        </form>
    )
}
