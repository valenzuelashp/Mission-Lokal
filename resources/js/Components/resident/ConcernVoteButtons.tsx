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
        <div className={cn('flex items-center gap-1', compact ? '' : 'rounded-lg bg-[#f0f2f5] p-1')}>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                    'gap-1.5 font-semibold',
                    userVote === 'up' ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-muted-foreground',
                )}
                onClick={() => cast('up')}
            >
                <ThumbsUp className={cn('h-4 w-4', userVote === 'up' && 'fill-current')} />
                {!compact && 'Upvote'}
            </Button>
            <span
                className={cn(
                    'min-w-[2rem] text-center text-sm font-bold tabular-nums',
                    voteCount > 0 && 'text-primary',
                    voteCount < 0 && 'text-red-600',
                )}
            >
                {voteCount}
            </span>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                    'gap-1.5 font-semibold',
                    userVote === 'down' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'text-muted-foreground',
                )}
                onClick={() => cast('down')}
            >
                <ThumbsDown className={cn('h-4 w-4', userVote === 'down' && 'fill-current')} />
                {!compact && 'Downvote'}
            </Button>
        </div>
    );
}
