import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Privacy Policy - BodiMate',
    description: 'Learn how BodiMate collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
    const effectiveDate = 'April 4, 2026'

    return (
        <div className="bg-background">
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Link>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
                <p className="mt-3 text-sm text-muted-foreground">Effective date: {effectiveDate}</p>

                <div className="mt-8 space-y-8 rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">1. Overview</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            BodiMate respects your privacy. This policy explains what information we collect, how we use it,
                            and the choices you have when using our platform as a student, owner, or administrator.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">2. Information We Collect</h2>
                        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                            <li>Account details such as name, email, role, phone number, gender, and optional profile data.</li>
                            <li>Listing information submitted by owners, including property details, pricing, amenities, and images.</li>
                            <li>Booking requests, reviews, saved listings, and notification activity generated in the app.</li>
                            <li>Technical and security information needed to keep the service functional and secure.</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">3. How We Use Information</h2>
                        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                            <li>To create and manage your account and role-based access.</li>
                            <li>To provide core features such as listings, booking requests, reviews, and notifications.</li>
                            <li>To improve platform reliability, safety, analytics, and user experience.</li>
                            <li>To communicate service updates, account notices, and support responses.</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">4. Data Sharing</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            We do not sell personal data. Relevant information is shared between users only as required by the
                            service (for example, owner and student interactions around listings and requests). We may also use
                            trusted service providers for hosting, authentication, and storage.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">5. Data Retention and Security</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            We retain information for as long as needed to provide the service and meet legal obligations. We
                            apply reasonable technical and organizational safeguards, but no online service can guarantee absolute
                            security.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">6. Your Rights</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            You can request access, correction, or deletion of your account data where applicable. You may also
                            close your account by contacting support.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">7. Children&apos;s Privacy</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            BodiMate is intended for users who can lawfully enter into agreements. We do not knowingly collect
                            personal data from children who are below the legal age in applicable jurisdictions.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">8. Changes to This Policy</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            We may update this policy from time to time. Material changes will be reflected by updating the
                            effective date on this page.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">9. Contact</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            For privacy questions, contact the BodiMate team at: <span className="font-semibold">inusha.thathsara@gmail.com</span>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
