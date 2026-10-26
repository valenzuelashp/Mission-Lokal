import { Link } from '@inertiajs/react';
import { Bell, CalendarDays, HandHelping, Megaphone, Share2, ThumbsUp } from 'lucide-react';
import VolunteerJoinButton from '@/Components/resident/VolunteerJoinButton';
import BufferedImage from '@/Components/shared/BufferedImage';
import { Button } from '@/Components/ui/button';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { AnnouncementKind, ResidentAnnouncement } from '@/Types';

type Props = {
    announcement: ResidentAnnouncement;
    compact?: boolean;
};

const kindIcons: Record<AnnouncementKind, typeof Megaphone> = {
    advisory: Bell,
    event: CalendarDays,
    volunteer: HandHelping,
};

export default function AnnouncementCard({ announcement, compact = false }: Props) {
    const theme = useResidentTheme();
    const kind = announcement.kind ?? 'advisory';
    const Icon = kindIcons[kind] ?? Megaphone;
    const kindLabel = announcement.kind_label ?? 'Advisory';
    
    const body = compact
        ? announcement.body.length > 90
            ? `${announcement.body.slice(0, 90)}…`
            : announcement.body
        : announcement.body;

    if (compact) {
        return (
            <article className={`overflow-hidden rounded-2xl border ${theme.cardBorder} ${theme.cardBg} shadow-2xs transition-all hover:shadow-sm w-full`}>
                <div className="flex items-start gap-3 p-3.5">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border`}>
                        <Icon className={`h-4 w-4 ${theme.primaryText}`} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                            <span className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                                {kindLabel}
                            </span>
                            <span className={`rounded-lg border px-2 py-1 text-[10px] font-medium ${theme.accentSurface} ${theme.cardBorder} ${theme.textMuted}`}>
                                {announcement.event_at ?? announcement.published_at}
                            </span>
                        </div>
                        <Link
                            href={`/announcements/${announcement.id}`}
                            className={`block truncate text-xs font-black tracking-tight ${theme.textMain} hover:underline`}
                        >
                            {announcement.title}
                        </Link>
                        <p className={`text-[11px] leading-relaxed ${theme.textMuted} font-medium line-clamp-2`}>{body}</p>
                    </div>
                </div>

                {announcement.image_url && (
                    <Link href={`/announcements/${announcement.id}`} className={`block overflow-hidden ${theme.inputBg} border-t ${theme.dividerColor}`}>
                        <BufferedImage
                            src={announcement.image_url}
                            alt={announcement.title}
                            className="w-full h-24 object-cover"
                            imgClassName="transition-transform duration-300 hover:scale-105"
                        />
                    </Link>
                )}
            </article>
        );
    }

    return (
        <article className={`overflow-hidden rounded-3xl border ${theme.cardBorder} ${theme.cardBg} shadow-sm transition-all hover:shadow-md w-full`}>
            <div className={`flex items-center gap-3.5 p-5 pb-4 border-b ${theme.dividerColor}`}>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border shadow-2xs`}>
                    <Icon className={`h-6 w-6 ${theme.primaryText}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className={`text-xs font-black uppercase tracking-wider ${theme.primaryText}`}>{kindLabel}</p>
                    {announcement.event_at ? (
                        <p className={`mt-1 inline-flex rounded-lg border px-2.5 py-1 text-xs font-black ${theme.badgeText} ${theme.badgeBg} ${theme.badgeBorder}`}>
                            Scheduled for {announcement.event_at}
                        </p>
                    ) : (
                        <p className={`text-xs ${theme.textMuted} font-medium mt-0.5`}>{announcement.published_at}</p>
                    )}
                </div>
            </div>

            {announcement.image_url && (
                <Link href={`/announcements/${announcement.id}`} className={`block overflow-hidden ${theme.inputBg}`}>
                    <BufferedImage
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="aspect-video max-h-[32rem] min-h-56 w-full"
                        imgClassName="transition-transform duration-500 hover:scale-105"
                    />
                </Link>
            )}

            <div className="space-y-3 p-6 sm:p-7">
                <Link
                    href={`/announcements/${announcement.id}`}
                    className={`block break-words text-lg font-black tracking-tight ${theme.textMain} hover:opacity-80 transition-colors sm:text-xl`}
                >
                    {announcement.title}
                </Link>
                <p className={`whitespace-pre-wrap text-sm leading-relaxed ${theme.textMuted} font-medium`}>{body}</p>
                {announcement.body.length > 200 && (
                    <Link
                        href={`/announcements/${announcement.id}`}
                        className={`inline-block pt-1 text-xs font-extrabold ${theme.primaryText} hover:underline`}
                    >
                        Read full announcement details →
                    </Link>
                )}
            </div>

            {kind === 'volunteer' && (
                <div className={`border-t ${theme.dividerColor} px-6 py-4 ${theme.accentSurface}`}>
                    <VolunteerJoinButton
                        announcementId={announcement.id}
                        hasJoined={announcement.has_joined}
                        volunteerCount={announcement.volunteer_count}
                    />
                </div>
            )}

            {announcement.author_name && (
                <div className={`border-t ${theme.dividerColor} ${theme.accentSurface} px-6 py-3 text-xs ${theme.textMuted} font-semibold`}>
                    Posted by <span className={`font-black ${theme.textMain}`}>{announcement.author_name}</span>
                </div>
            )}
            <div className={`grid grid-cols-2 gap-2 border-t ${theme.dividerColor} ${theme.accentSurface} p-2`}>
                <Button variant="ghost" size="sm" className={`gap-2 font-bold ${theme.textMuted} hover:opacity-100 cursor-pointer rounded-2xl h-10`} disabled>
                    <ThumbsUp className="h-4 w-4" />
                    Acknowledge
                </Button>
                <Button variant="ghost" size="sm" className={`gap-2 font-bold ${theme.textMuted} hover:opacity-100 cursor-pointer rounded-2xl h-10`} disabled>
                    <Share2 className="h-4 w-4" />
                    Share Notice
                </Button>
            </div>
        </article>
    );
}