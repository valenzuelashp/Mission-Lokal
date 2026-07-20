import { Link } from '@inertiajs/react';
import { Droplets, Flame, Lightbulb, Trash2, Volume2, Waves } from 'lucide-react';
import ReportQueueCard from '@/Components/admin/ReportQueueCard';
import SeverityBar from '@/Components/admin/SeverityBar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import type { AdminReport } from '@/Types';

const typeIcons = {
    fire: Flame,
    flood: Waves,
    waste: Trash2,
    noise: Volume2,
    drainage: Droplets,
    light: Lightbulb,
} as const;

const queueLabel: Record<AdminReport['queue_status'], string> = {
    ai_processed: 'AI processed',
    under_review: 'Under review',
    active: 'Active',
    rejected: 'Rejected',
    spam: 'Spam',
};

const queueStyle: Record<AdminReport['queue_status'], string> = {
    ai_processed: 'bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-100',
    under_review: 'bg-neutral-50 text-neutral-600 border-neutral-200/40 hover:bg-neutral-50',
    active: 'bg-neutral-900 text-white border-transparent hover:bg-neutral-900 shadow-xs',
    rejected: 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-100 opacity-60',
    spam: 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-100 opacity-40 line-through',
};

type Props = {
    reports: AdminReport[];
};

export default function ReportQueueTable({ reports }: Props) {
    if (reports.length === 0) {
        return (
            <p className="py-12 text-center text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50/30 rounded-2xl border border-dashed border-neutral-200">
                No reports in this queue.
            </p>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {reports.map((report) => (
                    <ReportQueueCard key={report.id} report={report} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm md:block">
                <table className="w-full min-w-[960px] text-xs font-bold tracking-tight text-neutral-700">
                    <thead>
                        <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            <th className="px-5 py-4">ID</th>
                            <th className="px-5 py-4 w-[25%]">Concern</th>
                            <th className="px-5 py-4">Location threshold</th>
                            <th className="px-5 py-4">AI category</th>
                            <th className="px-5 py-4 w-[15%]">AI severity index</th>
                            <th className="px-5 py-4">Visibility</th>
                            <th className="px-5 py-4">Queue status</th>
                            <th className="px-5 py-4">Submitted</th>
                            <th className="px-5 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {reports.map((row) => {
                            const Icon = typeIcons[row.type_icon] ?? Flame;
                            return (
                                <tr key={row.id} className="group transition-colors hover:bg-neutral-50/40">
                                    <td className="px-5 py-4 font-black text-neutral-900 tracking-wider">{row.id}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50/60 text-neutral-800">
                                                <Icon className="h-3.5 w-3.5 shrink-0 stroke-[2]" />
                                            </div>
                                            <span className="font-black text-neutral-900 tracking-tight">{row.incident_type}</span>
                                        </div>
                                    </td>
                                    <td className="max-w-[140px] truncate px-5 py-4 font-medium text-neutral-500" title={row.location}>
                                        {row.location}
                                    </td>
                                    <td className="px-5 py-4 text-neutral-800 font-bold uppercase text-[10px] tracking-wide">{row.ai_category}</td>
                                    <td className="px-5 py-4">
                                        <div className="transform scale-95 origin-left">
                                            <SeverityBar score={row.ai_severity} />
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Badge
                                            variant="outline"
                                            className={`rounded-lg border px-2 py-0.5 font-black text-[9px] uppercase tracking-widest ${
                                                row.visibility === 'private'
                                                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs border-transparent'
                                                    : 'border-neutral-200 bg-white text-neutral-400'
                                            }`}
                                        >
                                            {row.visibility === 'private' ? 'Private' : 'Public'}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Badge className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-2xs transition-all ${queueStyle[row.queue_status]}`}>
                                            {queueLabel[row.queue_status]}
                                        </Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-neutral-400 tabular-nums">
                                        {row.submitted_at}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Button variant="ghost" className="h-8 rounded-xl border border-neutral-200 bg-white px-3 text-[11px] font-black uppercase tracking-wider shadow-sm hover:bg-neutral-50 text-neutral-900 transition-all active:scale-95" asChild>
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