import { Link, router } from '@inertiajs/react';
import { Megaphone, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import type { AdminAnnouncement } from '@/Types';

type Props = {
    announcements: AdminAnnouncement[];
};

export default function AnnouncementsTable({ announcements }: Props) {
    const remove = (id: string, title: string) => {
        if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
            router.delete(`/admin/announcements/${id}`);
        }
    };

    return (
        <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[800px] text-sm">
                <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Published</th>
                        <th className="px-4 py-3">Author</th>
                        <th className="px-4 py-3">Updated</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {announcements.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                No announcements match your filters.
                            </td>
                        </tr>
                    ) : (
                        announcements.map((row) => (
                            <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                                <td className="px-4 py-3">
                                    <div className="flex items-start gap-3">
                                        {row.image_url ? (
                                            <img
                                                src={row.image_url}
                                                alt=""
                                                className="mt-0.5 h-12 w-12 shrink-0 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                                <Megaphone className="h-4 w-4" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-medium text-foreground">{row.title}</p>
                                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{row.body}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        className={
                                            row.is_published
                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                                : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                                        }
                                    >
                                        {row.is_published ? 'Published' : 'Draft'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{row.published_at ?? '—'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{row.author_name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{row.updated_at}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1">
                                        <Button size="sm" variant="outline" className="h-8" asChild>
                                            <Link href={`/admin/announcements/${row.id}/edit`}>
                                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 text-destructive hover:text-destructive"
                                            onClick={() => remove(row.id, row.title)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
