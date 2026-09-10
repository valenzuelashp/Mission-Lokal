import { Link } from '@inertiajs/react';
import { Bell, CalendarDays, HandHelping, Megaphone, Share2, ThumbsUp } from 'lucide-react';
import VolunteerJoinButton from '@/Components/resident/VolunteerJoinButton';
import BufferedImage from '@/Components/shared/BufferedImage';
import { Button } from '@/Components/ui/button';
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
    const kind = announcement.kind ?? 'advisory';
    const Icon = kindIcons[kind] ?? Megaphone;
    const kindLabel = announcement.kind_label ?? 'Advisory';
    const body = compact
        ? announcement.body.length > 120
            ? `${announcement.body.slice(0, 120)}…`
            : announcement.body
        : announcement.body;

    return (
        <article className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 p-4 pb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{kindLabel}</p>
                    <p className="text-xs text-muted-foreground">{announcement.published_at}</p>
                </div>
            </div>

            {announcement.image_url && (
                <Link href={`/announcements/${announcement.id}`} className="block overflow-hidden bg-slate-50">
                    <BufferedImage
                        src={announcement.image_url}
                        alt={announcement.title}
                        className={compact ? 'aspect-video max-h-40 min-h-28 w-full' : 'aspect-video max-h-96 min-h-48 w-full'}
                        imgClassName="transition-transform duration-300 hover:scale-[1.01]"
                    />
                </Link>
            )}

            <div className="space-y-2 px-4 py-3">
                <Link
                    href={`/announcements/${announcement.id}`}
                    className="block break-words text-base font-semibold text-slate-900 hover:text-primary transition-colors"
                >
                    {announcement.title}
                </Link>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{body}</p>
                {!compact && announcement.body.length > 200 && (
                    <Link
                        href={`/announcements/${announcement.id}`}
                        className="inline-block pt-1 text-sm font-semibold text-primary hover:underline"
                    >
                        Read full announcement →
                    </Link>
                )}
            </div>

            {!compact && kind === 'volunteer' && (
                <div className="border-t border-slate-100 px-4 py-3">
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
                        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-xs text-muted-foreground">
                            Posted by <span className="font-medium text-slate-700">{announcement.author_name}</span>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-1 border-t border-slate-100 bg-slate-50/50 p-1.5">
                        <Button variant="ghost" size="sm" className="gap-2 font-medium text-slate-600 hover:text-slate-900" disabled>
                            <ThumbsUp className="h-4 w-4" />
                            Acknowledge
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 font-medium text-slate-600 hover:text-slate-900" disabled>
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </>
            )}
        </article>
    );
}
