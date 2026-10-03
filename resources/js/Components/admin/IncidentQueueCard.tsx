import { Link } from '@inertiajs/react';
import { Droplets, Flame, Lightbulb, MapPin, Trash2, Volume2, Waves, ArrowUpRight } from 'lucide-react';
import SeverityBar from '@/Components/admin/SeverityBar';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminIncident } from '@/Types';
import { cn } from '@/Lib/utils';

const typeIcons: Record<string, typeof Flame> = {
    fire: Flame,
    flood: Waves,
    waste: Trash2,
    noise: Volume2,
    drainage: Droplets,
    light: Lightbulb,
};

type Props = {
    incident: AdminIncident;
};

export default function IncidentQueueCard({ incident }: Props) {
    const Icon = typeIcons[incident.type_icon] ?? Flame;

    return (
        <Link href={`/admin/reports/${incident.concern_id}`} className="block group">
            <Card className="shadow-xs transition-all duration-200 hover:shadow-md hover:border-blue-300 border-slate-200/80 bg-white">
                <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-blue-700">{incident.display_id ?? incident.id}</span>
                        <Badge
                            className={cn(
                                "text-[11px] font-bold px-2.5 py-0.5",
                                incident.status === 'ongoing'
                                    ? 'bg-red-600 text-white'
                                    : incident.status === 'done'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                            )}
                        >
                            {incident.status === 'ongoing' ? '● Ongoing' : incident.status === 'done' ? '✓ Resolved' : '○ Seen'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                            <Icon className="h-4 w-4" />
                        </div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors text-sm">{incident.incident_type}</p>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{incident.location}</span>
                    </p>
                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[11px] font-bold",
                                incident.priority === 'high'
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : incident.priority === 'med'
                                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-700'
                            )}
                        >
                            {incident.priority === 'med' ? 'Med Priority' : `${incident.priority.toUpperCase()} Priority`}
                        </Badge>
                        <div className="w-28">
                            <SeverityBar score={incident.ai_severity} />
                        </div>
                    </div>
                    <div className="flex items-center justify-end pt-1 text-xs font-bold text-blue-700 group-hover:underline">
                        <span>View Details</span>
                        <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}