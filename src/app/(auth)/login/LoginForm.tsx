'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Controlled inputs for Email, Password, and Remember Me
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        // Load saved email if 'Remember Me' was used previously
        const savedEmail = localStorage.getItem('bodimate_remembered_email')
        if (savedEmail) {
            setEmail(savedEmail)
            setRememberMe(true)
        }
    }, [])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // Handle Remember Me persistence
            if (rememberMe) {
                localStorage.setItem('bodimate_remembered_email', email)
            } else {
                localStorage.removeItem('bodimate_remembered_email')
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) throw signInError

            const { data: { user } } = await supabase.auth.getUser()

            // Fetch user role to determine where to redirect
            const { data: userData, error: roleError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user?.id || '')
                .single()

            if (roleError) console.error("Could not fetch user role during login redirect", roleError)

            if (userData?.role === 'OWNER') {
                router.push('/dashboard')
            } else if (userData?.role === 'STUDENT') {
                router.push('/student/dashboard')
            } else {
                router.push('/')
            }
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign in.')
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

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                        <a href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">Forgot password?</a>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary"
                    />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="data-[state=checked]:bg-[#0A1435] data-[state=checked]:border-[#0A1435]"
                    />
                    <Label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none cursor-pointer text-gray-700"
                    >
                        Remember me
                    </Label>
                </div>
            </div>

            <Button className="w-full h-12 text-base font-bold bg-[#0A1435] hover:bg-[#0A1435]/90 rounded-xl" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
            </Button>
        </form>
    )
}
