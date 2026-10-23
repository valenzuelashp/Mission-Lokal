import { Head, Link } from '@inertiajs/react';
import CertificatePaper, { canPrintPaper } from '@/Components/documents/CertificatePaper';
import ResidentLayout, { useResidentTheme } from '@/Layouts/ResidentLayout';
import { Button } from '@/Components/ui/button';

type RequestItem = {
    document_name: string;
    status: string;
    review_note: string | null;
    submitted_at: string;
    certificate: string | null;
    signatory_name: string | null;
    signatory_title: string;
    paper_size: 'show' | 'short' | 'long' | 'a4';
    signature_url: string | null;
    barangay_name: string | null;
};

const statusCopy: Record<string, string> = {
    submitted: 'The barangay has your request. You can print the certificate after they mark it ready.',
    ready: 'This copy is ready. You can print it or pick it up at the barangay.',
    released: 'The barangay has released this document.',
    rejected: 'The barangay did not issue this document.',
};

export default function ResidentDocumentShow({ requestItem }: { requestItem: RequestItem }) {
    const theme = useResidentTheme();

    return (
        <ResidentLayout>
            <Head title={requestItem.document_name} />
            <div className="mx-auto max-w-3xl space-y-4 pb-10">
                <div className="no-print space-y-3">
                    <Link href="/documents" className={`text-xs font-bold ${theme.primaryText}`}>Back to documents</Link>
                    <p className={`text-sm font-semibold ${theme.textMain}`}>{statusCopy[requestItem.status] ?? requestItem.status}</p>
                    {requestItem.review_note && (
                        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
                            {requestItem.review_note}
                        </p>
                    )}
                    {requestItem.certificate && canPrintPaper(requestItem.paper_size) && (
                        <Button type="button" onClick={() => window.print()} className={`h-10 rounded-xl font-black text-white ${theme.primaryBg}`}>
                            Print
                        </Button>
                    )}
                </div>

                {requestItem.certificate ? (
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
                ) : (
                    <p className={`no-print text-sm font-semibold ${theme.textMuted}`}>Submitted {requestItem.submitted_at}.</p>
                )}
            </div>
        </ResidentLayout>
    );
}
