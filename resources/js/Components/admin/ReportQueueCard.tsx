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
    ai_processed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    under_review: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    active: 'bg-red-600 text-white hover:bg-red-600',
    rejected: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
    spam: 'bg-slate-100 text-slate-500 hover:bg-slate-100',
};

type Props = {
    report: AdminReport;
};

export default function ReportQueueCard({ report }: Props) {
    const Icon = typeIcons[report.type_icon] ?? Flame;

    return (
        <Link href={`/admin/reports/${report.concern_id}`}>
            <Card className="shadow-sm transition-shadow active:shadow-md">
                <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-blue-700">{report.id}</span>
                        <Badge className={queueStyle[report.queue_status]}>{queueLabel[report.queue_status]}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="font-semibold leading-snug">{report.incident_type}</p>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-2">{report.location}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{report.ai_category}</span>
                        <Badge
                            variant="outline"
                            className={
                                report.visibility === 'private'
                                    ? 'border-violet-200 bg-violet-50 text-violet-700'
                                    : ''
                            }
                        >
                            {report.visibility === 'private' ? 'Private' : 'Public'}
                        </Badge>
                        <span className="text-muted-foreground">{report.submitted_at}</span>
                    </div>
                    <div className="max-w-[200px]">
                        <SeverityBar score={report.ai_severity} />
                    </div>
                    <p className="text-right text-sm font-medium text-blue-700">Review →</p>
                </CardContent>
            </Card>
        </Link>
    );
}
