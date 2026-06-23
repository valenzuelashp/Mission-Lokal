import { Head, useForm } from '@inertiajs/react';
import { Filter, Plus, Search, UserPlus, X } from 'lucide-react';
import { useMemo, useState, FormEvent } from 'react';
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

export default function Index(props: Partial<AdminMissionQueuePageProps & { personnel: { id: string, name: string }[] }>) {
    const missions = props.missions ?? demoMissions;
    const counts = props.counts ?? missionCounts(missions);
    const personnel = props.personnel ?? [];

    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Inertia Form Setup
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        concern_id: '',
        assigned_to: '',
    });

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

    const unassignedMissions = missions.filter((m) => !m.assignee && m.status !== 'cancelled' && m.status !== 'verified');
    const unassigned = unassignedMissions.length;

    // Modal Handlers
    const openModal = () => {
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const submitAssignment = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/missions', {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <AdminLayout title="Mission-Lokal Admin: Mission Queue">
            <Head title="Mission Queue" />

            <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Mission queue</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Assign personnel, track progress, and verify completed work.
                    </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    {/* The Assign Button triggers the Modal! */}
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={openModal}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign personnel
                    </Button>
                    <Button size="sm" className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto">
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
                <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
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

            <section className="rounded-lg border bg-card p-3 shadow-sm sm:p-4 lg:p-5">
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

            {/* --- THE ASSIGNMENT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-blue-900">Assign Personnel</h3>
                            <button onClick={closeModal} className="rounded-full p-1 hover:bg-slate-100">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={submitAssignment} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Select Mission</label>
                                <select
                                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={data.concern_id}
                                    onChange={(e) => setData('concern_id', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>-- Choose an unassigned mission --</option>
                                    {unassignedMissions.map(m => (
                                        <option key={m.concern_id} value={m.concern_id}>
                                            {m.id} - {m.concern_title}
                                        </option>
                                    ))}
                                </select>
                                {errors.concern_id && <p className="mt-1 text-xs text-red-600">{errors.concern_id}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Assign To</label>
                                <select
                                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={data.assigned_to}
                                    onChange={(e) => setData('assigned_to', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>-- Choose personnel --</option>
                                    {personnel.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.assigned_to && <p className="mt-1 text-xs text-red-600">{errors.assigned_to}</p>}
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-800">
                                    {processing ? 'Assigning...' : 'Confirm Assignment'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}