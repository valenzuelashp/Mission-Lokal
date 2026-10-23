import { Head, Link, useForm } from '@inertiajs/react';
import CertificatePaper, { canPrintPaper } from '@/Components/documents/CertificatePaper';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';

type RequestItem = {
    id: string;
    document_name: string;
    resident_name: string;
    account_id: string;
    status: string;
    answers: { label: string; value: string }[];
    review_note: string | null;
    submitted_at: string;
    certificate: string;
    signatory_name: string | null;
    signatory_title: string;
    paper_size: 'show' | 'short' | 'long' | 'a4';
    signature_url: string | null;
    barangay_name: string | null;
};

const statusLabel: Record<string, string> = {
    submitted: 'Waiting for review',
    ready: 'Ready for pickup',
    released: 'Released',
    rejected: 'Not issued',
};

export default function DocumentRequestShow({ requestItem, canModify }: { requestItem: RequestItem; canModify: boolean }) {
    const form = useForm({ status: 'ready', review_note: requestItem.review_note ?? '' });

    const submit = (status: 'ready' | 'released' | 'rejected') => {
        form.transform((data) => ({ ...data, status }));
        form.post(`/admin/documents/requests/${requestItem.id}/status`);
    };

    return (
        <AdminLayout title="Command Center: Document request">
            <Head title={requestItem.document_name} />
            <div className="mx-auto grid w-full max-w-5xl gap-6 pb-16 lg:grid-cols-[16rem_1fr]">
                <aside className="space-y-4">
                    <Link href="/admin/documents" className="text-xs font-bold text-blue-700 hover:underline">Back to documents</Link>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{statusLabel[requestItem.status] ?? requestItem.status}</p>
                        <h1 className="mt-1 text-xl font-black text-slate-900">{requestItem.document_name}</h1>
                        <p className="mt-2 text-sm font-bold text-slate-800">{requestItem.resident_name}</p>
                        <p className="text-xs font-semibold text-slate-500">{requestItem.account_id}</p>
                        <p className="mt-1 text-xs text-slate-500">{requestItem.submitted_at}</p>
                    </div>
                    <dl className="space-y-2">
                        {requestItem.answers.map((answer) => (
                            <div key={answer.label}>
                                <dt className="text-[10px] font-black uppercase tracking-wider text-slate-400">{answer.label}</dt>
                                <dd className="text-sm font-semibold text-slate-800">{answer.value}</dd>
                            </div>
                        ))}
                    </dl>
                    {canModify && (
                        <div className="space-y-2">
                            <textarea
                                value={form.data.review_note}
                                onChange={(event) => form.setData('review_note', event.target.value)}
                                rows={3}
                                placeholder="Note to the resident, required if you will not issue it"
                                className="w-full rounded-2xl border border-slate-200 p-3 text-xs"
                            />
                            <Button type="button" className="h-10 w-full rounded-xl bg-blue-600 font-bold text-white" onClick={() => submit('ready')}>
                                Mark ready for pickup
                            </Button>
                            <Button type="button" variant="outline" className="h-10 w-full rounded-xl font-bold" onClick={() => submit('released')}>
                                Mark released
                            </Button>
                            <Button type="button" variant="outline" className="h-10 w-full rounded-xl font-bold text-rose-600" onClick={() => submit('rejected')}>
                                Do not issue
                            </Button>
                        </div>
                    )}
                </aside>
                <div>
                    {canPrintPaper(requestItem.paper_size) && (
                        <Button type="button" variant="outline" className="no-print mb-3 h-9 rounded-xl text-xs font-bold" onClick={() => window.print()}>
                            Print {requestItem.paper_size === 'a4' ? 'A4' : requestItem.paper_size}
                        </Button>
                    )}
                    <CertificatePaper
                        paperSize={requestItem.paper_size}
                        title={requestItem.document_name}
                        barangayName={requestItem.barangay_name}
                        body={requestItem.certificate}
                        issuedOn={requestItem.submitted_at}
                        signatoryName={requestItem.signatory_name}
                        signatoryTitle={requestItem.signatory_title}
                        signatureUrl={requestItem.signature_url}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
