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
    const { data, setData, post, processing, errors, reset } = useForm({ response: '' });
    const pending = clarifications.find((entry) => !entry.answered_at);

    if (clarifications.length === 0) return null;

    return (
        <section className={`space-y-4 rounded-2xl border p-5 ${theme.cardBorder} ${theme.cardBg} ${theme.textMain}`}>
            <div>
                <h2 className="flex items-center gap-2 text-sm font-black"><MessageSquare className={`h-4 w-4 ${theme.primaryText}`} /> Questions from barangay staff</h2>
                <p className={`mt-1 text-xs leading-relaxed ${theme.textMuted}`}>Only you and barangay staff can see these questions and your replies.</p>
            </div>
            <ConcernClarificationHistory entries={clarifications} repliesOpen={canReply} />
            {pending && canReply && (
                <form className="space-y-3" onSubmit={(event) => {
                    event.preventDefault();
                    post(`/concerns/${concernId}/clarifications/${pending.id}/reply`, {
                        preserveScroll: true,
                        onSuccess: () => reset('response'),
                    });
                }}>
                    <label htmlFor="clarification-response" className="block text-xs font-bold">Your reply</label>
                    <textarea
                        id="clarification-response" value={data.response}
                        onChange={(event) => setData('response', event.target.value)}
                        rows={5} required maxLength={5000}
                        placeholder="Answer the questions above with the details you know."
                        className={`w-full rounded-xl border p-3 text-sm focus:ring-2 focus:ring-blue-500 ${theme.cardBorder} ${theme.inputBg} ${theme.textMain}`}
                    />
                    {errors.response && <p role="alert" className="text-xs text-red-600">{errors.response}</p>}
                    <p className={`text-xs ${theme.textMuted}`}>Share only what you can observe safely. You can send one reply to this request.</p>
                    <Button type="submit" disabled={processing || !data.response.trim()}>{processing ? 'Sending...' : 'Send reply to barangay staff'}</Button>
                </form>
            )}
            {pending && !canReply && <p className={`text-xs ${theme.textMuted}`}>Replies are closed because this concern is no longer awaiting a staff decision.</p>}
        </section>
    );
}
