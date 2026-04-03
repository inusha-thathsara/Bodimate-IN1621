import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './LoginForm'
import { Building2 } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Log In - BodiMate',
    description: 'Log in to your BodiMate account.',
}

export default function LoginPage() {
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
                        <h1 className="text-2xl font-extrabold text-foreground">Welcome back</h1>
                        <p className="mt-2 text-sm font-medium text-muted-foreground">Please enter your details to sign in.</p>
                    </div>

                    <LoginForm />

                    <div className="mt-8 text-center text-sm">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <Link href="/register" className="text-primary font-bold hover:underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
