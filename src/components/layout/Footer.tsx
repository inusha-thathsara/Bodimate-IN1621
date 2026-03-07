export function Footer() {
    return (
        <footer className="bg-gray-50 border-t py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <span className="font-bold text-xl tracking-tight text-primary">BodiMate</span>
                        <p className="mt-4 text-sm text-gray-500 max-w-sm">
                            The premier Web-Based Boarding Management System for university students.
                            Find the perfect place to stay or list your boarding to thousands of students.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 tracking-wider uppercase text-sm">For Students</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="/boardings" className="text-sm text-gray-500 hover:text-gray-900">Browse Boardings</a></li>
                            <li><a href="/register?role=student" className="text-sm text-gray-500 hover:text-gray-900">Sign Up</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 tracking-wider uppercase text-sm">For Owners</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="/dashboard/boardings/new" className="text-sm text-gray-500 hover:text-gray-900">List Your Property</a></li>
                            <li><a href="/register?role=owner" className="text-sm text-gray-500 hover:text-gray-900">Become a Host</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} BodiMate Inc. All rights reserved.
                    </p>
                    <div className="flex gap-4 text-sm text-gray-400">
                        <a href="#" className="hover:text-gray-900">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-900">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
