export function Footer() {
    return (
        <footer className="bg-background border-t border-border py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <span className="font-bold text-xl tracking-tight text-primary">BodiMate</span>
                        <p className="mt-4 text-sm text-muted-foreground max-w-sm">
                            The premier Web-Based Boarding Management System for university students.
                            Find the perfect place to stay or list your boarding to thousands of students.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground tracking-wider uppercase text-sm">For Students</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="/boardings" className="text-sm text-muted-foreground hover:text-foreground">Browse Boardings</a></li>
                            <li><a href="/register?role=student" className="text-sm text-muted-foreground hover:text-foreground">Sign Up</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground tracking-wider uppercase text-sm">For Owners</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="/dashboard/boardings/new" className="text-sm text-muted-foreground hover:text-foreground">List Your Property</a></li>
                            <li><a href="/register?role=owner" className="text-sm text-muted-foreground hover:text-foreground">Become a Host</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} BodiMate Inc. All rights reserved.
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-foreground">Privacy Policy</a>
                        <a href="#" className="hover:text-foreground">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
