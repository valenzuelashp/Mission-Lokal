import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, Activity, CheckCircle2, ClipboardList, UserRoundCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import PersonnelMissionTable from '@/Components/personnel/PersonnelMissionTable';
import EmptyState from '@/Components/shared/EmptyState';
import PersonnelLayout from '@/Layouts/PersonnelLayout';
import { cn } from '@/Lib/utils';
import { personnelDepartments, type PersonnelDepartmentKey } from '@/Lib/personnelDepartments';
import type { PageProps, PersonnelMissionsPageProps } from '@/Types';

type FilterKey = 'all' | 'active' | 'assigned' | 'in_progress' | 'completed' | 'overdue';

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Tasks' },
    { key: 'active', label: 'Active Roster' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue Alerts' },
];

export default function Index({ missions = [], counts = { all: 0, active: 0, in_progress: 0, completed: 0, overdue: 0 } }: Partial<PersonnelMissionsPageProps>) {
    const { flash, personnel_department: personnelDepartment } = usePage<PageProps>().props;
    const [filter, setFilter] = useState<FilterKey>('active');
    const departmentTheme = personnelDepartment?.value
        ? personnelDepartments[personnelDepartment.value as PersonnelDepartmentKey]
        : null;
    const accent = departmentTheme?.theme.accent ?? 'bg-blue-700';
    const accentHover = departmentTheme?.theme.accentHover ?? 'hover:bg-blue-800';
    const border = departmentTheme?.theme.border ?? 'border-blue-200';
    const foreground = departmentTheme?.theme.text ?? 'text-blue-800';
    const mine = missions.filter((mission) => mission.is_assigned).length;
    const activeCount = missions.filter((mission) => ['assigned', 'acknowledged', 'in_progress'].includes(mission.status)).length;
    const completedCount = missions.filter((mission) => ['completed', 'verified'].includes(mission.status)).length;

    const filtered = useMemo(() => {
        return missions.filter((m) => {
            if (filter === 'all') return true;
            if (filter === 'active') {
                return ['assigned', 'acknowledged', 'in_progress'].includes(m.status);
            }
            if (filter === 'overdue') {
                return m.is_overdue && !['completed', 'verified', 'cancelled'].includes(m.status);
            }
            if (filter === 'completed') {
                return ['completed', 'verified'].includes(m.status);
            }
            return m.status === filter;
        });
    }, [missions, filter]);

    const overdue = missions.filter(
        (m) => m.is_overdue && !['completed', 'verified', 'cancelled'].includes(m.status),
    ).length;

    return (
        <PersonnelLayout title="Mission-Lokal Personnel: Missions">
            <Head title="Department Mission Queue" />

            {flash.success && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-xs font-bold text-emerald-900 shadow-2xs">
                    <AlertCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                    {flash.success}
                </div>
            )}

            {overdue > 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-xs font-bold text-rose-900 shadow-2xs">
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                    <p className="leading-relaxed"><strong className="font-black">{overdue}</strong> mission{overdue > 1 ? 's' : ''} currently overdue for completion. Immediate action required.</p>
                </div>
            )}

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Department missions', value: missions.length, icon: ClipboardList, detail: 'Shared team queue' },
                    { label: 'Active response', value: activeCount, icon: Activity, detail: 'Open and in progress' },
                    { label: 'Assigned to me', value: mine, icon: UserRoundCheck, detail: 'You can update these' },
                    { label: 'Completed', value: completedCount, icon: CheckCircle2, detail: 'Awaiting or past review' },
                ].map((stat) => (
                    <div key={stat.label} className={cn('flex items-center gap-3 rounded-2xl border bg-white/90 p-4 shadow-sm', border)}>
                        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm', accent)}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-2xl font-black leading-none text-slate-900">{stat.value}</p>
                            <p className={cn('mt-1 truncate text-[11px] font-black uppercase tracking-wide', foreground)}>{stat.label}</p>
                            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">{stat.detail}</p>
                        </div>
                    </div>
                ))}
            </section>

            <div className="overflow-x-auto pb-2">
                <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key)}
                            className={cn(
                                'rounded-2xl px-4 py-2.5 text-xs font-black transition-all shadow-2xs cursor-pointer border',
                                filter === tab.key
                                    ? cn(accent, 'text-white shadow-md', accentHover)
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200',
                            )}
                        >
                            {tab.label}
                            <span className="ml-2 text-[10px] opacity-85 font-mono">
                                ({counts[tab.key as keyof typeof counts] ?? 0})
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 w-full space-y-4">
                <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100">
                    <span>Showing {filtered.length} of {missions.length} department missions · {mine} assigned to you</span>
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        title="No active missions in this queue"
                        description="Check alternate filter tabs or wait for command staff to dispatch new field work."
                    />
                ) : (
                    <PersonnelMissionTable missions={filtered} />
                )}
            </section>
        </PersonnelLayout>
    );
}