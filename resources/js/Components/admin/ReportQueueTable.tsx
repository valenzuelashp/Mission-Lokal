import { Link } from '@inertiajs/react';
import ReportQueueCard from '@/Components/admin/ReportQueueCard';
import SeverityBar from '@/Components/admin/SeverityBar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { rowNavProps, stopRowNav } from '@/Lib/tableRow';
import type { AdminReport } from '@/Types';
import { cn } from '@/Lib/utils';
import { ChevronRight, GitMerge, ShieldAlert } from 'lucide-react';

const queueLabel: Record<AdminReport['queue_status'], string> = {
    ai_processed: 'AI Processed',
    under_review: 'Under Review',
    active: 'Active',
    rejected: 'Rejected',
    spam: 'Spam',
};

const queueStyle: Record<AdminReport['queue_status'], string> = {
    ai_processed: 'bg-blue-50 text-blue-700 border-blue-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    spam: 'bg-slate-100 text-slate-600 border-slate-200',
};

type Props = {
    reports: (AdminReport & { rank?: number; priority_reason?: string })[];
};

export default function ReportQueueTable({ reports }: Props) {
    if (reports.length === 0) {
        return (
            <div className="py-16 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
                <p className="text-sm font-medium text-muted-foreground">No reports found in this operational queue.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {reports.map((report) => (
                    <ReportQueueCard key={report.concern_id ?? report.id} report={report} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-card shadow-xs md:block">
                <table className="w-full min-w-[1020px] text-sm text-left">
                    <thead>
                        <tr className="border-b bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3.5 w-16">Rank</th>
                            <th className="px-4 py-3.5 w-24">ID</th>
                            <th className="px-4 py-3.5">Incident Concern</th>
                            <th className="px-4 py-3.5">Location</th>
                            <th className="px-4 py-3.5">AI Category</th>
                            <th className="px-4 py-3.5">Severity & Score</th>
                            <th className="px-4 py-3.5">Duplicate / Status</th>
                            <th className="px-4 py-3.5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reports.map((row) => {
                            const href = `/admin/reports/${row.concern_id}`;
                            return (
                                <tr
                                    key={row.concern_id ?? row.id}
                                    className="cursor-pointer border-b last:border-0 hover:bg-blue-50/30 transition-colors group"
                                    {...rowNavProps(href)}
                                >
                                    <td className="px-4 py-3.5">
                                        {row.rank ? (
                                            <span className="inline-flex items-center justify-center bg-red-600 text-white rounded-md h-7 w-7 text-xs font-black shadow-2xs">
                                                #{row.rank}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-blue-700">
                                        {row.id}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            {row.images && row.images.length > 0 ? (
                                                <img 
                                                    src={row.images[0]} 
                                                    alt="Thumb" 
                                                    className="h-10 w-10 shrink-0 rounded-md object-cover border border-slate-200 shadow-2xs"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 shrink-0 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                                                    IMG
                                                </div>
                                            )}
                                            <div className="space-y-0.5">
                                                <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                                    {row.incident_type}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                                                    <span>{row.submitted_at}</span>
                                                    {row.visibility === 'private' && (
                                                        <span className="text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded text-[10px]">
                                                            Private
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="max-w-[150px] truncate px-4 py-3.5 text-slate-600 text-xs" title={row.location}>
                                        {row.location}
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-700 font-medium text-xs">
                                        {row.ai_category}
                                    </td>
                                    <td className="min-w-[140px] px-4 py-3.5">
                                        <div className="space-y-1">
                                            <SeverityBar score={row.ai_severity} />
                                            {row.priority_reason && (
                                                <div className="text-[10px] font-medium text-blue-700 truncate max-w-[160px]" title={row.priority_reason}>
                                                    {row.priority_reason}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex flex-col gap-1 items-start">
                                            <Badge variant="outline" className={cn("text-[10px] capitalize px-2 py-0.5", queueStyle[row.queue_status])}>
                                                {queueLabel[row.queue_status]}
                                            </Badge>

                                            {/* AI DUPLICATE CANDIDATE INDICATOR */}
                                            {row.has_duplicate_candidate && !row.is_duplicate && (
                                                <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-extrabold text-[10px] gap-1 px-1.5 py-0.5">
                                                    <ShieldAlert className="h-3 w-3 text-amber-600" />
                                                    Candidate: {row.duplicate_similarity ? `${Math.round(row.duplicate_similarity * 100)}%` : 'Match'}
                                                </Badge>
                                            )}

                                            {/* MERGED STATUS INDICATOR */}
                                            {row.is_duplicate && (
                                                <Badge className="bg-purple-100 text-purple-900 border-purple-300 font-extrabold text-[10px] gap-1 px-1.5 py-0.5">
                                                    <GitMerge className="h-3 w-3 text-purple-600" />
                                                    Merged Child
                                                </Badge>
                                            )}

                                            {/* MASTER CONCERN WITH MULTIPLE LINKED CITIZENS */}
                                            {row.is_merged_master && (
                                                <Badge className="bg-blue-100 text-blue-900 border-blue-300 font-extrabold text-[10px] gap-1 px-1.5 py-0.5">
                                                    <GitMerge className="h-3 w-3 text-blue-600" />
                                                    Master ({row.merged_duplicates_count} linked)
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold bg-white text-blue-700 hover:bg-blue-50 border-blue-200 shadow-2xs" asChild>
                                            <Link href={href} onClick={stopRowNav}>
                                                Review
                                                <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}