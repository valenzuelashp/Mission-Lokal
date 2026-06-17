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
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {flash.success}
                </div>
            )}

            <div className="mb-4 sm:mb-6">
                <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">My missions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Assigned field work — acknowledge, update status, and submit proof.
                </p>
            </div>

            {overdue > 0 && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <strong>{overdue}</strong> mission{overdue > 1 ? 's' : ''} overdue for action.
                </div>
            )}

            <div className="mb-4 -mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
                <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setFilter(tab.key)}
                        className={cn(
                            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                            filter === tab.key
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-muted-foreground ring-1 ring-border hover:bg-muted',
                        )}
                    >
                        {tab.label}
                        <span className="ml-1.5 text-xs opacity-80">
                            ({counts[tab.key as keyof typeof counts] ?? 0})
                        </span>
                    </button>
                ))}
                </div>
            </div>

            <section className="rounded-lg border bg-card p-3 shadow-sm sm:p-4 lg:p-5">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {filtered.length} of {missions.length} missions
                    </p>
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        title="No missions here"
                        description="Check another filter or wait for admin to assign new work."
                    />
                ) : (
                    <PersonnelMissionTable missions={filtered} />
                )}

                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Page 1 of 1</span>
                    <Button size="sm" variant="default" className="h-8 w-8 bg-blue-700 p-0">
                        1
                    </Button>
                </div>
            </section>
        </PersonnelLayout>
    );
}
