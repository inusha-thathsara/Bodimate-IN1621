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
                } else if (userData?.role === 'ADMIN') {
                    router.push('/admin/dashboard')
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
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background py-12">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-2 rounded-xl">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-primary">BodiMate</span>
                    </Link>
                </div>

                <div className="rounded-3xl border border-border bg-card p-8 shadow-sm shadow-black/5">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-extrabold text-foreground">Create a new password</h1>
                        <p className="mt-2 text-sm font-medium text-muted-foreground">Choose a strong password for your account.</p>
                    </div>

                    {isCheckingSession ? (
                        <div className="py-12 text-center font-medium text-muted-foreground">Checking your reset link...</div>
                    ) : success ? (
                        <div className="space-y-6 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Your password has been updated.</p>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-6">
                            {error && (
                                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive break-words">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="font-medium text-foreground">New password</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter a new password"
                                        required
                                        className="h-12 rounded-xl border-border bg-background/80 pl-10 focus-visible:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword" className="font-medium text-foreground">Confirm new password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat the new password"
                                    required
                                    className="h-12 rounded-xl border-border bg-background/80 focus-visible:ring-primary"
                                />
                            </div>

                            <Button className="h-12 w-full rounded-xl text-base font-bold" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update password
                            </Button>
                        </form>
                    )}

                    <div className="mt-8 text-center text-sm">
                        <span className="text-muted-foreground">Need a fresh reset link? </span>
                        <Link href="/forgot-password" className="text-primary font-bold hover:underline">
                            Request one again
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
