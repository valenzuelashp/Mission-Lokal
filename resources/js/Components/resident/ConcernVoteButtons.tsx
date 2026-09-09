import { router } from '@inertiajs/react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/Lib/utils';
import type { PublicConcern } from '@/Types';

type Props = {
    concernId: string;
    upvotes: number;
    downvotes: number;
    userVote: PublicConcern['user_vote'];
    compact?: boolean;
};

export default function ConcernVoteButtons({ concernId, upvotes, downvotes, userVote, compact = false }: Props) {
    const cast = (vote: 'up' | 'down') => {
        router.post(
            `/concerns/${concernId}/vote`,
            { vote },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <div className={cn('flex items-center gap-3', compact ? '' : 'rounded-lg bg-slate-100/80 p-2 border border-slate-200/60')}>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                        'gap-1.5 font-semibold transition-colors',
                        userVote === 'up' ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-slate-600 hover:text-slate-900',
                    )}
                    onClick={() => cast('up')}
                >
                    <ThumbsUp className={cn('h-4 w-4', userVote === 'up' && 'fill-current')} />
                    {!compact && 'Upvote'}
                </Button>
                <span className={cn('min-w-[1.25rem] text-sm font-bold tabular-nums', upvotes > 0 ? 'text-primary' : 'text-slate-500')}>
                    {upvotes}
                </span>
            </div>
            
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                        'gap-1.5 font-semibold transition-colors',
                        userVote === 'down' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'text-slate-600 hover:text-slate-900',
                    )}
                    onClick={() => cast('down')}
                >
                    <ThumbsDown className={cn('h-4 w-4', userVote === 'down' && 'fill-current')} />
                    {!compact && 'Downvote'}
                </Button>
                <span className={cn('min-w-[1.25rem] text-sm font-bold tabular-nums', downvotes > 0 ? 'text-red-600' : 'text-slate-500')}>
                    {downvotes}
                </span>
            </div>
        </div>
    );
}