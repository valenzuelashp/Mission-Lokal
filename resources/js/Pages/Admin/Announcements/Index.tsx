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

            <div className="w-full space-y-8 pb-16">

                {flash.success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-xs font-bold text-emerald-900 shadow-2xs">
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <Megaphone className="h-3 w-3" /> Barangay Communications Desk
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            Announcements Command
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            {canModify ? 'Create and publish barangay advisories visible across all resident PWA feeds.' : 'View official municipal advisories and community broadcasts.'}
                        </p>
                    </div>

                    {canModify && (
                        <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-5 shadow-sm cursor-pointer rounded-2xl shrink-0" 
                            onClick={() => router.visit('/admin/announcements/create')}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Announcement
                        </Button>
                    )}
                </div>

                {drafts > 0 && (
                    <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 text-xs font-bold text-amber-950 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                            <span className="text-base">⚠️</span>
                            <span><strong className="font-black">{drafts}</strong> draft{drafts > 1 ? 's' : ''} currently awaiting publication.</span>
                        </div>
                    </div>
                )}

                {/* Filter and Search Controls - Unboxed / Direct Page Content */}
                <div className="space-y-4 pt-1">
                    <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:overflow-visible sm:px-0">
                        <div className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setFilter(tab.key)}
                                    className={cn(
                                        'rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-2xs',
                                        filter === tab.key
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-600/20'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80',
                                    )}
                                >
                                    <span>{tab.label}</span>
                                    <span className={cn(
                                        'rounded-md px-1.5 py-0.5 text-[10px] font-black',
                                        filter === tab.key ? 'bg-blue-700/60 text-white' : 'bg-slate-200/70 text-slate-700'
                                    )}>
                                        {counts[tab.key] ?? 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-1">
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                className="pl-10 bg-white text-xs h-11 border-slate-200 focus:bg-white transition-colors rounded-xl shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                placeholder="Search announcements by title, content, or author…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Data Table Section */}
                <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Showing <strong className="text-slate-900">{filtered.length}</strong> of <strong className="text-slate-900">{announcements.length}</strong> broadcasts</span>
                    </div>
                    <div className="overflow-x-auto">
                        <AnnouncementsTable announcements={filtered} />
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}