import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2, UserCheck, UserPlus, X, AlertCircle } from 'lucide-react';
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

            {flash.success && (
                <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-xs font-bold text-emerald-900 shadow-2xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    {flash.success}
                </div>
            )}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Barangay Personnel Roster</h2>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                        Manage field unit personnel credentials, security categories, and deployment status.
                    </p>
                </div>
                <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-sm cursor-pointer" onClick={openModal}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Personnel Account
                </Button>
            </div>

            <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 border-b text-xs font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-3.5">Account ID</th>
                                    <th className="px-4 py-3.5">Full Name</th>
                                    <th className="px-4 py-3.5">Unit Category</th>
                                    <th className="px-4 py-3.5">Birthday</th>
                                    <th className="px-4 py-3.5">Contact Details</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {personnel.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-xs font-medium">
                                            No personnel accounts created yet. Click "Add Personnel Account" to register staff.
                                        </td>
                                    </tr>
                                ) : (
                                    personnel.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5 font-mono text-xs font-bold text-blue-700">{p.account_id}</td>
                                            <td className="px-4 py-3.5 font-bold text-slate-900">{p.name}</td>
                                            <td className="px-4 py-3.5">
                                                <span className="bg-slate-100 text-slate-800 font-bold text-xs px-2.5 py-1 rounded-md border">
                                                    {p.category ?? 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-slate-600">{p.birthday ?? 'N/A'}</td>
                                            <td className="px-4 py-3.5 text-xs text-slate-600">
                                                <div className="font-semibold text-slate-900">{p.mobile || 'No mobile'}</div>
                                                <div className="text-[11px] text-muted-foreground">{p.email || 'No email'}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={p.is_active
                                                    ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200'
                                                    : 'inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-200'}>
                                                    <UserCheck className="h-3 w-3" /> {p.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="inline-flex justify-end gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer shadow-2xs"
                                                        onClick={() => openInformationEditor(p)}
                                                        title={`Edit information for ${p.name}`}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer shadow-2xs"
                                                        onClick={() => handleDelete(p.id, p.name)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
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

            {/* ADD PERSONNEL MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
                        <div className="mb-5 flex items-center justify-between border-b pb-3">
                            <h3 className="text-base font-black text-slate-900">Add New Personnel Account</h3>
                            <button onClick={closeModal} className="rounded-full p-1.5 hover:bg-slate-100 cursor-pointer">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={submitPersonnel} className="space-y-4">
                            <div>
                                <Label htmlFor="category">Personnel Unit Category</Label>
                                <select
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    required
                                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs cursor-pointer"
                                >
                                    <option value="">Select a unit category</option>
                                    {categories.map((category) => (
                                        <option key={category.value} value={category.value}>{category.label}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="mt-1 text-xs font-medium text-red-600">{errors.category}</p>}
                            </div>

                            <div>
                                <Label htmlFor="account_id">Account ID Reference</Label>
                                <Input
                                    id="account_id"
                                    value={data.account_id}
                                    readOnly
                                    className="bg-slate-50 text-slate-600 font-mono font-bold cursor-not-allowed"
                                />
                                {errors.account_id && <p className="mt-1 text-xs font-medium text-red-600">{errors.account_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        placeholder="Juan"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        required
                                    />
                                    {errors.first_name && <p className="mt-1 text-xs font-medium text-red-600">{errors.first_name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="middle_name">Middle Name (Optional)</Label>
                                    <Input
                                        id="middle_name"
                                        placeholder="Santos"
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                    />
                                    {errors.middle_name && <p className="mt-1 text-xs font-medium text-red-600">{errors.middle_name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        placeholder="Dela Cruz"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        required
                                    />
                                    {errors.last_name && <p className="mt-1 text-xs font-medium text-red-600">{errors.last_name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="name_extension">Extension (Optional)</Label>
                                    <Input
                                        id="name_extension"
                                        placeholder="Jr., III"
                                        value={data.name_extension}
                                        onChange={(e) => setData('name_extension', e.target.value)}
                                    />
                                    {errors.name_extension && <p className="mt-1 text-xs font-medium text-red-600">{errors.name_extension}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="birthday">Birthday</Label>
                                    <Input
                                        id="birthday"
                                        type="date"
                                        value={data.birthday}
                                        onChange={(e) => setData('birthday', e.target.value)}
                                    />
                                    {errors.birthday && <p className="mt-1 text-xs font-medium text-red-600">{errors.birthday}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="mobile">Mobile Number</Label>
                                    <Input
                                        id="mobile"
                                        placeholder="09123456789"
                                        value={data.mobile}
                                        onChange={(e) => setData('mobile', e.target.value)}
                                    />
                                    {errors.mobile && <p className="mt-1 text-xs font-medium text-red-600">{errors.mobile}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="personnel@barangay.gov.ph"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <Label htmlFor="password">Temporary Secure Password</Label>
                                <Input
                                    id="password"
                                    type="text"
                                    value={data.password}
                                    readOnly
                                    className="bg-slate-50 text-slate-600 font-mono font-bold cursor-not-allowed"
                                />
                                {errors.password && <p className="mt-1 text-xs font-medium text-red-600">{errors.password}</p>}
                            </div>

                            <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={closeModal} className="cursor-pointer font-bold text-xs">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-800 cursor-pointer font-bold text-xs shadow-sm">
                                    {processing ? 'Saving...' : 'Create Personnel Account'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingPersonnel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
                        <div className="mb-5 flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="text-base font-black text-slate-900">Edit Personnel Information</h3>
                                <p className="mt-0.5 text-xs font-semibold text-slate-500">{editingPersonnel.name}</p>
                            </div>
                            <button onClick={closeInformationEditor} className="rounded-full p-1.5 hover:bg-slate-100 cursor-pointer">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={submitInformation} className="space-y-4">
                            <div>
                                <Label htmlFor="edit_category">Personnel Category</Label>
                                <select
                                    id="edit_category"
                                    value={informationData.category}
                                    onChange={(e) => setInformationData('category', e.target.value)}
                                    required
                                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs cursor-pointer"
                                >
                                    <option value="">Select a unit category</option>
                                    {categories.map((category) => (
                                        <option key={category.value} value={category.value}>{category.label}</option>
                                    ))}
                                </select>
                                {informationErrors.category && <p className="mt-1 text-xs font-medium text-red-600">{informationErrors.category}</p>}
                            </div>

                            <div>
                                <Label htmlFor="edit_birthday">Birthday</Label>
                                <Input
                                    id="edit_birthday"
                                    type="date"
                                    value={informationData.birthday}
                                    onChange={(e) => setInformationData('birthday', e.target.value)}
                                />
                                {informationErrors.birthday && <p className="mt-1 text-xs font-medium text-red-600">{informationErrors.birthday}</p>}
                            </div>

                            <div>
                                <Label htmlFor="edit_mobile">Mobile Number</Label>
                                <Input
                                    id="edit_mobile"
                                    placeholder="09123456789"
                                    value={informationData.mobile}
                                    onChange={(e) => setInformationData('mobile', e.target.value)}
                                />
                                {informationErrors.mobile && <p className="mt-1 text-xs font-medium text-red-600">{informationErrors.mobile}</p>}
                            </div>

                            <div>
                                <Label htmlFor="edit_email">Email Address</Label>
                                <Input
                                    id="edit_email"
                                    type="email"
                                    placeholder="personnel@barangay.gov.ph"
                                    value={informationData.email}
                                    onChange={(e) => setInformationData('email', e.target.value)}
                                />
                                {informationErrors.email && <p className="mt-1 text-xs font-medium text-red-600">{informationErrors.email}</p>}
                            </div>

                            <div>
                                <Label>Operational Status</Label>
                                <div className="mt-2.5 flex gap-5">
                                    <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
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
                                    <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
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
                                {informationErrors.status && <p className="mt-1 text-xs font-medium text-red-600">{informationErrors.status}</p>}
                            </div>

                            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={closeInformationEditor} className="cursor-pointer font-bold text-xs">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={informationProcessing} className="bg-blue-700 text-white hover:bg-blue-800 cursor-pointer font-bold text-xs shadow-sm">
                                    {informationProcessing ? 'Saving...' : 'Save Information'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}