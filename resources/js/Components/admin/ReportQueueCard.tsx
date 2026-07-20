import { Link } from '@inertiajs/react';
import { Droplets, Flame, Lightbulb, MapPin, Trash2, Volume2, Waves } from 'lucide-react';
import SeverityBar from '@/Components/admin/SeverityBar';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
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
    report: AdminReport;
};

export default function ReportQueueCard({ report }: Props) {
    const Icon = typeIcons[report.type_icon] ?? Flame;

    return (
        <Link href={`/admin/reports/${report.concern_id}`} className="block group">
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-neutral-400/60 group-hover:shadow-md active:scale-[0.995]">
                <CardContent className="space-y-3 p-4.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 group-hover:text-neutral-900 transition-colors">
                            {report.id}
                        </span>
                        <Badge className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all ${queueStyle[report.queue_status]}`}>
                            {queueLabel[report.queue_status]}
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-0.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50/50 text-neutral-800">
                            <Icon className="h-3.5 w-3.5 shrink-0 stroke-[2]" />
                        </div>
                        <p className="font-black text-sm tracking-tight text-neutral-900 leading-snug">{report.incident_type}</p>
                    </div>
                    
                    <p className="flex items-start gap-1.5 text-xs font-medium text-neutral-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{report.location}</span>
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[10px] font-black uppercase tracking-wider border-t border-neutral-100/60">
                        <span className="text-neutral-800 font-bold tracking-tight">{report.ai_category}</span>
                        <Badge
                            variant="outline"
                            className={`rounded-lg border px-2 py-0.5 font-black text-[9px] uppercase tracking-widest ${
                                report.visibility === 'private'
                                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs border-transparent'
                                    : 'border-neutral-200 bg-white text-neutral-400'
                            }`}
                        >
                            {report.visibility === 'private' ? 'Private' : 'Public'}
                        </Badge>
                        <span className="text-neutral-400 font-medium tracking-tight lowercase normal-case text-xs ml-auto tabular-nums">{report.submitted_at}</span>
                    </div>
                    
                    <div className="pt-1.5 transform scale-95 origin-left">
                        <SeverityBar score={report.ai_severity} />
                    </div>
                    
                    <p className="text-right text-[11px] font-black uppercase tracking-widest text-neutral-900 pt-1 leading-none group-hover:translate-x-0.5 transition-transform">
                        Evaluate report →
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}