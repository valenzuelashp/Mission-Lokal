import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, FileText, Filter, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import ActivityFeed from '@/Components/admin/ActivityFeed';
import AdminOperationMap from '@/Components/admin/AdminOperationMap';
import IncidentQueueTable from '@/Components/admin/IncidentQueueTable';
import KpiCard from '@/Components/admin/KpiCard';
import { Button } from '@/Components/ui/button';
import AdminLayout from '@/Layouts/AdminLayout';
import type { AdminDashboardPageProps } from '@/Types';

export default function Dashboard({ stats, incidents = [], activities = [], map_pins = [] }: AdminDashboardPageProps) {
    return (
        <AdminLayout title="Mission-Lokal Admin: Dashboard">
            <Head title="Admin Dashboard" />

            <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-4 xl:grid-cols-4">
                <KpiCard
                    label="Total reports"
                    value={stats.total_reports}
                    icon={FileText}
                    trend={{ value: '+12% vs last week', positive: true }}
                />
                <KpiCard
                    label="Ongoing missions"
                    value={stats.ongoing_missions}
                    icon={Sparkles}
                    hint="Active operations"
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
            </div>

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