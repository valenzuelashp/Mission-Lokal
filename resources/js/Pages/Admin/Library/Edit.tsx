import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';

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

export default function Edit({ item }: { item: ItemProp }) {
    const { data, setData, put, processing, errors } = useForm({
        title: item.title ?? '',
        type: item.type ?? 'manual',
        content: item.content ?? '',
        subtitle: item.subtitle ?? '',
        role: item.role ?? '',
        phone: item.phone ?? '',
        address: item.address ?? '',
        is_active: item.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/library/${item.id}`);
    };

    return (
        <AdminLayout title="Edit Library Asset">
            <Head title={`Edit: ${item.title}`} />

            <div className="w-full space-y-8 pb-16">
                
                {/* Top Back Navigation Bar */}
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                    <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-all rounded-xl" asChild>
                        <Link href="/admin/library" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4 text-slate-500" /> Back to Resource Library
                        </Link>
                    </Button>
                </div>

                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <Sparkles className="h-3 w-3" /> Asset Management
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                            <BookOpen className="h-7 w-7 text-blue-600" /> Modify Resource Asset
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Update classification types, content text, hotlines, or evacuation facilities.
                        </p>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Asset Classification Type</label>
                            <select 
                                className="w-full text-xs font-bold rounded-2xl border border-slate-200 bg-white px-3.5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer shadow-2xs"
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
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
                            <Input required value={data.title} onChange={e => setData('title', e.target.value)} className="rounded-xl h-11 text-xs" />
                            {errors.title && <span className="text-xs font-semibold text-red-600 mt-1 block">{errors.title}</span>}
                        </div>

                        {(data.type === 'manual' || data.type === 'faq') && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Topic Subtitle Group</label>
                                    <Input value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} className="rounded-xl h-11 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">{data.type === 'faq' ? 'Official Answer' : 'Handbook Content'}</label>
                                    <textarea required rows={6} className="w-full text-xs font-medium rounded-2xl border border-slate-200 bg-white p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 resize-y shadow-2xs" value={data.content} onChange={e => setData('content', e.target.value)} />
                                    {errors.content && <span className="text-xs font-semibold text-red-600 mt-1 block">{errors.content}</span>}
                                </div>
                            </>
                        )}

                        {data.type === 'evacuation_center' && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Shelter Physical Address</label>
                                <Input required value={data.address} onChange={e => setData('address', e.target.value)} className="rounded-xl h-11 text-xs" />
                            </div>
                        )}

                        {(data.type === 'contact' || data.type === 'emergency') && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Assigned Role/Department</label>
                                    <Input required value={data.role} onChange={e => setData('role', e.target.value)} className="rounded-xl h-11 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Active Contact Telephone/Mobile</label>
                                    <Input required value={data.phone} onChange={e => setData('phone', e.target.value)} className="rounded-xl h-11 text-xs" />
                                </div>
                            </>
                        )}

                        <div className="pt-2">
                            <label className="flex items-center gap-3 text-xs font-bold text-slate-800 cursor-pointer bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded border-slate-300 text-blue-600 h-4 w-4 cursor-pointer" />
                                Published and available in municipal library & PWA offline cache
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                            <Button type="button" variant="outline" className="cursor-pointer font-bold text-xs rounded-xl h-10 px-4" asChild>
                                <Link href="/admin/library">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs cursor-pointer shadow-sm rounded-xl h-10 px-5">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}