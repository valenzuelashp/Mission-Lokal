import { Link, router } from '@inertiajs/react';
import { Megaphone, Pencil, Trash2 } from 'lucide-react';
import AnnouncementCard from '@/Components/admin/AnnouncementCard';
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
            <p className="py-12 text-center text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50/30 rounded-2xl border border-dashed border-neutral-200">
                No bulletin documents match the selected filter parameters.
            </p>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {announcements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm md:block">
                <table className="w-full min-w-[800px] text-xs font-bold tracking-tight text-neutral-700">
                    <thead>
                        <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            <th className="px-5 py-4 w-[45%]">Advisory details</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4">Broadcast Time</th>
                            <th className="px-5 py-4">Author Profile</th>
                            <th className="px-5 py-4">Last update</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {announcements.map((row) => (
                            <tr key={row.id} className="group transition-colors hover:bg-neutral-50/40">
                                <td className="px-5 py-4">
                                    <div className="flex items-start gap-3.5">
                                        {row.image_url ? (
                                            <img
                                                src={row.image_url}
                                                alt=""
                                                className="mt-0.5 h-12 w-12 shrink-0 rounded-xl border border-neutral-200/40 object-cover shadow-xs"
                                            />
                                        ) : (
                                            <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-800 shadow-xs">
                                                <Megaphone className="h-4.5 w-4.5 stroke-[2]" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-black text-neutral-900 leading-snug line-clamp-1">{row.title}</p>
                                            <p className="mt-1 line-clamp-1 text-[11px] font-medium text-neutral-500 leading-relaxed">{row.body}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <Badge
                                        className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-xs transition-all ${
                                            row.is_published
                                                ? 'bg-neutral-900 text-white border-transparent'
                                                : 'bg-white text-neutral-500 border-neutral-200'
                                        }`}
                                    >
                                        {row.is_published ? 'Published' : 'Draft'}
                                    </Badge>
                                </td>
                                <td className="px-5 py-4 text-neutral-500 font-medium tabular-nums">{row.published_at ?? '—'}</td>
                                <td className="px-5 py-4 text-neutral-900 font-bold">{row.author_name}</td>
                                <td className="px-5 py-4 text-neutral-400 font-medium tabular-nums">{row.updated_at}</td>
                                <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Button size="sm" variant="outline" className="h-8 rounded-xl border border-neutral-200 bg-white px-3 text-[11px] font-black uppercase tracking-wider shadow-sm hover:bg-neutral-50 text-neutral-800 transition-all active:scale-95" asChild>
                                            <Link href={`/admin/announcements/${row.id}/edit`}>
                                                <Pencil className="mr-1.5 h-3.5 w-3.5 text-neutral-400 stroke-[2.5]" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 rounded-xl px-2.5 border border-transparent hover:border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all active:scale-95"
                                            onClick={() => remove(row.id, row.title)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 stroke-[2]" />
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