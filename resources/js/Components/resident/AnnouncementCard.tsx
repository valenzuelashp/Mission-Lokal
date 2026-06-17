import { Link } from '@inertiajs/react';
import { Megaphone, Share2, ThumbsUp } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import type { ResidentAnnouncement } from '@/Types';

type Props = {
    announcement: ResidentAnnouncement;
    compact?: boolean;
};

export default function AnnouncementCard({ announcement, compact = false }: Props) {
    const body = compact
        ? announcement.body.length > 120
            ? `${announcement.body.slice(0, 120)}…`
            : announcement.body
        : announcement.body;

    return (
        <article className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="flex items-center gap-3 p-3 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <Megaphone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Barangay Demo</p>
                    <p className="text-xs text-muted-foreground">
                        Official announcement · {announcement.published_at}
                    </p>
                </div>
            </div>

            {announcement.image_url && (
                <Link href={`/announcements/${announcement.id}`}>
                    <img
                        src={announcement.image_url}
                        alt=""
                        className="max-h-96 w-full object-cover"
                    />
                </Link>
            )}

            <div className="space-y-2 px-3 py-3">
                <Link
                    href={`/announcements/${announcement.id}`}
                    className="break-words text-base font-semibold hover:text-primary hover:underline"
                >
                    {announcement.title}
                </Link>
                <p className="whitespace-pre-wrap text-sm text-foreground">{body}</p>
                {!compact && announcement.body.length > 200 && (
                    <Link
                        href={`/announcements/${announcement.id}`}
                        className="text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                        See more
                    </Link>
                )}
            </div>

            {!compact && (
                <>
                    <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                        Posted by {announcement.author_name}
                    </div>
                    <div className="grid grid-cols-2 gap-1 border-t p-1">
                        <Button variant="ghost" size="sm" className="gap-2 font-semibold text-muted-foreground" disabled>
                            <ThumbsUp className="h-5 w-5" />
                            Acknowledge
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 font-semibold text-muted-foreground" disabled>
                            <Share2 className="h-5 w-5" />
                            Share
                        </Button>
                    </div>
                </>
            )}
        </article>
    );
}
