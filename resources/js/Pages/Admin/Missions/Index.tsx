import { Head, Link, useForm } from '@inertiajs/react';
import { Filter, Search, UserPlus, ChevronRight, X } from 'lucide-react';
import { useMemo, useState, FormEvent } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoMissions } from '@/Lib/adminDemo';
import { rowNavProps, stopRowNav } from '@/Lib/tableRow';
import { cn } from '@/Lib/utils';
import type { AdminMission as BaseAdminMission, AdminMissionQueuePageProps } from '@/Types';
import { Badge } from '@/Components/ui/badge';

type AdminMission = BaseAdminMission & {
    display_id?: string;
    personnel_ids?: string[];
    is_overdue?: boolean;
    is_escalated?: boolean;
};

type FilterKey = 'all' | 'assigned_ack' | 'in_progress' | 'completed' | 'verified' | 'overdue';

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Missions' },
    { key: 'assigned_ack', label: 'Assigned / Acknowledged' },
    { key: 'in_progress', label: 'Active & Ongoing' },
    { key: 'completed', label: 'Completed' },
    { key: 'verified', label: 'Completion Verified/Done' },
    { key: 'overdue', label: 'Overdue / Alerts' },
];

export default function Index(props: Partial<AdminMissionQueuePageProps & { personnel: { id: string, name: string, category: string }[] }>) {
    const missions = (props.missions ?? demoMissions) as AdminMission[];
    const personnel = props.personnel ?? [];
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

            if (filter === 'assigned_ack') {
                matchesFilter = row.status === 'assigned' || row.status === 'acknowledged';
            } else if (filter === 'in_progress') {
                matchesFilter = row.status === 'in_progress';
            } else if (filter === 'completed') {
                matchesFilter = row.status === 'completed';
            } else if (filter === 'verified') {
                matchesFilter = row.status === 'verified';
            } else if (filter === 'overdue') {
                matchesFilter = isOverdueAlert && row.status !== 'verified';
            }

            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                row.id.toLowerCase().includes(q) ||
                (row.display_id?.toLowerCase().includes(q) ?? false) ||
                row.concern_title.toLowerCase().includes(q) ||
                row.location.toLowerCase().includes(q) ||
                (row.assignee?.toLowerCase().includes(q) ?? false);

            return matchesFilter && matchesSearch;
        });
    }, [missions, filter, search]);

    // Computed counts matching the updated tabs
    const streamlinedCounts = useMemo(() => {
        return {
            all: missions.length,
            assigned_ack: missions.filter(m => m.status === 'assigned' || m.status === 'acknowledged').length,
            in_progress: missions.filter(m => m.status === 'in_progress').length,
            completed: missions.filter(m => m.status === 'completed').length,
            verified: missions.filter(m => m.status === 'verified').length,
            overdue: missions.filter(m => Boolean(m.is_overdue || m.is_escalated) && m.status !== 'verified').length,
        };
    }, [missions]);

    const openAssignModal = (mission: AdminMission) => {
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
        const currentIds = [...data.personnel_ids];
        if (currentIds.includes(id)) {
            setData('personnel_ids', currentIds.filter(item => item !== id));
        } else {
            setData('personnel_ids', [...currentIds, id]);
        }
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

            <div className="mb-4 sm:mb-6">
                <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Mission queue</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Monitor active field operations, manage multi-personnel assignments, and review completed work proofs.
                </p>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key)}
                            className={cn(
                                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                                filter === tab.key
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'bg-white text-muted-foreground ring-1 ring-border hover:bg-muted',
                            )}
                        >
                            {tab.label}
                            <span className="ml-1.5 text-xs opacity-80">
                                ({streamlinedCounts[tab.key] ?? 0})
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
                    <Button variant="outline" size="icon" className="shrink-0 cursor-pointer">
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
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3">Personnel(s)</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Due Date</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                        No missions found in this filter category.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((m: AdminMission) => (
                                    <tr
                                        key={m.id}
                                        className="cursor-pointer hover:bg-slate-50/50"
                                        {...rowNavProps(`/admin/missions/${m.id}`)}
                                    >
                                        <td className="px-4 py-3 font-medium text-slate-900">{m.display_id ?? `MS-${m.id.substring(0, 4).toUpperCase()}`}</td>
                                        <td className="px-4 py-3 font-medium text-blue-900 max-w-[200px]">
                                            <Link href={`/admin/missions/${m.id}`} onClick={stopRowNav} className="hover:underline truncate block" title={m.concern_title}>
                                                {m.concern_title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate" title={m.location}>{m.location}</td>
                                        
                                        <td className="px-4 py-3">
                                            {m.assignee ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        stopRowNav(e);
                                                        openAssignModal(m);
                                                    }}
                                                    className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 truncate max-w-[160px] block text-left transition-colors cursor-pointer"
                                                    title="Click to edit assignees"
                                                >
                                                    {m.assignee}
                                                </button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200 cursor-pointer"
                                                    onClick={(e) => {
                                                        stopRowNav(e);
                                                        openAssignModal(m);
                                                    }}
                                                >
                                                    <UserPlus className="mr-1 h-3 w-3" />
                                                    Assign
                                                </Button>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    m.priority === 'high'
                                                        ? 'border-red-200 bg-red-50 text-red-700'
                                                        : m.priority === 'med'
                                                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                          : 'border-slate-200 bg-slate-50'
                                                }
                                            >
                                                {m.priority === 'med' ? 'Med' : m.priority.charAt(0).toUpperCase() + m.priority.slice(1)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className={cn("capitalize", m.status === 'completed' && "bg-amber-100 text-amber-800 border-amber-300 font-semibold")}>{m.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{m.due_date}</td>
                                        
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs bg-white text-slate-700 hover:bg-slate-50 border-slate-200 cursor-pointer"
                                                asChild
                                            >
                                                <Link href={`/admin/missions/${m.id}`} onClick={stopRowNav}>
                                                    Open Mission
                                                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {selectedMission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-blue-900">Manage Assignees</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{selectedMission.concern_title}</p>
                            </div>
                            <button onClick={closeModal} className="rounded-full p-1 hover:bg-slate-100 cursor-pointer">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={submitAssignment} className="space-y-4">
                            <div>
                                <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <label className="block text-sm font-medium text-slate-700">Select Personnel (Multiple allowed)</label>
                                    <select
                                        aria-label="Filter personnel by category"
                                        value={personnelCategoryFilter}
                                        onChange={(e) => setPersonnelCategoryFilter(e.target.value)}
                                        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
                                    >
                                        <option value="all">All categories</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="min-h-[5.5rem] max-h-52 overflow-y-auto rounded-md border border-slate-300 bg-slate-50 p-2.5">
                                    {personnel.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No active personnel found in barangay.</p>
                                    ) : (
                                        <>
                                            {groupedPersonnel
                                                .filter((group) => personnelCategoryFilter === 'all' || group.category === personnelCategoryFilter)
                                                .map((group) => (
                                                    <div key={group.category} className="mb-2 space-y-1.5">
                                                        <p className="px-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            {group.category}
                                                        </p>
                                                        {group.members.length > 0 ? group.members.map((p) => (
                                                            <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded p-1.5 text-sm text-slate-700 hover:bg-slate-100">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={data.personnel_ids.includes(p.id)}
                                                                    onChange={() => togglePersonnelSelection(p.id)}
                                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                />
                                                                <span>{p.name}</span>
                                                            </label>
                                                        )) : (
                                                            <p className="px-1.5 py-1 text-sm text-muted-foreground">No personnel in this category yet.</p>
                                                        )}
                                                    </div>
                                                ))}
                                            {personnelCategoryFilter !== 'all' && !groupedPersonnel.some((group) => group.category === personnelCategoryFilter) && (
                                                <div className="space-y-2 p-1.5">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        {personnelCategoryFilter}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">No personnel in this category yet.</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                {errors.personnel_ids && <p className="mt-1 text-xs text-red-600">{errors.personnel_ids}</p>}
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={closeModal} className="cursor-pointer">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-800 cursor-pointer">
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