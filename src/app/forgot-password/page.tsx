'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const supabase = createClient()
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            })

            if (resetError) throw resetError

            setSuccess('We sent a password reset link if that email exists in our system. Check your inbox and spam folder.')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reset email.')
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
                        <h1 className="text-2xl font-extrabold text-foreground">Reset your password</h1>
                        <p className="mt-2 text-sm font-medium text-muted-foreground">Enter your email and we&apos;ll send you a secure reset link.</p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive break-words">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="space-y-6 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <MailCheck className="h-7 w-7" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{success}</p>
                            <Button onClick={() => router.push('/login')} className="h-12 w-full rounded-xl font-bold">
                                Back to login
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="font-medium text-foreground">Email address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    required
                                    className="h-12 rounded-xl border-border bg-background/80 focus-visible:ring-primary"
                                />
                            </div>

                            <Button className="h-12 w-full rounded-xl text-base font-bold" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send reset link
                            </Button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    )
}
