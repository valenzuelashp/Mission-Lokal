import { Head, useForm, usePage } from '@inertiajs/react';
import { Filter, Search, X, GitMerge } from 'lucide-react';
import { useMemo, useState, FormEvent } from 'react';
import MissionQueueTable from '@/Components/admin/MissionQueueTable';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoMissions, missionCounts } from '@/Lib/adminDemo';
import { cn } from '@/Lib/utils';
import type { AdminMission as BaseAdminMission, AdminMissionQueuePageProps, PageProps } from '@/Types';

type AdminMission = BaseAdminMission & {
    display_id?: string;
    personnel_ids?: string[];
    is_overdue?: boolean;
    is_escalated?: boolean;
    rank?: number;
    merged_duplicates_count?: number;
    has_merged_duplicates?: boolean;
};

type FilterKey = 'all' | 'assigned' | 'in_progress' | 'completed' | 'verified' | 'overdue' | 'merged';

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Missions' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'Active & Ongoing' },
    { key: 'completed', label: 'Completed' },
    { key: 'verified', label: 'Verified & Closed' },
    { key: 'overdue', label: 'Overdue / Alerts' },
    { key: 'merged', label: 'Merged Concerns' },
];

export default function Index(props: Partial<AdminMissionQueuePageProps & { personnel: { id: string, name: string, category: string }[], counts?: Record<string, number> }>) {
    const rawMissions = (props.missions ?? demoMissions) as AdminMission[];
    const personnel = props.personnel ?? [];
    const { auth } = usePage<PageProps & { auth: { user: any } }>().props;
    const canModify = auth.user?.can_modify_system ?? true;

    const missions = useMemo(() => {
        return rawMissions.map((m, idx) => ({
            ...m,
            rank: m.rank ?? (idx + 1),
        }));
    }, [rawMissions]);

    const counts: Record<string, number> = props.counts ?? {
        ...missionCounts(missions),
        merged: missions.filter(m => Boolean(m.has_merged_duplicates || (m.merged_duplicates_count && m.merged_duplicates_count > 0))).length,
    };

    const categories = ['Tanod', 'Lupon', 'Public works', 'Sanitation', 'VAW Desk'];

    const groupedPersonnel = [
        ...categories.map((category) => ({
            category,
            members: personnel.filter((member) => member.category === category),
        })),
    ];

    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');
    const [selectedMission, setSelectedMission] = useState<AdminMission | null>(null);
    const [personnelCategoryFilter, setPersonnelCategoryFilter] = useState('all');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        concern_id: '',
        personnel_ids: [] as string[],
    });

    const filtered = useMemo(() => {
        return missions.filter((row: AdminMission) => {
            let matchesFilter = true;
            const isOverdueAlert = Boolean(row.is_overdue || row.is_escalated);

            if (filter === 'assigned') {
                matchesFilter = row.status === 'assigned' || row.status === 'acknowledged';
            } else if (filter === 'in_progress') {
                matchesFilter = row.status === 'in_progress';
            } else if (filter === 'completed') {
                matchesFilter = row.status === 'completed';
            } else if (filter === 'verified') {
                matchesFilter = row.status === 'verified';
            } else if (filter === 'overdue') {
                matchesFilter = isOverdueAlert && row.status !== 'verified';
            } else if (filter === 'merged') {
                matchesFilter = Boolean(row.has_merged_duplicates || (row.merged_duplicates_count && row.merged_duplicates_count > 0));
            }

            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                row.id.toLowerCase().includes(q) ||
                (row.display_id?.toLowerCase().includes(q) ?? false) ||
                row.concern_title.toLowerCase().includes(q) ||
                row.location.toLowerCase().includes(q) ||
                (row.assignee?.toLowerCase().includes(q) ?? false) ||
                (q === 'merged' && Boolean(row.has_merged_duplicates));

            return matchesFilter && matchesSearch;
        });
    }, [missions, filter, search]);

    const openAssignModal = (mission: AdminMission) => {
        if (!canModify) return;
        reset();
        clearErrors();
        setPersonnelCategoryFilter('all');
        setSelectedMission(mission);
        setData({
            concern_id: mission.concern_id,
            personnel_ids: mission.personnel_ids ?? [],
        });
    };

    const closeModal = () => {
        setSelectedMission(null);
        reset();
        clearErrors();
    };

    const togglePersonnelSelection = (id: string) => {
        if (!canModify) return;
        const currentIds = [...data.personnel_ids];
        if (currentIds.includes(id)) {
            setData('personnel_ids', currentIds.filter(item => item !== id));
        } else {
            setData('personnel_ids', [...currentIds, id]);
        }
    };

    const submitAssignment = (e: FormEvent) => {
        e.preventDefault();
        if (!canModify) return;
        post('/admin/missions', {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <AdminLayout title="Mission-Lokal Admin: Mission Queue">
            <Head title="Mission Queue" />

            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mission Dispatch Queue</h2>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                    {canModify ? 'Monitor prioritized field operations, assign multidisciplinary units, and review completed work proofs.' : 'View active field operations and inspect completed work proofs.'}
                </p>
            </div>

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key)}
                            className={cn(
                                'rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer',
                                filter === tab.key
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200',
                            )}
                        >
                            {tab.label}
                            <span className="ml-1.5 text-[10px] opacity-80">
                                ({counts[tab.key] ?? 0})
                            </span>
                        </button>
                    ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            className="pl-9 bg-white text-xs h-10 border-slate-200 shadow-2xs"
                            placeholder="Search missions…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0 cursor-pointer border-slate-200 bg-white">
                        <Filter className="h-4 w-4 text-slate-600" />
                    </Button>
                </div>
            </div>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
                <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Showing {filtered.length} of {missions.length} active missions</span>
                </div>
                
                <MissionQueueTable missions={filtered} onOpenAssign={canModify ? openAssignModal : undefined} />
            </section>

            {selectedMission && canModify && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
                        <div className="mb-5 flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="text-base font-black text-slate-900">Manage Personnel Assignments</h3>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[280px]">{selectedMission.concern_title}</p>
                                {selectedMission.has_merged_duplicates && (
                                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                        <GitMerge className="h-3 w-3" /> Includes {selectedMission.merged_duplicates_count} Merged Resident Reports
                                    </span>
                                )}
                            </div>
                            <button onClick={closeModal} className="rounded-full p-1.5 hover:bg-slate-100 cursor-pointer">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={submitAssignment} className="space-y-4">
                            <div>
                                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-700">Select Units (Multiple allowed)</label>
                                    <select
                                        aria-label="Filter personnel by category"
                                        value={personnelCategoryFilter}
                                        onChange={(e) => setPersonnelCategoryFilter(e.target.value)}
                                        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 cursor-pointer"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="min-h-[6rem] max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-3">
                                    {personnel.length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-4">No active municipal personnel found.</p>
                                    ) : (
                                        <>
                                            {groupedPersonnel
                                                .filter((group) => personnelCategoryFilter === 'all' || group.category === personnelCategoryFilter)
                                                .map((group) => (
                                                    <div key={group.category} className="space-y-1.5">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            {group.category}
                                                        </p>
                                                        {group.members.length > 0 ? group.members.map((p) => (
                                                            <label key={p.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white border border-slate-200/80 hover:border-blue-300 transition-colors shadow-2xs">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={data.personnel_ids.includes(p.id)}
                                                                    onChange={() => togglePersonnelSelection(p.id)}
                                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                />
                                                                <span>{p.name}</span>
                                                            </label>
                                                        )) : (
                                                            <p className="text-[11px] text-muted-foreground italic pl-1">No active personnel in this unit.</p>
                                                        )}
                                                    </div>
                                                ))}
                                        </>
                                    )}
                                </div>
                                {errors.personnel_ids && <p className="mt-1 text-xs font-medium text-red-600">{errors.personnel_ids}</p>}
                            </div>

                            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={closeModal} className="cursor-pointer font-bold text-xs">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-800 cursor-pointer font-bold text-xs shadow-sm">
                                    {processing ? 'Saving...' : 'Confirm Assignment'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}