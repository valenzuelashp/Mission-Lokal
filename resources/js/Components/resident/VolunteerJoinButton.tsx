import { router } from '@inertiajs/react';
import { HandHelping } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/Lib/utils';

type Props = {
    announcementId: string;
    hasJoined?: boolean;
    volunteerCount?: number;
    compact?: boolean;
};

export default function VolunteerJoinButton({
    announcementId,
    hasJoined = false,
    volunteerCount = 0,
    compact = false,
}: Props) {
    const toggle = () => {
        router.post(`/announcements/${announcementId}/volunteer`, {}, { preserveScroll: true });
    };

    return (
        <div className={cn('flex items-center gap-3', compact ? '' : 'w-full')}>
            <Button
                type="button"
                size={compact ? 'sm' : 'default'}
                variant={hasJoined ? 'outline' : 'default'}
                className={cn(
                    hasJoined
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-teal-700 hover:bg-teal-800',
                    compact ? '' : 'w-full sm:w-auto',
                )}
                onClick={toggle}
            >
                <HandHelping className="h-4 w-4" />
                {hasJoined ? "You're helping" : 'I can help'}
            </Button>
            <p className="text-xs text-muted-foreground">
                {volunteerCount} volunteer{volunteerCount === 1 ? '' : 's'} signed up
            </p>
        </div>
    );
}
