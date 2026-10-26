import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, Clock3, FileCheck2, HelpCircle, Printer } from 'lucide-react';
import CertificatePaper, { canPrintPaper } from '@/Components/documents/CertificatePaper';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import ResidentLayout, { useResidentTheme } from '@/Layouts/ResidentLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';

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
    city: string | null;
    contact_phone: string | null;
    logo_url: string | null;
    issued_day: string;
    issued_month: string;
    issued_year: string;
};

const statusCopy: Record<string, string> = {
    submitted: 'The barangay has your request. You can print the certificate after they mark it ready.',
    ready: 'This copy is ready. You can print it or pick it up at the barangay.',
    released: 'The barangay has released this document.',
    rejected: 'The barangay did not issue this document.',
};

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
    submitted: 'warning',
    ready: 'success',
    released: 'secondary',
    rejected: 'danger',
};

export default function ResidentDocumentShow({ requestItem }: { requestItem: RequestItem }) {
    const theme = useResidentTheme();
    const canPrint = Boolean(requestItem.certificate && canPrintPaper(requestItem.paper_size));
    const isComplete = ['ready', 'released'].includes(requestItem.status);
    const isRejected = requestItem.status === 'rejected';
    const reviewStep = isComplete || isRejected;
    const finalStep = isComplete || isRejected;
    const progressSteps = [
        { label: 'Request received', detail: requestItem.submitted_at, complete: true },
        {
            label: 'Barangay review',
            detail: isRejected ? 'Decision returned' : isComplete ? 'Review complete' : 'In progress',
            complete: reviewStep,
        },
        {
            label: isRejected ? 'Request decision' : 'Certificate',
            detail: isRejected ? 'Not issued' : isComplete ? 'Ready' : 'Available after review',
            complete: finalStep,
        },
    ];
    const pendingTitle = isRejected
        ? 'The barangay did not issue this request'
        : isComplete
            ? 'Your certificate is being prepared'
            : 'Your request is being reviewed';
    const pendingAside = (
        <div className="no-print space-y-5">
            <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Request status</h2>
                        <Badge variant={statusVariant[requestItem.status] ?? 'secondary'}>
                            {requestItem.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    <div className={`border-t pt-4 ${theme.dividerColor}`}>
                        <p className={`text-[10px] font-black uppercase tracking-wider ${theme.textMuted}`}>Submitted</p>
                        <p className={`mt-1 text-sm font-black ${theme.textMain}`}>{requestItem.submitted_at}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                <CardContent className="space-y-3 p-5">
                    <div className="flex items-center gap-2">
                        <HelpCircle className={`h-4 w-4 ${theme.primaryText}`} />
                        <h2 className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Need assistance?</h2>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${theme.textMuted}`}>
                        Contact the barangay if you have questions about this certificate request.
                    </p>
                    <Link href="/help" className={`inline-flex items-center gap-1.5 text-xs font-black ${theme.primaryText} hover:underline`}>
                        Open barangay help <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title={requestItem.document_name} />
            {canPrint && (
                <style>{`@media print { .document-show-layout { max-width: none !important; padding: 0 !important; } .document-show-grid { display: block !important; } }`}</style>
            )}
            {!requestItem.certificate ? (
                <ResidentSocialShell right={pendingAside}>
                    <div className="no-print w-full space-y-5 pb-2">
                        <Button variant="ghost" className={`-ml-3 text-xs font-bold ${theme.textMuted}`} asChild>
                            <Link href="/documents"><ArrowLeft className="mr-2 h-4 w-4" />All documents</Link>
                        </Button>
                        <header className="flex flex-wrap items-end justify-between gap-3">
                            <div className="min-w-0">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${theme.primaryText}`}>Certificate request</p>
                                <h1 className={`mt-1 break-words text-xl font-black sm:text-2xl ${theme.textMain}`}>{requestItem.document_name}</h1>
                            </div>
                            <Badge variant={statusVariant[requestItem.status] ?? 'secondary'} className="px-3 py-1.5">
                                {requestItem.status.replace('_', ' ')}
                            </Badge>
                        </header>

                        <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                            <CardContent className="space-y-6 p-5 sm:p-6">
                                <div className={`flex items-start gap-3 rounded-2xl border p-4 ${theme.badgeBorder} ${theme.accentSurface}`}>
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText}`}>
                                        {isRejected ? <FileCheck2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className={`text-sm font-black ${theme.textMain}`}>{pendingTitle}</h2>
                                        <p className={`mt-1 text-xs leading-relaxed ${theme.textMuted}`}>
                                            {statusCopy[requestItem.status] ?? requestItem.status}
                                        </p>
                                    </div>
                                </div>

                                <section className="space-y-3">
                                    <h2 className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Request progress</h2>
                                    <ol className="grid gap-2 sm:grid-cols-3">
                                        {progressSteps.map((step, index) => (
                                            <li key={step.label} className={`flex items-start gap-2.5 rounded-xl border p-3 ${theme.cardBorder} ${theme.cardBg}`}>
                                                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${step.complete ? `${theme.primaryBg} text-white` : `${theme.accentSurface} ${theme.primaryText}`}`}>
                                                    {step.complete ? <Check className="h-3.5 w-3.5" /> : index === 1 ? <Clock3 className="h-3.5 w-3.5" /> : <Printer className="h-3.5 w-3.5" />}
                                                </span>
                                                <span className="min-w-0">
                                                    <strong className={`block text-[11px] font-black ${theme.textMain}`}>{step.label}</strong>
                                                    <span className={`mt-1 block text-[10px] leading-relaxed ${theme.textMuted}`}>{step.detail}</span>
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                </section>

                                {requestItem.review_note && (
                                    <div className={`rounded-xl border p-3 text-xs leading-relaxed ${isRejected ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
                                        {requestItem.review_note}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </ResidentSocialShell>
            ) : (
                <div className="document-show-layout mx-auto max-w-6xl space-y-5 pb-2">
                    <div className="no-print">
                        <Button variant="ghost" className={`-ml-3 text-xs font-bold ${theme.textMuted}`} asChild>
                            <Link href="/documents"><ArrowLeft className="mr-2 h-4 w-4" />All documents</Link>
                        </Button>
                    </div>

                    <div className="document-show-grid grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                        <section className="min-w-0 space-y-4">
                            <div className="no-print flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${theme.primaryText}`}>Certificate request</p>
                                    <h1 className={`mt-1 break-words text-xl font-black sm:text-2xl ${theme.textMain}`}>{requestItem.document_name}</h1>
                                </div>
                                <Badge variant={statusVariant[requestItem.status] ?? 'secondary'} className="px-3 py-1.5">
                                    {requestItem.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <CertificatePaper
                                paperSize={requestItem.paper_size}
                                title={requestItem.document_name}
                                barangayName={requestItem.barangay_name}
                                city={requestItem.city}
                                contactPhone={requestItem.contact_phone}
                                logoUrl={requestItem.logo_url}
                                body={requestItem.certificate}
                                issuedDay={requestItem.issued_day}
                                issuedMonth={requestItem.issued_month}
                                issuedYear={requestItem.issued_year}
                                signatoryName={requestItem.signatory_name}
                                signatoryTitle={requestItem.signatory_title}
                                signatureUrl={requestItem.signature_url}
                            />
                        </section>

                        <aside className="no-print space-y-4">
                            <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                                <CardContent className="space-y-4 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText}`}>
                                            <FileCheck2 className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Request status</p>
                                            <p className={`mt-0.5 text-sm font-black capitalize ${theme.textMain}`}>{requestItem.status.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <p className={`border-t pt-4 text-xs font-medium leading-relaxed ${theme.dividerColor} ${theme.textMuted}`}>
                                        {statusCopy[requestItem.status] ?? requestItem.status}
                                    </p>
                                    {requestItem.review_note && (
                                        <div className={`rounded-xl border p-3 text-xs leading-relaxed ${isRejected ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
                                            {requestItem.review_note}
                                        </div>
                                    )}
                                    {canPrint && (
                                        <Button type="button" onClick={() => window.print()} className={`w-full gap-2 rounded-xl font-black text-white ${theme.primaryBg} ${theme.primaryHover}`}>
                                            <Printer className="h-4 w-4" /> Print certificate
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                                <CardContent className="space-y-4 p-5">
                                    <h2 className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Request progress</h2>
                                    <ol className="space-y-4">
                                        {progressSteps.map((step, index) => (
                                            <li key={step.label} className="flex items-start gap-3">
                                                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${step.complete ? `${theme.primaryBg} text-white` : `${theme.cardBorder} ${theme.accentSurface} ${theme.primaryText}`}`}>
                                                    {step.complete ? <Check className="h-3.5 w-3.5" /> : index === 1 ? <Clock3 className="h-3.5 w-3.5" /> : <Printer className="h-3.5 w-3.5" />}
                                                </span>
                                                <span>
                                                    <strong className={`block text-xs font-black ${theme.textMain}`}>{step.label}</strong>
                                                    <span className={`mt-0.5 block text-[10px] ${theme.textMuted}`}>{step.detail}</span>
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </div>
            )}
        </ResidentLayout>
    );
}
