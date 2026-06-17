import { Head } from '@inertiajs/react';
import { Filter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import ReportQueueTable from '@/Components/admin/ReportQueueTable';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoReports, reportCounts } from '@/Lib/adminDemo';
import { cn } from '@/Lib/utils';
import type { AdminReportQueuePageProps } from '@/Types';

type FilterKey = 'all' | 'ai_processed' | 'under_review' | 'active' | 'rejected';

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'ai_processed', label: 'AI processed' },
    { key: 'under_review', label: 'Under review' },
    { key: 'active', label: 'Active' },
    { key: 'rejected', label: 'Rejected / spam' },
];

export default function Index(props: Partial<AdminReportQueuePageProps>) {
    const reports = props.reports ?? demoReports;
    const counts = props.counts ?? reportCounts(reports);

    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return reports.filter((row) => {
            const matchesFilter =
                filter === 'all' ||
                (filter === 'rejected'
                    ? row.queue_status === 'rejected' || row.queue_status === 'spam'
                    : row.queue_status === filter);

            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                row.id.toLowerCase().includes(q) ||
                row.incident_type.toLowerCase().includes(q) ||
                row.location.toLowerCase().includes(q) ||
                row.ai_category.toLowerCase().includes(q);

            return matchesFilter && matchesSearch;
        });
    }, [reports, filter, search]);

    return (
        <AdminLayout title="Mission-Lokal Admin: Report Queue">
            <Head title="Report Queue" />

            <div className="mb-4 sm:mb-6">
                <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Report queue</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Review AI suggestions, confirm categories, and approve or reject incoming concerns.
                </p>
            </div>

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
                <div className="flex gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search reports…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <section className="rounded-lg border bg-card p-3 shadow-sm sm:p-4 lg:p-5">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {filtered.length} of {reports.length} reports
                    </p>
                </div>
                <ReportQueueTable reports={filtered} />
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Page 1 of 2</span>
                    <div className="flex gap-1">
                        <Button size="sm" variant="default" className="h-8 w-8 bg-blue-700 p-0">
                            1
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            2
                        </Button>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
