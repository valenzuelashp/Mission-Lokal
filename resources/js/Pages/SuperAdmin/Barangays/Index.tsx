import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, Plus, Users, FileText, Eye, EyeOff, AlertCircle, Edit2, Phone, Mail, Shield } from 'lucide-react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

export default function SuperAdminBarangays({ barangays = [] }: { barangays: any[] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingBarangay, setEditingBarangay] = useState<any | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const createForm = useForm({
        barangay_name: '',
        house_street: '',
        city: '',
        province: '',
        contact_phone: '',
        contact_email: '',
        admin_first_name: '',
        admin_last_name: '',
        admin_email: '',
        admin_password: '',
    });

    const editForm = useForm({
        name: '',
        house_street: '',
        city: '',
        province: '',
        contact_phone: '',
        contact_email: '',
        is_active: true,
        admin_first_name: '',
        admin_last_name: '',
        admin_email: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/super-admin/barangays', {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setShowCreateModal(false);
            },
        });
    };

    const openEditModal = (b: any) => {
        setEditingBarangay(b);
        
        let adminFirst = '';
        let adminLast = '';
        if (b.primary_admin?.name) {
            const parts = b.primary_admin.name.trim().split(' ');
            adminFirst = parts[0] || '';
            adminLast = parts.slice(1).join(' ') || '';
        }

        editForm.setData({
            name: b.name || '',
            house_street: b.house_street || '',
            city: b.city || '',
            province: b.province || '',
            contact_phone: b.contact_phone === 'N/A' ? '' : (b.contact_phone || ''),
            contact_email: b.contact_email === 'N/A' ? '' : (b.contact_email || ''),
            is_active: Boolean(b.is_active),
            admin_first_name: adminFirst,
            admin_last_name: adminLast,
            admin_email: b.primary_admin?.email || '',
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBarangay) return;

        editForm.put(`/super-admin/barangays/${editingBarangay.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingBarangay(null);
            },
        });
    };

    return (
        <SuperAdminLayout title="Barangay Nodes Management">
            <Head title="Barangay Nodes" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Global Barangay Nodes</h2>
                    <p className="text-sm text-muted-foreground">Manage multi-tenant barangay containers and provision primary administrators.</p>
                </div>
                <Button onClick={() => { createForm.reset(); setShowCreateModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Provision New Barangay
                </Button>
            </div>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-lg font-bold text-slate-900">Provision New Barangay & Primary Admin</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>✕</Button>
                        </div>

                        {Object.keys(createForm.errors).length > 0 && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold block">Please fix the following errors:</span>
                                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                        {Object.values(createForm.errors).map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase">Barangay Name *</label>
                                <Input placeholder="e.g. Barangay 36" value={createForm.data.barangay_name} onChange={e => createForm.setData('barangay_name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase">House / Street / Compound *</label>
                                <Input placeholder="Barangay Hall Compound" value={createForm.data.house_street} onChange={e => createForm.setData('house_street', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold uppercase">City / Municipality *</label>
                                    <Input placeholder="e.g. Parañaque" value={createForm.data.city} onChange={e => createForm.setData('city', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase">Province *</label>
                                    <Input placeholder="e.g. Metro Manila" value={createForm.data.province} onChange={e => createForm.setData('province', e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold uppercase">Contact Phone</label>
                                    <Input placeholder="09171234567" value={createForm.data.contact_phone} onChange={e => createForm.setData('contact_phone', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase">Contact Email</label>
                                    <Input type="email" placeholder="brgy@demo.local" value={createForm.data.contact_email} onChange={e => createForm.setData('contact_email', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                <div>
                                    <label className="text-xs font-semibold uppercase">Admin First Name *</label>
                                    <Input value={createForm.data.admin_first_name} onChange={e => createForm.setData('admin_first_name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase">Admin Last Name *</label>
                                    <Input value={createForm.data.admin_last_name} onChange={e => createForm.setData('admin_last_name', e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase">Admin Email *</label>
                                <Input type="email" value={createForm.data.admin_email} onChange={e => createForm.setData('admin_email', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase">Initial Temporary Password *</label>
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? 'text' : 'password'} 
                                        value={createForm.data.admin_password} 
                                        onChange={e => createForm.setData('admin_password', e.target.value)} 
                                        required 
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={createForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {createForm.processing ? 'Provisioning...' : 'Provision Node'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingBarangay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-lg font-bold text-slate-900">Edit Barangay Node: {editingBarangay.name}</h3>
                            <Button variant="ghost" size="sm" onClick={() => setEditingBarangay(null)}>✕</Button>
                        </div>

                        {Object.keys(editForm.errors).length > 0 && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold block">Please fix the following errors:</span>
                                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                        {Object.values(editForm.errors).map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase">Barangay Name *</label>
                                <Input value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase">House / Street / Compound *</label>
                                <Input value={editForm.data.house_street} onChange={e => editForm.setData('house_street', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold uppercase">City / Municipality *</label>
                                    <Input value={editForm.data.city} onChange={e => editForm.setData('city', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase">Province *</label>
                                    <Input value={editForm.data.province} onChange={e => editForm.setData('province', e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold uppercase">Contact Phone</label>
                                    <Input value={editForm.data.contact_phone} onChange={e => editForm.setData('contact_phone', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase">Contact Email</label>
                                    <Input type="email" value={editForm.data.contact_email} onChange={e => editForm.setData('contact_email', e.target.value)} />
                                </div>
                            </div>

                            <div className="pt-2 border-t space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    <Shield className="h-3.5 w-3.5 text-blue-600" /> Primary Administrator Details
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold uppercase">Admin First Name *</label>
                                        <Input value={editForm.data.admin_first_name} onChange={e => editForm.setData('admin_first_name', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold uppercase">Admin Last Name *</label>
                                        <Input value={editForm.data.admin_last_name} onChange={e => editForm.setData('admin_last_name', e.target.value)} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase">Admin Email *</label>
                                    <Input type="email" value={editForm.data.admin_email} onChange={e => editForm.setData('admin_email', e.target.value)} required />
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <label className="text-xs font-semibold uppercase">Operational Status</label>
                                <select 
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm mt-1"
                                    value={editForm.data.is_active ? '1' : '0'}
                                    onChange={e => editForm.setData('is_active', e.target.value === '1')}
                                >
                                    <option value="1">Active Node</option>
                                    <option value="0">Inactive / Suspended</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button type="button" variant="outline" onClick={() => setEditingBarangay(null)}>Cancel</Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* BRGY CARDS GRID */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {barangays.map((b) => (
                    <div key={b.id} className="rounded-xl border bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900">{b.name}</h3>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${b.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                {b.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-xs font-mono text-muted-foreground">{b.code}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => openEditModal(b)} className="text-slate-500 hover:text-blue-600">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <p className="text-xs text-slate-600">
                                {[b.house_street, b.city, b.province].filter(Boolean).join(', ') || 'Address not specified'}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {b.contact_phone}</span>
                                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {b.contact_email}</span>
                            </div>

                            <div className="rounded-lg bg-slate-50 p-3 border text-xs space-y-1">
                                <span className="font-semibold text-gray-700 block mb-1">Primary Administrator:</span>
                                {b.primary_admin ? (
                                    <>
                                        <p className="font-medium text-gray-900">{b.primary_admin.name} <span className="font-mono text-[10px] text-blue-600">({b.primary_admin.account_id})</span></p>
                                        <p className="font-mono text-muted-foreground">{b.primary_admin.email}</p>
                                    </>
                                ) : (
                                    <p className="text-red-600 font-medium">No primary admin assigned</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {b.users_count} Users</span>
                            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {b.concerns_count} Reports</span>
                            <span>Added: {b.created_at}</span>
                        </div>
                    </div>
                ))}
            </div>
        </SuperAdminLayout>
    );
}