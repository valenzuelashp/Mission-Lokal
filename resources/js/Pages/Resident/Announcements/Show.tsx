import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Bell, CalendarDays, HandHelping, Megaphone } from 'lucide-react';
import VolunteerJoinButton from '@/Components/resident/VolunteerJoinButton';
import BufferedImage from '@/Components/shared/BufferedImage';
import { Button } from '@/Components/ui/button';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { findPublishedAnnouncement, publishedAnnouncements } from '@/Lib/residentDemo';
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
            <Button variant="ghost" className="mb-4 -ml-2" asChild>
                <Link href="/announcements">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    All announcements
                </Link>
            </Button>

            <article className="lg:max-w-3xl">
                {item.image_url && (
                    <BufferedImage
                        src={item.image_url}
                        alt={item.title}
                        className="mb-6 aspect-video max-h-80 w-full rounded-xl"
                    />
                )}
                <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-teal-800">{kindLabel}</span>
                    <span>·</span>
                    <span className="break-words">
                        {item.published_at} · Posted by {item.author_name}
                    </span>
                </div>
                <h1 className="break-words text-xl font-bold tracking-tight sm:text-2xl">{item.title}</h1>
                <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
                    {item.body}
                </p>
                {kind === 'volunteer' && (
                    <div className="mt-8 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
                        <p className="mb-3 text-sm font-medium text-teal-900">The barangay needs volunteers for this.</p>
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
