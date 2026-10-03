import { router } from '@inertiajs/react';
import { Megaphone, Pencil, Trash2, Calendar } from 'lucide-react';
import AnnouncementCard from '@/Components/admin/AnnouncementCard';
import BufferedImage from '@/Components/shared/BufferedImage';
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

    if (announcements.length === 0) {
        return (
            <div className="py-16 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
                <p className="text-sm font-semibold text-muted-foreground">No announcements found matching your criteria.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {announcements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-card shadow-xs md:block">
                <table className="w-full min-w-[960px] text-sm text-left">
                    <thead>
                        <tr className="border-b bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-5 py-3.5">Announcement Title & Category</th>
                            <th className="px-4 py-3.5 w-32">Status</th>
                            <th className="px-4 py-3.5 w-44">Event Schedule</th>
                            <th className="px-4 py-3.5 w-36">Published Date</th>
                            <th className="px-4 py-3.5 w-36">Author</th>
                            <th className="px-4 py-3.5 text-right w-36">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {announcements.map((row) => (
                            <tr key={row.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3.5">
                                        {row.image_url ? (
                                            <BufferedImage
                                                src={row.image_url}
                                                alt=""
                                                className="h-11 w-11 shrink-0 rounded-lg object-cover border border-slate-200 shadow-2xs"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                                                <Megaphone className="h-5 w-5" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900 truncate">{row.title}</p>
                                            <p className="text-[11px] font-extrabold text-blue-700">
                                                {row.kind_label ?? 'Advisory'}
                                                {row.kind === 'volunteer' ? ` · ${row.volunteer_count ?? 0} volunteers` : ''}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3.5">
                                    <Badge
                                        className={
                                            row.is_published
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                                                : 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                                        }
                                        variant="outline"
                                    >
                                        {row.is_published ? '● Published' : '○ Draft'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3.5 text-xs font-medium text-slate-700">
                                    {row.event_at ? (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                            {row.event_at}
                                        </span>
                                    ) : '—'}
                                </td>
                                <td className="px-4 py-3.5 text-xs text-muted-foreground">{row.published_at ?? '—'}</td>
                                <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium">{row.author_name}</td>
                                <td className="px-4 py-3.5 text-right">
                                    <div className="flex justify-end gap-1.5">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs cursor-pointer"
                                            onClick={() => router.visit(`/admin/announcements/${row.id}/edit`)}
                                        >
                                            <Pencil className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                            onClick={() => remove(row.id, row.title)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}