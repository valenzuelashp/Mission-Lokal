import { router } from '@inertiajs/react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/Lib/utils';
import type { PublicConcern } from '@/Types';

type Props = {
    concernId: string;
    voteCount: number;
    userVote: PublicConcern['user_vote'];
    compact?: boolean;
};

export default function ConcernVoteButtons({ concernId, voteCount, userVote, compact = false }: Props) {
    const cast = (vote: 'up' | 'down') => {
        router.post(
            `/concerns/${concernId}/vote`,
            { vote },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <div className={cn('flex items-center gap-1', compact ? '' : 'rounded-xl bg-white border border-neutral-200 p-1 shadow-sm')}>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                    'h-7 gap-1 font-bold rounded-lg text-xs px-2.5 transition-all active:scale-95',
                    userVote === 'up' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 bg-white border border-neutral-200/40',
                )}
                onClick={() => cast('up')}
            >
                <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            
            <span className={cn('min-w-[1rem] text-center text-xs font-black tabular-nums', voteCount !== 0 ? 'text-neutral-900' : 'text-neutral-400')}>
                {voteCount}
            </span>
            
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                    'h-7 gap-1 font-bold rounded-lg text-xs px-2.5 transition-all active:scale-95',
                    userVote === 'down' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-500 bg-white border border-neutral-200/40',
                )}
                onClick={() => cast('down')}
            >
                <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}