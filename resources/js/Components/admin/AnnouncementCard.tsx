import { router } from '@inertiajs/react';
import { Megaphone, Pencil, Trash2, Calendar } from 'lucide-react';
import { MouseEvent } from 'react';
import BufferedImage from '@/Components/shared/BufferedImage';
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
        if (window.confirm(`Delete "${announcement.title}"? This action cannot be undone.`)) {
            router.delete(`/admin/announcements/${announcement.id}`);
        }
    };

    return (
        <Card className="shadow-xs border-slate-200/80 bg-white hover:border-blue-300 transition-all duration-200">
            <CardContent className="space-y-4 p-5">
                <div className="flex gap-4">
                    {announcement.image_url ? (
                        <BufferedImage
                            src={announcement.image_url}
                            alt=""
                            className="h-16 w-16 shrink-0 rounded-xl object-cover border border-slate-200 shadow-2xs"
                        />
                    ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                            <Megaphone className="h-6 w-6" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-900 leading-snug line-clamp-1">{announcement.title}</p>
                            <Badge
                                className={
                                    announcement.is_published
                                        ? 'shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                                        : 'shrink-0 bg-amber-50 text-amber-700 border-amber-200 font-bold'
                                }
                                variant="outline"
                            >
                                {announcement.is_published ? '● Published' : '○ Draft'}
                            </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-600 leading-relaxed">{announcement.body}</p>
                        
                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs">
                            <span className="font-extrabold text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded-md border border-blue-100">
                                {announcement.kind_label ?? 'Advisory'}
                                {announcement.kind === 'volunteer'
                                    ? ` · ${announcement.volunteer_count ?? 0} joined`
                                    : ''}
                            </span>
                            {announcement.event_at && (
                                <span className="flex items-center gap-1 text-slate-600 font-medium">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    {announcement.event_at}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-muted-foreground">
                    <span>By {announcement.author_name} · {announcement.updated_at}</span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border-slate-200 cursor-pointer shadow-2xs"
                            onClick={() => router.visit(`/admin/announcements/${announcement.id}/edit`)}
                        >
                            <Pencil className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            onClick={remove}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}