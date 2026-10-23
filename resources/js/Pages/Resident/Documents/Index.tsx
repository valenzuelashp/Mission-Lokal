import { Head, Link } from '@inertiajs/react';
import { ScrollText } from 'lucide-react';
import ResidentLayout, { useResidentTheme } from '@/Layouts/ResidentLayout';
import { Button } from '@/Components/ui/button';

type Template = { id: string; name: string };
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

export default function ResidentDocuments({ templates, requests }: { templates: Template[]; requests: RequestRow[] }) {
    const theme = useResidentTheme();

    return (
        <ResidentLayout>
            <Head title="Documents" />
            <div className="space-y-8 pb-10">
                <div>
                    <h1 className={`flex items-center gap-2 text-2xl font-black ${theme.textMain}`}>
                        <ScrollText className="h-6 w-6" /> Barangay documents
                    </h1>
                    <p className={`mt-1 text-sm font-medium ${theme.textMuted}`}>
                        Request a certificate. The barangay reviews it before you can print a copy.
                    </p>
                </div>

                <section className="grid gap-3 sm:grid-cols-2">
                    {templates.map((template) => (
                        <article key={template.id} className={`rounded-3xl border p-5 ${theme.cardBorder} ${theme.cardBg}`}>
                            <h2 className={`text-sm font-black ${theme.textMain}`}>{template.name}</h2>
                            <Button asChild className={`mt-4 h-10 rounded-xl text-xs font-black text-white ${theme.primaryBg}`}>
                                <Link href={`/documents/new/${template.id}`}>Request this</Link>
                            </Button>
                        </article>
                    ))}
                    {templates.length === 0 && (
                        <p className={`text-sm font-semibold ${theme.textMuted}`}>No documents are open for requests right now.</p>
                    )}
                </section>

                <section className="space-y-3">
                    <h2 className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Your requests</h2>
                    {requests.length === 0 ? (
                        <p className={`text-sm font-semibold ${theme.textMuted}`}>You have not requested a document yet.</p>
                    ) : (
                        requests.map((item) => (
                            <Link key={item.id} href={`/documents/${item.id}`} className={`block rounded-3xl border p-4 ${theme.cardBorder} ${theme.cardBg}`}>
                                <p className={`text-sm font-black ${theme.textMain}`}>{item.document_name}</p>
                                <p className={`mt-1 text-xs font-semibold ${theme.textMuted}`}>
                                    {statusLabel[item.status] ?? item.status} · {item.submitted_at}
                                </p>
                            </Link>
                        ))
                    )}
                </section>
            </div>
        </ResidentLayout>
    );
}
