import { cn } from '@/Lib/utils';

type Props = {
    score: number;
    className?: string;
};

export default function SeverityBar({ score, className }: Props) {
    const color =
        score >= 75 ? 'bg-red-600' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-600';

    return (
        <div className={cn('flex items-center gap-2.5', className)}>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 border border-slate-200/60 shadow-inner">
                <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${Math.max(5, score)}%` }} />
            </div>
            <span className="w-7 text-right text-xs font-black text-slate-700">{score}</span>
        </div>
    );
}