import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from './RegisterForm'
import { Building2 } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Sign Up - BodiMate',
    description: 'Create a new BodiMate account.',
}

export default function RegisterPage() {
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
                        <h1 className="text-2xl font-extrabold text-[#0A1435]">Create an account</h1>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Enter your details to get started.</p>
                    </div>

                    <Suspense fallback={<div className="h-[400px] flex items-center justify-center">Loading form...</div>}>
                        <RegisterForm />
                    </Suspense>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-500">Already have an account? </span>
                        <Link href="/login" className="text-primary font-bold hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
