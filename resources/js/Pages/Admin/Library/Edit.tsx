import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
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

            <div className="mb-4">
                <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer" asChild>
                    <Link href="/admin/library">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resource Library
                    </Link>
                </Button>
            </div>

            <div className="max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mb-5">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    Modify Resource Asset
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Asset Classification Type</label>
                        <select 
                            className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
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

                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Title Name</label>
                        <Input required value={data.title} onChange={e => setData('title', e.target.value)} />
                        {errors.title && <span className="text-xs font-medium text-red-600 mt-1 block">{errors.title}</span>}
                    </div>

                    {(data.type === 'manual' || data.type === 'faq') && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Topic Subtitle Group</label>
                                <Input value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">{data.type === 'faq' ? 'Official Answer' : 'Handbook Content'}</label>
                                <textarea required rows={5} className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-white p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 resize-y" value={data.content} onChange={e => setData('content', e.target.value)} />
                                {errors.content && <span className="text-xs font-medium text-red-600 mt-1 block">{errors.content}</span>}
                            </div>
                        </>
                    )}

                    {data.type === 'evacuation_center' && (
                        <div>
                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Shelter Physical Address</label>
                            <Input required value={data.address} onChange={e => setData('address', e.target.value)} />
                        </div>
                    )}

                    {(data.type === 'contact' || data.type === 'emergency') && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Assigned Role/Department</label>
                                <Input required value={data.role} onChange={e => setData('role', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Active Contact Telephone/Mobile</label>
                                <Input required value={data.phone} onChange={e => setData('phone', e.target.value)} />
                            </div>
                        </>
                    )}

                    <div className="pt-2">
                        <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                            <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded border-slate-300 text-blue-600 h-4 w-4" />
                            Published and available in municipal library & PWA offline cache
                        </label>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" className="cursor-pointer font-bold text-xs" asChild>
                            <Link href="/admin/library">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-800 font-bold text-xs cursor-pointer shadow-sm">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}