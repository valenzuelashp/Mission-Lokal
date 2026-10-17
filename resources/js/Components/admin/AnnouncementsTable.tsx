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
            <div className="py-20 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
                <p className="text-sm font-semibold text-muted-foreground">No announcements found matching your criteria.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 md:hidden">
                {announcements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-3xl border border-slate-200/80 bg-card shadow-2xs md:block">
                <table className="w-full min-w-[960px] text-sm text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-black uppercase tracking-wider text-slate-400">
                            <th className="px-6 py-4">Announcement Title & Category</th>
                            <th className="px-5 py-4 w-36">Status</th>
                            <th className="px-5 py-4 w-48">Event Schedule</th>
                            <th className="px-5 py-4 w-40">Published Date</th>
                            <th className="px-5 py-4 w-40">Author</th>
                            <th className="px-6 py-4 text-right w-36">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {announcements.map((row) => (
                            <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        {row.image_url ? (
                                            <BufferedImage
                                                src={row.image_url}
                                                alt=""
                                                className="h-12 w-12 shrink-0 rounded-xl object-cover border border-slate-200 shadow-2xs"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                                                <Megaphone className="h-5 w-5" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-extrabold text-slate-900 truncate">{row.title}</p>
                                            <p className="text-[11px] font-extrabold text-blue-700 mt-0.5">
                                                {row.kind_label ?? 'Advisory'}
                                                {row.kind === 'volunteer' ? ` · ${row.volunteer_count ?? 0} volunteers` : ''}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <Badge
                                        className={
                                            row.is_published
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3 py-1'
                                                : 'bg-amber-50 text-amber-700 border-amber-200 font-bold px-3 py-1'
                                        }
                                        variant="outline"
                                    >
                                        {row.is_published ? '● Published' : '○ Draft'}
                                    </Badge>
                                </td>
                                <td className="px-5 py-4 font-semibold text-slate-700">
                                    {row.event_at ? (
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                            {row.event_at}
                                        </span>
                                    ) : '—'}
                                </td>
                                <td className="px-5 py-4 text-slate-400 font-medium">{row.published_at ?? '—'}</td>
                                <td className="px-5 py-4 text-slate-700 font-bold">{row.author_name}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-9 px-3.5 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs cursor-pointer rounded-xl"
                                            onClick={() => router.visit(`/admin/announcements/${row.id}/edit`)}
                                        >
                                            <Pencil className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-9 w-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer rounded-xl p-0 flex items-center justify-center"
                                            onClick={() => remove(row.id, row.title)}
                                        >
                                            <Trash2 className="h-4 w-4" />
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