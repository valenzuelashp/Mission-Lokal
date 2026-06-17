import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { findPublishedAnnouncement, publishedAnnouncements } from '@/Lib/residentDemo';
import type { AnnouncementShowPageProps } from '@/Types';

type Props = Partial<AnnouncementShowPageProps> & {
    announcementId?: string;
};

export default function Show({ announcement, announcementId }: Props) {
    const item =
        announcement ??
        findPublishedAnnouncement(announcementId ?? '') ??
        publishedAnnouncements[0];

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
                    <img
                        src={item.image_url}
                        alt=""
                        className="mb-6 w-full rounded-xl object-cover"
                        style={{ maxHeight: '320px' }}
                    />
                )}
                <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <Megaphone className="h-4 w-4 shrink-0" />
                    <span className="break-words">
                        {item.published_at} · Posted by {item.author_name}
                    </span>
                </div>
                <h1 className="break-words text-xl font-bold tracking-tight sm:text-2xl">{item.title}</h1>
                <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
                    {item.body}
                </p>
            </article>
        </ResidentLayout>
    );
}
