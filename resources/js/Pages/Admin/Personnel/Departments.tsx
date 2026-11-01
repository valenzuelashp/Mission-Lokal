import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Building2, Users, UserPlus, X, AlertCircle, Plus, ArrowUpRight, Sparkles, ShieldCheck, UserRound, Phone } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { getPersonnelRolesForDepartment, type PersonnelRoleOption } from '@/Lib/personnelRoles';
import type { PageProps } from '@/Types';

interface Department {
    name: string;
    personnel_count: number;
}

const departmentThemes = [
    { icon: 'bg-sky-100 text-sky-700', glow: 'from-sky-500/10', dot: 'bg-sky-500', count: 'bg-sky-50 text-sky-700 ring-sky-100' },
    { icon: 'bg-blue-100 text-blue-700', glow: 'from-blue-500/10', dot: 'bg-blue-500', count: 'bg-blue-50 text-blue-700 ring-blue-100' },
    { icon: 'bg-indigo-100 text-indigo-700', glow: 'from-indigo-500/10', dot: 'bg-indigo-500', count: 'bg-indigo-50 text-indigo-700 ring-indigo-100' },
    { icon: 'bg-cyan-100 text-cyan-700', glow: 'from-cyan-500/10', dot: 'bg-cyan-500', count: 'bg-cyan-50 text-cyan-700 ring-cyan-100' },
    { icon: 'bg-sky-100 text-sky-800', glow: 'from-sky-600/10', dot: 'bg-sky-600', count: 'bg-sky-50 text-sky-800 ring-sky-100' },
];

