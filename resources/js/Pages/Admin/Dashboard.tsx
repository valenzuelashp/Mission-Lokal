import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, FileText, Filter, Plus, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import ActivityFeed from '@/Components/admin/ActivityFeed';
import AdminOperationMap from '@/Components/admin/AdminOperationMap';
import IncidentQueueTable from '@/Components/admin/IncidentQueueTable';
import KpiCard from '@/Components/admin/KpiCard';
import { Button } from '@/Components/ui/button';
import AdminLayout from '@/Layouts/AdminLayout';
import type { AdminDashboardPageProps } from '@/Types';

export default function Dashboard({ stats, incidents = [], activities = [], map_pins = [], registrations = [] }: AdminDashboardPageProps) {
    return (
        <AdminLayout title="Mission-Lokal Admin: Dashboard">
            <Head title="Admin Dashboard" />

            <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-4 xl:grid-cols-5">
                <KpiCard
                    label="Total reports"
                    value={stats.total_reports}
                    icon={FileText}
                    hint="All concerns in this barangay"
                />
                <KpiCard
                    label="Ongoing missions"
                    value={stats.ongoing_missions}
                    icon={Sparkles}
                    hint={
                        stats.high_priority
                            ? `${stats.high_priority} high / critical reports`
                            : 'Active operations'
                    }
                />
                <KpiCard
                    label="Accomplished"
                    value={stats.accomplished}
                    icon={CheckCircle2}
                    trend={{ value: 'Real-time resolved', positive: true }}
                    iconClassName="bg-emerald-50 text-emerald-600"
                />
                <KpiCard
                    label="Pending verification"
                    value={stats.pending_verification}
                    icon={ShieldCheck}
                    hint="Requires completion sign-off"
                    iconClassName="bg-amber-50 text-amber-600"
                />
                <KpiCard
                    label="Resident registrations"
                    value={stats.pending_registrations ?? 0}
                    icon={UserPlus}
                    hint="Waiting for ID comparison"
                    iconClassName="bg-blue-50 text-blue-700"
                />
            </div>

            {stats.by_severity && (
                <div className="mb-4 flex flex-wrap gap-2 text-xs sm:mb-6">
                    {(
                        [
                            ['critical', stats.by_severity.critical, 'bg-red-100 text-red-800'],
                            ['high', stats.by_severity.high, 'bg-orange-100 text-orange-800'],
                            ['medium', stats.by_severity.medium, 'bg-amber-100 text-amber-800'],
                            ['low', stats.by_severity.low, 'bg-emerald-100 text-emerald-800'],
                        ] as const
                    ).map(([label, count, className]) => (
                        <span key={label} className={`rounded-full px-2.5 py-1 font-medium capitalize ${className}`}>
                            {label}: {count}
                        </span>
                    ))}
                </div>
            )}

            <section className="mb-4 rounded-lg border bg-card p-3 shadow-sm sm:mb-6 sm:p-4 lg:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold sm:text-lg">Resident registrations</h2>
                        <p className="text-sm text-muted-foreground">
                            {stats.pending_registrations
                                ? `${stats.pending_registrations} waiting for census comparison`
                                : 'No new registrations right now'}
                        </p>
                    </div>
                    <Button size="sm" className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto" asChild>
                        <Link href="/admin/verifications">Open verification queue</Link>
                    </Button>
                </div>
                {registrations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">New resident submissions will appear here.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="pb-2 pr-4">Name</th>
                                    <th className="pb-2 pr-4">Census</th>
                                    <th className="pb-2 pr-4">Email</th>
                                    <th className="pb-2 pr-4">Phone</th>
                                    <th className="pb-2 pr-4">Submitted</th>
                                    <th className="pb-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="py-3 pr-4 font-medium">{item.full_name}</td>
                                        <td className="py-3 pr-4">
                                            {item.census_match ? (
                                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                                                    {item.account_id}
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                    Unknown
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4">{item.email || 'Unknown'}</td>
                                        <td className="py-3 pr-4">{item.mobile || 'Unknown'}</td>
                                        <td className="py-3 pr-4 text-muted-foreground">{item.submitted_at}</td>
                                        <td className="py-3 text-right">
                                            <Link href={`/admin/verifications/${item.id}`} className="font-medium text-blue-700 hover:underline">
                                                Compare
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="mb-4 rounded-lg border bg-card p-3 shadow-sm sm:mb-6 sm:p-4 lg:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold sm:text-lg">Active incident queue</h2>
                        <p className="text-sm text-muted-foreground">
                            Showing {incidents.length} of {stats.ongoing_missions} active missions
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button size="sm" className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto" asChild>
                            <Link href="/admin/missions">
                                <Plus className="mr-2 h-4 w-4" />
                                New mission
                            </Link>
                        </Button>
                    </div>
                </div>
                <IncidentQueueTable incidents={incidents} />
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Page 1 of 1</span>
                    <div className="flex gap-1">
                        <Button size="sm" variant="default" className="h-8 w-8 bg-blue-700 p-0">
                            1
                        </Button>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-lg border bg-card p-3 shadow-sm sm:p-4 lg:col-span-2">
                    <AdminOperationMap pins={map_pins} className="h-64 sm:h-80 lg:h-96" />
                </div>
                <ActivityFeed activities={activities} />
            </div>
        </AdminLayout>
    );
}