import { Link } from '@inertiajs/react';
import { Droplets, Flame, Lightbulb, MapPin, Trash2, Volume2, Waves, ArrowUpRight, AlertCircle } from 'lucide-react';
import SeverityBar from '@/Components/admin/SeverityBar';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminReport } from '@/Types';
import { cn } from '@/Lib/utils';

const typeIcons = {
    fire: Flame,
    flood: Waves,
    waste: Trash2,
    noise: Volume2,
    drainage: Droplets,
    light: Lightbulb,
} as const;

const queueLabel: Record<AdminReport['queue_status'], string> = {
    ai_processed: 'AI Processed',
    under_review: 'Under Review',
    active: 'Active Deployment',
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
    report: AdminReport & { rank?: number; priority_reason?: string };
};

export default function ReportQueueCard({ report }: Props) {
    const Icon = typeIcons[report.type_icon as keyof typeof typeIcons] ?? Flame;

    return (
        <Link href={`/admin/reports/${report.concern_id}`} className="block group">
            <Card className="shadow-xs transition-all duration-200 hover:shadow-md hover:border-blue-300 border-slate-200/80 bg-white">
                <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {report.rank && (
                                <span className="inline-flex items-center justify-center bg-red-600 text-white rounded-md h-6 px-2 text-xs font-black shadow-2xs">
                                    #{report.rank}
                                </span>
                            )}
                            <span className="text-xs font-mono font-bold text-slate-500">{report.id}</span>
                        </div>
                        <Badge variant="outline" className={cn("text-[11px] capitalize px-2.5 py-0.5", queueStyle[report.queue_status])}>
                            {queueLabel[report.queue_status]}
                        </Badge>
                    </div>

                    <div className="flex items-start gap-3 pt-1">
                        {report.images && report.images.length > 0 ? (
                            <img 
                                src={report.images[0]} 
                                alt="Report Preview" 
                                className="h-12 w-12 shrink-0 rounded-lg object-cover border border-slate-200 shadow-2xs"
                            />
                        ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 border border-slate-200">
                                <Icon className="h-6 w-6" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1 text-sm">
                                {report.incident_type}
                            </h4>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span className="truncate">{report.location}</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-600">{report.ai_category}</span>
                            <Badge variant="outline" className={cn(
                                report.visibility === 'private' ? 'border-purple-200 bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600'
                            )}>
                                {report.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 max-w-[180px]">
                                <SeverityBar score={report.ai_severity} />
                            </div>
                            <span className="text-[11px] text-muted-foreground">{report.submitted_at}</span>
                        </div>
                        {report.priority_reason && (
                            <p className="text-[10px] text-blue-700 bg-blue-50/60 px-2 py-1 rounded border border-blue-100 flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3 shrink-0" />
                                <span className="truncate">{report.priority_reason}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end pt-1 text-xs font-bold text-blue-700 group-hover:underline">
                        <span>Inspect & Review</span>
                        <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}