import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FileText, Plus, Search, Trash2, Pencil, BookOpen, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps } from '@/Types';

interface ItemProp {
    id: string;
    title: string;
    type: string;
    content: string;
    is_active: boolean;
    subtitle: string;
    role: string;
    phone: string;
    address: string;
}

export default function Index({ items = [] }: { items: ItemProp[] }) {
    const { auth } = usePage<PageProps & { auth: { user: any } }>().props;
    const canModify = auth.user?.can_modify_system ?? true;

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
        is_active: true,
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
        if (confirm('Are you sure you want to permanently remove this asset from the registry?')) {
            router.delete(`/admin/library/${id}`);
        }
    };

    return (
        <AdminLayout title="Barangay Resource Library">
            <Head title="Resource Library" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        Resource Library Registry
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                        Deploy emergency handbooks, evacuation shelter locations, and active hotlines visible to citizens.
                    </p>
                </div>
                {canModify && (
                    <Button onClick={() => setShowModal(true)} className="bg-blue-700 hover:bg-blue-800 shrink-0 font-bold text-xs shadow-sm cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" /> Add Directory Asset
                    </Button>
                )}
            </div>

            <div className="mb-5 relative max-w-sm">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    className="pl-9 bg-white text-xs h-10 border-slate-200 shadow-2xs"
                    placeholder="Search library registry..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                            <p className="text-sm font-bold text-slate-700">No directory matrices match search parameters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3.5">Resource Element</th>
                                        <th className="px-4 py-3.5">Classification Tag</th>
                                        <th className="px-4 py-3.5">Context / Assignment</th>
                                        <th className="px-4 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                                                {item.type === 'manual' && <div className="text-xs text-muted-foreground font-medium">{item.subtitle}</div>}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700 border border-blue-100 uppercase">
                                                    {item.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate font-medium">
                                                {(item.type === 'manual' || item.type === 'faq') && item.content}
                                                {item.type === 'evacuation_center' && item.address}
                                                {(item.type === 'contact' || item.type === 'emergency') && `${item.role} · ${item.phone}`}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <span className={`mr-3 text-xs font-bold ${item.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                    {item.is_active ? '● Published' : '○ Inactive'}
                                                </span>
                                                {canModify && (
                                                    <div className="inline-flex items-center justify-end gap-1.5">
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer shadow-2xs"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/library/${item.id}/edit`}>
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </Button>

                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer shadow-2xs"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-slate-200">
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <h3 className="text-base font-extrabold text-slate-900">Create Directory Element</h3>
                            <button onClick={() => setShowModal(false)} className="rounded-full p-1.5 hover:bg-slate-100 cursor-pointer">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Asset Classification Type</label>
                                <select 
                                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                    value={data.type}
                                    onChange={e => { reset(); setData('type', e.target.value); }}
                                >
                                    <option value="faq">FAQ / Chatbot Answer</option>
                                    <option value="manual">Preparedness Manual / Guide Text</option>
                                    <option value="emergency">Emergency Hotlines (Red Tag Alert)</option>
                                    <option value="contact">General Barangay Official Contact</option>
                                    <option value="evacuation_center">Evacuation Center / Facility Info</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Title Name</label>
                                <Input required placeholder="e.g., Typhoon Alert Manual, Barangay Main Clinic" value={data.title} onChange={e => setData('title', e.target.value)} />
                                {errors.title && <span className="text-xs font-medium text-red-600 mt-1 block">{errors.title}</span>}
                            </div>

                            {(data.type === 'manual' || data.type === 'faq') && (
                                <>
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Topic Subtitle Group</label>
                                        <Input placeholder="e.g., Typhoon Preparedness Guide" value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">{data.type === 'faq' ? 'Official Answer' : 'Handbook Content'}</label>
                                        <textarea required rows={4} className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-white p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 resize-y" placeholder={data.type === 'faq' ? 'Write the verified barangay answer here...' : 'Write localized instructions here...'} value={data.content} onChange={e => setData('content', e.target.value)} />
                                        {errors.content && <span className="text-xs font-medium text-red-600 mt-1 block">{errors.content}</span>}
                                    </div>
                                </>
                            )}

                            {data.type === 'evacuation_center' && (
                                <div>
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Shelter Physical Address</label>
                                    <Input required placeholder="e.g., Barangay Covered Court Complex" value={data.address} onChange={e => setData('address', e.target.value)} />
                                </div>
                            )}

                            {(data.type === 'contact' || data.type === 'emergency') && (
                                <>
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Assigned Role/Department</label>
                                        <Input required placeholder="e.g., BHERT Team Leader, Desk Officer" value={data.role} onChange={e => setData('role', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Active Contact Telephone/Mobile</label>
                                        <Input required placeholder="e.g., +63 912 3456 789" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button type="button" variant="outline" className="cursor-pointer font-bold text-xs" onClick={() => { setShowModal(false); reset(); }}>Cancel</Button>
                                <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-800 font-bold text-xs cursor-pointer shadow-sm">Upload Directory Item</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}