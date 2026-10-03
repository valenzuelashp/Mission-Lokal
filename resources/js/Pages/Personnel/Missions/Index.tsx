import { Head, usePage } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import PersonnelMissionTable from '@/Components/personnel/PersonnelMissionTable';
import EmptyState from '@/Components/shared/EmptyState';
import PersonnelLayout from '@/Layouts/PersonnelLayout';
import { cn } from '@/Lib/utils';
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
    const { flash } = usePage<PageProps>().props;
    const [filter, setFilter] = useState<FilterKey>('active');

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
        <PersonnelLayout title="Mission-Lokal Personnel: My Missions">
            <Head title="My Field Missions" />

            {flash.success && (
                <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-xs font-bold text-emerald-900 shadow-2xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    {flash.success}
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Field Missions</h2>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                    Active operational deployments — acknowledge tasks, update progress checklists, and upload proof.
                </p>
            </div>

            {overdue > 0 && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-xs font-bold text-red-900 shadow-2xs">
                    ⚠️ <strong className="font-black">{overdue}</strong> mission{overdue > 1 ? 's' : ''} currently overdue for completion. Immediate action required.
                </div>
            )}

            <div className="mb-5 -mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
                <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setFilter(tab.key)}
                        className={cn(
                            'rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer',
                            filter === tab.key
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200',
                        )}
                    >
                        {tab.label}
                        <span className="ml-1.5 text-[10px] opacity-80">
                            ({counts[tab.key as keyof typeof counts] ?? 0})
                        </span>
                    </button>
                ))}
                </div>
            </div>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
                <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Showing {filtered.length} of {missions.length} assigned missions</span>
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