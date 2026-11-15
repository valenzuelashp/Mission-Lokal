import { useForm } from '@inertiajs/react';
import { MessageSquare, Plus, Send, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import ConcernClarificationHistory from '@/Components/shared/ConcernClarificationHistory';
import type { ConcernClarification, ConcernReportQuality } from '@/Types';

interface Props {
    concernId: string;
    quality?: ConcernReportQuality;
    missingDetails: string[];
    suggestedQuestions: string[];
    clarifications: ConcernClarification[];
    canRequest: boolean;
    repliesOpen: boolean;
    canReanalyse: boolean;
    reanalysisStatus?: string | null;
    reanalysisError?: string | null;
}

export default function ConcernClarificationPanel({ concernId, quality, missingDetails, suggestedQuestions, clarifications, canRequest, repliesOpen, canReanalyse, reanalysisStatus, reanalysisError }: Props) {
    const reanalysis = useForm({});
    const { data, setData, post, processing, errors } = useForm({
        questions: suggestedQuestions.length > 0 ? suggestedQuestions.slice(0, 5)
            : ['Could you describe what happened and any details that would help barangay staff assess the concern safely?'],
    });
    const fieldErrors = errors as Record<string, string>;
    const pending = clarifications.some((entry) => !entry.answered_at);
    const needsClarification = quality === 'needs_clarification';

    if (!canRequest && clarifications.length === 0 && !needsClarification) return null;

    return (
        <section className="space-y-5 rounded-3xl border border-amber-200 bg-white p-6 text-slate-800 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="flex items-center gap-2 text-base font-black text-slate-900"><MessageSquare className="h-5 w-5 text-amber-700" /> Resident clarification</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">Questions and replies are private to barangay staff and the original reporter.</p>
                </div>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-900">
                    {pending ? (repliesOpen ? 'Awaiting reply' : 'Replies closed') : clarifications.length > 0 ? 'Resident replied' : needsClarification ? 'Needs clarification' : 'Staff review'}
                </Badge>
            </div>

            {needsClarification && clarifications.length === 0 && (
                <div className="space-y-2 rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">
                    <p className="font-bold">This report needs more context or a closer staff review.</p>
                    {missingDetails.length > 0 && <ul className="list-disc space-y-1 pl-4">{missingDetails.map((detail, index) => <li key={index}>{detail}</li>)}</ul>}
                </div>
            )}

            <ConcernClarificationHistory entries={clarifications} repliesOpen={repliesOpen} />
            {clarifications.some(entry => entry.answered_at) && <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs text-blue-950">Reanalysis uses the original report and resident replies locally. Private replies are not sent to the external AI service. Previous analyses and staff-confirmed severity are preserved.</p>
                <Button type="button" disabled={!canReanalyse || reanalysis.processing} onClick={() => reanalysis.post(`/admin/reports/${concernId}/reanalyse`, { preserveScroll: true })}>
                    {reanalysis.processing || ['queued', 'processing'].includes(reanalysisStatus ?? '') ? 'Reanalysis queued' : 'Reanalyse with resident replies'}
                </Button>
                {reanalysisStatus === 'completed' && !canReanalyse && <p className="text-xs font-semibold text-blue-900">The current replies have been reassessed. Review the updated analysis below.</p>}
                {(reanalysis.errors as Record<string, string>).reanalysis && <p role="alert" className="text-xs text-red-700">{(reanalysis.errors as Record<string, string>).reanalysis}</p>}
                {reanalysisError && <p role="alert" className="text-xs text-red-700">{reanalysisError}</p>}
            </div>}

            {canRequest && (
                <form className="space-y-4" onSubmit={(event) => {
                    event.preventDefault();
                    post(`/admin/reports/${concernId}/clarifications`, {
                        preserveScroll: true,
                        onSuccess: () => setData('questions', ['']),
                    });
                }}>
                    <p className="text-xs leading-relaxed text-slate-600">Review and edit the draft questions before sending. Only ask for details the resident can provide safely.</p>
                    {data.questions.map((question, index) => (
                        <div key={index} className="space-y-1.5">
                            <label htmlFor={`clarification-question-${index}`} className="text-xs font-bold">Question {index + 1}</label>
                            <div className="flex items-start gap-2">
                                <textarea
                                    id={`clarification-question-${index}`}
                                    value={question}
                                    onChange={(event) => setData('questions', data.questions.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                                    required maxLength={500} rows={2}
                                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {data.questions.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove question ${index + 1}`} onClick={() => setData('questions', data.questions.filter((_, itemIndex) => itemIndex !== index))}><X className="h-4 w-4" /></Button>
                                )}
                            </div>
                            {fieldErrors[`questions.${index}`] && <p role="alert" className="text-xs text-red-700">{fieldErrors[`questions.${index}`]}</p>}
                        </div>
                    ))}
                    {errors.questions && <p role="alert" className="text-xs text-red-700">{errors.questions}</p>}
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" disabled={data.questions.length >= 5 || processing} onClick={() => setData('questions', [...data.questions, ''])}><Plus className="mr-1 h-4 w-4" /> Add question</Button>
                        <Button type="submit" disabled={processing || data.questions.some((question) => !question.trim())}><Send className="mr-2 h-4 w-4" /> {processing ? 'Sending...' : 'Send questions to resident'}</Button>
                    </div>
                </form>
            )}
            {pending && repliesOpen && <p className="text-xs text-slate-600">The resident has been notified. Their reply will appear here and notify the requesting staff member.</p>}
        </section>
    );
}
