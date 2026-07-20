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

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 sm:text-2xl">Mission queue</h2>
                    <p className="mt-1 text-xs font-medium text-neutral-500 max-w-md leading-relaxed">
                        Dispatch personnel nodes, run telemetry tracks, and verify operational closure indices.
                    </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button variant="outline" size="sm" className="w-full border-neutral-200 bg-white/80 text-neutral-800 hover:bg-white rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm sm:w-auto px-4" onClick={openModal}>
                        <UserPlus className="mr-2 h-4 w-4 text-neutral-400 stroke-[2.5]" />
                        Assign personnel
                    </Button>
                    <Button size="sm" className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm sm:w-auto px-5">
                        <Plus className="mr-2 h-4 w-4 stroke-[2.5]" />
                        New mission
                    </Button>
                </div>
            </div>

            {unassigned > 0 && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-md px-4 py-3 text-xs font-bold text-neutral-800 shadow-xs">
                    <div className="h-2 w-2 rounded-full bg-neutral-950 animate-pulse" />
                    <span>Assignment deficit: <strong className="font-black underline">{unassigned} dispatcher framework model{unassigned > 1 ? 's' : ''}</strong> awaiting dispatch vector.</span>
                </div>
            )}

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
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
                                <span className="ml-1.5 text-[10px] font-bold opacity-60 tabular-nums">
                                    ({counts[tab.key as keyof typeof counts] ?? 0})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                        <Input
                            className="pl-8.5 h-9 rounded-xl border-neutral-200 bg-white/50 text-xs font-bold shadow-2xs focus:bg-white placeholder-neutral-400 focus:border-neutral-900 focus:ring-neutral-900"
                            placeholder="Search active dispatches..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Showing {filtered.length} of {missions.length} active instances
                    </p>
                </div>
                <MissionQueueTable missions={filtered} />
                
                <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-neutral-400 px-1">
                    <span>Page 1 of 1</span>
                    <Button size="sm" className="h-7 w-7 rounded-lg bg-neutral-900 text-white p-0 text-[10px] font-black shadow-sm">
                        1
                    </Button>
                </div>
            </div>

            {/* --- PREMIUM GLASS MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/20 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">Dispatch allocation</h3>
                            <button onClick={closeModal} className="rounded-xl p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                                <X className="h-4 w-4 stroke-[2.5]" />
                            </button>
                        </div>

                        <form onSubmit={submitAssignment} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">Target mission vector</label>
                                <select
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs font-bold text-neutral-800 shadow-2xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                                    value={data.concern_id}
                                    onChange={(e) => setData('concern_id', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>-- Select target log frame --</option>
                                    {unassignedMissions.map(m => (
                                        <option key={m.concern_id} value={m.concern_id}>
                                            {m.id} - {m.concern_title}
                                        </option>
                                    ))}
                                </select>
                                {errors.concern_id && <p className="text-[11px] font-bold text-neutral-900 mt-1">{errors.concern_id}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">Assignee node</label>
                                <select
                                    className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs font-bold text-neutral-800 shadow-2xs focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                                    value={data.assigned_to}
                                    onChange={(e) => setData('assigned_to', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>-- Select active field cluster personnel --</option>
                                    {personnel.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.assigned_to && <p className="text-[11px] font-bold text-neutral-900 mt-1">{errors.assigned_to}</p>}
                            </div>

                            <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-100">
                                <Button type="button" variant="outline" className="border-neutral-200 bg-white text-neutral-700 rounded-xl font-black uppercase tracking-widest text-[10px] h-9.5 px-4" onClick={closeModal}>
                                    Abort
</Button>
                                <Button type="submit" disabled={processing} className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-[10px] h-9.5 px-4 shadow-sm">
                                    {processing ? 'Transmitting...' : 'Execute dispatch'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}