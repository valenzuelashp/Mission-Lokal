import { Head } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import ReportQueueTable from '@/Components/admin/ReportQueueTable';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoReports, reportCounts } from '@/Lib/adminDemo';
import { cn } from '@/Lib/utils';
import type { AdminReportQueuePageProps } from '@/Types';

type FilterKey = 'all' | 'ai_processed' | 'under_review' | 'active' | 'candidates' | 'merged' | 'rejected';
type ScoreDisplay = 'severity' | 'priority';

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
    const [scoreDisplay, setScoreDisplay] = useState<ScoreDisplay>('severity');
    const maxUpvotes = reports.reduce(
        (maxCount, report) => Math.max(maxCount, report.upvotes_count ?? 0),
        0,
    );

    const rankedReports = useMemo(() => {
        if (scoreDisplay !== 'priority') {
            return reports;
        }

        return [...reports]
            .sort((a, b) => (b.upvotes_count ?? 0) - (a.upvotes_count ?? 0))
            .map((report, index) => ({ ...report, rank: index + 1 }));
    }, [reports, scoreDisplay]);

    const filtered = useMemo(() => {
        return rankedReports.filter((row: any) => {
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
    }, [rankedReports, filter, search]);

    return (
        <AdminLayout title="Mission-Lokal Admin: Report Queue">
            <Head title="Report Queue" />

            <div className="w-full space-y-6 pb-12">
                {/* Header Section */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">AI Triage & Report Queue</h2>
                        <p className="mt-1 text-sm font-medium text-slate-500 max-w-3xl">
                            Reports are prioritized by AI severity, safety keywords, and waiting time. Review potential matches and merge reports seamlessly.
                        </p>
                    </div>
                </div>

                {/* Filter and Search Controls */}
                <div className="space-y-4 pt-1">
                    <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
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

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                className="pl-10 bg-white text-xs h-11 border-slate-200 focus:bg-white transition-colors rounded-xl shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                placeholder="Search reports by ID, incident type, location, category, or duplicate title…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <label className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-none">
                            <span>Show</span>
                            <select
                                aria-label="Score to display"
                                className="h-full bg-transparent text-xs font-bold text-slate-900 outline-none"
                                value={scoreDisplay}
                                onChange={(e) => setScoreDisplay(e.target.value as ScoreDisplay)}
                            >
                                <option value="severity">AI Severity</option>
                                <option value="priority">Priority</option>
                            </select>
                        </label>
                    </div>
                </div>

                {/* Main Data Table Section */}
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Showing <strong className="text-slate-900">{filtered.length}</strong> of <strong className="text-slate-900">{reports.length}</strong> incoming reports</span>
                        <span className="text-[11px] text-slate-400 font-normal normal-case">Updated in real-time</span>
                    </div>
                    <div className="overflow-x-auto">
                        <ReportQueueTable
                            reports={filtered}
                            scoreDisplay={scoreDisplay}
                            maxUpvotes={maxUpvotes}
                        />
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}