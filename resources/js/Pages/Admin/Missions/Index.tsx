import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, RefreshCw, Search, Users, UserCheck, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import MissionQueueTable from '@/Components/admin/MissionQueueTable';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoMissions, missionCounts } from '@/Lib/adminDemo';
import { cn } from '@/Lib/utils';
import { personnelDepartments, personnelDepartmentOptions, type PersonnelDepartmentKey } from '@/Lib/personnelDepartments';
import type { AdminMission as BaseAdminMission, AdminMissionQueuePageProps, PageProps } from '@/Types';

type AdminMission = BaseAdminMission & {
    display_id?: string;
    personnel_ids?: string[];
    is_overdue?: boolean;
    is_past_due?: boolean;
    is_escalated?: boolean;
    rank?: number;
    merged_duplicates_count?: number;
    has_merged_duplicates?: boolean;
    max_due_date?: string;
    due_date_iso?: string | null;
};

type FilterKey = 'all' | 'assigned' | 'in_progress' | 'completed' | 'verified' | 'overdue' | 'past_due' | 'merged';

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Missions' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Work Submitted' },
    { key: 'verified', label: 'Closed' },
    { key: 'overdue', label: 'Needs Attention' },
    { key: 'past_due', label: 'Past Due' },
    { key: 'merged', label: 'Merged Concerns' },
];

