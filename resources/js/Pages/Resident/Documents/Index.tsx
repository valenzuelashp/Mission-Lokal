import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, ChevronDown, ClipboardCheck, Clock3, FileCheck2, HelpCircle, ScrollText } from 'lucide-react';
import ResidentLayout, { useResidentTheme } from '@/Layouts/ResidentLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import EmptyState from '@/Components/shared/EmptyState';
import DocumentRequestForm from '@/Components/documents/DocumentRequestForm';

type Template = { id: string; name: string; fields: { key: string; label: string }[] };
type RequestRow = {
    id: string;
    document_name: string;
    status: string;
    submitted_at: string;
    review_note: string | null;
};

const statusLabel: Record<string, string> = {
    submitted: 'Waiting for the barangay',
    ready: 'Ready for pickup',
    released: 'Released',
    rejected: 'Not issued',
};

const statusVariant: Record<string, 'secondary' | 'success' | 'warning' | 'danger'> = {
    submitted: 'warning',
    ready: 'success',
    released: 'secondary',
    rejected: 'danger',
};

export default function ResidentDocuments({ templates, requests }: { templates: Template[]; requests: RequestRow[] }) {
    const theme = useResidentTheme();
    const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

    const rightAside = (
        <div className="space-y-6">
            <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                <CardContent className="space-y-4 p-6">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText}`}>
                        <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Request process</h2>
                        <p className={`mt-2 text-xs font-medium leading-relaxed ${theme.textMuted}`}>
                            Submit a request, wait for barangay review, then open your request to print once it is ready.
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 border-t pt-3 text-[11px] font-bold ${theme.dividerColor} ${theme.textMuted}`}>
                        <Clock3 className={`h-4 w-4 ${theme.primaryText}`} />
                        Review times may vary by certificate.
                    </div>
                </CardContent>
            </Card>

            <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                <CardContent className="space-y-3 p-6">
                    <div className="flex items-center gap-2">
                        <HelpCircle className={`h-4 w-4 ${theme.primaryText}`} />
                        <h2 className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Need assistance?</h2>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${theme.textMuted}`}>
                        Contact the barangay through the community help page if you have questions about a request.
                    </p>
                    <Link href="/help" className={`inline-flex items-center gap-1.5 pt-1 text-xs font-black ${theme.primaryText} hover:underline`}>
                        Open barangay help <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title="Documents" />
            <ResidentSocialShell right={rightAside}>
                <div className="w-full space-y-6 pb-2">
                    <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                        <CardContent className="flex items-center gap-4 p-6 sm:p-8">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.primaryBg} text-white shadow-md`}>
                                <ScrollText className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <h1 className={`text-2xl font-black tracking-tight ${theme.textMain} sm:text-3xl`}>Barangay documents</h1>
                                <p className={`mt-1 text-xs font-medium leading-relaxed sm:text-sm ${theme.textMuted}`}>
                                    Request a certificate. The barangay reviews it before you can print a copy.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <section className="space-y-3">
                        <h2 className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Available certificates</h2>
                        {templates.length === 0 ? (
                            <EmptyState title="No certificates available" description="No documents are open for requests right now." />
                        ) : (
                            <div className="space-y-3">
                                {templates.map((template) => {
                                    const isExpanded = expandedTemplateId === template.id;

                                    return (
                                        <Card key={template.id} className={`overflow-hidden rounded-2xl shadow-2xs transition-colors ${theme.cardBorder} ${theme.cardBg}`}>
                                            <CardContent className="p-4 sm:p-5">
                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <div className="flex min-w-0 items-center gap-3.5">
                                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText}`}>
                                                            <FileCheck2 className="h-5 w-5" />
                                                        </div>
                                                        <h3 className={`min-w-0 text-sm font-black leading-snug ${theme.textMain}`}>{template.name}</h3>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant={isExpanded ? 'secondary' : 'default'}
                                                        onClick={() => setExpandedTemplateId(isExpanded ? null : template.id)}
                                                        aria-expanded={isExpanded}
                                                        aria-controls={`request-form-${template.id}`}
                                                        className={isExpanded ? `h-10 rounded-xl text-xs font-black ${theme.badgeBg} ${theme.textMain}` : `h-10 rounded-xl text-xs font-black text-white ${theme.primaryBg} ${theme.primaryHover}`}
                                                    >
                                                        {isExpanded ? 'Close form' : 'Request this'}
                                                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </Button>
                                                </div>
                                                {isExpanded && (
                                                    <div id={`request-form-${template.id}`} className={`mt-5 border-t pt-5 ${theme.dividerColor}`}>
                                                        <DocumentRequestForm
                                                            template={template}
                                                            onCancel={() => setExpandedTemplateId(null)}
                                                        />
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Your requests</h2>
                            {requests.length > 0 && (
                                <Badge variant="secondary" className={`${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                                    {requests.length}
                                </Badge>
                            )}
                        </div>
                        {requests.length === 0 ? (
                            <EmptyState title="No requests yet" description="Your certificate requests will appear here after you submit one." />
                        ) : (
                            <div className="space-y-3">
                                {requests.map((item) => (
                                    <Link key={item.id} href={`/documents/${item.id}`} className={`block rounded-2xl border p-4 transition-colors ${theme.cardBorder} ${theme.cardBg} ${theme.hoverBg}`}>
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <p className={`text-sm font-black ${theme.textMain}`}>{item.document_name}</p>
                                            <Badge variant={statusVariant[item.status] ?? 'secondary'}>{statusLabel[item.status] ?? item.status}</Badge>
                                        </div>
                                        <p className={`mt-2 text-xs font-semibold ${theme.textMuted}`}>Submitted {item.submitted_at}</p>
                                        {item.review_note && <p className={`mt-3 border-t pt-3 text-xs leading-relaxed ${theme.dividerColor} ${theme.textMuted}`}>{item.review_note}</p>}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}
