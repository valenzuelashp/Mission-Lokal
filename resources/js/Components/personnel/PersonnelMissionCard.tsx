import { Link } from '@inertiajs/react';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import MissionStatusBadge from '@/Components/personnel/MissionStatusBadge';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import type { PersonnelMission } from '@/Types';

type Props = {
    mission: PersonnelMission;
};

export default function PersonnelMissionCard({ mission }: Props) {
    return (
        <Link href={`/personnel/missions/${mission.id}`}>
            <Card className="shadow-sm transition-shadow active:shadow-md">
                <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-blue-700">{mission.id}</span>
                        <MissionStatusBadge status={mission.status} />
                    </div>
                    <p className="font-semibold leading-snug">{mission.title}</p>
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
                        <span className="text-muted-foreground">Due {mission.due_date}</span>
                        {mission.is_overdue && !['completed', 'verified', 'cancelled'].includes(mission.status) && (
                            <span className="flex items-center gap-1 font-medium text-red-600">
                                <Clock className="h-3 w-3" />
                                Overdue
                            </span>
                        )}
                        {mission.visibility === 'private' && (
                            <span className="flex items-center gap-1 text-orange-700">
                                <AlertTriangle className="h-3 w-3" />
                                Private
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
