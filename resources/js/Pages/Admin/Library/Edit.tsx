import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';
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

export default function Edit({ item }: { item: ItemProp }) {
    const { data, setData, put, processing, errors } = useForm({
        title: item.title ?? '',
        type: item.type ?? 'manual',
        content: item.content ?? '',
        subtitle: item.subtitle ?? '',
        role: item.role ?? '',
        phone: item.phone ?? '',
        address: item.address ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/library/${item.id}`);
    };

    return (
        <AdminLayout title="Edit Library Asset">
            <Head title={`Edit: ${item.title}`} />

            <div className="mb-4">
                <Button variant="ghost" className="-ml-2 h-auto px-2 text-sm" asChild>
                    <Link href="/admin/library">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to library
                    </Link>
                </Button>
            </div>

            <div className="max-w-xl rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-bold text-blue-900 mb-4">Edit Directory Asset</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Asset Classification Type</label>
                        <select 
                            className="w-full text-sm rounded-md border border-input bg-background p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={data.type}
                            onChange={e => setData('type', e.target.value)}
                        >
                            <option value="manual">Preparedness Manual / Guide Text</option>
                            <option value="emergency">Emergency Hotlines (Red Tag Alert)</option>
                            <option value="contact">General Barangay Official Contact</option>
                            <option value="evacuation_center">Evacuation Center / Facility Info</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title Name</label>
                        <Input required value={data.title} onChange={e => setData('title', e.target.value)} />
                        {errors.title && <span className="text-xs text-red-600 mt-1 block">{errors.title}</span>}
                    </div>

                    {data.type === 'manual' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Topic Subtitle Group</label>
                                <Input value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Handbook Content</label>
                                <textarea required rows={4} className="w-full text-sm rounded-md border border-input bg-background p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={data.content} onChange={e => setData('content', e.target.value)} />
                                {errors.content && <span className="text-xs text-red-600 mt-1 block">{errors.content}</span>}
                            </div>
                        </>
                    )}

                    {data.type === 'evacuation_center' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shelter Physical Address</label>
                            <Input required value={data.address} onChange={e => setData('address', e.target.value)} />
                        </div>
                    )}

                    {(data.type === 'contact' || data.type === 'emergency') && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Role/Department</label>
                                <Input required value={data.role} onChange={e => setData('role', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Active Contact Telephone/Mobile</label>
                                <Input required value={data.phone} onChange={e => setData('phone', e.target.value)} />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/library">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-700 text-white">Save Changes</Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}