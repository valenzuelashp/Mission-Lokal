import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import ConcernClarificationHistory from '@/Components/shared/ConcernClarificationHistory';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { ConcernClarification } from '@/Types';

interface Props {
    concernId: string;
    clarifications: ConcernClarification[];
    canReply: boolean;
}

export default function ConcernClarifications({ concernId, clarifications, canReply }: Props) {
    const theme = useResidentTheme();
    const pending = clarifications.find((entry) => !entry.answered_at);
    const { data, setData, post, processing, errors } = useForm({
        responses: pending?.questions.map(() => '') ?? [],
    });

    useEffect(() => {
        setData('responses', pending?.questions.map(() => '') ?? []);
    }, [pending?.id, pending?.questions.length]);

    if (clarifications.length === 0) return null;

    return (
        <section id="concern-clarifications" className={`space-y-4 rounded-2xl border p-5 ${theme.cardBorder} ${theme.cardBg} ${theme.textMain}`}>
            <div>
                <h2 className="flex items-center gap-2 text-sm font-black"><MessageSquare className={`h-4 w-4 ${theme.primaryText}`} /> Questions from barangay staff</h2>
                <p className={`mt-1 text-xs leading-relaxed ${theme.textMuted}`}>Only you and barangay staff can see these questions and your replies.</p>
                <p className={`mt-2 text-xs leading-relaxed ${theme.textMuted}`}>Replying is optional. Barangay staff can continue assessing and processing your concern without a reply.</p>
            </div>
            <ConcernClarificationHistory entries={clarifications} repliesOpen={canReply} />
            {pending && canReply && (
                <form className="space-y-3" onSubmit={(event) => {
                    event.preventDefault();
                    post(`/concerns/${concernId}/clarifications/${pending.id}/reply`, {
                        preserveScroll: true,
                    });
                }}>
                    <p className="block text-xs font-bold">Your answers (optional)</p>
                    {pending.questions.map((question, index) => (
                        <div key={index} className="space-y-2">
                            <p className="text-xs leading-relaxed"><span className="font-bold">Question {index + 1}:</span> {question}</p>
                            <label htmlFor={`clarification-response-${index}`} className="block text-xs font-semibold">Your answer (optional)</label>
                            <textarea
                                id={`clarification-response-${index}`}
                                value={data.responses[index] ?? ''}
                                onChange={(event) => setData('responses', data.responses.map((response, responseIndex) => responseIndex === index ? event.target.value : response))}
                                rows={3}
                                maxLength={950}
                                placeholder="Share the details you know."
                                className={`w-full rounded-xl border p-3 text-sm focus:ring-2 focus:ring-blue-500 ${theme.cardBorder} ${theme.inputBg} ${theme.textMain}`}
                            />
                            {errors[`responses.${index}`] && <p role="alert" className="text-xs text-red-600">{errors[`responses.${index}`]}</p>}
                        </div>
                    ))}
                    {errors.responses && <p role="alert" className="text-xs text-red-600">{errors.responses}</p>}
                    <p className={`text-xs ${theme.textMuted}`}>Answer any questions you can. Share only details you can provide safely.</p>
                    <Button type="submit" disabled={processing || !data.responses.some((response) => response.trim())}>{processing ? 'Sending...' : 'Send reply to barangay staff'}</Button>
                </form>
            )}
            {pending && !canReply && <p className={`text-xs ${theme.textMuted}`}>Replies are closed because this concern is no longer awaiting a staff decision.</p>}
        </section>
    );
}
