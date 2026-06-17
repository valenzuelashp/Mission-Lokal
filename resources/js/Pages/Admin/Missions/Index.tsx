import { Head } from '@inertiajs/react';
import { Filter, Plus, Search, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import MissionQueueTable from '@/Components/admin/MissionQueueTable';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoMissions, missionCounts } from '@/Lib/adminDemo';
import { cn } from '@/Lib/utils';
import type { AdminMission, AdminMissionQueuePageProps, MissionStatus } from '@/Types';

type FilterKey = 'all' | MissionStatus | 'overdue';

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'acknowledged', label: 'Acknowledged' },
    { key: 'in_progress', label: 'In progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'verified', label: 'Verified' },
    { key: 'overdue', label: 'Overdue' },
];

export default function Index(props: Partial<AdminMissionQueuePageProps>) {
    const missions = props.missions ?? demoMissions;
    const counts = props.counts ?? missionCounts(missions);

    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return missions.filter((row: AdminMission) => {
            const matchesFilter =
                filter === 'all' ||
                (filter === 'overdue' ? row.is_overdue || row.is_escalated : row.status === filter);

            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                row.id.toLowerCase().includes(q) ||
                row.concern_title.toLowerCase().includes(q) ||
                row.location.toLowerCase().includes(q) ||
                (row.assignee?.toLowerCase().includes(q) ?? false);

            return matchesFilter && matchesSearch;
        });
    }, [missions, filter, search]);

    const unassigned = missions.filter((m) => !m.assignee && m.status !== 'cancelled' && m.status !== 'verified').length;

    return (
        <AdminLayout title="Mission-Lokal Admin: Mission Queue">
            <Head title="Mission Queue" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-blue-900">Mission queue</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Assign personnel, track progress, and verify completed work.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign personnel
                    </Button>
                    <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                        <Plus className="mr-2 h-4 w-4" />
                        New mission
                    </Button>
                </div>
            </div>

            {unassigned > 0 && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <strong>{unassigned}</strong> mission{unassigned > 1 ? 's' : ''} need personnel assignment.
                </div>
            )}

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
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
                <div className="flex gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search missions…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <section className="rounded-lg border bg-card p-4 shadow-sm lg:p-5">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {filtered.length} of {missions.length} missions
                    </p>
                </div>
                <MissionQueueTable missions={filtered} />
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Page 1 of 1</span>
                    <div className="flex gap-1">
                        <Button size="sm" variant="default" className="h-8 w-8 bg-blue-700 p-0">
                            1
                        </Button>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
