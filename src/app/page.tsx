import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Building2, Search, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-12 mb-24">
      <div className="bg-primary/10 p-4 rounded-full mb-6">
        <Building2 className="h-12 w-12 text-primary" />
      </div>

      <h1 className="text-5xl md:text-6xl font-extrabold text-[#0A1435] tracking-tight mb-6 max-w-3xl">
        Find Your Perfect <br className="hidden sm:block" />
        University Boarding
      </h1>

      <p className="text-xl text-gray-500 mb-10 max-w-2xl font-medium">
        The premier Web-Based Boarding Management System designed exclusively for university students. Discover, filter, and secure your new home.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <Link href="/boardings">
          <Button className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-lg shadow-blue-900/20 bg-[#0A1435] hover:bg-[#0A1435]/90">
            Browse Boardings
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link href="/register?role=owner">
          <Button variant="outline" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto font-bold border-2">
            List Your Property
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Search className="h-6 w-6 text-[#0A1435]" />
          </div>
          <h3 className="text-xl font-bold text-[#0A1435] mb-3">Smart Search</h3>
          <p className="text-gray-500 font-medium">Filter by distance to campus, price range, and specific facilities like WiFi and AC.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-[#0A1435] mb-3">Verified Listings</h3>
          <p className="text-gray-500 font-medium">Every boarding is verified to ensure it meets our quality and safety standards.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Building2 className="h-6 w-6 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-[#0A1435] mb-3">Direct Contact</h3>
          <p className="text-gray-500 font-medium">Communicate directly with boarding owners to arrange viewings and ask questions.</p>
        </div>
      </div>
    </div>
  )
}
