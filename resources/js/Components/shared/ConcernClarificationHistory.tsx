import type { ConcernClarification } from '@/Types';

export default function ConcernClarificationHistory({ entries, repliesOpen = true }: { entries: ConcernClarification[]; repliesOpen?: boolean }) {
    return (
        <div className="space-y-4">
            {entries.map((entry) => (
                <div key={entry.id} className="space-y-3 rounded-2xl border border-slate-300/50 bg-slate-500/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                        <span>Barangay staff requested details</span>
                        <span className="text-[11px] font-medium opacity-70">{entry.requested_at}</span>
                    </div>
                    <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                        {entry.questions.map((question, index) => <li key={index}>{question}</li>)}
                    </ol>
                    {entry.answered_at ? (
                        <div className="space-y-2 border-t border-slate-300/50 pt-3">
                            <p className="text-xs font-bold">Resident reply <span className="font-medium opacity-70">{entry.answered_at}</span></p>
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{entry.response}</p>
                        </div>
                    ) : (
                        <p className="text-xs font-semibold opacity-70">{repliesOpen ? 'Awaiting resident reply' : 'Replies closed'}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
