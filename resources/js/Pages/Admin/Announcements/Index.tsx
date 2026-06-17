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
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    {flash.success}
                </div>
            )}

            <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Announcements</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Create and publish barangay advisories visible to all residents.
                    </p>
                </div>
                <Button size="sm" className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto" asChild>
                    <Link href="/admin/announcements/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New announcement
                    </Link>
                </Button>
            </div>

            {drafts > 0 && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <strong>{drafts}</strong> draft{drafts > 1 ? 's' : ''} waiting to be published.
                </div>
            )}

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key)}
                            className={cn(
                                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                                filter === tab.key
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-muted-foreground ring-1 ring-border hover:bg-muted',
                            )}
                        >
                            {tab.label}
                            <span className="ml-1.5 text-xs opacity-80">({counts[tab.key]})</span>
                        </button>
                    ))}
                    </div>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search announcements…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <section className="rounded-lg border bg-card p-3 shadow-sm sm:p-4 lg:p-5">
                <p className="mb-4 text-sm text-muted-foreground">
                    Showing {filtered.length} of {announcements.length} announcements
                </p>
                <AnnouncementsTable announcements={filtered} />
            </section>
        </AdminLayout>
    );
}
