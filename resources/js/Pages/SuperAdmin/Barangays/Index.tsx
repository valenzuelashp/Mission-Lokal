import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Building2, Plus, Users, FileText, Edit2, UserPlus, CheckCircle2, Copy, Shield, User, BarChart3 } from 'lucide-react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

export default function SuperAdminBarangays({ barangays = [] }: { barangays: any[] }) {
    const { flash } = usePage().props as any;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewOnlyModal, setShowViewOnlyModal] = useState(false);
    const [editingBarangay, setEditingBarangay] = useState<any | null>(null);
    const [selectedBarangayForViewOnly, setSelectedBarangayForViewOnly] = useState<any | null>(null);
    const [generatedCredentials, setGeneratedCredentials] = useState<any | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (flash?.new_view_only_credentials) {
            setGeneratedCredentials(flash.new_view_only_credentials);
        }
    }, [flash]);

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
    });

    const viewOnlyForm = useForm({
        barangay_id: '',
        first_name: '',
        last_name: '',
        email: '',
    });

    const editForm = useForm({
        name: '',
        code: '',
        house_street: '',
        city: '',
        province: '',
        contact_phone: '',
        contact_email: '',
        is_active: true,
        primary_admin_first_name: '',
        primary_admin_last_name: '',
        primary_admin_email: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/super-admin/barangays', {
            preserveScroll: true,
            onSuccess: (page: any) => {
                createForm.reset();
                setShowCreateModal(false);
                const incomingFlash = page.props?.flash as any;
                if (incomingFlash?.new_view_only_credentials) {
                    setGeneratedCredentials(incomingFlash.new_view_only_credentials);
                }
            },
        });
    };

    const handleViewOnlyCreate = (e: React.FormEvent) => {
        e.preventDefault();
        viewOnlyForm.post('/super-admin/barangays/view-only-admin', {
            preserveScroll: true,
            onSuccess: (page: any) => {
                viewOnlyForm.reset();
                setShowViewOnlyModal(false);
                setSelectedBarangayForViewOnly(null);
                const incomingFlash = page.props?.flash as any;
                if (incomingFlash?.new_view_only_credentials) {
                    setGeneratedCredentials(incomingFlash.new_view_only_credentials);
                }
            },
        });
    };

    const openViewOnlyModal = (b: any) => {
        setSelectedBarangayForViewOnly(b);
        viewOnlyForm.setData({
            barangay_id: b.id,
            first_name: '',
            last_name: '',
            email: '',
        });
        setShowViewOnlyModal(true);
    };

    const openEditModal = (b: any) => {
        setEditingBarangay(b);
        
        editForm.setData({
            name: b.name || '',
            code: b.code || '',
            house_street: b.house_street === 'N/A' ? '' : (b.house_street || ''),
            city: b.city || '',
            province: b.province || '',
            contact_phone: b.contact_phone === 'N/A' ? '' : (b.contact_phone || ''),
            contact_email: b.contact_email === 'N/A' ? '' : (b.contact_email || ''),
            is_active: Boolean(b.is_active),
            primary_admin_first_name: b.primary_admin?.first_name || '',
            primary_admin_last_name: b.primary_admin?.last_name || '',
            primary_admin_email: b.primary_admin?.email || '',
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const calculatePreviewCode = (cityInput: string, brgyInput: string) => {
        if (!cityInput) return 'CODE';
        const cleanCity = cityInput.replace(/(CITY|MUNICIPALITY|PROVINCE)/gi, '').trim().toUpperCase();
        const lettersOnly = cleanCity.replace(/[^A-Z]/g, '');
        const noVowels = lettersOnly.replace(/[AEIOU]/g, '');
        const cityCode = noVowels.substring(0, 4);

        let brgyCode = 'BRGY';
        const brgyTrim = brgyInput.trim();
        const match = brgyTrim.match(/(\d+)/);
        if (match) {
            brgyCode = 'B' + match[1];
        } else if (brgyTrim) {
            const noPrefix = brgyTrim.replace(/^(barangay|brgy)\.?\s*/i, '');
            const cleanAlpha = noPrefix.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            brgyCode = cleanAlpha.substring(0, 6) || 'BRGY';
        }
        return `${cityCode || 'CODE'}-${brgyCode}`;
    };

    const previewNewBarangayCode = calculatePreviewCode(createForm.data.city, createForm.data.barangay_name);
    const previewNewAdminPassword = createForm.data.admin_last_name
        ? `${previewNewBarangayCode}!${createForm.data.admin_last_name.trim()}`
        : `${previewNewBarangayCode}!Lastname`;

    const previewViewOnlyPassword = selectedBarangayForViewOnly && viewOnlyForm.data.last_name
        ? `${selectedBarangayForViewOnly.code}!${viewOnlyForm.data.last_name.trim()}`
        : selectedBarangayForViewOnly ? `${selectedBarangayForViewOnly.code}!Lastname` : 'BarangayCode!Lastname';

    return (
        <SuperAdminLayout title="Barangay Nodes Management">
            <Head title="Barangay Nodes" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Global Barangay Nodes</h2>
                    <p className="text-sm text-muted-foreground">Manage multi-tenant barangay containers and provision primary or view-only administrators.</p>
                </div>
                <Button onClick={() => { createForm.reset(); setShowCreateModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Provision New Barangay
                </Button>
            </div>

            {/* SUCCESS CREDENTIALS POPUP MODAL */}
            {generatedCredentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border space-y-4">
                        <div className="flex items-center gap-3 text-emerald-600 border-b pb-3">
                            <CheckCircle2 className="h-6 w-6 shrink-0" />
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{generatedCredentials.title || 'Credentials Created!'}</h3>
                                <p className="text-xs text-muted-foreground">Sent via Gmail and displayed below securely.</p>
                            </div>
                        </div>

                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border text-sm">
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">Official Name</span>
                                <p className="font-semibold text-slate-900">{generatedCredentials.name}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">Login Account ID (User ID)</span>
                                <p className="font-mono font-bold text-blue-600 bg-white p-2 rounded border select-all">{generatedCredentials.account_id}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">Email</span>
                                <p className="font-mono text-slate-800">{generatedCredentials.email}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">Auto-Generated Password</span>
                                <p className="font-mono font-bold text-emerald-700 bg-white p-2 rounded border select-all">{generatedCredentials.password}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button 
                                type="button" 
                                onClick={() => copyToClipboard(`Account ID: ${generatedCredentials.account_id}\nEmail: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`)}
                                className="bg-slate-800 hover:bg-slate-900 text-white"
                            >
                                <Copy className="mr-2 h-4 w-4" /> {copied ? 'Copied!' : 'Copy Credentials'}
                            </Button>
                            <Button type="button" onClick={() => setGeneratedCredentials(null)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-lg font-bold text-slate-900">Provision New Barangay & Primary Admin</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>✕</Button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase">Barangay Name *</label>
                                <Input placeholder="e.g. Barangay Tambo or Barangay 36" value={createForm.data.barangay_name} onChange={e => createForm.setData('barangay_name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase">House / Street / Compound *</label>
                                <Input placeholder="Barangay Hall Compound" value={createForm.data.house_street} onChange={e => createForm.setData('house_street', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold uppercase">City / Municipality *</label>
                                    <Input placeholder="e.g. Caloocan City" value={createForm.data.city} onChange={e => createForm.setData('city', e.target.value)} required />
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
                                <label className="text-xs font-semibold uppercase">Admin Email (For Gmail Notification) *</label>
                                <Input type="email" value={createForm.data.admin_email} onChange={e => createForm.setData('admin_email', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase">Auto-Generated Password Preview</label>
                                <Input type="text" value={previewNewAdminPassword} disabled className="bg-slate-100 font-mono text-slate-700 cursor-not-allowed" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={createForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {createForm.processing ? 'Provisioning & Emailing...' : 'Provision Node & Email'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW-ONLY ACCOUNT CREATION MODAL */}
            {showViewOnlyModal && selectedBarangayForViewOnly && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Create View-Only Account</h3>
                                <p className="text-xs text-muted-foreground">For Barangay: <span className="font-semibold text-slate-800">{selectedBarangayForViewOnly.name}</span></p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setShowViewOnlyModal(false)}>✕</Button>
                        </div>

                        <form onSubmit={handleViewOnlyCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold uppercase">First Name *</label>
                                    <Input value={viewOnlyForm.data.first_name} onChange={e => viewOnlyForm.setData('first_name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase">Last Name *</label>
                                    <Input value={viewOnlyForm.data.last_name} onChange={e => viewOnlyForm.setData('last_name', e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase">Official Email (For Gmail Notification) *</label>
                                <Input type="email" placeholder="official@barangay.gov.ph" value={viewOnlyForm.data.email} onChange={e => viewOnlyForm.setData('email', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase">Auto-Generated Password Preview</label>
                                <Input type="text" value={previewViewOnlyPassword} disabled className="bg-slate-100 font-mono text-slate-700 cursor-not-allowed" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button type="button" variant="outline" onClick={() => setShowViewOnlyModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={viewOnlyForm.processing} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {viewOnlyForm.processing ? 'Creating & Emailing...' : 'Create & Email Account'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* COMPREHENSIVE EDIT MODAL */}
            {editingBarangay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" /> Edit Barangay Node: {editingBarangay.name}
                                </h3>
                                <p className="text-xs text-muted-foreground font-mono mt-0.5">Node ID: {editingBarangay.id}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setEditingBarangay(null)}>✕</Button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            
                            {/* Section 1: Tenant Node Properties */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5 border-b pb-1">
                                    <Building2 className="h-3.5 w-3.5" /> Physical & System Properties
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold uppercase">Barangay Name *</label>
                                        <Input value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold uppercase">System Code *</label>
                                        <Input value={editForm.data.code} onChange={e => editForm.setData('code', e.target.value)} required className="font-mono" />
                                    </div>
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
                                <div>
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
                            </div>

                            {/* Section 2: Primary Administrator Details */}
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 border-b pb-1">
                                    <Shield className="h-3.5 w-3.5" /> Primary Administrator Account
                                </h4>
                                {editingBarangay.primary_admin ? (
                                    <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-slate-700">First Name *</label>
                                            <Input value={editForm.data.primary_admin_first_name} onChange={e => editForm.setData('primary_admin_first_name', e.target.value)} required className="bg-white" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-slate-700">Last Name *</label>
                                            <Input value={editForm.data.primary_admin_last_name} onChange={e => editForm.setData('primary_admin_last_name', e.target.value)} required className="bg-white" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-semibold uppercase text-slate-700">Official Email *</label>
                                            <Input type="email" value={editForm.data.primary_admin_email} onChange={e => editForm.setData('primary_admin_email', e.target.value)} required className="bg-white font-mono text-xs" />
                                            <p className="text-[10px] text-muted-foreground mt-1 font-mono">Account ID: {editingBarangay.primary_admin.account_id}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-red-600 font-medium">No primary administrator assigned to this node.</p>
                                )}
                            </div>

                            {/* Section 3: View-Only Accounts Overview */}
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5 border-b pb-1">
                                    <User className="h-3.5 w-3.5" /> View-Only Monitoring Accounts ({editingBarangay.view_only_admins?.length || 0})
                                </h4>
                                {editingBarangay.view_only_admins && editingBarangay.view_only_admins.length > 0 ? (
                                    <div className="space-y-2">
                                        {editingBarangay.view_only_admins.map((va: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/30 border border-indigo-100 text-xs">
                                                <div>
                                                    <p className="font-bold text-slate-900">{va.name} <span className="font-mono text-[10px] text-indigo-600 ml-1">({va.account_id})</span></p>
                                                    <p className="font-mono text-slate-500">{va.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 italic">No view-only accounts created for this node yet.</p>
                                )}
                            </div>

                            {/* Section 4: Live Node Analytics Summary */}
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-1">
                                    <BarChart3 className="h-3.5 w-3.5" /> Live Node Telemetry
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border">
                                    <div>
                                        <span className="text-muted-foreground block">Registered Users:</span>
                                        <strong className="text-slate-900 text-sm">{editingBarangay.users_count} total</strong>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Submitted Reports:</span>
                                        <strong className="text-slate-900 text-sm">{editingBarangay.concerns_count} total</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setEditingBarangay(null)}>Cancel</Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                                    {editForm.processing ? 'Saving Changes...' : 'Save Comprehensive Node Details'}
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
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => openViewOnlyModal(b)} title="Create View-Only Account" className="text-indigo-600 hover:bg-indigo-50">
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => openEditModal(b)} title="Edit Node Details" className="text-slate-500 hover:text-blue-600">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600">
                                {[b.house_street, b.city, b.province].filter(Boolean).join(', ') || 'Address not specified'}
                            </p>

                            <div className="rounded-lg bg-slate-50 p-3 border text-xs space-y-2">
                                <div>
                                    <span className="font-semibold text-gray-700 block">Primary Administrator:</span>
                                    {b.primary_admin ? (
                                        <>
                                            <p className="font-medium text-gray-900">{b.primary_admin.name} <span className="font-mono text-[10px] text-blue-600">({b.primary_admin.account_id})</span></p>
                                            <p className="font-mono text-muted-foreground">{b.primary_admin.email}</p>
                                        </>
                                    ) : (
                                        <p className="text-red-600 font-medium">No primary admin assigned</p>
                                    )}
                                </div>

                                {b.view_only_admins && b.view_only_admins.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <span className="font-semibold text-indigo-700 block">View-Only Accounts ({b.view_only_admins.length}):</span>
                                        {b.view_only_admins.map((va: any, idx: number) => (
                                            <div key={idx} className="mt-1 text-slate-700">
                                                <p className="font-medium">{va.name} <span className="font-mono text-[10px] text-indigo-600">({va.account_id})</span></p>
                                                <p className="font-mono text-muted-foreground">{va.email}</p>
                                            </div>
                                        ))}
                                    </div>
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