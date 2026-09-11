import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Trash2, UserCheck, UserPlus, X, AlertCircle } from 'lucide-react';
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
    });

    // Automatically update password format whenever account_id or last_name changes
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

    return (
        <AdminLayout title="Mission-Lokal Admin: Barangay Personnel">
            <Head title="Barangay Personnel" />

            {flash.success && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {flash.success}
                </div>
            )}

            <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Barangay Personnel Roster</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage personnel accounts, credentials, and field deployment availability.
                    </p>
                </div>
                <Button size="sm" className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto" onClick={openModal}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Personnel
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Account ID</th>
                                    <th className="px-4 py-3">Full Name</th>
                                    <th className="px-4 py-3">Birthday</th>
                                    <th className="px-4 py-3">Contact Info</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {personnel.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            No personnel accounts created yet. Click "Add Personnel" to register staff.
                                        </td>
                                    </tr>
                                ) : (
                                    personnel.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{p.account_id}</td>
                                            <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                                            <td className="px-4 py-3 text-slate-600">{p.birthday ?? 'N/A'}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                <div>{p.mobile || 'No mobile'}</div>
                                                <div className="text-xs text-muted-foreground">{p.email || 'No email'}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                                    <UserCheck className="h-3 w-3" /> Active
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleDelete(p.id, p.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-blue-900">Add New Personnel Account</h3>
                            <button onClick={closeModal} className="rounded-full p-1 hover:bg-slate-100">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={submitPersonnel} className="space-y-4">
                            <div>
                                <Label htmlFor="account_id">Account ID / Username</Label>
                                <Input
                                    id="account_id"
                                    value={data.account_id}
                                    readOnly
                                    className="bg-slate-100 text-slate-600 font-medium cursor-not-allowed focus-visible:ring-0 focus-visible:ring-offset-0 border-slate-200"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">Auto-generated incremental ID.</p>
                                {errors.account_id && <p className="mt-1 text-xs text-red-600">{errors.account_id}</p>}
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
                                    {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="middle_name">Middle Name (Optional)</Label>
                                    <Input
                                        id="middle_name"
                                        placeholder="Santos"
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                    />
                                    {errors.middle_name && <p className="mt-1 text-xs text-red-600">{errors.middle_name}</p>}
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
                                    {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="name_extension">Extension (Optional)</Label>
                                    <Input
                                        id="name_extension"
                                        placeholder="Jr., III"
                                        value={data.name_extension}
                                        onChange={(e) => setData('name_extension', e.target.value)}
                                    />
                                    {errors.name_extension && <p className="mt-1 text-xs text-red-600">{errors.name_extension}</p>}
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
                                    {errors.birthday && <p className="mt-1 text-xs text-red-600">{errors.birthday}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="mobile">Mobile Number</Label>
                                    <Input
                                        id="mobile"
                                        placeholder="09123456789"
                                        value={data.mobile}
                                        onChange={(e) => setData('mobile', e.target.value)}
                                    />
                                    {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
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
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <Label htmlFor="password">Temporary Password</Label>
                                <Input
                                    id="password"
                                    type="text"
                                    value={data.password}
                                    readOnly
                                    className="bg-slate-100 text-slate-600 font-medium cursor-not-allowed focus-visible:ring-0 focus-visible:ring-offset-0 border-slate-200"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">Auto-generated password based on Account ID and Last Name.</p>
                                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-800">
                                    {processing ? 'Saving...' : 'Create Personnel Account'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}