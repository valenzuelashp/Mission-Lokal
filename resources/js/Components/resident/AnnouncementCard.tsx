import { Link } from '@inertiajs/react';
import { Megaphone, Share2, ThumbsUp } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/Lib/utils';
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
        <article className={cn("overflow-hidden rounded-2xl transition-all duration-200 w-full", compact ? "bg-transparent shadow-none" : "border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm p-1")}>
            <div className={cn("flex items-center gap-2.5 p-3 pb-1.5", compact && "px-0 pt-1 pb-1")}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm border border-neutral-800">
                    <Megaphone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-wider text-neutral-900">Official Notice</p>
                    <p className="text-[10px] text-neutral-400 font-medium">
                        {announcement.published_at}
                    </p>
                </div>
            </div>

            {announcement.image_url && !compact && (
                <Link href={`/announcements/${announcement.id}`} className="block mt-1">
                    <img
                        src={announcement.image_url}
                        alt=""
                        className="max-h-80 w-full object-cover border-y border-neutral-100"
                    />
                </Link>
            )}

            <div className={cn("space-y-1 px-3 py-2.5", compact && "px-0 py-1.5")}>
                <Link
                    href={`/announcements/${announcement.id}`}
                    className="break-words text-sm font-black tracking-tight text-neutral-950 hover:text-neutral-600 transition-colors block leading-tight"
                >
                    {announcement.title}
                </Link>
                <p className="whitespace-pre-wrap text-xs text-neutral-600 font-medium leading-relaxed">{body}</p>
                {compact && announcement.body.length > 120 && (
                    <Link
                        href={`/announcements/${announcement.id}`}
                        className="text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-neutral-900 mt-1 block"
                    >
                        See more →
                    </Link>
                )}
            </div>

            {!compact && (
                <>
                    <div className="border-t border-neutral-100/70 px-3 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/20">
                        Posted by {announcement.author_name}
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-neutral-100/70 p-1.5 bg-neutral-50/40">
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 font-bold text-xs text-neutral-500 hover:text-neutral-900 hover:bg-white rounded-xl border border-transparent hover:border-neutral-200/40 shadow-none" disabled>
                            <ThumbsUp className="h-3.5 w-3.5" />
                            Acknowledge
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 font-bold text-xs text-neutral-500 hover:text-neutral-900 hover:bg-white rounded-xl border border-transparent hover:border-neutral-200/40 shadow-none" disabled>
                            <Share2 className="h-3.5 w-3.5" />
                            Share
                        </Button>
                    </div>
                </>
            )}
        </article>
    );
}