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
        <Card className="shadow-sm">
            <CardContent className="space-y-3 p-4">
                <div className="flex gap-3">
                    {announcement.image_url ? (
                        <img
                            src={announcement.image_url}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <Megaphone className="h-5 w-5" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold leading-snug">{announcement.title}</p>
                            <Badge
                                className={
                                    announcement.is_published
                                        ? 'shrink-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                        : 'shrink-0 bg-amber-100 text-amber-800 hover:bg-amber-100'
                                }
                            >
                                {announcement.is_published ? 'Published' : 'Draft'}
                            </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{announcement.body}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            {announcement.author_name} · {announcement.updated_at}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 flex-1" asChild>
                        <Link href={`/admin/announcements/${announcement.id}/edit`}>
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-destructive hover:text-destructive"
                        onClick={remove}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
