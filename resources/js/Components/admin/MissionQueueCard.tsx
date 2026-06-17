import { Link } from '@inertiajs/react';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminMission, MissionStatus } from '@/Types';

const statusLabel: Record<MissionStatus, string> = {
    assigned: 'Assigned',
    acknowledged: 'Acknowledged',
    in_progress: 'In progress',
    completed: 'Completed',
    verified: 'Verified',
    cancelled: 'Cancelled',
};

const statusStyle: Record<MissionStatus, string> = {
    assigned: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    acknowledged: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
    in_progress: 'bg-red-600 text-white hover:bg-red-600',
    completed: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    verified: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    cancelled: 'bg-slate-100 text-slate-500 hover:bg-slate-100',
};

type Props = {
    mission: AdminMission;
};

export default function MissionQueueCard({ mission }: Props) {
    return (
        <Link href={`/admin/missions/${mission.id.replace('#', '')}`}>
            <Card className="shadow-sm transition-shadow active:shadow-md">
                <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-blue-700">{mission.id}</span>
                        <Badge className={statusStyle[mission.status]}>{statusLabel[mission.status]}</Badge>
                    </div>
                    <p className="font-semibold leading-snug">{mission.concern_title}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-2">{mission.location}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge
                            variant="outline"
                            className={
                                mission.priority === 'high'
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : mission.priority === 'med'
                                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                                      : ''
                            }
                        >
                            {mission.priority === 'med' ? 'Med' : mission.priority} priority
                        </Badge>
                        <span className="text-muted-foreground">
                            {mission.assignee ? mission.assignee : 'Unassigned'}
                        </span>
                        <span className="text-muted-foreground">Due {mission.due_date}</span>
                        {mission.is_overdue && (
                            <span className="flex items-center gap-1 font-medium text-red-600">
                                <Clock className="h-3 w-3" />
                                Overdue
                            </span>
                        )}
                        {mission.is_escalated && (
                            <span className="flex items-center gap-1 text-orange-700">
                                <AlertTriangle className="h-3 w-3" />
                                Escalated
                            </span>
                        )}
                    </div>
                    <p className="text-right text-sm font-medium text-blue-700">Manage →</p>
                </CardContent>
            </Card>
        </Link>
    );
}
