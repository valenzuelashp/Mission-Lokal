import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Bell, CalendarDays, HandHelping, Megaphone } from 'lucide-react';
import VolunteerJoinButton from '@/Components/resident/VolunteerJoinButton';
import BufferedImage from '@/Components/shared/BufferedImage';
import { Button } from '@/Components/ui/button';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { findPublishedAnnouncement, publishedAnnouncements } from '@/Lib/residentDemo';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { AnnouncementKind, AnnouncementShowPageProps } from '@/Types';

type Props = Partial<AnnouncementShowPageProps> & {
    announcementId?: string;
};

const kindIcons: Record<AnnouncementKind, typeof Megaphone> = {
    advisory: Bell,
    event: CalendarDays,
    volunteer: HandHelping,
};

export default function Show({ announcement, announcementId }: Props) {
    const theme = useResidentTheme();
    const item =
        announcement ??
        findPublishedAnnouncement(announcementId ?? '') ??
        publishedAnnouncements[0];
    const kind = item.kind ?? 'advisory';
    const Icon = kindIcons[kind] ?? Megaphone;
    const kindLabel = item.kind_label ?? 'Advisory';

    return (
        <ResidentLayout wide>
            <Head title={item.title} />
            <div className="w-full space-y-6 pb-16">
                <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 cursor-pointer`} asChild>
                    <Link href="/announcements">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to All Announcements
                    </Link>
                </Button>

                <article className={`w-full rounded-3xl border ${theme.cardBorder} ${theme.cardBg} p-6 sm:p-10 shadow-xl space-y-6`}>
                    {item.image_url && (
                        <BufferedImage
                            src={item.image_url}
                            alt={item.title}
                            className={`aspect-video max-h-[32rem] w-full rounded-2xl shadow-md border ${theme.cardBorder}`}
                        />
                    )}
                    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold ${theme.textMuted} border-b ${theme.dividerColor} pb-4`}>
                        <Icon className={`h-4 w-4 shrink-0 ${theme.primaryText}`} />
                        <span className={`font-black uppercase tracking-wider ${theme.primaryText}`}>{kindLabel}</span>
                        {item.event_at && (
                            <>
                                <span>·</span>
                                <span className={`font-black ${theme.badgeText} ${theme.badgeBg} px-3 py-1 rounded-xl border ${theme.badgeBorder} shadow-2xs`}>Happening {item.event_at}</span>
                            </>
                        )}
                        <span>·</span>
                        <span className={`break-words font-medium ${theme.textMain}`}>
                            Published {item.published_at} by <strong className="font-bold">{item.author_name}</strong>
                        </span>
                    </div>
                    <h1 className={`break-words text-2xl font-black tracking-tight sm:text-4xl ${theme.textMain}`}>{item.title}</h1>
                    <div className={`whitespace-pre-wrap text-sm sm:text-base leading-relaxed ${theme.textMuted} font-medium ${theme.inputBg} p-6 sm:p-8 rounded-2xl border ${theme.cardBorder} shadow-2xs`}>
                        {item.body}
                    </div>
                    {kind === 'volunteer' && (
                        <div className={`rounded-2xl border ${theme.badgeBorder} ${theme.badgeBg} p-6 shadow-2xs space-y-3`}>
                            <p className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Community Call: Volunteers Requested</p>
                            <VolunteerJoinButton
                                announcementId={item.id}
                                hasJoined={item.has_joined}
                                volunteerCount={item.volunteer_count}
                            />
                        </div>
                    )}
                </article>
            </div>
        </ResidentLayout>
    );
}