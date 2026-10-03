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
        <ResidentLayout>
            <Head title={item.title} />
            <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 mb-4 cursor-pointer`} asChild>
                <Link href="/announcements">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Announcements
                </Link>
            </Button>

            <article className={`lg:max-w-3xl rounded-2xl border ${theme.cardBorder} ${theme.cardBg} p-6 sm:p-8 shadow-sm`}>
                {item.image_url && (
                    <BufferedImage
                        src={item.image_url}
                        alt={item.title}
                        className={`mb-6 aspect-video max-h-96 w-full rounded-2xl shadow-2xs border ${theme.cardBorder}`}
                    />
                )}
                <div className={`mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold ${theme.textMuted} border-b ${theme.dividerColor} pb-3`}>
                    <Icon className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="font-black uppercase tracking-wider text-blue-600">{kindLabel}</span>
                    {item.event_at && (
                        <>
                            <span>·</span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">Happening {item.event_at}</span>
                        </>
                    )}
                    <span>·</span>
                    <span className="break-words">
                        Published {item.published_at} by <strong className="font-bold">{item.author_name}</strong>
                    </span>
                </div>
                <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl">{item.title}</h1>
                <p className={`mt-6 whitespace-pre-wrap text-sm sm:text-base leading-relaxed ${theme.textMuted} font-medium ${theme.inputBg} p-5 rounded-2xl border ${theme.cardBorder}`}>
                    {item.body}
                </p>
                {kind === 'volunteer' && (
                    <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
                        <p className="mb-3 text-xs font-black uppercase tracking-wider text-blue-900">Community Call: Volunteers Requested</p>
                        <VolunteerJoinButton
                            announcementId={item.id}
                            hasJoined={item.has_joined}
                            volunteerCount={item.volunteer_count}
                        />
                    </div>
                )}
            </article>
        </ResidentLayout>
    );
}