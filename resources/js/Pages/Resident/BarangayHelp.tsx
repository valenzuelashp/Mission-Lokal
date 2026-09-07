import { Head, useForm } from '@inertiajs/react';
import { Bot, Send, ShieldCheck } from 'lucide-react';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';

interface Props {
    question: string | null;
    answer: string | null;
}

export default function BarangayHelp({ question, answer }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        question: question ?? '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post('/help');
    };

    return (
        <ResidentLayout>
            <Head title="Barangay Help" />

            <div className="mx-auto max-w-2xl space-y-5">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">Mission-Lokal Help</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900">Ask about your barangay</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Get answers from the barangay&apos;s published FAQs, services, contacts, and emergency information.
                    </p>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>This assistant cannot access accounts, reports, passwords, or private records. For emergencies, contact the official emergency numbers listed in the Library.</p>
                </div>

                {answer && (
                    <div className="rounded-lg border bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Bot className="h-5 w-5 text-primary" />
                            Barangay Help
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{answer}</p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-3 rounded-lg border bg-white p-5 shadow-sm">
                    <label htmlFor="question" className="text-sm font-semibold text-slate-900">Your question</label>
                    <Textarea
                        id="question"
                        value={data.question}
                        onChange={(event) => setData('question', event.target.value)}
                        placeholder="Example: What documents are needed for barangay clearance?"
                        maxLength={1000}
                        required
                    />
                    {errors.question && <p className="text-sm text-red-600">{errors.question}</p>}
                    <Button type="submit" disabled={processing || !data.question.trim()}>
                        <Send className="mr-2 h-4 w-4" />
                        {processing ? 'Checking barangay information...' : 'Ask Barangay Help'}
                    </Button>
                </form>
            </div>
        </ResidentLayout>
    );
}