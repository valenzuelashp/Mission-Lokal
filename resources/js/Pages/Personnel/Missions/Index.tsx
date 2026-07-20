import { Head, usePage } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import PersonnelMissionTable from '@/Components/personnel/PersonnelMissionTable';
import EmptyState from '@/Components/shared/EmptyState';
import { Button } from '@/Components/ui/button';
import PersonnelLayout from '@/Layouts/PersonnelLayout';
import { demoPersonnelMissions, personnelMissionCounts } from '@/Lib/personnelDemo';
import { cn } from '@/Lib/utils';
import type { PageProps, PersonnelMissionsPageProps } from '@/Types';

type FilterKey = 'all' | 'active' | 'assigned' | 'in_progress' | 'completed' | 'overdue';

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'in_progress', label: 'In progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue' },
];

export default function Index(props: Partial<PersonnelMissionsPageProps>) {
    const missions = props.missions ?? demoPersonnelMissions;
    const counts = props.counts ?? personnelMissionCounts(missions);
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
            <Head title="My Missions" />

            {flash.success && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-md px-3.5 py-3 text-xs font-bold text-neutral-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-neutral-900" />
                    <span className="truncate">{flash.success}</span>
                </div>
            )}

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 sm:text-2xl">My missions</h2>
                    <p className="mt-1 text-xs font-medium text-neutral-500 max-w-md leading-relaxed">
                        Assigned field work operations — acknowledge tasks, log milestones, and record completion parameters.
                    </p>
                </div>
            </div>

            {overdue > 0 && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-md px-4 py-3 text-xs font-bold text-neutral-800 shadow-xs">
                    <div className="h-2 w-2 rounded-full bg-neutral-900 animate-ping" />
                    <span>Attention required: <strong className="font-black underline">{overdue} operational file{overdue > 1 ? 's' : ''}</strong> overdue for evaluation.</span>
                </div>
            )}

            {/* Custom Filter Bar Segment */}
            <div className="mb-5 -mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
                <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key)}
                            className={cn(
                                'rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wider border transition-all active:scale-[0.98]',
                                filter === tab.key
                                    ? 'bg-neutral-900 text-white border-transparent shadow-sm'
                                    : 'bg-white/80 border-neutral-200/60 text-neutral-500 hover:text-neutral-900 hover:bg-white hover:border-neutral-300',
                            )}
                        >
                            {tab.label}
                            <span className={cn('ml-1.5 text-[10px] font-bold opacity-60 tabular-nums', filter === tab.key && 'opacity-90')}>
                                {counts[tab.key as keyof typeof counts] ?? 0}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Structured Grid Wrapper Container */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Showing {filtered.length} of {missions.length} indexed items
                    </p>
                </div>

                {filtered.length === 0 ? (
                    <div className="border border-neutral-200/60 bg-white/60 backdrop-blur-md rounded-2xl p-10 text-center shadow-sm">
                        <EmptyState
                            title="Queue clear"
                            description="No assignments verified under this operational pipeline segment."
                        />
                    </div>
                ) : (
                    <PersonnelMissionTable missions={filtered} />
                )}

                {/* Styled Pagination Bar footer element */}
                <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-neutral-400 px-1">
                    <span>Page 1 of 1</span>
                    <Button size="sm" className="h-7 w-7 rounded-lg bg-neutral-900 text-white p-0 text-[10px] font-black shadow-sm">
                        1
                    </Button>
                </div>
            </div>
        </PersonnelLayout>
    );
}