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
        ? announcement.body.length > 120
            ? `${announcement.body.slice(0, 120)}…`
            : announcement.body
        : announcement.body;

    return (
        <article className={`overflow-hidden rounded-2xl border ${theme.cardBorder} ${theme.cardBg} shadow-xs transition-all hover:shadow-md`}>
            <div className={`flex items-center gap-3 p-4 pb-3 border-b ${theme.dividerColor}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.primaryBg} text-white font-bold shadow-2xs`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className={`text-xs font-black uppercase tracking-wider ${theme.primaryText}`}>{kindLabel}</p>
                    {announcement.event_at ? (
                        <p className="text-xs font-bold text-emerald-600">Happening {announcement.event_at}</p>
                    ) : (
                        <p className={`text-xs ${theme.textMuted} font-medium`}>{announcement.published_at}</p>
                    )}
                </div>
            </div>

            {announcement.image_url && (
                <Link href={`/announcements/${announcement.id}`} className="block overflow-hidden bg-slate-100">
                    <BufferedImage
                        src={announcement.image_url}
                        alt={announcement.title}
                        className={compact ? 'aspect-video max-h-40 min-h-28 w-full' : 'aspect-video max-h-96 min-h-48 w-full'}
                        imgClassName="transition-transform duration-300 hover:scale-[1.01]"
                    />
                </Link>
            )}

            <div className="space-y-2 p-4">
                <Link
                    href={`/announcements/${announcement.id}`}
                    className={`block break-words text-base font-bold ${theme.textMain} hover:opacity-80 transition-colors`}
                >
                    {announcement.title}
                </Link>
                <p className={`whitespace-pre-wrap text-sm leading-relaxed ${theme.textMain} opacity-90`}>{body}</p>
                {!compact && announcement.body.length > 200 && (
                    <Link
                        href={`/announcements/${announcement.id}`}
                        className={`inline-block pt-1 text-xs font-extrabold ${theme.primaryText} hover:underline`}
                    >
                        Read full announcement details →
                    </Link>
                )}
            </div>

            {!compact && kind === 'volunteer' && (
                <div className={`border-t ${theme.dividerColor} px-4 py-3 bg-slate-50/40`}>
                    <VolunteerJoinButton
                        announcementId={announcement.id}
                        hasJoined={announcement.has_joined}
                        volunteerCount={announcement.volunteer_count}
                    />
                </div>
            )}

            {!compact && (
                <>
                    {announcement.author_name && (
                        <div className={`border-t ${theme.dividerColor} bg-slate-50/40 px-4 py-2.5 text-xs ${theme.textMuted} font-medium`}>
                            Issued by <span className={`font-bold ${theme.textMain}`}>{announcement.author_name}</span>
                        </div>
                    )}
                    <div className={`grid grid-cols-2 gap-1 border-t ${theme.dividerColor} bg-slate-50/40 p-1.5`}>
                        <Button variant="ghost" size="sm" className={`gap-2 font-semibold ${theme.textMuted} hover:opacity-100 cursor-pointer`} disabled>
                            <ThumbsUp className="h-4 w-4" />
                            Acknowledge
                        </Button>
                        <Button variant="ghost" size="sm" className={`gap-2 font-semibold ${theme.textMuted} hover:opacity-100 cursor-pointer`} disabled>
                            <Share2 className="h-4 w-4" />
                            Share Notice
                        </Button>
                    </div>
                </>
            )}
        </article>
    );
}