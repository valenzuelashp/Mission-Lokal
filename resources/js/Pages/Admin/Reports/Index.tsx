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

            <div className="mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 sm:text-2xl">Report queue</h2>
                <p className="mt-1 text-xs font-medium text-neutral-500 max-w-md leading-relaxed">
                    Audit deep classification diagnostics, override model parameters, and gradient approve public concerns.
                </p>
            </div>

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
                <div className="flex gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                        <Input
                            className="pl-8.5 h-9 rounded-xl border-neutral-200 bg-white/50 text-xs font-bold shadow-2xs focus:bg-white placeholder-neutral-400 focus:border-neutral-900 focus:ring-neutral-900"
                            placeholder="Search inbound packets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Showing {filtered.length} of {reports.length} records indexed
                    </p>
                </div>
                <ReportQueueTable reports={filtered} />
                
                <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-neutral-400 px-1">
                    <span>Page 1 of 2</span>
                    <div className="flex gap-1">
                        <Button size="sm" className="h-7 w-7 rounded-lg bg-neutral-900 text-white p-0 text-[10px] font-black shadow-sm">1</Button>
                        <Button size="sm" variant="outline" className="h-7 w-7 rounded-lg border-neutral-200 bg-white p-0 text-[10px] font-black text-neutral-500 shadow-sm hover:bg-neutral-50">2</Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}