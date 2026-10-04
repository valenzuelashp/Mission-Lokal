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

type FilterKey = 'all' | 'ai_processed' | 'under_review' | 'active' | 'candidates' | 'merged' | 'rejected';

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Reports' },
    { key: 'ai_processed', label: 'AI Processed' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'active', label: 'Active Deployment' },
    { key: 'candidates', label: 'AI Candidates (To Merge)' },
    { key: 'merged', label: 'Merged (Duplicates)' },
    { key: 'rejected', label: 'Rejected / Spam' },
];

export default function Index(props: Partial<AdminReportQueuePageProps & { counts?: Record<string, number> }>) {
    const rawReports = props.reports ?? demoReports;
    
    // Attach ranked ordering
    const reports = useMemo(() => {
        return rawReports.map((r, idx) => ({
            ...r,
            rank: r.rank ?? (idx + 1),
        }));
    }, [rawReports]);

    const counts: Record<string, number> = props.counts ?? {
        ...reportCounts(reports),
        candidates: reports.filter((r: any) => Boolean(r.has_duplicate_candidate && !r.is_duplicate)).length,
        merged: reports.filter((r: any) => Boolean(r.is_duplicate)).length,
    };

    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return reports.filter((row: any) => {
            let matchesFilter = true;

            if (filter === 'all') {
                matchesFilter = true;
            } else if (filter === 'rejected') {
                matchesFilter = row.queue_status === 'rejected' || row.queue_status === 'spam';
            } else if (filter === 'candidates') {
                matchesFilter = Boolean(row.has_duplicate_candidate && !row.is_duplicate);
            } else if (filter === 'merged') {
                matchesFilter = Boolean(row.is_duplicate);
            } else {
                matchesFilter = row.queue_status === filter;
            }

            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                row.id?.toLowerCase().includes(q) ||
                row.incident_type?.toLowerCase().includes(q) ||
                row.location?.toLowerCase().includes(q) ||
                row.ai_category?.toLowerCase().includes(q) ||
                (row.duplicate_of_title && row.duplicate_of_title.toLowerCase().includes(q)) ||
                (row.duplicate_candidate_title && row.duplicate_candidate_title.toLowerCase().includes(q));

            return matchesFilter && matchesSearch;
        });
    }, [reports, filter, search]);

    return (
        <AdminLayout title="Mission-Lokal Admin: Report Queue">
            <Head title="Report Queue" />

            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Triage & Report Queue</h2>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                    Mathematically prioritized by AI severity, community upvotes, and duplicate detection. Review potential matches and merge reports seamlessly.
                </p>
            </div>

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
                            <span className="ml-1.5 text-[10px] opacity-80">({counts[tab.key] ?? 0})</span>
                        </button>
                    ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            className="pl-9 bg-white text-xs h-10 border-slate-200 shadow-2xs"
                            placeholder="Search reports or duplicates…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0 border-slate-200 bg-white">
                        <Filter className="h-4 w-4 text-slate-600" />
                    </Button>
                </div>
            </div>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
                <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Showing {filtered.length} of {reports.length} incoming reports</span>
                </div>
                <ReportQueueTable reports={filtered} />
            </section>
        </AdminLayout>
    );
}