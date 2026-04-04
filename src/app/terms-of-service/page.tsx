import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Terms of Service - BodiMate',
    description: 'Read the terms that govern your use of the BodiMate platform.',
}

export default function TermsOfServicePage() {
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
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Terms of Service</h1>
                <p className="mt-3 text-sm text-muted-foreground">Effective date: {effectiveDate}</p>

                <div className="mt-8 space-y-8 rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            By creating an account or using BodiMate, you agree to these Terms of Service. If you do not agree,
                            do not use the platform.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">2. Platform Purpose</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            BodiMate connects students seeking accommodation with owners who list boarding properties.
                            BodiMate facilitates discovery and communication but is not a party to rental agreements.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">3. Account Responsibilities</h2>
                        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                            <li>You must provide accurate registration and profile details.</li>
                            <li>You are responsible for maintaining account security and password confidentiality.</li>
                            <li>You must not impersonate others or misuse role-based permissions.</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">4. Owner Obligations</h2>
                        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                            <li>Listings must be accurate, lawful, and up to date.</li>
                            <li>Owners must not publish misleading pricing, availability, or property details.</li>
                            <li>Owners are solely responsible for agreements made with students.</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">5. Student Obligations</h2>
                        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                            <li>Students must use the platform in good faith and provide truthful booking information.</li>
                            <li>Reviews and requests must be respectful, lawful, and not abusive.</li>
                            <li>Students are responsible for independently verifying listing suitability before commitment.</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">6. Prohibited Conduct</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            You must not submit unlawful content, attempt unauthorized access, disrupt platform operations,
                            or use BodiMate to harass, defraud, or harm other users.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">7. Content and Intellectual Property</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Users retain rights to their submitted content but grant BodiMate a limited license to host,
                            display, and process that content for service operation. The BodiMate brand and platform assets
                            remain owned by their respective rights holders.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">8. Disclaimers and Liability</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            BodiMate is provided on an "as is" basis. We do not guarantee listing accuracy, uninterrupted
                            availability, or outcomes of user agreements. To the fullest extent permitted by law, liability is
                            limited for indirect or consequential losses.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">9. Account Suspension or Termination</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            We may suspend or terminate accounts that violate these terms, applicable laws, or platform safety
                            policies.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">10. Changes to Terms</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            We may update these terms over time. Continued use after updates means you accept the revised terms.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-xl font-bold">11. Contact</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Questions about these terms can be sent to: <span className="font-semibold">inusha.thathsara@gmail.com</span>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
