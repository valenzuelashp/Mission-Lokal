import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ChevronDown, MessageSquare, Plus, RefreshCw, Send, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
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

export default function ConcernClarificationPanel({ concernId, missingDetails, suggestedQuestions, clarifications, canRequest, repliesOpen, canReanalyse, reanalysisStatus, reanalysisError }: Props) {
    const [composing, setComposing] = useState(false);
    const reanalysis = useForm({});
    const { data, setData, post, processing, errors } = useForm({
        questions: suggestedQuestions.length > 0 ? suggestedQuestions.slice(0, 5)
            : ['Could you describe what happened and any details that would help barangay staff assess the concern safely?'],
    });
    const fieldErrors = errors as Record<string, string>;
    const pending = clarifications.some(entry => !entry.answered_at);
    const answered = clarifications.filter(entry => entry.answered_at);
    const busy = reanalysis.processing || ['queued', 'processing'].includes(reanalysisStatus || '');

    return (
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="clarification-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id="clarification-heading" className="flex items-center gap-2 text-sm font-bold text-slate-900"><MessageSquare className="h-4 w-4 text-slate-500" /> Resident clarification</h3>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">Optional</span>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-sm font-semibold text-blue-950">You can process this report without a reply.</p>
                <p className="mt-1 text-xs leading-relaxed text-blue-900">Severity is assessed using the available information. Ask a question only if it would help; sending questions or reassessing a reply is optional.</p>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">Questions and replies are private to barangay staff and the original reporter.</p>
            {pending && <p role="status" className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">{repliesOpen ? 'A question is awaiting a reply. You can still choose a staff action now.' : 'Replies are closed because this report has already been processed.'}</p>}
            {missingDetails.length > 0 && <details className="group rounded-xl border border-slate-200 p-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded text-xs font-semibold text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">Details that may help ({missingDetails.length})<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
                <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-relaxed text-slate-600">{missingDetails.map((detail, index) => <li key={index}>{detail}</li>)}</ul>
            </details>}
            {answered.length > 0 && <div className="space-y-3 rounded-xl border border-blue-100 p-4">
                <div><p className="text-xs font-bold text-slate-900">{answered.length} resident {answered.length === 1 ? 'reply' : 'replies'} received</p><p className="mt-1 text-xs leading-relaxed text-slate-500">Read the conversation below. You may reassess the replies or continue with your own review.</p></div>
                <Button type="button" size="sm" variant="outline" disabled={!canReanalyse || busy} onClick={() => reanalysis.post(`/admin/reports/${concernId}/reanalyse`, { preserveScroll: true })}><RefreshCw className={`mr-2 h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />{busy ? 'Reassessing replies...' : 'Reassess with replies'}</Button>
                {reanalysisStatus === 'completed' && !canReanalyse && <p role="status" className="text-xs font-semibold text-blue-800">Current replies are included in the assessment.</p>}
                <details className="text-xs text-slate-500"><summary className="cursor-pointer rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">How reassessment works</summary><p className="mt-2 leading-relaxed">Replies are assessed locally and are not sent to the external AI service. Previous analyses and staff-confirmed severity are preserved.</p></details>
                {(reanalysis.errors as Record<string, string>).reanalysis && <p role="alert" className="text-xs text-red-700">{(reanalysis.errors as Record<string, string>).reanalysis}</p>}
                {reanalysisError && <p role="alert" className="text-xs text-red-700">{reanalysisError}</p>}
            </div>}
            {clarifications.length > 0 && <details className="group rounded-xl border border-slate-200 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded text-xs font-bold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">Conversation history ({clarifications.length})<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
                <div className="mt-4"><ConcernClarificationHistory entries={clarifications} repliesOpen={repliesOpen} /></div>
            </details>}
            {canRequest ? <div className="space-y-4">
                <Button type="button" size="sm" variant="outline" aria-expanded={composing} aria-controls="clarification-composer" onClick={() => setComposing(value => !value)}><Plus className="mr-2 h-4 w-4" />{composing ? 'Close question editor' : clarifications.length > 0 ? 'Ask another question' : 'Ask the resident a question'}</Button>
                {composing && <form id="clarification-composer" className="space-y-4 rounded-xl bg-slate-50 p-4" onSubmit={event => {
                    event.preventDefault();
                    post(`/admin/reports/${concernId}/clarifications`, { preserveScroll: true, onSuccess: () => { setData('questions', ['']); setComposing(false); } });
                }}>
                    <p className="text-xs leading-relaxed text-slate-600">Edit the suggested questions before sending. Only ask for details the resident can provide safely.</p>
                    {data.questions.map((question, index) => <div key={index} className="space-y-1.5">
                        <label htmlFor={`clarification-question-${index}`} className="text-xs font-bold text-slate-700">Question {index + 1}</label>
                        <div className="flex items-start gap-2"><textarea id={`clarification-question-${index}`} value={question} onChange={event => setData('questions', data.questions.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} required maxLength={500} rows={2} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500" />{data.questions.length > 1 && <Button type="button" variant="ghost" size="icon" aria-label={`Remove question ${index + 1}`} onClick={() => setData('questions', data.questions.filter((_, itemIndex) => itemIndex !== index))}><X className="h-4 w-4" /></Button>}</div>
                        {fieldErrors[`questions.${index}`] && <p role="alert" className="text-xs text-red-700">{fieldErrors[`questions.${index}`]}</p>}
                    </div>)}
                    {errors.questions && <p role="alert" className="text-xs text-red-700">{errors.questions}</p>}
                    <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={data.questions.length >= 5 || processing} onClick={() => setData('questions', [...data.questions, ''])}><Plus className="mr-1 h-4 w-4" /> Add question</Button><Button type="submit" size="sm" disabled={processing || data.questions.some(question => !question.trim())}><Send className="mr-2 h-4 w-4" />{processing ? 'Sending...' : 'Send questions'}</Button></div>
                </form>}
            </div> : clarifications.length === 0 && <p className="text-xs leading-relaxed text-slate-500">In-app questions are unavailable for this report. You can continue reviewing and processing it.</p>}
        </section>
    );
}
