import { cn } from '@/Lib/utils';

type Props = {
    score: number;
    className?: string;
};

export default function SeverityBar({ score, className }: Props) {
    const color =
        score >= 75 ? 'bg-red-500' : score >= 40 ? 'bg-blue-500' : 'bg-emerald-500';

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className={cn('h-full rounded-full', color)} style={{ width: `${score}%` }} />
            </div>
            <span className="w-6 text-right text-xs font-semibold text-muted-foreground">{score}</span>
        </div>
    );
}
