import { Link } from '@inertiajs/react';
import { Droplets, Flame, Lightbulb, MapPin, Trash2, Volume2, Waves, ArrowUpRight, GitMerge, ShieldAlert } from 'lucide-react';
import PriorityBar from '@/Components/admin/PriorityBar';
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
    report: AdminReport & { rank?: number };
    scoreDisplay: 'severity' | 'priority';
    maxUpvotes: number;
};

export default function ReportQueueCard({ report, scoreDisplay, maxUpvotes }: Props) {
    const Icon = typeIcons[report.type_icon as keyof typeof typeIcons] ?? Flame;

    return (
        <Link href={`/admin/reports/${report.concern_id}`} className="block group">
            <Card className="shadow-2xs transition-all duration-200 hover:shadow-md hover:border-blue-300 border-slate-200/80 bg-white rounded-3xl">
                <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            {report.rank && (
                                <span className="inline-flex items-center justify-center bg-blue-600 text-white rounded-xl h-7 px-2.5 text-xs font-black shadow-2xs">
                                    #{report.rank}
                                </span>
                            )}
                            <span className="text-xs font-mono font-bold text-slate-400">{report.id}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <Badge variant="outline" className={cn("text-[11px] capitalize px-3 py-1 font-bold", queueStyle[report.queue_status])}>
                                {queueLabel[report.queue_status]}
                            </Badge>

                            {report.has_duplicate_candidate && !report.is_duplicate && (
                                <Badge className="bg-amber-100 text-amber-950 border-amber-300 font-extrabold text-[10px] gap-1 px-2.5 py-1">
                                    <ShieldAlert className="h-3 w-3 text-amber-600" />
                                    {report.duplicate_similarity ? `${Math.round(report.duplicate_similarity * 100)}% Match` : 'Match'}
                                </Badge>
                            )}

                            {report.is_duplicate && (
                                <Badge className="bg-purple-100 text-purple-950 border-purple-300 font-extrabold text-[10px] gap-1 px-2.5 py-1">
                                    <GitMerge className="h-3 w-3 text-purple-600" />
                                    Merged
                                </Badge>
                            )}

                            {report.is_merged_master && (
                                <Badge className="bg-blue-100 text-blue-950 border-blue-300 font-extrabold text-[10px] gap-1 px-2.5 py-1">
                                    <GitMerge className="h-3 w-3 text-blue-600" />
                                    Master ({report.merged_duplicates_count})
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-4 pt-1">
                        {report.images && report.images.length > 0 ? (
                            <img 
                                src={report.images[0]} 
                                alt="Report Preview" 
                                className="h-14 w-14 shrink-0 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                            />
                        ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 border border-slate-200">
                                <Icon className="h-6 w-6" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1 text-sm">
                                {report.incident_type}
                            </h4>
                            <p className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                                <span className="truncate">{report.location}</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-600">{report.ai_category}</span>
                            <Badge variant="outline" className={cn(
                                report.visibility === 'private' ? 'border-purple-200 bg-purple-50 text-purple-700 font-bold px-2 py-0.5' : 'text-slate-600 px-2 py-0.5'
                            )}>
                                {report.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 max-w-[200px]">
                                {scoreDisplay === 'severity' ? (
                                    <SeverityBar score={report.ai_severity} />
                                ) : (
                                    <PriorityBar score={report.upvotes_count ?? 0} maxScore={maxUpvotes} />
                                )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-semibold">{report.submitted_at}</span>
                        </div>
                        {scoreDisplay === 'priority' && (
                            <p className="text-[11px] text-blue-700 font-medium">
                                {report.upvotes_count ?? 0} community {(report.upvotes_count ?? 0) === 1 ? 'upvote' : 'upvotes'}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end pt-2 text-xs font-black text-blue-700 group-hover:underline">
                        <span>Inspect & Review</span>
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}