import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, FileText, Filter, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import ActivityFeed from '@/Components/admin/ActivityFeed';
import AdminOperationMap from '@/Components/admin/AdminOperationMap';
import IncidentQueueTable from '@/Components/admin/IncidentQueueTable';
import KpiCard from '@/Components/admin/KpiCard';
import { Button } from '@/Components/ui/button';
import AdminLayout from '@/Layouts/AdminLayout';
import type { AdminActivity, AdminDashboardPageProps, AdminIncident, MapPin } from '@/Types';

const demo = {
    stats: {
        total_reports: 124,
        ongoing_missions: 12,
        accomplished: 89,
        pending_verification: 23,
    },
    incidents: [
        {
            id: '#MS-8902',
            concern_id: 'c1',
            incident_type: 'Residential fire',
            type_icon: 'fire',
            location: 'Zone 4, Block 12',
            ai_severity: 92,
            priority: 'high',
            status: 'ongoing',
        },
        {
            id: '#MS-8905',
            concern_id: 'c2',
            incident_type: 'Street flooding',
            type_icon: 'flood',
            location: 'Riverside Ave.',
            ai_severity: 78,
            priority: 'high',
            status: 'ongoing',
        },
        {
            id: '#MS-8910',
            concern_id: 'c3',
            incident_type: 'Illegal dumping',
            type_icon: 'waste',
            location: 'Market rear alley',
            ai_severity: 45,
            priority: 'med',
            status: 'seen',
        },
        {
            id: '#MS-8912',
            concern_id: 'c4',
            incident_type: 'Noise complaint',
            type_icon: 'noise',
            location: 'Phase 2, Unit 7',
            ai_severity: 15,
            priority: 'low',
            status: 'done',
        },
    ],
    activities: [
        { id: '1', title: 'Personnel updated status for #MS-8910', time: '2 minutes ago', icon: 'user' },
        { id: '2', title: 'AI flagged high-severity report at Zone 4', time: '8 minutes ago', icon: 'ai' },
        { id: '3', title: 'Mission #MS-8890 successfully verified', time: '24 minutes ago', icon: 'success' },
        { id: '4', title: 'New personnel unit Echo-9 marked active', time: '1 hour ago', icon: 'system' },
    ],
    map_pins: [
        { id: 'p1', lat: 14.601, lng: 120.982, title: 'Zone 4', severity: 'critical' },
        { id: 'p2', lat: 14.598, lng: 120.986, title: 'Riverside', severity: 'high' },
        { id: 'p3', lat: 14.602, lng: 120.988, title: 'Market', severity: 'medium' },
        { id: 'p4', lat: 14.597, lng: 120.981, title: 'Phase 2', severity: 'low' },
    ],
} satisfies {
    stats: AdminDashboardPageProps['stats'];
    incidents: AdminIncident[];
    activities: AdminActivity[];
    map_pins: MapPin[];
};

export default function Dashboard(props: Partial<AdminDashboardPageProps>) {
    const stats = props.stats ?? demo.stats;
    const incidents = props.incidents ?? demo.incidents;
    const activities = props.activities ?? demo.activities;
    const map_pins = props.map_pins ?? demo.map_pins;

    return (
        <AdminLayout title="Mission-Lokal Admin: Dashboard">
            <Head title="Admin Dashboard" />

            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                    hint="4 high priority"
                />
                <KpiCard
                    label="Accomplished"
                    value={stats.accomplished}
                    icon={CheckCircle2}
                    trend={{ value: '98% success rate', positive: true }}
                    iconClassName="bg-emerald-50 text-emerald-600"
                />
                <KpiCard
                    label="Pending verification"
                    value={stats.pending_verification}
                    icon={ShieldCheck}
                    hint="Average 14m delay"
                    iconClassName="bg-red-50 text-red-600"
                />
            </div>

            <section className="mb-6 rounded-lg border bg-card p-4 shadow-sm lg:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Active incident queue</h2>
                        <p className="text-sm text-muted-foreground">
                            Showing {incidents.length} of {stats.ongoing_missions} active missions
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button size="sm" className="bg-blue-700 hover:bg-blue-800" asChild>
                            <Link href="/admin/missions">
                                <Plus className="mr-2 h-4 w-4" />
                                New mission
                            </Link>
                        </Button>
                    </div>
                </div>
                <IncidentQueueTable incidents={incidents} />
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Page 1 of 3</span>
                    <div className="flex gap-1">
                        <Button size="sm" variant="default" className="h-8 w-8 bg-blue-700 p-0">
                            1
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            2
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            3
                        </Button>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-lg border bg-card p-4 shadow-sm lg:col-span-2">
                    <AdminOperationMap pins={map_pins} className="h-96" />
                </div>
                <ActivityFeed activities={activities} />
            </div>
        </AdminLayout>
    );
}
