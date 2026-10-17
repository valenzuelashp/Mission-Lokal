import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FileText, Plus, Search, Trash2, Pencil, BookOpen, X, Sparkles } from 'lucide-react';
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

            <div className="w-full space-y-8 pb-16">
                
                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <Sparkles className="h-3 w-3" /> Barangay Repository
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                            <BookOpen className="h-7 w-7 text-blue-600" /> Resource Library Registry
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Deploy emergency handbooks, evacuation shelter locations, and active hotlines visible to citizens.
                        </p>
                    </div>

                    {canModify && (
                        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-5 shadow-sm cursor-pointer rounded-2xl shrink-0">
                            <Plus className="mr-2 h-4 w-4" /> Add Directory Asset
                        </Button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        className="pl-10 bg-white text-xs h-11 border-slate-200 focus:bg-white transition-colors rounded-xl shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
                        placeholder="Search library registry by title or classification..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Main Data Table Section */}
                <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-0">
                        {filtered.length === 0 ? (
                            <div className="py-20 text-center space-y-3">
                                <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <FileText className="h-6 w-6 text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">No directory matrices match search parameters.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-black uppercase tracking-wider text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4">Resource Element</th>
                                            <th className="px-5 py-4">Classification Tag</th>
                                            <th className="px-5 py-4">Context / Assignment</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filtered.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-extrabold text-slate-900 text-xs">{item.title}</div>
                                                    {item.type === 'manual' && <div className="text-xs text-slate-400 font-medium mt-0.5">{item.subtitle}</div>}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center rounded-xl bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 border border-blue-100 uppercase tracking-wide">
                                                        {item.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-xs text-slate-600 max-w-xs truncate font-medium">
                                                    {(item.type === 'manual' || item.type === 'faq') && item.content}
                                                    {item.type === 'evacuation_center' && item.address}
                                                    {(item.type === 'contact' || item.type === 'emergency') && `${item.role} · ${item.phone}`}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-3">
                                                        <span className={`text-xs font-extrabold ${item.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                            {item.is_active ? '● Published' : '○ Inactive'}
                                                        </span>
                                                        {canModify && (
                                                            <div className="inline-flex items-center gap-2">
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="icon" 
                                                                    className="h-9 w-9 text-blue-700 border-slate-200 hover:bg-blue-50 cursor-pointer shadow-2xs rounded-xl"
                                                                    asChild
                                                                >
                                                                    <Link href={`/admin/library/${item.id}/edit`}>
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>

                                                                <Button 
                                                                    variant="outline" 
                                                                    size="icon" 
                                                                    className="h-9 w-9 text-rose-600 border-slate-200 hover:bg-rose-50 cursor-pointer shadow-2xs rounded-xl"
                                                                    onClick={() => handleDelete(item.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
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
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                        Asset Intake
                                    </span>
                                    <h3 className="text-lg font-black text-slate-900 mt-1">Create Directory Element</h3>
                                </div>
                                <button onClick={() => setShowModal(false)} className="rounded-full p-2 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:text-slate-700">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Asset Classification Type</label>
                                    <select 
                                        className="w-full text-xs font-bold rounded-2xl border border-slate-200 bg-white px-3.5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer shadow-2xs"
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

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Title Name</label>
                                    <Input required placeholder="e.g., Typhoon Alert Manual, Barangay Main Clinic" value={data.title} onChange={e => setData('title', e.target.value)} className="rounded-xl h-11 text-xs" />
                                    {errors.title && <span className="text-xs font-semibold text-red-600 mt-1 block">{errors.title}</span>}
                                </div>

                                {(data.type === 'manual' || data.type === 'faq') && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Topic Subtitle Group</label>
                                            <Input placeholder="e.g., Typhoon Preparedness Guide" value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} className="rounded-xl h-11 text-xs" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">{data.type === 'faq' ? 'Official Answer' : 'Handbook Content'}</label>
                                            <textarea required rows={5} className="w-full text-xs font-medium rounded-2xl border border-slate-200 bg-white p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 resize-y shadow-2xs" placeholder={data.type === 'faq' ? 'Write the verified barangay answer here...' : 'Write localized instructions here...'} value={data.content} onChange={e => setData('content', e.target.value)} />
                                            {errors.content && <span className="text-xs font-semibold text-red-600 mt-1 block">{errors.content}</span>}
                                        </div>
                                    </>
                                )}

                                {data.type === 'evacuation_center' && (
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Shelter Physical Address</label>
                                        <Input required placeholder="e.g., Barangay Covered Court Complex" value={data.address} onChange={e => setData('address', e.target.value)} className="rounded-xl h-11 text-xs" />
                                    </div>
                                )}

                                {(data.type === 'contact' || data.type === 'emergency') && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Assigned Role/Department</label>
                                            <Input required placeholder="e.g., BHERT Team Leader, Desk Officer" value={data.role} onChange={e => setData('role', e.target.value)} className="rounded-xl h-11 text-xs" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Active Contact Telephone/Mobile</label>
                                            <Input required placeholder="e.g., +63 912 3456 789" value={data.phone} onChange={e => setData('phone', e.target.value)} className="rounded-xl h-11 text-xs" />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Button type="button" variant="outline" className="cursor-pointer font-bold text-xs rounded-xl h-10 px-4" onClick={() => { setShowModal(false); reset(); }}>Cancel</Button>
                                    <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs cursor-pointer shadow-sm rounded-xl h-10 px-5">Upload Directory Item</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}