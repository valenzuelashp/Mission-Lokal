import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import AnnouncementsTable from '@/Components/admin/AnnouncementsTable';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { announcementCounts, demoAnnouncements } from '@/Lib/adminDemo';
import { cn } from '@/Lib/utils';
import type { AdminAnnouncementsPageProps, PageProps } from '@/Types';

type FilterKey = 'all' | 'published' | 'draft';

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
];

export default function Index(props: Partial<AdminAnnouncementsPageProps>) {
    const announcements = props.announcements ?? demoAnnouncements;
    const counts = props.counts ?? announcementCounts(announcements);
    const { flash } = usePage<PageProps>().props;

    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        return announcements.filter((row) => {
            const matchesFilter =
                filter === 'all' ||
                (filter === 'published' ? row.is_published : !row.is_published);

            const matchesSearch =
                !q ||
                row.title.toLowerCase().includes(q) ||
                row.body.toLowerCase().includes(q) ||
                row.author_name.toLowerCase().includes(q);

            return matchesFilter && matchesSearch;
        });
    }, [announcements, filter, search]);

    const drafts = announcements.filter((a) => !a.is_published).length;

    return (
        <AdminLayout title="Mission-Lokal Admin: Announcements">
            <Head title="Announcements" />

            {flash.success && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-md px-3.5 py-3 text-xs font-bold text-neutral-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="truncate">{flash.success}</span>
                </div>
            )}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 sm:text-2xl">Announcements</h2>
                    <p className="mt-1 text-xs font-medium text-neutral-500 max-w-md leading-relaxed">
                        Construct, balance, and broadcast barangay system advisories explicitly mapped to residential feed targets.
                    </p>
                </div>
                <Button size="sm" className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm transition-all active:scale-[0.98] sm:w-auto px-5" asChild>
                    <Link href="/admin/announcements/create">
                        <Plus className="mr-2 h-4 w-4 stroke-[2.5]" />
                        New announcement
                    </Link>
                </Button>
            </div>

            {drafts > 0 && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-md px-4 py-3 text-xs font-bold text-neutral-800 shadow-xs">
                    <div className="h-2 w-2 rounded-full bg-neutral-900 animate-pulse" />
                    <span>Staged items: <strong className="font-black underline">{drafts} advisory document{drafts > 1 ? 's' : ''}</strong> pending public deployment.</span>
                </div>
            )}

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setFilter(tab.key)}
                                className={cn(
                                    'rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wider border transition-all active:scale-[0.98]',
                                    filter === tab.key
                                        ? 'bg-neutral-900 text-white border-transparent shadow-sm'
                                        : 'bg-white/80 border-neutral-200/60 text-neutral-500 hover:text-neutral-900 hover:bg-white hover:border-neutral-300',
                                )}
                            >
                                {tab.label}
                                <span className="ml-1.5 text-[10px] font-bold opacity-60 tabular-nums">({counts[tab.key]})</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                    <Input
                        className="pl-8.5 h-9 rounded-xl border-neutral-200 bg-white/50 text-xs font-bold shadow-2xs focus:bg-white placeholder-neutral-400 focus:border-neutral-900 focus:ring-neutral-900"
                        placeholder="Search advisory registers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Displaying {filtered.length} of {announcements.length} records
                    </p>
                </div>
                <AnnouncementsTable announcements={filtered} />
            </div>
        </AdminLayout>
    );
}