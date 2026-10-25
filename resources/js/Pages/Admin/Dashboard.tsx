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
    ScrollText,
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

            <div className="w-full space-y-8 pb-16">

                {/* Enterprise Header Banner */}
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-8 text-white shadow-xl">
                    <div>
                        <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1.5">
                            <Building2 className="h-4 w-4" /> Barangay Operations Command Center
                        </div>
                        <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
                            Welcome back, {auth.user?.first_name || 'Administrator'}
                        </h1>
                        <p className="mt-1.5 text-sm text-blue-100 max-w-2xl font-medium">
                            Community Concerns, Connected Responses, Stronger Barangays.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {canModify && (
                            <Button 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-5 shadow-md transition-all hover:scale-[1.02] cursor-pointer rounded-2xl"
                                asChild
                            >
                                <Link href="/admin/missions">
                                    <Plus className="mr-2 h-4 w-4" /> Deploy Mission
                                </Link>
                            </Button>
                        )}
                        <Button 
                            variant="outline" 
                            className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm cursor-pointer h-11 px-5 rounded-2xl font-bold text-xs"
                            asChild
                        >
                            <Link href="/admin/verifications">
                                <UserPlus className="mr-2 h-4 w-4" /> Verifications ({stats.pending_registrations ?? 0})
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* SECTION 1: PRIMARY OPERATIONAL KPI TILES */}
                <div className="space-y-3">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
                        Primary Action Queues
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                        {/* 1. Report Queue */}
                        <Link 
                            href="/admin/reports" 
                            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-md sm:rounded-3xl sm:p-6"
                        >
                            <div className="mb-2 flex items-center justify-between sm:mb-4">
                                <div className="rounded-xl bg-blue-50 p-2 text-blue-700 sm:rounded-2xl sm:p-3.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-blue-600 hidden items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                                    Review <ArrowRight className="h-3 w-3" />
                                </span>
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 sm:text-3xl">{stats.total_reports}</p>
                                <p className="mt-1 text-[9px] font-black uppercase leading-tight tracking-wider text-slate-500 sm:text-xs">Report Queue</p>
                                <p className="mt-1 hidden text-xs font-medium text-slate-400 sm:block">Incoming resident concerns</p>
                            </div>
                        </Link>

                        {/* 2. Mission Queue */}
                        <Link 
                            href="/admin/missions" 
                            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500 hover:shadow-md sm:rounded-3xl sm:p-6"
                        >
                            <div className="mb-2 flex items-center justify-between sm:mb-4">
                                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700 sm:rounded-2xl sm:p-3.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-indigo-600 hidden items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                                    Dispatch <ArrowRight className="h-3 w-3" />
                                </span>
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 sm:text-3xl">{stats.ongoing_missions}</p>
                                <p className="mt-1 text-[9px] font-black uppercase leading-tight tracking-wider text-slate-500 sm:text-xs">Mission Queue</p>
                                <p className="mt-1 hidden text-xs font-medium text-slate-400 sm:block">
                                    {stats.high_priority ? `${stats.high_priority} high priority` : 'Field operations'}
                                </p>
                            </div>
                        </Link>

                        {/* 3. Verifications Queue */}
                        <Link 
                            href="/admin/verifications" 
                            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-md sm:rounded-3xl sm:p-6"
                        >
                            <div className="mb-2 flex items-center justify-between sm:mb-4">
                                <div className="rounded-xl bg-sky-50 p-2 text-sky-700 sm:rounded-2xl sm:p-3.5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-sky-600 hidden items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                                    Verify <ArrowRight className="h-3 w-3" />
                                </span>
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 sm:text-3xl">{stats.pending_registrations ?? 0}</p>
                                <p className="mt-1 text-[9px] font-black uppercase leading-tight tracking-wider text-slate-500 sm:text-xs">Verifications</p>
                                <p className="mt-1 hidden text-xs font-medium text-slate-400 sm:block">Self-registration queue</p>
                            </div>
                        </Link>

                        {/* 4. Blotter Desk */}
                        <Link 
                            href="/admin/blotters" 
                            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-500 hover:shadow-md sm:rounded-3xl sm:p-6"
                        >
                            <div className="mb-2 flex items-center justify-between sm:mb-4">
                                <div className="rounded-xl bg-rose-50 p-2 text-rose-600 sm:rounded-2xl sm:p-3.5 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-rose-600 hidden items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                                    Blotter Desk <ArrowRight className="h-3 w-3" />
                                </span>
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 sm:text-3xl">{stats.pending_blotters ?? 0}</p>
                                <p className="mt-1 text-[9px] font-black uppercase leading-tight tracking-wider text-slate-500 sm:text-xs">Blotter Desk</p>
                                <p className="mt-1 hidden text-xs font-medium text-slate-400 sm:block">Incident complaints review</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* SECTION 2: MANAGEMENT & DIRECTORY MODULES GRID */}
                <div className="space-y-3">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
                        Barangay Directory & Management Modules
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                        {/* Personnel */}
                        <Link href="/admin/personnel" className="flex flex-col items-center justify-center p-5 rounded-3xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all hover:shadow-2xs text-center group shadow-2xs">
                            <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl group-hover:scale-110 transition-transform mb-3 border border-purple-100">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-black text-slate-900">Personnel</span>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">Staff roster</span>
                        </Link>

                        {/* Residents */}
                        <Link href="/admin/residents" className="flex flex-col items-center justify-center p-5 rounded-3xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all hover:shadow-2xs text-center group shadow-2xs">
                            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl group-hover:scale-110 transition-transform mb-3 border border-emerald-100">
                                <FolderKanban className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-black text-slate-900">Residents</span>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">Citizen directory</span>
                        </Link>

                        {/* Profile Requests */}
                        <Link href="/admin/profile-edits" className="flex flex-col items-center justify-center p-5 rounded-3xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all hover:shadow-2xs text-center group shadow-2xs">
                            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl group-hover:scale-110 transition-transform mb-3 border border-amber-100">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-black text-slate-900">Profile Edits</span>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">{stats.pending_profile_edits ?? 0} pending</span>
                        </Link>

                        {/* Announcements */}
                        <Link href="/admin/announcements" className="flex flex-col items-center justify-center p-5 rounded-3xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all hover:shadow-2xs text-center group shadow-2xs">
                            <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl group-hover:scale-110 transition-transform mb-3 border border-blue-100">
                                <Bell className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-black text-slate-900">Announcements</span>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">Broadcast advisories</span>
                        </Link>

                        {/* Resource Library */}
                        <Link href="/admin/documents" className="flex flex-col items-center justify-center p-5 rounded-3xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all hover:shadow-2xs text-center group shadow-2xs">
                            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl group-hover:scale-110 transition-transform mb-3 border border-indigo-100">
                                <ScrollText className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-black text-slate-900">Documents</span>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">Certificates & clearances</span>
                        </Link>

                        <Link href="/admin/library" className="flex flex-col items-center justify-center p-5 rounded-3xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all hover:shadow-2xs text-center group shadow-2xs">
                            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl group-hover:scale-110 transition-transform mb-3 border border-teal-100">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-black text-slate-900">Resource Library</span>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">Guides & hotlines</span>
                        </Link>

                        {/* Calendar */}
                        <Link href="/admin/calendar" className="flex flex-col items-center justify-center p-5 rounded-3xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all hover:shadow-2xs text-center group shadow-2xs">
                            <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl group-hover:scale-110 transition-transform mb-3 border border-rose-100">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-black text-slate-900">Calendar</span>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">Operations schedule</span>
                        </Link>
                    </div>
                </div>

                {/* Severity Distribution Breakdown Bar */}
                {stats.by_severity && (
                    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-2 font-black">
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
                            <span key={label} className={`rounded-xl border px-3.5 py-1.5 font-extrabold capitalize flex items-center gap-2 shadow-2xs ${className}`}>
                                <span className="h-2 w-2 rounded-full bg-current"></span>
                                {label}: <strong className="font-black">{count}</strong>
                            </span>
                        ))}
                    </div>
                )}

                {/* Resident Registrations Queue Preview Card */}
                <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50/80 border-b border-slate-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-base font-black text-blue-950 flex items-center gap-2">
                                <UserPlus className="h-4 w-4 text-blue-600" /> Resident Registrations Awaiting Comparison
                            </CardTitle>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {stats.pending_registrations
                                    ? `${stats.pending_registrations} pending self-registrations waiting for physical logbook check`
                                    : 'No new registrations right now'}
                            </p>
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0 cursor-pointer rounded-xl h-10 px-4 text-xs shadow-2xs" asChild>
                            <Link href="/admin/verifications">
                                Open verification queue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {registrations.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-xs font-semibold">
                                New resident submissions will appear here for verification.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/80 text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-5 py-4">Census Status</th>
                                            <th className="px-5 py-4">Email</th>
                                            <th className="px-5 py-4">Phone</th>
                                            <th className="px-5 py-4">Submitted</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white text-xs">
                                        {registrations.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="cursor-pointer transition-colors hover:bg-slate-50/70"
                                                {...rowNavProps(`/admin/verifications/${item.id}`)}
                                            >
                                                <td className="px-6 py-4 font-extrabold text-slate-900">{item.full_name}</td>
                                                <td className="px-5 py-4">
                                                    {item.census_match ? (
                                                        <span className="inline-flex items-center rounded-xl bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-200 shadow-2xs">
                                                            {item.account_id}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600 border border-slate-200 shadow-2xs">
                                                            Unknown
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600 font-mono">{item.email || '—'}</td>
                                                <td className="px-5 py-4 text-slate-600 font-mono">{item.mobile || '—'}</td>
                                                <td className="px-5 py-4 text-slate-500 font-medium">{item.submitted_at}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link 
                                                        href={`/admin/verifications/${item.id}`} 
                                                        onClick={stopRowNav} 
                                                        className="font-bold text-blue-700 hover:text-blue-900 text-xs bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-100 inline-block shadow-2xs"
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
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-base font-black text-slate-900">Active incident queue</h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Showing {incidents.length} of {stats.ongoing_missions} active missions
                            </p>
                        </div>
                        <div className="flex flex-col gap-2.5 sm:flex-row">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto cursor-pointer rounded-xl font-bold text-xs h-10 border-slate-200">
                                <Filter className="mr-2 h-4 w-4 text-slate-500" /> Filter
                            </Button>
                            {canModify && (
                                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 sm:w-auto cursor-pointer rounded-xl shadow-sm" asChild>
                                    <Link href="/admin/missions">
                                        <Plus className="mr-2 h-4 w-4" /> New mission
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                    <IncidentQueueTable missions={incidents} />
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-t border-slate-100 pt-4">
                        <span>Showing latest priority dispatch queue</span>
                        <Link href="/admin/missions" className="font-extrabold text-blue-700 hover:underline">
                            View full mission queue &rarr;
                        </Link>
                    </div>
                </section>

                {/* Interactive Operations Map & Audit Feed Section */}
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
                                <Activity className="h-4 w-4 text-blue-600" /> Real-time Operations Heatmap
                            </h3>
                            <Badge variant="outline" className="text-xs font-mono font-bold bg-blue-50 text-blue-700 border-blue-200">Live GPS Telemetry</Badge>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-slate-200">
                            <AdminOperationMap pins={map_pins} className="h-80 sm:h-96 w-full" />
                        </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs flex flex-col">
                        <ActivityFeed activities={activities} />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}