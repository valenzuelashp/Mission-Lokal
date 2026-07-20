import { Link } from '@inertiajs/react';
import ReportQueueCard from '@/Components/admin/ReportQueueCard';
import SeverityBar from '@/Components/admin/SeverityBar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import type { AdminReport } from '@/Types';

const queueLabel: Record<AdminReport['queue_status'], string> = {
    ai_processed: 'AI processed',
    under_review: 'Under review',
    active: 'Active',
    rejected: 'Rejected',
    spam: 'Spam',
};

const queueStyle: Record<AdminReport['queue_status'], string> = {
    ai_processed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    under_review: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    active: 'bg-red-600 text-white hover:bg-red-600',
    rejected: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
    spam: 'bg-slate-100 text-slate-500 hover:bg-slate-100',
};

type Props = {
    reports: AdminReport[];
};

export default function ReportQueueTable({ reports }: Props) {
    if (reports.length === 0) {
        return <p className="py-10 text-center text-sm text-muted-foreground">No reports in this queue.</p>;
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {reports.map((report) => (
                    <ReportQueueCard key={report.id} report={report} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
                <table className="w-full min-w-[960px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Concern</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">AI category</th>
                            <th className="px-4 py-3">AI severity</th>
                            <th className="px-4 py-3">Visibility</th>
                            <th className="px-4 py-3">Queue status</th>
                            <th className="px-4 py-3">Submitted</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((row) => {
                            return (
                                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                                    <td className="px-4 py-3 font-medium text-blue-700">{row.id}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {row.images && row.images.length > 0 ? (
                                                <img 
                                                    src={row.images[0]} 
                                                    alt="Thumbnail" 
                                                    className="h-10 w-10 shrink-0 rounded object-cover border border-slate-200"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 shrink-0 rounded bg-slate-100 border border-slate-200" />
                                            )}
                                            <div>
                                                <div className="font-medium text-blue-900">{row.incident_type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="max-w-[140px] truncate px-4 py-3 text-muted-foreground" title={row.location}>
                                        {row.location}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{row.ai_category}</td>
                                    <td className="min-w-[120px] px-4 py-3">
                                        <div className="flex items-center">
                                            <SeverityBar score={row.ai_severity} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant="outline"
                                            className={
                                                row.visibility === 'private'
                                                    ? 'border-violet-200 bg-violet-50 text-violet-700'
                                                    : 'border-slate-200 bg-slate-50'
                                            }
                                        >
                                            {row.visibility === 'private' ? 'Private' : 'Public'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={queueStyle[row.queue_status]}>
                                            {queueLabel[row.queue_status]}
                                        </Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                                        {row.submitted_at}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button variant="ghost" className="h-auto p-0 text-blue-700 hover:bg-transparent" asChild>
                                            <Link href={`/admin/reports/${row.concern_id}`}>Review</Link>
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