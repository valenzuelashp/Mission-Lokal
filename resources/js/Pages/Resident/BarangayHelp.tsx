import { Head, useForm } from '@inertiajs/react';
import { Bot, Send, ShieldCheck } from 'lucide-react';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

interface Props {
    question: string | null;
    answer: string | null;
}

export default function BarangayHelp({ question, answer }: Props) {
    const theme = useResidentTheme();
    const { data, setData, post, processing, errors } = useForm({
        question: question ?? '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post('/help');
    };

    return (
        <ResidentLayout>
            <Head title="Barangay AI Help" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <p className={`text-xs font-black uppercase tracking-wider ${theme.primaryText}`}>Mission-Lokal RAG Assistant</p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight">Barangay Knowledge Assistant</h1>
                    <p className={`mt-1 text-xs sm:text-sm font-medium ${theme.textMuted}`}>
                        Get instant answers derived from published barangay FAQs, municipal services, and emergency handbooks.
                    </p>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs font-bold text-blue-900 shadow-2xs">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <p className="leading-relaxed">This assistant has no access to private accounts, passwords, or confidential blotter records. For life-threatening emergencies, please call the official hotlines listed in the Resource Library.</p>
                </div>

                {answer && (
                    <div className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} p-6 shadow-sm space-y-3`}>
                        <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider border-b ${theme.dividerColor} pb-3`}>
                            <Bot className={`h-5 w-5 ${theme.primaryText}`} />
                            Assistant Response
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{answer}</p>
                    </div>
                )}

                <form onSubmit={submit} className={`space-y-3 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} p-6 shadow-sm`}>
                    <label htmlFor="question" className="text-xs font-black uppercase tracking-wider block">Ask a Question</label>
                    <Textarea
                        id="question"
                        value={data.question}
                        onChange={(event) => setData('question', event.target.value)}
                        placeholder="Example: What documents are required to secure a barangay clearance?"
                        maxLength={1000}
                        required
                        className={`${theme.inputBg} resize-none`}
                        rows={4}
                    />
                    {errors.question && <p className="text-xs font-medium text-destructive">{errors.question}</p>}
                    <Button type="submit" disabled={processing || !data.question.trim()} className={`${theme.primaryBg} ${theme.primaryHover} text-white font-bold text-xs py-3 cursor-pointer shadow-sm`}>
                        <Send className="mr-2 h-4 w-4" />
                        {processing ? 'Consulting knowledge base...' : 'Ask Barangay Assistant'}
                    </Button>
                </form>
            </div>
        </ResidentLayout>
    );
}