export default function Index(props: Partial<AdminMissionQueuePageProps & { personnel: { id: string, name: string, role: string, role_value?: string, department?: PersonnelDepartmentKey, department_label?: string, shift_label?: string | null }[], counts?: Record<string, number> }>) {
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
        assigned: missions.filter(m => ['assigned', 'acknowledged'].includes(m.status)).length,
        overdue: missions.filter(m => Boolean(m.is_overdue || m.is_escalated) && m.status !== 'verified').length,
        merged: missions.filter(m => Boolean(m.has_merged_duplicates || (m.merged_duplicates_count && m.merged_duplicates_count > 0))).length,
        past_due: missions.filter(m => Boolean(m.is_past_due)).length,
    };

    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1] ?? '');
    const requestedFilter = queryParams.get('filter');
    const filter: FilterKey = tabs.some(tab => tab.key === requestedFilter) ? requestedFilter as FilterKey : 'all';
    const setFilter = (key: FilterKey) => {
        if (key === 'all') queryParams.delete('filter');
        else queryParams.set('filter', key);
        const query = queryParams.toString();
        router.replace({ url: `/admin/missions${query ? `?${query}` : ''}`, preserveState: true, preserveScroll: true });
    };
    const [search, setSearch] = useState('');
    const [selectedMission, setSelectedMission] = useState<AdminMission | null>(null);
    const [personnelRoleFilter, setPersonnelRoleFilter] = useState('all');
    const [personnelSearch, setPersonnelSearch] = useState('');
    const assignmentDialog = useRef<HTMLElement | null>(null);
    const processingRef = useRef(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        concern_id: '',
        personnel_ids: [] as string[],
        department: '',
        due_date: '',
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
            } else if (filter === 'past_due') {
                matchesFilter = Boolean(row.is_past_due);
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
        setPersonnelRoleFilter('all');
        setPersonnelSearch('');
        setSelectedMission(mission);
        setData({
            concern_id: mission.concern_id,
            personnel_ids: mission.personnel_ids ?? [],
            department: mission.department ?? '',
            due_date: mission.due_date_iso ?? mission.max_due_date ?? '',
        });
    };

    const closeModal = () => {
        setSelectedMission(null);
        reset();
        clearErrors();
    };

    processingRef.current = processing;

    useEffect(() => {
        if (!selectedMission) return;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        assignmentDialog.current?.querySelector<HTMLElement>('#personnel-department')?.focus();
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !processingRef.current) {
                closeModal();
                return;
            }
            if (event.key !== 'Tab' || !assignmentDialog.current) return;
            const focusable = Array.from(assignmentDialog.current.querySelectorAll<HTMLElement>(
                'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
            )).filter((element) => element.getClientRects().length > 0);
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && (document.activeElement === first || !assignmentDialog.current.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !assignmentDialog.current.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, [selectedMission]);

    const clearFilters = () => {
        setSearch('');
        setFilter('all');
    };

    const availablePersonnel = personnel
        .filter((member) => member.department === data.department)
        .filter((member) => personnelRoleFilter === 'all' || member.role_value === personnelRoleFilter)
        .filter((member) => `${member.name} ${member.role}`.toLowerCase().includes(personnelSearch.trim().toLowerCase()));
    const selectedPersonnel = personnel.filter((member) => data.personnel_ids.includes(member.id));

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

            <div className="w-full space-y-6 pb-12">
                {/* Header Section */}
                <div className="flex flex-col gap-3 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Mission Queue</h2>
                        <p className="mt-1 max-w-3xl text-sm font-medium text-slate-500">
                            {canModify ? 'Review assigned personnel, manage mission teams, and track field work through completion.' : 'Review assigned field missions and inspect submitted completion evidence.'}
                        </p>
                    </div>
                    <Button type="button" className="h-10 shrink-0 rounded-xl bg-cyan-800 px-4 text-xs font-bold text-white hover:bg-cyan-900" onClick={() => router.reload({ only: ['missions', 'counts'] })}>
                        <RefreshCw className="mr-2 h-4 w-4" />Refresh queue
                    </Button>
                </div>

                {/* Filters and search */}
                <div className="space-y-4 pt-1">
                    <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
                        <div role="group" aria-label="Filter mission queue by status" className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    aria-pressed={filter === tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold shadow-2xs transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600',
                                        filter === tab.key
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-600/20'
                                            : 'border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                                    )}
                                >
                                    <span>{tab.label}</span>
                                    <span className={cn(
                                        'rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums',
                                        filter === tab.key ? 'bg-blue-700/60 text-white' : 'bg-slate-200/70 text-slate-700',
                                    )}>{counts[tab.key] ?? 0}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative min-w-0 flex-1">
                            <Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                aria-label="Search mission queue"
                                className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-10 text-xs shadow-none transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-blue-500"
                                placeholder="Search by reference, concern, location, or assigned personnel"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><X className="h-4 w-4" /></button>}
                        </div>
                        {(filter !== 'all' || search) && <Button type="button" variant="outline" className="h-11 shrink-0 rounded-xl border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-none hover:bg-slate-100" onClick={clearFilters}>Clear filters</Button>}
                    </div>
                </div>

                <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6" aria-label="Mission queue results">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span>Showing <strong className="text-slate-900">{filtered.length}</strong> of <strong className="text-slate-900">{missions.length}</strong> missions</span>
                        <span className="text-[11px] font-normal normal-case text-slate-400">{filter === 'all' ? 'Assigned response missions' : tabs.find(tab => tab.key === filter)?.label}</span>
                    </div>
                    <MissionQueueTable
                        missions={filtered}
                        onOpenAssign={canModify ? openAssignModal : undefined}
                        filtersActive={filter !== 'all' || Boolean(search)}
                        onClearFilters={clearFilters}
                    />
                </section>
            </div>

            {/* Assignment Modal */}
            {selectedMission && canModify && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(event) => {
                    if (event.target === event.currentTarget && !processing) closeModal();
                }}>
                    <section ref={assignmentDialog} role="dialog" aria-modal="true" aria-labelledby="assignment-dialog-title" aria-describedby="assignment-dialog-description" className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-slate-200/80 bg-white shadow-2xl sm:rounded-3xl">
                        <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                            <div className="min-w-0">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/70 px-2.5 py-1 text-xs font-medium text-blue-800">
                                    <Users className="h-3.5 w-3.5" />Mission assignment
                                </span>
                                <h3 id="assignment-dialog-title" className="mt-2 text-lg font-semibold text-slate-900">{selectedMission.assignee ? 'Update assigned team' : 'Assign a response team'}</h3>
                                <p id="assignment-dialog-description" className="mt-1 line-clamp-2 text-sm text-slate-600">{selectedMission.concern_title}</p>
                                <p className="mt-1 font-mono text-xs text-slate-500">{selectedMission.display_id ?? selectedMission.id} <span className="font-sans">·</span> {selectedMission.location}</p>
                            </div>
                            <button type="button" aria-label="Close assignment dialog" disabled={processing} onClick={closeModal} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50">
                                <X className="h-5 w-5" />
                            </button>
                        </header>

                        <form onSubmit={submitAssignment} className="flex min-h-0 flex-1 flex-col">
                            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                                {errors.concern_id && <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-2 text-xs font-medium text-rose-800">{errors.concern_id}</p>}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label htmlFor="personnel-department" className="text-sm font-medium text-slate-700">Department</label>
                                        <select
                                            id="personnel-department"
                                            autoFocus
                                            value={data.department}
                                            onChange={(event) => {
                                                setData({ ...data, department: event.target.value, personnel_ids: [] });
                                                setPersonnelRoleFilter('all');
                                            }}
                                            required
                                            className="h-11 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-900 outline-none shadow-2xs focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="">Select a department</option>
                                            {personnelDepartmentOptions.map((department) => <option key={department.value} value={department.value}>{department.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="mission-due-date" className="text-sm font-medium text-slate-700">Mission due date</label>
                                        <div className="relative">
                                            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <Input id="mission-due-date" type="date" value={data.due_date} max={selectedMission.max_due_date} onChange={(event) => setData('due_date', event.target.value)} required className="h-11 rounded-xl border-slate-200/80 bg-white pl-10 text-sm shadow-2xs focus-visible:ring-blue-500" />
                                        </div>
                                        <p className="text-xs leading-relaxed text-slate-500">Latest permitted date: {selectedMission.max_due_date || 'See concern deadline'}</p>
                                        {errors.due_date && <p role="alert" className="text-xs font-medium text-rose-700">{errors.due_date}</p>}
                                    </div>
                                </div>

                                <section aria-labelledby="personnel-picker-heading" className="space-y-3">
                                    <div className="flex flex-wrap items-end justify-between gap-2">
                                        <div>
                                            <h4 id="personnel-picker-heading" className="text-sm font-semibold text-slate-900">Select personnel</h4>
                                            <p className="mt-0.5 text-sm text-slate-500">Choose one or more active members from the selected department.</p>
                                        </div>
                                        <span aria-live="polite" className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{data.personnel_ids.length} selected</span>
                                    </div>
                                    {selectedPersonnel.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5" aria-label="Selected personnel">
                                            {selectedPersonnel.map((member) => (
                                                <button key={member.id} type="button" onClick={() => togglePersonnelSelection(member.id)} className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-900 hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                                                    {member.name}<X className="h-3 w-3" /><span className="sr-only">Remove</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                                        <div className="relative">
                                            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <Input aria-label="Search personnel" placeholder="Search personnel by name or role" value={personnelSearch} onChange={(event) => setPersonnelSearch(event.target.value)} className="h-10 rounded-xl border-slate-200/80 bg-white pl-9 text-sm shadow-2xs" />
                                        </div>
                                        <label className="sr-only" htmlFor="personnel-role-filter">Filter by role</label>
                                        <select id="personnel-role-filter" aria-label="Filter personnel by role" value={personnelRoleFilter} onChange={(event) => setPersonnelRoleFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-700 outline-none shadow-2xs focus:border-blue-300 focus:ring-2 focus:ring-blue-100">
                                            <option value="all">All roles</option>
                                            {(data.department ? personnelDepartments[data.department as PersonnelDepartmentKey]?.roles ?? [] : []).map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                                        </select>
                                    </div>

                                    <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-2xl border border-slate-200/70 bg-slate-50/60 p-2" role="group" aria-label="Available personnel">
                                        {!data.department ? (
                                            <p className="px-3 py-8 text-center text-sm text-slate-500">Choose a department to see available personnel.</p>
                                        ) : availablePersonnel.length === 0 ? (
                                            <p className="px-3 py-8 text-center text-sm text-slate-500">{personnel.some(member => member.department === data.department) ? 'No personnel match this search or role filter.' : 'No active personnel are available in this department.'}</p>
                                        ) : availablePersonnel.map((member) => {
                                            const checked = data.personnel_ids.includes(member.id);
                                            return (
                                                <label key={member.id} className={cn('flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-colors focus-within:ring-2 focus-within:ring-blue-500', checked ? 'border-blue-100 bg-blue-50/70' : 'border-transparent bg-white hover:border-slate-200/80 hover:bg-slate-50/50')}>
                                                    <input type="checkbox" checked={checked} onChange={() => togglePersonnelSelection(member.id)} className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600" />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-medium text-slate-900">{member.name}</span>
                                                        <span className="mt-0.5 block truncate text-sm text-slate-500">{member.role}{member.shift_label ? ` · ${member.shift_label}` : ''}</span>
                                                    </span>
                                                    {checked && <UserCheck aria-label="Selected" className="h-4 w-4 shrink-0 text-blue-700" />}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {errors.personnel_ids && <p role="alert" className="text-xs font-medium text-rose-700">{errors.personnel_ids}</p>}
                                </section>
                                <p className="flex gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm leading-relaxed text-slate-600">
                                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                                    {selectedMission.assignee ? 'Saving will update this mission’s assigned personnel.' : 'The selected personnel will be notified after assignment.'}
                                </p>
                            </div>

                            <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <p className="text-sm text-slate-500">{!data.department ? 'Select a department to continue.' : data.personnel_ids.length === 0 ? 'Select at least one person to enable assignment.' : 'Check the team and due date before confirming.'}</p>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" disabled={processing} onClick={closeModal} className="min-h-10 rounded-xl border-slate-200/80 px-4 text-sm shadow-2xs">Cancel</Button>
                                    <Button type="submit" disabled={processing || !data.department || data.personnel_ids.length === 0 || !data.due_date} className="min-h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-2xs hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                                        {processing ? 'Saving assignment…' : selectedMission.assignee ? 'Save team' : 'Assign mission'}
                                    </Button>
                                </div>
                            </footer>
                        </form>
                    </section>
                </div>
            )}
        </AdminLayout>
    );
}