export default function DepartmentsIndex({ departments = [], department_roles = {}, next_account_id, total_personnel = 0 }: { departments: Department[], department_roles: Record<string, PersonnelRoleOption[]>, next_account_id: string, total_personnel: number }) {
    const { flash } = usePage<PageProps>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
    const {
        data: departmentData,
        setData: setDepartmentData,
        post: postDepartment,
        processing: departmentProcessing,
        errors: departmentErrors,
        clearErrors: clearDepartmentErrors,
        reset: resetDepartmentForm,
    } = useForm({ name: '' });

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
        department: '',
        role: '',
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
            department: '',
            role: '',
        });
        setIsModalOpen(true);
    };

    const submitPersonnel = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/personnel', {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const submitDepartment = (e: FormEvent) => {
        e.preventDefault();
        postDepartment('/admin/departments', {
            onSuccess: () => {
                setIsDepartmentModalOpen(false);
                resetDepartmentForm();
            },
        });
    };

    return (
        <AdminLayout title="Mission-Lokal Admin: Departments">
            <Head title="Departments" />

            <div className="mx-auto w-full max-w-[1500px] space-y-8 pb-16">

                {flash.success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-900 shadow-sm">
                        <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                <section className="relative isolate overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_95%_0%,rgba(56,189,248,0.18),transparent_34%),linear-gradient(125deg,#ffffff_35%,#f0f9ff_100%)]" />
                    <div className="flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-sky-800 shadow-sm">
                                <Sparkles className="h-3.5 w-3.5" /> Personnel directory
                            </span>
                            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                                Departments
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                                Browse teams, open a roster, and keep every field unit organized from one place.
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto lg:items-end">
                            <div className="grid flex-1 grid-cols-2 gap-3 sm:min-w-[280px]">
                                <div className="rounded-2xl border border-white/90 bg-white/75 p-4 shadow-sm backdrop-blur">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        <Building2 className="h-3.5 w-3.5 text-sky-600" /> Departments
                                    </div>
                                    <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{departments.length}</p>
                                </div>
                                <div className="rounded-2xl border border-white/90 bg-white/75 p-4 shadow-sm backdrop-blur">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        <Users className="h-3.5 w-3.5 text-blue-600" /> Active personnel
                                    </div>
                                    <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{total_personnel}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-11 flex-1 rounded-xl border-slate-200 bg-white/85 px-4 font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 sm:flex-none" onClick={() => {
                            clearDepartmentErrors();
                            resetDepartmentForm();
                            setIsDepartmentModalOpen(true);
                        }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Department
                        </Button>
                                <Button size="sm" className="h-11 flex-1 rounded-xl bg-blue-600 px-4 font-bold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:flex-none" onClick={openModal}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Personnel
                        </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex items-end justify-between gap-4 px-1">
                    <div>
                        <h2 className="text-lg font-black tracking-tight text-slate-900">Your teams</h2>
                        <p className="mt-1 text-xs font-medium text-slate-500">Choose a department to view and manage its roster.</p>
                    </div>
                    <span className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:inline-flex">
                        <ShieldCheck className="h-3.5 w-3.5 text-sky-500" /> Barangay workspace
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    <Card className="group relative overflow-hidden rounded-[1.75rem] border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-sky-100 text-slate-900 shadow-[0_18px_50px_-30px_rgba(37,99,235,0.3)] transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_26px_60px_-25px_rgba(14,165,233,0.3)]">
                        <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-sky-300/30 blur-3xl transition duration-500 group-hover:bg-blue-300/40" />
                        <Link href="/admin/personnel" className="block h-full">
                            <CardContent className="relative flex min-h-[220px] flex-col p-6 sm:p-7">
                                <div className="flex items-start justify-between">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-blue-200 bg-white/80 text-blue-700 shadow-sm transition duration-300 group-hover:scale-105 group-hover:bg-white">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <span className="rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                                        All teams
                                    </span>
                                </div>
                                <h3 className="mt-6 text-xl font-black tracking-tight text-slate-950">All personnel</h3>
                                <p className="mt-1 text-xs leading-5 text-slate-600">View every team member in a single roster.</p>
                                <div className="mt-auto flex items-end justify-between border-t border-blue-200/80 pt-5">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active team members</p>
                                        <p className="mt-1 text-2xl font-black tabular-nums text-slate-950">{total_personnel}</p>
                                    </div>
                                    <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-900/15 transition duration-300 group-hover:translate-x-1 group-hover:bg-blue-700">
                                        <ArrowUpRight className="h-5 w-5" />
                                    </span>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>

                    {departments.map((dept, i) => {
                        const theme = departmentThemes[i % departmentThemes.length];
                        return (
                        <Card key={dept.name} className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-[0_12px_36px_-25px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_48px_-25px_rgba(15,23,42,0.3)]">
                            <div className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${theme.glow} to-transparent opacity-90 transition duration-300 group-hover:h-40`} />
                            <Link href={`/admin/personnel?department=${encodeURIComponent(dept.name)}`} className="block h-full">
                                <CardContent className="relative flex min-h-[220px] flex-col p-6 sm:p-7">
                                    <div className="flex items-start justify-between">
                                        <div className={`grid h-12 w-12 place-items-center rounded-2xl shadow-sm transition duration-300 group-hover:-rotate-3 group-hover:scale-105 ${theme.icon}`}>
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${theme.count}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} /> Department
                                        </span>
                                    </div>
                                    <h3 className="mt-6 line-clamp-2 text-lg font-black leading-snug tracking-tight text-slate-900">{dept.name}</h3>
                                    <p className="mt-1 text-xs text-slate-500">Open team roster and manage personnel.</p>
                                    <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-5">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active members</p>
                                            <p className="mt-1 text-2xl font-black tabular-nums text-slate-900">{dept.personnel_count}</p>
                                        </div>
                                        <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition duration-300 group-hover:translate-x-1 group-hover:bg-slate-900 group-hover:text-white">
                                            <ArrowUpRight className="h-5 w-5" />
                                        </span>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    )})}
                </div>
            </div>

            {/* ADD PERSONNEL MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-md sm:p-6">
                    <div className="my-auto flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-white/40 bg-white shadow-[0_35px_100px_-25px_rgba(2,6,23,0.65)]">
                        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-5 py-5 text-white sm:px-7">
                            <div className="pointer-events-none absolute -right-6 -top-20 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-sky-200 shadow-inner"><UserPlus className="h-5 w-5" /></div>
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
                                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700"><Building2 className="h-4 w-4" /></span>
                                        <div><h4 className="text-sm font-extrabold text-slate-900">Team assignment</h4><p className="text-[11px] text-slate-500">Choose the department and role for this person.</p></div>
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
                                                <option key={dept.name} value={dept.name} />
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
                                </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><UserRound className="h-4 w-4" /></span>
                                        <div><h4 className="text-sm font-extrabold text-slate-900">Personal details</h4><p className="text-[11px] text-slate-500">Enter the name and account reference.</p></div>
                                    </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Account ID reference</Label>
                                    <Input value={data.account_id} readOnly className="h-11 cursor-not-allowed rounded-xl border-slate-200 bg-slate-50 font-mono text-sm font-bold text-slate-600" />
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Phone className="h-4 w-4" /></span>
                                        <div><h4 className="text-sm font-extrabold text-slate-900">Contact & access</h4><p className="text-[11px] text-slate-500">Keep contact details accurate and review account access.</p></div>
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
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email address</Label>
                                    <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="h-11 rounded-xl border-slate-200 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Temporary password</Label>
                                    <Input type="text" value={data.password} readOnly className="h-11 cursor-not-allowed rounded-xl border-slate-200 bg-slate-50 font-mono text-sm font-bold text-slate-600" />
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

            {isDepartmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-md">
                    <div className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/40 bg-white shadow-[0_35px_100px_-25px_rgba(2,6,23,0.65)]">
                        <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-sky-900 px-6 py-6 text-white sm:px-7">
                            <div className="pointer-events-none absolute -right-8 -top-20 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-sky-200"><Building2 className="h-5 w-5" /></div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-200">Workspace setup</span>
                                        <h2 className="mt-1 text-xl font-black tracking-tight">Add a department</h2>
                                        <p className="mt-1 text-xs text-slate-300">Create a new team for this barangay.</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setIsDepartmentModalOpen(false)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white" aria-label="Close department dialog">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={submitDepartment}>
                            <div className="bg-slate-50/80 px-6 py-6 sm:px-7">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <Label htmlFor="department-name" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Department name</Label>
                                    <Input
                                        id="department-name"
                                        autoFocus
                                        maxLength={50}
                                        value={departmentData.name}
                                        onChange={(event) => setDepartmentData('name', event.target.value)}
                                        placeholder="e.g. Disaster Risk Reduction"
                                        required
                                        className="mt-2 h-12 rounded-xl border-slate-200 text-sm focus-visible:ring-blue-500"
                                    />
                                    <p className="mt-2 text-[11px] text-slate-500">The department will be available for personnel assignments.</p>
                                    {departmentErrors.name && <p className="mt-2 text-xs font-semibold text-red-600">{departmentErrors.name}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2.5 border-t border-slate-200 bg-white px-6 py-4 sm:px-7">
                                <Button type="button" variant="outline" onClick={() => setIsDepartmentModalOpen(false)} className="h-11 rounded-xl border-slate-200 px-5 text-sm font-bold">Cancel</Button>
                                <Button type="submit" disabled={departmentProcessing} className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-900/15 hover:bg-blue-700">
                                    {departmentProcessing ? 'Creating department...' : 'Create department'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}