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

        <AdminLayout title="Mission-Lokal Admin: Dashboard Dashboard">

            <Head title="Admin Dashboard Hub" />



            {/* KPI Performance Section Grid */}

            <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">

                <KpiCard

                    label="Total telemetry reports"

                    value={stats.total_reports}

                    icon={FileText}

                    trend={{ value: '+12% vs preceding epoch', positive: true }}

                />

                <KpiCard

                    label="Ongoing operations"

                    value={stats.ongoing_missions}

                    icon={Sparkles}

                    hint="4 critical priority nodes"

                />

                <KpiCard

                    label="Accomplished closed logs"

                    value={stats.accomplished}

                    icon={CheckCircle2}

                    trend={{ value: '98% structural close velocity', positive: true }}

                />

                <KpiCard

                    label="Verification backlogs"

                    value={stats.pending_verification}

                    icon={ShieldCheck}

                    hint="Average 14m latency window"

                />

            </div>



            {/* Central Queue Table Framework */}

            <section className="mb-6 rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md p-4 sm:p-5 shadow-sm">

                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">

                    <div>

                        <h2 className="text-sm font-black uppercase tracking-widest text-neutral-800">Active Incident Array Queue</h2>

                        <p className="text-[11px] font-medium text-neutral-400 mt-0.5">

                            Evaluating {incidents.length} of {stats.ongoing_missions} verified operational dispatches

                        </p>

                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">

                        <Button variant="outline" size="sm" className="w-full border-neutral-200 bg-white/80 text-neutral-800 hover:bg-white rounded-xl font-black uppercase tracking-widest text-xs h-9 sm:w-auto px-4 shadow-3xs">

                            <Filter className="mr-1.5 h-3.5 w-3.5 text-neutral-400 stroke-[2.5]" />

                            Filter matrix

                        </Button>

                        <Button size="sm" className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-xs h-9 shadow-sm sm:w-auto px-4" asChild>

                            <Link href="/admin/missions">

                                <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />

                                New dispatch

                            </Link>

                        </Button>

                    </div>

                </div>

               

                <IncidentQueueTable incidents={incidents} />

               

                <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-neutral-400 px-1">

                    <span>Page 1 of 3</span>

                    <div className="flex gap-1">

                        <Button size="sm" className="h-7 w-7 rounded-lg bg-neutral-900 text-white p-0 text-[10px] font-black shadow-sm">1</Button>

                        <Button size="sm" variant="outline" className="h-7 w-7 rounded-lg border-neutral-200 bg-white/80 text-neutral-400 p-0 text-[10px] font-black shadow-3xs">2</Button>

                        <Button size="sm" variant="outline" className="h-7 w-7 rounded-lg border-neutral-200 bg-white/80 text-neutral-400 p-0 text-[10px] font-black shadow-3xs">3</Button>

                    </div>

                </div>

            </section>



            {/* Split Theater Map & Stream Logs */}

            <div className="grid gap-5 lg:grid-cols-3">

                <div className="rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md p-4 shadow-sm lg:col-span-2">

                    <AdminOperationMap pins={map_pins} className="h-64 sm:h-80 lg:h-96" />

                </div>

                <ActivityFeed activities={activities} className="h-full" />

            </div>

        </AdminLayout>

    );

}

