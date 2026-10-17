import { router } from '@inertiajs/react';
import { HandHelping } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
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
    const theme = useResidentTheme();

    const toggle = () => {
        router.post(`/announcements/${announcementId}/volunteer`, {}, { preserveScroll: true });
    };

    return (
        <div className={cn('flex items-center justify-between gap-4', compact ? '' : 'w-full')}>
            <Button
                type="button"
                size={compact ? 'sm' : 'default'}
                variant={hasJoined ? 'outline' : 'default'}
                className={cn(
                    'font-black cursor-pointer shadow-2xs rounded-2xl h-11 px-6',
                    hasJoined
                        ? `${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border`
                        : `${theme.primaryBg} ${theme.primaryHover} text-white`,
                    compact ? '' : 'w-full sm:w-auto',
                )}
                onClick={toggle}
            >
                <HandHelping className="mr-2 h-4 w-4" />
                {hasJoined ? "✓ You're Volunteering" : 'I Can Help / Volunteer'}
            </Button>
            <p className={`text-xs font-black ${theme.textMain}`}>
                {volunteerCount} volunteer{volunteerCount === 1 ? '' : 's'} enrolled
            </p>
        </div>
    );
}