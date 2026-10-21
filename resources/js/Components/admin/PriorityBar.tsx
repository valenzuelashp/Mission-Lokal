import { cn } from '@/Lib/utils';

type Props = {
    score: number;
    maxScore: number;
};

export default function PriorityBar({ score, maxScore }: Props) {
    const percentage = maxScore > 0 ? Math.min(100, Math.max(0, (score / maxScore) * 100)) : 0;
    const color =
        percentage >= 75 ? 'bg-red-600' : percentage >= 40 ? 'bg-amber-500' : 'bg-emerald-600';

    return (
        <div
            className="flex items-center gap-3"
            title={`Community upvotes relative to the most-upvoted report (${maxScore})`}
        >
            <div
                className="h-2.5 flex-1 overflow-hidden rounded-full border border-slate-200/80 bg-slate-100 shadow-inner"
                role="progressbar"
                aria-label="Community upvotes"
                aria-valuemin={0}
                aria-valuemax={maxScore}
                aria-valuenow={score}
            >
                <div
                    className={cn('h-full rounded-full transition-all duration-500', color)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="w-10 text-right text-xs font-black text-slate-800">{score}</span>
        </div>
    );
}
