import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search, Megaphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import AnnouncementsTable from '@/Components/admin/AnnouncementsTable';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/Lib/utils';
import type { AdminAnnouncementsPageProps, PageProps } from '@/Types';

type FilterKey = 'all' | 'published' | 'draft';

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Broadcasts' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
];

export default function Index(props: Partial<AdminAnnouncementsPageProps>) {
    const announcements = props.announcements ?? [];
    const counts = props.counts ?? { all: 0, published: 0, draft: 0 };
    const { flash, auth } = usePage<PageProps & { auth: { user: any } }>().props;
    const canModify = auth.user?.can_modify_system ?? true;

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
                (row.author_name?.toLowerCase() ?? '').includes(q);

            return matchesFilter && matchesSearch;
        });
    }, [announcements, filter, search]);

    const drafts = announcements.filter((a) => !a.is_published).length;

    return (
        <AdminLayout title="Mission-Lokal Admin: Announcements">
            <Head title="Announcements" />

            {flash.success && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-xs font-bold text-emerald-900 shadow-2xs">
                    {flash.success}
                </div>
            )}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Megaphone className="h-6 w-6 text-blue-600" />
                        Announcements Command
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                        {canModify ? 'Create and publish barangay advisories visible across all resident PWA feeds.' : 'View official municipal advisories and community broadcasts.'}
                    </p>
                </div>
                {canModify && (
                    <Button 
                        size="sm" 
                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-sm cursor-pointer" 
                        onClick={() => router.visit('/admin/announcements/create')}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Announcement
                    </Button>
                )}
            </div>

            {drafts > 0 && (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-xs font-bold text-amber-900 shadow-2xs">
                    ⚠️ <strong className="font-black">{drafts}</strong> draft{drafts > 1 ? 's' : ''} currently awaiting publication.
                </div>
            )}

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key)}
                            className={cn(
                                'rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer',
                                filter === tab.key
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200',
                            )}
                        >
                            {tab.label}
                            <span className="ml-1.5 opacity-80 text-[10px]">({counts[tab.key] ?? 0})</span>
                        </button>
                    ))}
                    </div>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        className="pl-9 bg-white text-xs h-10 border-slate-200 shadow-2xs"
                        placeholder="Search announcements…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
                <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Showing {filtered.length} of {announcements.length} broadcasts</span>
                </div>
                <AnnouncementsTable announcements={filtered} />
            </section>
        </AdminLayout>
    );
}