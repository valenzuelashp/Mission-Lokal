import { cn } from '@/Lib/utils';

type Props = {
    score: number;
    className?: string;
};

export default function SeverityBar({ score, className }: Props) {
    const color =
        score >= 75 ? 'bg-neutral-900' : score >= 40 ? 'bg-neutral-500' : 'bg-neutral-300';

    return (
        <div className={cn('flex items-center gap-2.5', className)}>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 border border-neutral-200/40 shadow-inner">
                <div className={cn('h-full rounded-full transition-all duration-500 ease-out', color)} style={{ width: `${score}%` }} />
            </div>
            <span className="w-5 text-right text-[10px] font-black uppercase tracking-wider text-neutral-800 tabular-nums">{score}%</span>
        </div>
    );
}