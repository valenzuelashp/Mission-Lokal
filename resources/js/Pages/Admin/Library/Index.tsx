import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { FileText, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';

interface ItemProp {
    id: string;
    title: string;
    type: string;
    content: string;
    subtitle: string;
    role: string;
    phone: string;
    address: string;
}

export default function Index({ items = [] }: { items: ItemProp[] }) {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        type: 'manual', 
        content: '',
        subtitle: '',
        role: '',
        phone: '',
        address: '',
    });

    const filtered = items.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/library', {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to permanently remove this asset?')) {
            router.delete(`/admin/library/${id}`);
        }
    };

    return (
        <AdminLayout title="Barangay Resource Library">
            <Head title="Resource Library" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-blue-900">Resource Library</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Deploy emergency handbooks, evacuation shelter locations, and active hotlines visible to citizens.
                    </p>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-blue-700 hover:bg-blue-800 shrink-0">
                    <Plus className="mr-2 h-4 w-4" /> Add Directory Asset
                </Button>
            </div>

            <div className="mb-4 relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder="Search library registry..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Card className="shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <FileText className="mx-auto mb-3 h-10 w-10 opacity-30" />
                            <p className="text-sm font-medium">No directory matrices match search parameters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                                    <tr>
                                        <th className="p-4">Resource Element</th>
                                        <th className="p-4">Classification Tag</th>
                                        <th className="p-4">Context / Assignment</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-900">{item.title}</div>
                                                {item.type === 'manual' && <div className="text-xs text-muted-foreground">{item.subtitle}</div>}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 uppercase">
                                                    {item.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-600 max-w-xs truncate">
                                                {item.type === 'manual' && item.content}
                                                {item.type === 'evacuation_center' && item.address}
                                                {(item.type === 'contact' || item.type === 'emergency') && `${item.role} · ${item.phone}`}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button 
                                                    variant="outline" 
                                                    size="icon" 
                                                    className="h-8 w-8 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* DYNAMIC FORM INTAKE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto border animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Create Directory Element</h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Asset Classification Type</label>
                                <select 
                                    className="w-full text-sm rounded-md border border-input bg-background p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={data.type}
                                    onChange={e => { reset(); setData('type', e.target.value); }}
                                >
                                    <option value="manual">Preparedness Manual / Guide Text</option>
                                    <option value="emergency">Emergency Hotlines (Red Tag Alert)</option>
                                    <option value="contact">General Barangay Official Contact</option>
                                    <option value="evacuation_center">Evacuation Center / Facility Info</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title Name</label>
                                <Input required placeholder="e.g., Typhoon Alert Manual, Barangay Main Clinic" value={data.title} onChange={e => setData('title', e.target.value)} />
                                {errors.title && <span className="text-xs text-red-600 mt-1 block">{errors.title}</span>}
                            </div>

                            {data.type === 'manual' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Topic Subtitle Group</label>
                                        <Input placeholder="e.g., Typhoon Preparedness Guide" value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Handbook Content</label>
                                        <textarea required rows={4} className="w-full text-sm rounded-md border border-input bg-background p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Write localized instructions here..." value={data.content} onChange={e => setData('content', e.target.value)} />
                                        {errors.content && <span className="text-xs text-red-600 mt-1 block">{errors.content}</span>}
                                    </div>
                                </>
                            )}

                            {data.type === 'evacuation_center' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shelter Physical Address</label>
                                    <Input required placeholder="e.g., Barangay Covered Court Complex" value={data.address} onChange={e => setData('address', e.target.value)} />
                                </div>
                            )}

                            {(data.type === 'contact' || data.type === 'emergency') && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Role/Department</label>
                                        <Input required placeholder="e.g., BHERT Team Leader, Desk Officer" value={data.role} onChange={e => setData('role', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Active Contact Telephone/Mobile</label>
                                        <Input required placeholder="e.g., +63 912 3456 789" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button type="button" variant="outline" onClick={() => { setShowModal(false); reset(); }}>Cancel</Button>
                                <Button type="submit" disabled={processing} className="bg-blue-700 text-white">Upload Directory Item</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}