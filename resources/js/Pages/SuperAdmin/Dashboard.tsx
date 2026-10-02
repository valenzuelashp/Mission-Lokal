import { Head, Link } from '@inertiajs/react';
import { Building2, Users, FileText, ShieldAlert, ArrowRight } from 'lucide-react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Button } from '@/Components/ui/button';

export default function SuperAdminDashboard({ stats, recent_barangays = [] }: { stats: any; recent_barangays: any[] }) {
    return (
        <SuperAdminLayout title="Super Administrator Overview">
            <Head title="Super Admin Dashboard" />

            <div className="space-y-6">
                {/* Top Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-1">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-semibold uppercase tracking-wider">Total Barangays</span>
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{stats.total_barangays}</p>
                        <p className="text-xs text-muted-foreground">Active multi-tenant nodes</p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-1">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-semibold uppercase tracking-wider">Platform Users</span>
                            <Users className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{stats.total_users}</p>
                        <p className="text-xs text-muted-foreground">Residents, personnel & admins</p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-1">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-semibold uppercase tracking-wider">Global Concerns</span>
                            <FileText className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{stats.total_concerns}</p>
                        <p className="text-xs text-muted-foreground">Reported across all nodes</p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-1">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-semibold uppercase tracking-wider">Active Missions</span>
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{stats.active_missions}</p>
                        <p className="text-xs text-muted-foreground">Ongoing field responses</p>
                    </div>
                </div>

                {/* Recent Barangays Section */}
                <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Recently Provisioned Barangays</h3>
                            <p className="text-xs text-muted-foreground">Latest tenant nodes added to the platform</p>
                        </div>
                        <Link href="/super-admin/barangays">
                            <Button variant="outline" size="sm" className="gap-2">
                                View All Nodes <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>

                    <div className="divide-y">
                        {recent_barangays.length > 0 ? (
                            recent_barangays.map((b) => (
                                <div key={b.id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900 text-sm">{b.name}</h4>
                                                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">{b.code}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Registered on {b.created_at}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                        <span><strong>{b.users_count}</strong> Users</span>
                                        <span><strong>{b.concerns_count}</strong> Reports</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${b.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                            {b.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">No barangays provisioned yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}