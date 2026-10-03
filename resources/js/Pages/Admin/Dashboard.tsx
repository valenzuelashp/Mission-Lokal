import { Head, Link, usePage } from '@inertiajs/react';
import { 
    FileText, 
    Filter, 
    Plus, 
    Sparkles, 
    UserPlus, 
    ArrowRight, 
    AlertTriangle, 
    Activity, 
    Building2,
    Users,
    BookOpen,
    Calendar,
    Bell,
    ShieldAlert,
    FileSpreadsheet,
    FolderKanban
} from 'lucide-react';
import ActivityFeed from '@/Components/admin/ActivityFeed';
import AdminOperationMap from '@/Components/admin/AdminOperationMap';
import IncidentQueueTable from '@/Components/admin/IncidentQueueTable';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { rowNavProps, stopRowNav } from '@/Lib/tableRow';
import type { PageProps } from '@/Types';

interface RegistrationItem {
    id: string;
    full_name: string;
    account_id: string;
    census_match: boolean;
    email: string;
    mobile: string;
    submitted_at: string;
}

interface DashboardStats {
    total_reports: number;
    ongoing_missions: number;
    accomplished: number;
    pending_verification: number;
    pending_registrations?: number;
    pending_blotters?: number;
    pending_profile_edits?: number;
    unread_notifications?: number;
    high_priority?: number;
    by_severity?: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

interface CustomDashboardProps extends PageProps {
    stats: DashboardStats;
    incidents?: any[];
    activities?: any[];
    map_pins?: any[];
    registrations?: RegistrationItem[];
}

export default function Dashboard({ stats, incidents = [], activities = [], map_pins = [], registrations = [] }: CustomDashboardProps) {
    const { auth } = usePage<CustomDashboardProps>().props;
    const user = auth.user as any;
    const canModify = user?.role === 'super_admin' || (user?.role === 'admin' && !user?.is_view_only) || user?.role === 'personnel';

    return (
        <AdminLayout title="Mission-Lokal Admin: Command Center">
            <Head title="Command Center Dashboard" />

            {/* Enterprise Header Banner */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white shadow-xl">
                <div>
                    <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
                        <Building2 className="h-4 w-4" /> Barangay Operations Command Center
                    </div>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        Welcome back, {auth.user?.first_name || 'Administrator'}
                    </h1>
                    <p className="mt-1 text-sm text-blue-100 max-w-2xl">
                        Community Concerns, Connected Responses, Stronger Barangays.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {canModify && (
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                            asChild
                        >
                            <Link href="/admin/missions">
                                <Plus className="mr-2 h-4 w-4" /> Deploy Mission
                            </Link>
                        </Button>
                    )}
                    <Button 
                        variant="outline" 
                        className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm cursor-pointer"
                        asChild
                    >
                        <Link href="/admin/verifications">
                            <UserPlus className="mr-2 h-4 w-4" /> Verifications ({stats.pending_registrations ?? 0})
                        </Link>
                    </Button>
                </div>
            </div>

            {/* SECTION 1: PRIMARY OPERATIONAL KPI TILES */}
            <div className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Primary Action Queues
            </div>
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
                {/* 1. Report Queue */}
                <Link 
                    href="/admin/reports" 
                    className="group relative flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="rounded-lg bg-blue-50 p-3 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Review <ArrowRight className="h-3 w-3" />
                        </span>
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold text-slate-900">{stats.total_reports}</p>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5">Report Queue</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Incoming resident concerns</p>
                    </div>
                </Link>

                {/* 2. Mission Queue */}
                <Link 
                    href="/admin/missions" 
                    className="group relative flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="rounded-lg bg-indigo-50 p-3 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Dispatch <ArrowRight className="h-3 w-3" />
                        </span>
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold text-slate-900">{stats.ongoing_missions}</p>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5">Mission Queue</p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {stats.high_priority ? `${stats.high_priority} high priority` : 'Field operations'}
                        </p>
                    </div>
                </Link>

                {/* 3. Verifications Queue */}
                <Link 
                    href="/admin/verifications" 
                    className="group relative flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="rounded-lg bg-sky-50 p-3 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Verify <ArrowRight className="h-3 w-3" />
                        </span>
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold text-slate-900">{stats.pending_registrations ?? 0}</p>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5">Verifications</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Self-registration queue</p>
                    </div>
                </Link>

                {/* 4. Blotter Desk */}
                <Link 
                    href="/admin/blotters" 
                    className="group relative flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:border-red-500 hover:shadow-md hover:-translate-y-0.5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="rounded-lg bg-red-50 p-3 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Blotter Desk <ArrowRight className="h-3 w-3" />
                        </span>
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold text-slate-900">{stats.pending_blotters ?? 0}</p>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5">Blotter Desk</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Incident complaints review</p>
                    </div>
                </Link>
            </div>

            {/* SECTION 2: MANAGEMENT & DIRECTORY MODULES GRID */}
            <div className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Barangay Directory & Management Modules
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 sm:gap-4">
                {/* Personnel */}
                <Link href="/admin/personnel" className="flex flex-col items-center justify-center p-4 rounded-xl border bg-white hover:bg-slate-50 transition-all hover:shadow-sm text-center group">
                    <div className="p-2.5 bg-purple-50 text-purple-700 rounded-lg group-hover:scale-110 transition-transform mb-2">
                        <Users className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Personnel</span>
                    <span className="text-[10px] text-muted-foreground">Staff roster</span>
                </Link>

                {/* Residents */}
                <Link href="/admin/residents" className="flex flex-col items-center justify-center p-4 rounded-xl border bg-white hover:bg-slate-50 transition-all hover:shadow-sm text-center group">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg group-hover:scale-110 transition-transform mb-2">
                        <FolderKanban className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Residents</span>
                    <span className="text-[10px] text-muted-foreground">Citizen directory</span>
                </Link>

                {/* Profile Requests */}
                <Link href="/admin/profile-edits" className="flex flex-col items-center justify-center p-4 rounded-xl border bg-white hover:bg-slate-50 transition-all hover:shadow-sm text-center group">
                    <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg group-hover:scale-110 transition-transform mb-2">
                        <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Profile Edits</span>
                    <span className="text-[10px] text-muted-foreground">{stats.pending_profile_edits ?? 0} pending</span>
                </Link>

                {/* Announcements */}
                <Link href="/admin/announcements" className="flex flex-col items-center justify-center p-4 rounded-xl border bg-white hover:bg-slate-50 transition-all hover:shadow-sm text-center group">
                    <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg group-hover:scale-110 transition-transform mb-2">
                        <Bell className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Announcements</span>
                    <span className="text-[10px] text-muted-foreground">Broadcast advisories</span>
                </Link>

                {/* Resource Library */}
                <Link href="/admin/library" className="flex flex-col items-center justify-center p-4 rounded-xl border bg-white hover:bg-slate-50 transition-all hover:shadow-sm text-center group">
                    <div className="p-2.5 bg-teal-50 text-teal-700 rounded-lg group-hover:scale-110 transition-transform mb-2">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Resource Library</span>
                    <span className="text-[10px] text-muted-foreground">Guides & hotlines</span>
                </Link>

                {/* Calendar */}
                <Link href="/admin/calendar" className="flex flex-col items-center justify-center p-4 rounded-xl border bg-white hover:bg-slate-50 transition-all hover:shadow-sm text-center group">
                    <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg group-hover:scale-110 transition-transform mb-2">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Calendar</span>
                    <span className="text-[10px] text-muted-foreground">Operations schedule</span>
                </Link>
            </div>

            {/* Severity Distribution Breakdown Bar */}
            {stats.by_severity && (
                <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border bg-white p-4 shadow-sm text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wide mr-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Severity Triage:
                    </span>
                    {(
                        [
                            ['critical', stats.by_severity.critical, 'bg-red-50 text-red-700 border-red-200'],
                            ['high', stats.by_severity.high, 'bg-orange-50 text-orange-700 border-orange-200'],
                            ['medium', stats.by_severity.medium, 'bg-amber-50 text-amber-800 border-amber-200'],
                            ['low', stats.by_severity.low, 'bg-emerald-50 text-emerald-700 border-emerald-200'],
                        ] as const
                    ).map(([label, count, className]) => (
                        <span key={label} className={`rounded-lg border px-3 py-1 font-semibold capitalize flex items-center gap-1.5 ${className}`}>
                            <span className="h-2 w-2 rounded-full bg-current"></span>
                            {label}: <strong className="font-bold">{count}</strong>
                        </span>
                    ))}
                </div>
            )}

            {/* Resident Registrations Queue Preview Card */}
            <Card className="mb-6 shadow-sm border-slate-200/80 overflow-hidden">
                <CardHeader className="bg-slate-50/50 pb-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <CardTitle className="text-base font-bold text-blue-900 flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-blue-600" /> Resident Registrations Awaiting Comparison
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {stats.pending_registrations
                                ? `${stats.pending_registrations} pending self-registrations waiting for physical logbook check`
                                : 'No new registrations right now'}
                        </p>
                    </div>
                    <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white shrink-0 cursor-pointer" asChild>
                        <Link href="/admin/verifications">
                            Open verification queue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {registrations.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                            New resident submissions will appear here for verification.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100/70 text-xs uppercase tracking-wider text-slate-600 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Census Status</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Phone</th>
                                        <th className="px-4 py-3">Submitted</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {registrations.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="cursor-pointer transition-colors hover:bg-slate-50/80"
                                            {...rowNavProps(`/admin/verifications/${item.id}`)}
                                        >
                                            <td className="px-4 py-3.5 font-semibold text-slate-900">{item.full_name}</td>
                                            <td className="px-4 py-3.5">
                                                {item.census_match ? (
                                                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                        {item.account_id}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                                        Unknown
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{item.email || '—'}</td>
                                            <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{item.mobile || '—'}</td>
                                            <td className="px-4 py-3.5 text-muted-foreground text-xs">{item.submitted_at}</td>
                                            <td className="px-4 py-3.5 text-right">
                                                <Link 
                                                    href={`/admin/verifications/${item.id}`} 
                                                    onClick={stopRowNav} 
                                                    className="font-medium text-blue-700 hover:text-blue-900 hover:underline text-xs bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100 inline-block"
                                                >
                                                    Compare ID
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Active Incident Queue Section */}
            <section className="mb-6 rounded-xl border bg-card p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Active incident queue</h2>
                        <p className="text-sm text-muted-foreground">
                            Showing {incidents.length} of {stats.ongoing_missions} active missions
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto cursor-pointer">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                        {canModify && (
                            <Button size="sm" className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto cursor-pointer" asChild>
                                <Link href="/admin/missions">
                                    <Plus className="mr-2 h-4 w-4" /> New mission
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
                <IncidentQueueTable incidents={incidents} />
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <span>Showing latest priority dispatch queue</span>
                    <Link href="/admin/missions" className="font-semibold text-blue-700 hover:underline">
                        View full mission queue &rarr;
                    </Link>
                </div>
            </section>

            {/* Interactive Operations Map & Audit Feed Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border bg-card p-4 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" /> Real-time Operations Heatmap
                        </h3>
                        <Badge variant="outline" className="text-xs font-mono">Live GPS Telemetry</Badge>
                    </div>
                    <AdminOperationMap pins={map_pins} className="h-72 sm:h-96 rounded-lg overflow-hidden border" />
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <ActivityFeed activities={activities} />
                </div>
            </div>
        </AdminLayout>
    );
}