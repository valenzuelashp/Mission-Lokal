import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, ScrollText } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';

type Template = {
    id: string;
    name: string;
    is_enabled: boolean;
    is_system: boolean;
    paper_size: string;
    resident_fields: string[];
};

type RequestRow = {
    id: string;
    document_name: string;
    resident_name: string;
    status: string;
    submitted_at: string;
};

const paperLabel: Record<string, string> = {
    show: 'Show only',
    short: 'Short',
    long: 'Long',
    a4: 'A4',
};

const statusLabel: Record<string, string> = {
    submitted: 'Waiting',
    ready: 'Ready for pickup',
    released: 'Released',
    rejected: 'Not issued',
};

export default function DocumentsIndex({
    templates,
    requests,
    canModify,
    signatureUrl,
}: {
    templates: Template[];
    requests: RequestRow[];
    canModify: boolean;
    signatureUrl: string | null;
}) {
    const signatureForm = useForm<{ signature: File | null }>({ signature: null });

    const saveSignature = (event: React.FormEvent) => {
        event.preventDefault();
        signatureForm.post('/admin/documents/signature', { forceFormData: true });
    };
    return (
        <AdminLayout title="Command Center: Documents">
            <Head title="Documents" />
            <div className="w-full space-y-8 pb-16">
                <div className="flex flex-col gap-4 border-b border-slate-200/60 pb-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                            <ScrollText className="h-7 w-7 text-blue-600" /> Documents
                        </h1>
                        <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                            Rewrite each certificate for this barangay, then review resident requests.
                        </p>
                    </div>
                    {canModify && (
                        <Button asChild className="h-11 rounded-2xl bg-blue-600 font-bold text-white hover:bg-blue-700">
                            <Link href="/admin/documents/templates/create">
                                <Plus className="mr-2 h-4 w-4" /> Add a document
                            </Link>
                        </Button>
                    )}
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white p-5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Barangay signature</h2>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                        {signatureUrl ? (
                            <img src={signatureUrl} alt="Stored barangay signature" className="h-16 w-40 rounded-xl border border-slate-200 bg-slate-50 object-contain p-2" />
                        ) : (
                            <p className="text-xs font-semibold text-slate-400">No signature stored yet.</p>
                        )}
                        {canModify && (
                            <form onSubmit={saveSignature} className="flex flex-1 flex-wrap items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={(event) => signatureForm.setData('signature', event.target.files?.[0] ?? null)}
                                    className="h-11 min-w-0 flex-1 cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-semibold text-slate-500 file:mr-3 file:h-8 file:cursor-pointer file:rounded-xl file:border-0 file:bg-blue-50 file:px-3.5 file:text-xs file:font-black file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <Button type="submit" disabled={signatureForm.processing || !signatureForm.data.signature}>
                                    Save signature
                                </Button>
                            </form>
                        )}
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Templates</h2>
                    <div className="grid gap-2 md:grid-cols-2">
                        {templates.map((template) => (
                            <article key={template.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-black text-slate-900">{template.name}</h3>
                                    <p className="text-xs font-semibold text-slate-500">
                                        {paperLabel[template.paper_size] ?? 'Short'}
                                        {' · '}
                                        {template.is_enabled ? 'Residents can request this' : 'Hidden from residents'}
                                        {template.is_system ? '' : ' · Custom'}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className={`rounded-xl px-2.5 py-1 text-[10px] font-black uppercase ${template.is_enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {template.is_enabled ? 'On' : 'Off'}
                                    </span>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/documents/templates/${template.id}/edit`}>Edit</Link>
                                    </Button>
                                    {canModify && !template.is_system && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-rose-600"
                                            onClick={() => {
                                                if (confirm('Remove this custom document?')) {
                                                    router.delete(`/admin/documents/templates/${template.id}`);
                                                }
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Requests</h2>
                    {requests.length === 0 ? (
                        <p className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center text-sm font-semibold text-slate-500">
                            No document requests yet.
                        </p>
                    ) : (
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-5 py-3">Resident</th>
                                        <th className="px-5 py-3">Document</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {requests.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="cursor-pointer hover:bg-slate-50"
                                            onClick={() => router.visit(`/admin/documents/requests/${item.id}`)}
                                        >
                                            <td className="px-5 py-3 text-xs font-bold text-slate-800">{item.resident_name}</td>
                                            <td className="px-5 py-3 text-xs font-semibold text-slate-600">{item.document_name}</td>
                                            <td className="px-5 py-3 text-xs font-black text-slate-700">{statusLabel[item.status] ?? item.status}</td>
                                            <td className="px-5 py-3 text-xs font-semibold text-slate-500">{item.submitted_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
