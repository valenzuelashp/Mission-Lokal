import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import { Pencil, ArchiveRestore, UserPlus, X, AlertCircle, ArrowLeft, Search, Mail, Phone, Building2, BriefcaseBusiness, IdCard, ShieldCheck, UserRound, UsersRound, Clock } from 'lucide-react';
import { useState, FormEvent, useEffect, useMemo } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import AdminLayout from '@/Layouts/AdminLayout';
import { getPersonnelRolesForDepartment, type PersonnelRoleOption } from '@/Lib/personnelRoles';
import type { PageProps } from '@/Types';

interface PersonnelMember {
    id: string;
    account_id: string;
    role: string | null;
    department: string | null;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    name_extension?: string;
    name: string;
    birthday: string | null;
    email: string | null;
    mobile: string | null;
    is_active: boolean;
    shift: string | null;
    shift_label: string | null;
    is_on_shift: boolean;
    created_at: string;
}

interface ShiftOption {
    value: string;
    label: string;
}

function formatDateInputForPH(date: Date) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const parts = formatter.formatToParts(date);
    const values = Object.fromEntries(
        parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
}


export default function PersonnelIndex({ personnel = [], next_account_id, departments = [], department_roles = {}, current_department, shift_options = [], current_shift = 'morning' }: { personnel: PersonnelMember[], next_account_id: string, departments: string[], department_roles: Record<string, PersonnelRoleOption[]>, current_department: string | null, shift_options: ShiftOption[], current_shift: string }) {
    const { flash } = usePage<PageProps>().props;
    const currentShiftLabel = shift_options.find((shift) => shift.value === current_shift)?.label ?? 'Current shift unavailable';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPersonnel, setEditingPersonnel] = useState<PersonnelMember | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const filteredPersonnel = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return personnel;
        return personnel.filter((member) =>
            [member.name, member.account_id, member.department, member.role, member.email, member.mobile, member.shift_label]
                .some((value) => value?.toLowerCase().includes(query)),
        );
    }, [personnel, searchTerm]);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        account_id: next_account_id,
        first_name: '',
        middle_name: '',
        last_name: '',
        name_extension: '',
        birthday: '',
        email: '',
        mobile: '',
        password: `${next_account_id}!${''}`,
        department: current_department || '',
        role: '',
        shift: current_shift,
    });

    const {
        data: infoData,
        setData: setInfoData,
        patch: patchInfo,
        processing: infoProcessing,
        errors: infoErrors,
        clearErrors: clearInfoErrors,
    } = useForm({
        department: '',
        role: '',
        birthday: '',
        email: '',
        mobile: '',
        shift: '',
        status: 'active',
    });

    useEffect(() => {
        const cleanLastName = data.last_name.trim();
        const defaultPwd = cleanLastName ? `${next_account_id}!${cleanLastName}` : `${next_account_id}!password`;
        setData((prev) => ({
            ...prev,
            account_id: next_account_id,
            password: defaultPwd,
        }));
    }, [next_account_id, data.last_name]);

    const openModal = () => {
        clearErrors();
        setData({
            account_id: next_account_id,
            first_name: '',
            middle_name: '',
            last_name: '',
            name_extension: '',
            birthday: '',
            email: '',
            mobile: '',
            password: `${next_account_id}!`,
            department: current_department || '',
            role: '',
            shift: current_shift,
        });
        setIsModalOpen(true);
    };

    const submitPersonnel = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/personnel', {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const handleArchive = (id: string, name: string) => {
        if (confirm(`Are you sure you want to archive the personnel account for ${name}? They will no longer be active, but historical records will be preserved.`)) {
            router.patch(`/admin/personnel/${id}/archive`);
        }
    };

    const openInformationEditor = (member: PersonnelMember) => {
        clearInfoErrors();

        let formattedBirthday = '';
        if (member.birthday && member.birthday !== 'N/A') {
            const parsedDate = new Date(member.birthday);
            if (!isNaN(parsedDate.getTime())) {
                formattedBirthday = formatDateInputForPH(parsedDate);
            }
        }

        setInfoData({
            department: member.department ?? '',
            role: member.role ?? '',
            birthday: formattedBirthday,
            email: member.email ?? '',
            mobile: member.mobile ?? '',
            shift: member.shift ?? '',
            status: member.is_active ? 'active' : 'inactive',
        });
        setEditingPersonnel(member);
    };

    const submitInformation = (e: FormEvent) => {
        e.preventDefault();
        if (!editingPersonnel) return;
        patchInfo(`/admin/personnel/${editingPersonnel.id}/information`, {
            onSuccess: () => setEditingPersonnel(null),
        });
    };

    return (
        <AdminLayout title={`Mission-Lokal Admin: ${current_department ? current_department : 'All Personnel'}`}>
            <Head title="Personnel Roster" />

            <div className="mx-auto w-full max-w-[1500px] space-y-7 pb-16">
                
                {flash.success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-900 shadow-sm">
                        <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash.error && (
                    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-900 shadow-sm">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                        <span>{flash.error}</span>
                    </div>
                )}

                <section className="relative isolate overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_95%_0%,rgba(56,189,248,0.16),transparent_35%),linear-gradient(125deg,#ffffff_35%,#eff6ff_100%)]" />
                    <div className="flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
                        <div className="max-w-2xl">
                            <Link href="/admin/departments" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700">
                                <ArrowLeft className="h-3.5 w-3.5" /> Departments
                            </Link>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                                    {current_department ? `${current_department} Roster` : 'All Personnel'}
                                </h1>
                                {current_department && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-800">
                                        <Building2 className="h-3.5 w-3.5" /> Department
                                    </span>
                                )}
                            </div>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                                Manage team profiles, roles, contact details, and operational status.
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto lg:items-end">
                            <div className="grid flex-1 grid-cols-2 gap-3 sm:min-w-[280px]">
                                <div className="rounded-2xl border border-white/90 bg-white/75 p-4 shadow-sm backdrop-blur">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        <UsersRound className="h-3.5 w-3.5 text-blue-600" /> Team members
                                    </div>
                                    <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{personnel.length}</p>
                                </div>
                                <div className="rounded-2xl border border-white/90 bg-white/75 p-4 shadow-sm backdrop-blur">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        <ShieldCheck className="h-3.5 w-3.5 text-sky-600" /> Active
                                    </div>
                                    <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{personnel.filter((member) => member.is_active).length}</p>
                                </div>
                            </div>
                            <Button size="sm" className="h-11 w-full rounded-xl bg-blue-600 px-5 font-bold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:w-auto" onClick={openModal}>
                                <UserPlus className="mr-2 h-4 w-4" /> Add Personnel
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_50px_-38px_rgba(15,23,42,0.4)]">
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                        <div>
                            <h2 className="text-base font-black tracking-tight text-slate-900">Personnel directory</h2>
                            <p className="mt-1 text-xs font-medium text-slate-500">Search by name, account ID, department, role, or contact. Current shift: {currentShiftLabel}.</p>
                        </div>
                        <label className="relative block w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search personnel..."
                                aria-label="Search personnel"
                                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm transition focus:bg-white focus:ring-4 focus:ring-sky-100"
                            />
                        </label>
                    </div>
                    <div className="hidden overflow-x-auto lg:block">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                <tr>
                                    <th className="px-7 py-4">Personnel</th>
                                    <th className="px-5 py-4">Department / Role</th>
                                    <th className="px-5 py-4">Contact</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Current shift</th>
                                    <th className="px-7 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPersonnel.map((p) => (
                                    <tr key={p.id} className="group transition hover:bg-sky-50/40">
                                        <td className="px-7 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 text-sm font-black text-sky-800 ring-1 ring-inset ring-sky-200/70">
                                                    {p.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-extrabold text-slate-900">{p.name}</p>
                                                    <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-400">
                                                        <IdCard className="h-3 w-3" /> {p.account_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-slate-800">{p.department ?? 'Unassigned'}</p>
                                            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500"><BriefcaseBusiness className="h-3 w-3" /> {p.role ?? 'No role assigned'}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="flex items-center gap-2 text-xs font-semibold text-slate-700"><Phone className="h-3.5 w-3.5 text-slate-400" /> {p.mobile || 'No mobile'}</p>
                                            <p className="mt-1 flex items-center gap-2 text-xs text-slate-500"><Mail className="h-3.5 w-3.5 text-slate-400" /> {p.email || 'No email'}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={p.is_active
                                                ? 'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800'
                                                : 'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-600'}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} /> {p.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-xs font-bold text-slate-700">{p.shift_label ?? 'No shift assigned'}</p>
                                            {p.shift && (
                                                <span className={p.is_on_shift
                                                    ? 'mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-800'
                                                    : 'mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-600'}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${p.is_on_shift ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    {p.is_on_shift ? 'On shift now' : 'Off shift'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-7 py-4 text-right">
                                            <div className="inline-flex justify-end gap-2">
                                                <Button variant="outline" size="icon" title="Edit Information" aria-label={`Edit ${p.name}`} className="h-9 w-9 rounded-xl border-slate-200 text-sky-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50" onClick={() => openInformationEditor(p)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" title="Archive Account" aria-label={`Archive ${p.name}`} className="h-9 w-9 rounded-xl border-slate-200 text-rose-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50" onClick={() => handleArchive(p.id, p.name)}>
                                                    <ArchiveRestore className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPersonnel.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Search className="h-5 w-5" /></div>
                                            <p className="mt-4 text-sm font-bold text-slate-700">{searchTerm ? 'No matching personnel' : 'No personnel in this roster yet'}</p>
                                            <p className="mt-1 text-xs text-slate-500">{searchTerm ? 'Try another name, role, or account ID.' : 'Add a team member to get started.'}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="space-y-3 p-4 lg:hidden">
                        {filteredPersonnel.map((p) => (
                            <article key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md">
                                <div className="flex items-start gap-3">
                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 text-sm font-black text-sky-800 ring-1 ring-inset ring-sky-200/70">
                                        {p.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-extrabold text-slate-900">{p.name}</h3>
                                                <p className="mt-1 font-mono text-[10px] font-bold text-slate-400">{p.account_id}</p>
                                            </div>
                                            <span className={p.is_active
                                                ? 'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-800'
                                                : 'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-600'}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} /> {p.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Department / role</p>
                                        <p className="mt-1 truncate text-xs font-bold text-slate-800">{p.department ?? 'Unassigned'}</p>
                                        <p className="mt-0.5 truncate text-[11px] text-slate-500">{p.role ?? 'No role assigned'}</p>
                                    </div>
                                    <div className="min-w-0 space-y-1.5">
                                        <p className="truncate text-[11px] font-semibold text-slate-600"><Phone className="mr-1 inline h-3 w-3 text-slate-400" />{p.mobile || 'No mobile'}</p>
                                        <p className="truncate text-[11px] text-slate-500"><Mail className="mr-1 inline h-3 w-3 text-slate-400" />{p.email || 'No email'}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Assigned shift</p>
                                        <p className="mt-1 text-xs font-bold text-slate-700">{p.shift_label ?? 'No shift assigned'}</p>
                                    </div>
                                    {p.shift && (
                                        <span className={p.is_on_shift
                                            ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-800'
                                            : 'inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-600'}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${p.is_on_shift ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                            {p.is_on_shift ? 'On shift now' : 'Off shift'}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <p className="text-[10px] text-slate-400">{p.birthday ? `Birthday ${p.birthday}` : 'Birthday not set'}</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" title="Edit Information" aria-label={`Edit ${p.name}`} className="h-9 w-9 rounded-xl border-slate-200 text-sky-700" onClick={() => openInformationEditor(p)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" title="Archive Account" aria-label={`Archive ${p.name}`} className="h-9 w-9 rounded-xl border-slate-200 text-rose-600" onClick={() => handleArchive(p.id, p.name)}>
                                            <ArchiveRestore className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </article>
                        ))}
                        {filteredPersonnel.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center">
                                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Search className="h-5 w-5" /></div>
                                <p className="mt-4 text-sm font-bold text-slate-700">{searchTerm ? 'No matching personnel' : 'No personnel in this roster yet'}</p>
                                <p className="mt-1 text-xs text-slate-500">{searchTerm ? 'Try another name, role, or account ID.' : 'Add a team member to get started.'}</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* ADD PERSONNEL MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-md sm:p-6">
                    <div className="my-auto flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-white/40 bg-white shadow-[0_35px_100px_-25px_rgba(2,6,23,0.65)]">
                        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-5 py-5 text-white sm:px-7">
                            <div className="pointer-events-none absolute -right-6 -top-20 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-sky-200 shadow-inner">
                                        <UserPlus className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-200">Personnel directory</span>
                                        <h3 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">Add a team member</h3>
                                        <p className="mt-1 text-xs text-slate-300">Create an account and assign a department and role.</p>
                                    </div>
                                </div>
                                <button type="button" aria-label="Close add personnel dialog" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto bg-slate-50/80 px-4 py-5 sm:px-7 sm:py-6">
                            <form id="add-form" onSubmit={submitPersonnel} className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700"><BriefcaseBusiness className="h-4 w-4" /></span>
                                        <div><h4 className="text-sm font-extrabold text-slate-900">Team assignment</h4><p className="text-[11px] text-slate-500">Choose where this person works and their role.</p></div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Department</Label>
                                        <Input
                                            list="department-options"
                                            value={data.department}
                                            onChange={(e) => {
                                                setData('department', e.target.value);
                                                setData('role', '');
                                            }}
                                            placeholder="Select or type new..."
                                            required
                                            className="h-11 w-full rounded-xl border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-900 focus-visible:ring-sky-500"
                                        />
                                        <datalist id="department-options">
                                            {departments.map((dept) => (
                                                <option key={dept} value={dept} />
                                            ))}
                                        </datalist>
                                        {errors.department && <p className="text-xs text-red-600">{errors.department}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Role / position</Label>
                                        <select
                                            value={data.role}
                                            onChange={(e) => {
                                                const role = e.target.value;
                                                setData('role', role);
                                            }}
                                            required
                                            disabled={!data.department}
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:bg-slate-100"
                                        >
                                            <option value="">{data.department ? (getPersonnelRolesForDepartment(data.department, department_roles).length ? 'Select a role / position' : 'No roles are saved for this department') : 'Select a department first'}</option>
                                            {getPersonnelRolesForDepartment(data.department, department_roles).map((role) => (
                                                <option key={role.value} value={role.value}>{role.label}</option>
                                            ))}
                                        </select>
                                        {errors.role && <p className="text-xs text-red-600">{errors.role}</p>}
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Daily shift</Label>
                                        <select
                                            value={data.shift}
                                            onChange={(e) => setData('shift', e.target.value)}
                                            required
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                                        >
                                            <option value="">Select a shift</option>
                                            {shift_options.map((shift) => (
                                                <option key={shift.value} value={shift.value}>{shift.label}</option>
                                            ))}
                                        </select>
                                        {errors.shift && <p className="text-xs text-red-600">{errors.shift}</p>}
                                    </div>
                                </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-700"><UserRound className="h-4 w-4" /></span>
                                        <div><h4 className="text-sm font-extrabold text-slate-900">Personal details</h4><p className="text-[11px] text-slate-500">Enter the name and account reference.</p></div>
                                    </div>
                                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">First name</Label>
                                            <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required className="h-11 rounded-xl border-slate-200 text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Middle name</Label>
                                            <Input value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} className="h-11 rounded-xl border-slate-200 text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Last name</Label>
                                            <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required className="h-11 rounded-xl border-slate-200 text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Name extension</Label>
                                            <Input value={data.name_extension} onChange={(e) => setData('name_extension', e.target.value)} placeholder="Jr., III" className="h-11 rounded-xl border-slate-200 text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Account ID reference</Label>
                                        <Input value={data.account_id} readOnly className="h-11 cursor-not-allowed rounded-xl border-slate-200 bg-slate-50 font-mono text-sm font-bold text-slate-600" />
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><Phone className="h-4 w-4" /></span>
                                        <div><h4 className="text-sm font-extrabold text-slate-900">Contact & access</h4><p className="text-[11px] text-slate-500">Add contact information and review the temporary password.</p></div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Birthday</Label>
                                            <Input type="date" value={data.birthday} onChange={(e) => setData('birthday', e.target.value)} className="h-11 rounded-xl border-slate-200 text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Mobile number</Label>
                                            <Input value={data.mobile} onChange={(e) => setData('mobile', e.target.value)} placeholder="09123456789" className="h-11 rounded-xl border-slate-200 text-sm" />
                                        </div>
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email address</Label>
                                            <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="h-11 rounded-xl border-slate-200 text-sm" />
                                        </div>
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Temporary password</Label>
                                            <Input type="text" value={data.password} readOnly className="h-11 cursor-not-allowed rounded-xl border-slate-200 bg-slate-50 font-mono text-sm font-bold text-slate-600" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="flex shrink-0 justify-end gap-2.5 border-t border-slate-200 bg-white px-4 py-4 sm:px-7">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-11 rounded-xl border-slate-200 px-5 text-sm font-bold">Cancel</Button>
                            <Button form="add-form" type="submit" disabled={processing} className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 hover:bg-sky-800">
                                {processing ? 'Creating account...' : 'Create account'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT PERSONNEL MODAL */}
            {editingPersonnel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-md sm:p-6">
                    <div className="my-auto flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-[1.75rem] border border-white/40 bg-white shadow-[0_35px_100px_-25px_rgba(2,6,23,0.65)]">
                        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-sky-900 px-5 py-5 text-white sm:px-7">
                            <div className="pointer-events-none absolute -right-6 -top-20 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-violet-200 shadow-inner">
                                        <Pencil className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-200">Profile settings</span>
                                        <h3 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">Edit personnel</h3>
                                        <p className="mt-1 truncate text-xs text-slate-300">{editingPersonnel.name} <span className="font-mono text-slate-400">· {editingPersonnel.account_id}</span></p>
                                    </div>
                                </div>
                                <button type="button" aria-label="Close edit personnel dialog" onClick={() => setEditingPersonnel(null)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto bg-slate-50/80 px-4 py-5 sm:px-7 sm:py-6">
                            <form id="edit-form" onSubmit={submitInformation} className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700"><Building2 className="h-4 w-4" /></span>
                                        <div><h4 className="text-sm font-extrabold text-slate-900">Team assignment</h4><p className="text-[11px] text-slate-500">Department and position.</p></div>
                                    </div>
                                    <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Department</Label>
                                    <Input
                                        list="department-options-edit"
                                        value={infoData.department}
                                        onChange={(e) => {
                                            setInfoData('department', e.target.value);
                                            setInfoData('role', '');
                                        }}
                                        placeholder="Select or type new..."
                                        required
                                        className="h-11 w-full rounded-xl border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-900"
                                    />
                                    <datalist id="department-options-edit">
                                        {departments.map((dept) => (
                                            <option key={dept} value={dept} />
                                        ))}
                                    </datalist>
                                    {infoErrors.department && <p className="text-xs text-red-600">{infoErrors.department}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Role / position</Label>
                                    <select
                                        value={infoData.role}
                                        onChange={(e) => {
                                            const role = e.target.value;
                                            setInfoData('role', role);
                                        }}
                                        required
                                        disabled={!infoData.department}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:bg-slate-100"
                                    >
                                        <option value="">{infoData.department ? (getPersonnelRolesForDepartment(infoData.department, department_roles).length ? 'Select a role / position' : 'No roles are saved for this department') : 'Select a department first'}</option>
                                        {getPersonnelRolesForDepartment(infoData.department, department_roles).map((role) => (
                                            <option key={role.value} value={role.value}>{role.label}</option>
                                        ))}
                                    </select>
                                    {infoErrors.role && <p className="text-xs text-red-600">{infoErrors.role}</p>}
                                </div>
                                </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700"><Clock className="h-4 w-4" /></span>
                                    <div><h4 className="text-sm font-extrabold text-slate-900">Daily shift</h4><p className="text-[11px] text-slate-500">The assigned shift repeats every day. Multiple personnel can share a shift.</p></div>
                                </div>
                                <select
                                    value={infoData.shift}
                                    onChange={(e) => setInfoData('shift', e.target.value)}
                                    required
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                                >
                                    <option value="">Select a shift</option>
                                    {shift_options.map((shift) => (
                                        <option key={shift.value} value={shift.value}>{shift.label}</option>
                                    ))}
                                </select>
                                {infoErrors.shift && <p className="mt-1 text-xs text-red-600">{infoErrors.shift}</p>}
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><Phone className="h-4 w-4" /></span>
                                    <div><h4 className="text-sm font-extrabold text-slate-900">Contact information</h4><p className="text-[11px] text-slate-500">Keep the employee's profile details current.</p></div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Birthday</Label>
                                <Input type="date" value={infoData.birthday} onChange={(e) => setInfoData('birthday', e.target.value)} className="h-11 rounded-xl border-slate-200 text-sm" />
                                    {infoErrors.birthday && <p className="text-xs text-red-600">{infoErrors.birthday}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Mobile number</Label>
                                    <Input value={infoData.mobile} onChange={(e) => setInfoData('mobile', e.target.value)} className="h-11 rounded-xl border-slate-200 text-sm" />
                                    {infoErrors.mobile && <p className="text-xs text-red-600">{infoErrors.mobile}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email address</Label>
                                    <Input type="email" value={infoData.email} onChange={(e) => setInfoData('email', e.target.value)} className="h-11 rounded-xl border-slate-200 text-sm" />
                                    {infoErrors.email && <p className="text-xs text-red-600">{infoErrors.email}</p>}
                                </div>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700"><ShieldCheck className="h-4 w-4" /></span>
                                        <div><h4 className="text-sm font-extrabold text-slate-900">Operational status</h4><p className="text-[11px] text-slate-500">Choose whether this person is currently active.</p></div>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <label className={`flex min-w-[130px] flex-1 cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-bold transition ${infoData.status === 'active' ? 'border-emerald-300 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                                            <input type="radio" name="status" value="active" checked={infoData.status === 'active'} onChange={(e) => setInfoData('status', e.target.value)} className="h-4 w-4 accent-emerald-600" /> Active
                                        </label>
                                        <label className={`flex min-w-[130px] flex-1 cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-bold transition ${infoData.status === 'inactive' ? 'border-slate-300 bg-slate-100 text-slate-800 ring-2 ring-slate-100' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                                            <input type="radio" name="status" value="inactive" checked={infoData.status === 'inactive'} onChange={(e) => setInfoData('status', e.target.value)} className="h-4 w-4 accent-slate-500" /> Inactive
                                        </label>
                                    </div>
                                    {infoErrors.status && <p className="text-xs text-red-600">{infoErrors.status}</p>}
                                </div>
                            </form>
                        </div>
                        <div className="flex shrink-0 justify-end gap-2.5 border-t border-slate-200 bg-white px-4 py-4 sm:px-7">
                            <Button type="button" variant="outline" onClick={() => setEditingPersonnel(null)} className="h-11 rounded-xl border-slate-200 px-5 text-sm font-bold">Cancel</Button>
                            <Button form="edit-form" type="submit" disabled={infoProcessing} className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-900/15 hover:bg-blue-700">
                                {infoProcessing ? 'Saving changes...' : 'Save changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}