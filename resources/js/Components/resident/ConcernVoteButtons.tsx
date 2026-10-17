import { router } from '@inertiajs/react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
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
    const theme = useResidentTheme();

    const cast = (vote: 'up' | 'down') => {
        router.post(
            `/concerns/${concernId}/vote`,
            { vote },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <div className={cn('flex items-center gap-4', compact ? '' : `rounded-2xl ${theme.inputBg} p-3 border ${theme.cardBorder}`)}>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                        'gap-2 font-black transition-colors cursor-pointer rounded-xl h-9 px-3.5',
                        userVote === 'up' ? `${theme.primaryBg} text-white shadow-2xs` : `${theme.textMuted} hover:opacity-100`,
                    )}
                    onClick={() => cast('up')}
                >
                    <ThumbsUp className={cn('h-4 w-4', userVote === 'up' && 'fill-current')} />
                    {!compact && 'Upvote'}
                </Button>
                <span className={cn('min-w-[1.25rem] text-xs font-black tabular-nums', upvotes > 0 ? theme.primaryText : theme.textMuted)}>
                    {upvotes}
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                        'gap-2 font-black transition-colors cursor-pointer rounded-xl h-9 px-3.5',
                        userVote === 'down' ? 'bg-rose-600 text-white shadow-2xs' : `${theme.textMuted} hover:opacity-100`,
                    )}
                    onClick={() => cast('down')}
                >
                    <ThumbsDown className={cn('h-4 w-4', userVote === 'down' && 'fill-current')} />
                    {!compact && 'Downvote'}
                </Button>
                <span className={cn('min-w-[1.25rem] text-xs font-black tabular-nums', downvotes > 0 ? 'text-rose-600' : theme.textMuted)}>
                    {downvotes}
                </span>
            </div>
        </div>
    );
}