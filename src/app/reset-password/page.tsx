'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, CheckCircle2, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        async function checkSession() {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setError('Your reset link is missing or expired. Please request a new one.')
            }

            setIsCheckingSession(false)
        }

        checkSession()
    }, [])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setIsLoading(true)

        try {
            const supabase = createClient()
            const { error: updateError } = await supabase.auth.updateUser({ password })

            if (updateError) throw updateError

            setSuccess(true)

            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (userData?.role === 'OWNER') {
                    router.push('/dashboard')
                } else if (userData?.role === 'STUDENT') {
                    router.push('/student/dashboard')
                } else {
                    router.push('/')
                }
                router.refresh()
            } else {
                router.push('/login')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update password.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#F6F8FD] py-12">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-2 rounded-xl">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-primary">BodiMate</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-extrabold text-[#0A1435]">Create a new password</h1>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Choose a strong password for your account.</p>
                    </div>

                    {isCheckingSession ? (
                        <div className="py-12 text-center text-gray-500 font-medium">Checking your reset link...</div>
                    ) : success ? (
                        <div className="space-y-6 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Your password has been updated.</p>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-6">
                            {error && (
                                <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600 break-words">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-gray-700 font-medium">New password</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter a new password"
                                        required
                                        className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm new password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat the new password"
                                    required
                                    className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary"
                                />
                            </div>

                            <Button className="w-full h-12 text-base font-bold bg-[#0A1435] hover:bg-[#0A1435]/90 rounded-xl" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update password
                            </Button>
                        </form>
                    )}

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-500">Need a fresh reset link? </span>
                        <Link href="/forgot-password" className="text-primary font-bold hover:underline">
                            Request one again
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
