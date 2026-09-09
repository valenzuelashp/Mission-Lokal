import { Head, useForm } from '@inertiajs/react';
import { Filter, Search, UserCheck, X } from 'lucide-react';
import { useMemo, useState, FormEvent } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoMissions, missionCounts } from '@/Lib/adminDemo';
import { cn } from '@/Lib/utils';
import type { AdminMission as BaseAdminMission, AdminMissionQueuePageProps, MissionStatus } from '@/Types';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';

type AdminMission = BaseAdminMission & {
    display_id?: string;
    personnel_ids?: string[];
};

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
    const missions = (props.missions ?? demoMissions) as AdminMission[];
    const counts = props.counts ?? missionCounts(missions);
    const personnel = props.personnel ?? [];

    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');
    const [selectedMission, setSelectedMission] = useState<AdminMission | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        concern_id: '',
        personnel_ids: [] as string[],
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
                (row.display_id?.toLowerCase().includes(q) ?? false) ||
                row.concern_title.toLowerCase().includes(q) ||
                row.location.toLowerCase().includes(q) ||
                (row.assignee?.toLowerCase().includes(q) ?? false);

            return matchesFilter && matchesSearch;
        });
    }, [missions, filter, search]);

    const openAssignModal = (mission: AdminMission) => {
        reset();
        clearErrors();
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
                    Manage approved missions, assign multiple personnel, track progress, and verify completed work.
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
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3">Personnel(s)</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No missions found in this queue. Escalate reports from the Report Queue to populate missions.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((m: AdminMission) => (
                                    <tr key={m.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{m.display_id ?? `MS-${m.id.substring(0, 4).toUpperCase()}`}</td>
                                        <td className="px-4 py-3 font-medium text-blue-900">
                                            <Link href={`/admin/missions/${m.id}`} className="hover:underline">
                                                {m.concern_title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{m.location}</td>
                                        <td className="px-4 py-3">
                                            {m.assignee ? (
                                                <span className="font-medium text-slate-800">{m.assignee}</span>
                                            ) : (
                                                <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-1 rounded">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="capitalize">{m.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                                onClick={() => openAssignModal(m)}
                                            >
                                                <UserCheck className="mr-1 h-3.5 w-3.5" />
                                                {m.assignee ? 'Manage Assignees' : 'Assign Personnel'}
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
                            <button onClick={closeModal} className="rounded-full p-1 hover:bg-slate-100">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={submitAssignment} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Select Personnel (Multiple allowed)</label>
                                <div className="max-h-48 overflow-y-auto rounded-md border border-slate-300 p-2.5 space-y-2 bg-slate-50">
                                    {personnel.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No active personnel found in barangay.</p>
                                    ) : (
                                        personnel.map(p => (
                                            <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:bg-slate-100 p-1.5 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={data.personnel_ids.includes(p.id)}
                                                    onChange={() => togglePersonnelSelection(p.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                />
                                                <span>{p.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {errors.personnel_ids && <p className="mt-1 text-xs text-red-600">{errors.personnel_ids}</p>}
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-800">
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