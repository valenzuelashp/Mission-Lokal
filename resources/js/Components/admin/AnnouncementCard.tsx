import { Link, router } from '@inertiajs/react';
import { Megaphone, Pencil, Trash2 } from 'lucide-react';
import { MouseEvent } from 'react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminAnnouncement } from '@/Types';

type Props = {
    announcement: AdminAnnouncement;
};

export default function AnnouncementCard({ announcement }: Props) {
    const remove = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`Delete "${announcement.title}"? This cannot be undone.`)) {
            router.delete(`/admin/announcements/${announcement.id}`);
        }
    };

    return (
        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden transition-all duration-300 hover:border-neutral-300 hover:shadow-md">
            <CardContent className="space-y-4 p-4.5">
                <div className="flex items-start gap-3.5">
                    {announcement.image_url ? (
                        <img
                            src={announcement.image_url}
                            alt=""
                            className="h-16 w-16 shrink-0 rounded-xl border border-neutral-200/40 object-cover shadow-xs"
                        />
                    ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-800 shadow-xs">
                            <Megaphone className="h-5 w-5 stroke-[2]" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-3">
                            <p className="font-black text-sm tracking-tight text-neutral-900 leading-snug">{announcement.title}</p>
                            <Badge
                                className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest shrink-0 shadow-xs transition-all ${
                                    announcement.is_published
                                        ? 'bg-neutral-900 text-white border-transparent'
                                        : 'bg-white text-neutral-500 border-neutral-200'
                                }`}
                            >
                                {announcement.is_published ? 'Published' : 'Draft'}
                            </Badge>
                        </div>
                        <p className="line-clamp-2 text-xs font-medium text-neutral-500 leading-relaxed pt-0.5">{announcement.body}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pt-1.5 leading-none">
                            {announcement.author_name} · <span className="tabular-nums lowercase font-bold font-sans text-xs normal-case text-neutral-400/80">{announcement.updated_at}</span>
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-neutral-100">
                    <Button size="sm" variant="outline" className="h-8 rounded-xl border border-neutral-200 bg-white px-3 text-[11px] font-black uppercase tracking-wider shadow-sm hover:bg-neutral-50 text-neutral-800 transition-all active:scale-95 flex-1" asChild>
                        <Link href={`/admin/announcements/${announcement.id}/edit`}>
                            <Pencil className="mr-1.5 h-3.5 w-3.5 text-neutral-400 stroke-[2.5]" />
                            Edit entry
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-xl px-3 border border-transparent hover:border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all active:scale-95"
                        onClick={remove}
                    >
                        <Trash2 className="h-3.5 w-3.5 stroke-[2]" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}