import { Link } from '@inertiajs/react';
import { Droplets, Flame, Lightbulb, MapPin, Trash2, Volume2, Waves } from 'lucide-react';
import SeverityBar from '@/Components/admin/SeverityBar';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminIncident } from '@/Types';

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
        <Link href={`/admin/reports/${incident.concern_id}`}>
            <Card className="shadow-sm transition-shadow active:shadow-md">
                <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-blue-700">{incident.display_id ?? incident.id}</span>
                        <Badge
                            className={
                                incident.status === 'ongoing'
                                    ? 'bg-red-600 hover:bg-red-600'
                                    : incident.status === 'done'
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                            }
                        >
                            {incident.status === 'ongoing' ? 'Ongoing' : incident.status === 'done' ? 'Done' : 'Seen'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="font-semibold leading-snug">{incident.incident_type}</p>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {incident.location}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className={
                                incident.priority === 'high'
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : incident.priority === 'med'
                                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                                      : ''
                            }
                        >
                            {incident.priority === 'med' ? 'Med' : incident.priority} priority
                        </Badge>
                        <div className="max-w-[140px]">
                            <SeverityBar score={incident.ai_severity} />
                        </div>
                    </div>
                    <p className="text-right text-sm font-medium text-blue-700">View details →</p>
                </CardContent>
            </Card>
        </Link>
    );
}
