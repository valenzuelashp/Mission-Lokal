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
        <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl hover:border-blue-300 transition-all duration-200">
            <CardContent className="space-y-4 p-6">
                <div className="flex gap-4">
                    {announcement.image_url ? (
                        <BufferedImage
                            src={announcement.image_url}
                            alt=""
                            className="h-16 w-16 shrink-0 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                        />
                    ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                            <Megaphone className="h-6 w-6" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <p className="font-extrabold text-slate-900 leading-snug line-clamp-1">{announcement.title}</p>
                            <Badge
                                className={
                                    announcement.is_published
                                        ? 'shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3 py-1'
                                        : 'shrink-0 bg-amber-50 text-amber-700 border-amber-200 font-bold px-3 py-1'
                                }
                                variant="outline"
                            >
                                {announcement.is_published ? '● Published' : '○ Draft'}
                            </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-600 leading-relaxed font-medium">{announcement.body}</p>
                        
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                            <span className="font-black text-blue-700 bg-blue-50/80 px-3 py-1 rounded-xl border border-blue-100">
                                {announcement.kind_label ?? 'Advisory'}
                                {announcement.kind === 'volunteer'
                                    ? ` · ${announcement.volunteer_count ?? 0} joined`
                                    : ''}
                            </span>
                            {announcement.event_at && (
                                <span className="flex items-center gap-1.5 text-slate-600 font-bold">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    {announcement.event_at}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400 font-semibold">
                    <span>By {announcement.author_name} · {announcement.updated_at}</span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-4 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs cursor-pointer rounded-xl"
                            onClick={() => router.visit(`/admin/announcements/${announcement.id}/edit`)}
                        >
                            <Pencil className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer rounded-xl p-0 flex items-center justify-center"
                            onClick={remove}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}