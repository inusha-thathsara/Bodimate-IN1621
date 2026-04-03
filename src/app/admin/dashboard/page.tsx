import { redirect } from 'next/navigation'
import { BarChart3, BedDouble, Building2, Clock3, FileText, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    const { data: roleData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (roleData?.role !== 'ADMIN') {
        redirect('/')
    }

    const [
        totalUsersResult,
        totalStudentsResult,
        totalOwnersResult,
        totalListingsResult,
        availableListingsResult,
        totalRequestsResult,
        pendingRequestsResult,
        acceptedRequestsResult,
        totalReviewsResult,
        recentRequestsResult,
        recentUsersResult,
    ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'STUDENT'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'OWNER'),
        supabase.from('boardings').select('id', { count: 'exact', head: true }),
        supabase.from('boardings').select('id', { count: 'exact', head: true }).eq('is_available', true),
        supabase.from('requests').select('id', { count: 'exact', head: true }),
        supabase.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabase.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'ACCEPTED'),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase
            .from('requests')
            .select('id, status, created_at, users!requests_student_id_fkey(full_name), boardings(title)')
            .order('created_at', { ascending: false })
            .limit(6),
        supabase
            .from('users')
            .select('id, full_name, email, role, created_at')
            .order('created_at', { ascending: false })
            .limit(6),
    ])

    const totalUsers = totalUsersResult.count ?? 0
    const totalStudents = totalStudentsResult.count ?? 0
    const totalOwners = totalOwnersResult.count ?? 0
    const totalListings = totalListingsResult.count ?? 0
    const availableListings = availableListingsResult.count ?? 0
    const totalRequests = totalRequestsResult.count ?? 0
    const pendingRequests = pendingRequestsResult.count ?? 0
    const acceptedRequests = acceptedRequestsResult.count ?? 0
    const totalReviews = totalReviewsResult.count ?? 0

    const recentRequests = recentRequestsResult.data ?? []
    const recentUsers = recentUsersResult.data ?? []

    return (
        <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/80">Admin Panel</p>
                    <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">Platform Analytics</h1>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">Monitor students, owners, listings, and booking activity in one place.</p>
                </div>
                <form action="/admin/dashboard" method="get">
                    <Button type="submit" variant="outline" className="rounded-xl">Refresh Metrics</Button>
                </form>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Users</p>
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-4 text-3xl font-extrabold text-foreground">{totalUsers}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Students: {totalStudents} · Owners: {totalOwners}</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Listings</p>
                        <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-4 text-3xl font-extrabold text-foreground">{totalListings}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Available: {availableListings}</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Booking Requests</p>
                        <BedDouble className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-4 text-3xl font-extrabold text-foreground">{totalRequests}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Pending: {pendingRequests} · Accepted: {acceptedRequests}</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reviews</p>
                        <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-4 text-3xl font-extrabold text-foreground">{totalReviews}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Platform engagement indicator</p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-primary" />
                        <h2 className="text-lg font-bold text-foreground">Latest Booking Requests</h2>
                    </div>

                    {recentRequests.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No requests yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentRequests.map((request: any) => (
                                <div key={request.id} className="rounded-xl border border-border/70 bg-muted/30 p-3">
                                    <p className="text-sm font-semibold text-foreground">{request.boardings?.title || 'Listing'}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">By {request.users?.full_name || 'Student'} · {request.status}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{new Date(request.created_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <h2 className="text-lg font-bold text-foreground">Recently Joined Users</h2>
                    </div>

                    {recentUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No users found.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentUsers.map((account: any) => (
                                <div key={account.id} className="rounded-xl border border-border/70 bg-muted/30 p-3">
                                    <p className="text-sm font-semibold text-foreground">{account.full_name || account.email}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{account.email}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Role: {account.role} · Joined {new Date(account.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
