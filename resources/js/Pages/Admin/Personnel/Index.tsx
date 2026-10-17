import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2, UserCheck, UserPlus, X, AlertCircle, Users } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent } from '@/Components/ui/card';
import type { PageProps } from '@/Types';

interface PersonnelMember {
    id: string;
    account_id: string;
    category: string | null;
    category_value: string | null;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    name_extension?: string;
    name: string;
    birthday: string | null;
    email: string | null;
    mobile: string | null;
    is_active: boolean;
    created_at: string;
}

export default function PersonnelIndex({ personnel = [], next_account_id }: { personnel: PersonnelMember[], next_account_id: string }) {
    const { flash } = usePage<PageProps>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPersonnel, setEditingPersonnel] = useState<PersonnelMember | null>(null);

    const categories = [
        { value: 'tanod', label: 'Tanod' },
        { value: 'lupon', label: 'Lupon' },
        { value: 'public_works', label: 'Public works' },
        { value: 'sanitation', label: 'Sanitation' },
        { value: 'vaw_desk', label: 'VAW Desk' },
    ];

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
        category: '',
    });

    const {
        data: informationData,
        setData: setInformationData,
        patch: patchInformation,
        processing: informationProcessing,
        errors: informationErrors,
        clearErrors: clearInformationErrors,
    } = useForm({
        category: '',
        birthday: '',
        email: '',
        mobile: '',
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
            category: '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        clearErrors();
    };

    const submitPersonnel = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/personnel', {
            onSuccess: () => closeModal(),
        });
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete personnel account for ${name}?`)) {
            router.delete(`/admin/personnel/${id}`);
        }
    };

    const openInformationEditor = (member: PersonnelMember) => {
        clearInformationErrors();
        setInformationData({
            category: member.category_value ?? '',
            birthday: member.birthday ? new Date(member.birthday).toISOString().slice(0, 10) : '',
            email: member.email ?? '',
            mobile: member.mobile ?? '',
            status: member.is_active ? 'active' : 'inactive',
        });
        setEditingPersonnel(member);
    };

    const closeInformationEditor = () => {
        setEditingPersonnel(null);
        clearInformationErrors();
    };

    const submitInformation = (e: FormEvent) => {
        e.preventDefault();
        if (!editingPersonnel) return;

        patchInformation(`/admin/personnel/${editingPersonnel.id}/information`, {
            onSuccess: closeInformationEditor,
        });
    };

    return (
        <AdminLayout title="Mission-Lokal Admin: Barangay Personnel">
            <Head title="Barangay Personnel" />

            <div className="w-full space-y-8 pb-16">
                
                {/* Flash Success Notification */}
                {flash.success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-xs font-bold text-emerald-900 shadow-2xs">
                        <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <Users className="h-3 w-3" /> Municipal Field Force
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            Barangay Personnel Roster
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Manage field unit personnel credentials, security categories, and deployment status.
                        </p>
                    </div>

                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-5 shadow-sm cursor-pointer rounded-2xl shrink-0" onClick={openModal}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Personnel Account
                    </Button>
                </div>

                {/* Personnel Roster Data Table Card */}
                <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Account ID</th>
                                        <th className="px-5 py-4">Full Name</th>
                                        <th className="px-5 py-4">Unit Category</th>
                                        <th className="px-5 py-4">Birthday</th>
                                        <th className="px-5 py-4">Contact Details</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {personnel.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground text-xs font-semibold">
                                                No personnel accounts created yet. Click "Add Personnel Account" to register staff.
                                            </td>
                                        </tr>
                                    ) : (
                                        personnel.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs font-black text-blue-700">{p.account_id}</td>
                                                <td className="px-5 py-4 font-extrabold text-slate-900 text-xs">{p.name}</td>
                                                <td className="px-5 py-4">
                                                    <span className="bg-slate-100 text-slate-800 font-bold text-xs px-3 py-1 rounded-xl border border-slate-200/60 inline-block">
                                                        {p.category ?? 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-xs font-medium text-slate-600">{p.birthday ?? 'N/A'}</td>
                                                <td className="px-5 py-4 text-xs text-slate-600">
                                                    <div className="font-bold text-slate-900">{p.mobile || 'No mobile'}</div>
                                                    <div className="text-[11px] text-slate-400 font-medium">{p.email || 'No email'}</div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={p.is_active
                                                        ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-200 shadow-2xs'
                                                        : 'inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600 border border-slate-200 shadow-2xs'}>
                                                        <UserCheck className="h-3 w-3" /> {p.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-9 w-9 text-blue-700 border-slate-200 hover:bg-blue-50 cursor-pointer shadow-2xs rounded-xl"
                                                            onClick={() => openInformationEditor(p)}
                                                            title={`Edit information for ${p.name}`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-9 w-9 text-rose-600 border-slate-200 hover:bg-rose-50 cursor-pointer shadow-2xs rounded-xl"
                                                            onClick={() => handleDelete(p.id, p.name)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ADD PERSONNEL MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs">
                    <div className="my-auto w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white shrink-0">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                    Registration Desk
                                </span>
                                <h3 className="text-lg font-black text-slate-900 mt-1">Add New Personnel Account</h3>
                            </div>
                            <button onClick={closeModal} className="rounded-full p-2 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:text-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto px-6 py-6 space-y-4">
                            <form id="add-personnel-form" onSubmit={submitPersonnel} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="category" className="text-xs font-black uppercase tracking-wider text-slate-700">Personnel Unit Category</Label>
                                    <select
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        required
                                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-2xs cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="">Select a unit category</option>
                                        {categories.map((category) => (
                                            <option key={category.value} value={category.value}>{category.label}</option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="text-xs font-semibold text-red-600">{errors.category}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="account_id" className="text-xs font-black uppercase tracking-wider text-slate-700">Account ID Reference</Label>
                                    <Input
                                        id="account_id"
                                        value={data.account_id}
                                        readOnly
                                        className="bg-slate-50 text-slate-600 font-mono font-bold cursor-not-allowed rounded-xl h-11 text-xs"
                                    />
                                    {errors.account_id && <p className="text-xs font-semibold text-red-600">{errors.account_id}</p>}
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="first_name" className="text-xs font-black uppercase tracking-wider text-slate-700">First Name</Label>
                                        <Input
                                            id="first_name"
                                            placeholder="Juan"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            required
                                            className="rounded-xl h-11 text-xs"
                                        />
                                        {errors.first_name && <p className="text-xs font-semibold text-red-600">{errors.first_name}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="middle_name" className="text-xs font-black uppercase tracking-wider text-slate-700">Middle Name (Optional)</Label>
                                        <Input
                                            id="middle_name"
                                            placeholder="Santos"
                                            value={data.middle_name}
                                            onChange={(e) => setData('middle_name', e.target.value)}
                                            className="rounded-xl h-11 text-xs"
                                        />
                                        {errors.middle_name && <p className="text-xs font-semibold text-red-600">{errors.middle_name}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="last_name" className="text-xs font-black uppercase tracking-wider text-slate-700">Last Name</Label>
                                        <Input
                                            id="last_name"
                                            placeholder="Dela Cruz"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            required
                                            className="rounded-xl h-11 text-xs"
                                        />
                                        {errors.last_name && <p className="text-xs font-semibold text-red-600">{errors.last_name}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name_extension" className="text-xs font-black uppercase tracking-wider text-slate-700">Extension (Optional)</Label>
                                        <Input
                                            id="name_extension"
                                            placeholder="Jr., III"
                                            value={data.name_extension}
                                            onChange={(e) => setData('name_extension', e.target.value)}
                                            className="rounded-xl h-11 text-xs"
                                        />
                                        {errors.name_extension && <p className="text-xs font-semibold text-red-600">{errors.name_extension}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="birthday" className="text-xs font-black uppercase tracking-wider text-slate-700">Birthday</Label>
                                        <Input
                                            id="birthday"
                                            type="date"
                                            value={data.birthday}
                                            onChange={(e) => setData('birthday', e.target.value)}
                                            className="rounded-xl h-11 text-xs"
                                        />
                                        {errors.birthday && <p className="text-xs font-semibold text-red-600">{errors.birthday}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="mobile" className="text-xs font-black uppercase tracking-wider text-slate-700">Mobile Number</Label>
                                        <Input
                                            id="mobile"
                                            placeholder="09123456789"
                                            value={data.mobile}
                                            onChange={(e) => setData('mobile', e.target.value)}
                                            className="rounded-xl h-11 text-xs"
                                        />
                                        {errors.mobile && <p className="text-xs font-semibold text-red-600">{errors.mobile}</p>}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-slate-700">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="personnel@barangay.gov.ph"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="rounded-xl h-11 text-xs"
                                    />
                                    {errors.email && <p className="text-xs font-semibold text-red-600">{errors.email}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-black uppercase tracking-wider text-slate-700">Temporary Secure Password</Label>
                                    <Input
                                        id="password"
                                        type="text"
                                        value={data.password}
                                        readOnly
                                        className="bg-slate-50 text-slate-600 font-mono font-bold cursor-not-allowed rounded-xl h-11 text-xs"
                                    />
                                    {errors.password && <p className="text-xs font-semibold text-red-600">{errors.password}</p>}
                                </div>
                            </form>
                        </div>
                        <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4 bg-white shrink-0">
                            <Button type="button" variant="outline" onClick={closeModal} className="cursor-pointer font-bold text-xs rounded-xl h-10 px-4">
                                Cancel
                            </Button>
                            <Button form="add-personnel-form" type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer font-bold text-xs rounded-xl h-10 px-5 shadow-sm">
                                {processing ? 'Saving...' : 'Create Personnel Account'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT PERSONNEL MODAL */}
            {editingPersonnel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs">
                    <div className="my-auto w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white shrink-0">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                    Record Editor
                                </span>
                                <h3 className="text-lg font-black text-slate-900 mt-1">Edit Personnel Information</h3>
                                <p className="mt-0.5 text-xs font-semibold text-slate-500">{editingPersonnel.name}</p>
                            </div>
                            <button onClick={closeInformationEditor} className="rounded-full p-2 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:text-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto px-6 py-6 space-y-4">
                            <form id="edit-personnel-form" onSubmit={submitInformation} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_category" className="text-xs font-black uppercase tracking-wider text-slate-700">Personnel Category</Label>
                                    <select
                                        id="edit_category"
                                        value={informationData.category}
                                        onChange={(e) => setInformationData('category', e.target.value)}
                                        required
                                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-2xs cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="">Select a unit category</option>
                                        {categories.map((category) => (
                                            <option key={category.value} value={category.value}>{category.label}</option>
                                        ))}
                                    </select>
                                    {informationErrors.category && <p className="text-xs font-semibold text-red-600">{informationErrors.category}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_birthday" className="text-xs font-black uppercase tracking-wider text-slate-700">Birthday</Label>
                                    <Input
                                        id="edit_birthday"
                                        type="date"
                                        value={informationData.birthday}
                                        onChange={(e) => setInformationData('birthday', e.target.value)}
                                        className="rounded-xl h-11 text-xs"
                                    />
                                    {informationErrors.birthday && <p className="text-xs font-semibold text-red-600">{informationErrors.birthday}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_mobile" className="text-xs font-black uppercase tracking-wider text-slate-700">Mobile Number</Label>
                                    <Input
                                        id="edit_mobile"
                                        placeholder="09123456789"
                                        value={informationData.mobile}
                                        onChange={(e) => setInformationData('mobile', e.target.value)}
                                        className="rounded-xl h-11 text-xs"
                                    />
                                    {informationErrors.mobile && <p className="text-xs font-semibold text-red-600">{informationErrors.mobile}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_email" className="text-xs font-black uppercase tracking-wider text-slate-700">Email Address</Label>
                                    <Input
                                        id="edit_email"
                                        type="email"
                                        placeholder="personnel@barangay.gov.ph"
                                        value={informationData.email}
                                        onChange={(e) => setInformationData('email', e.target.value)}
                                        className="rounded-xl h-11 text-xs"
                                    />
                                    {informationErrors.email && <p className="text-xs font-semibold text-red-600">{informationErrors.email}</p>}
                                </div>
                                <div className="space-y-1.5 pt-1">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">Operational Status</Label>
                                    <div className="mt-2.5 flex gap-6">
                                        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
                                            <input
                                                type="radio"
                                                name="personnel_status"
                                                value="active"
                                                checked={informationData.status === 'active'}
                                                onChange={(e) => setInformationData('status', e.target.value)}
                                                className="h-4 w-4 border-slate-300 accent-emerald-600 cursor-pointer"
                                            />
                                            Active
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
                                            <input
                                                type="radio"
                                                name="personnel_status"
                                                value="inactive"
                                                checked={informationData.status === 'inactive'}
                                                onChange={(e) => setInformationData('status', e.target.value)}
                                                className="h-4 w-4 border-slate-300 accent-slate-500 cursor-pointer"
                                            />
                                            Inactive
                                        </label>
                                    </div>
                                    {informationErrors.status && <p className="text-xs font-semibold text-red-600">{informationErrors.status}</p>}
                                </div>
                            </form>
                        </div>
                        <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4 bg-white shrink-0">
                            <Button type="button" variant="outline" onClick={closeInformationEditor} className="cursor-pointer font-bold text-xs rounded-xl h-10 px-4">
                                Cancel
                            </Button>
                            <Button form="edit-personnel-form" type="submit" disabled={informationProcessing} className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer font-bold text-xs rounded-xl h-10 px-5 shadow-sm">
                                {informationProcessing ? 'Saving...' : 'Save Information'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}