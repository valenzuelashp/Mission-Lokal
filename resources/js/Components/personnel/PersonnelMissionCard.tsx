import { Link } from '@inertiajs/react';
import { AlertTriangle, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import MissionStatusBadge from '@/Components/personnel/MissionStatusBadge';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import type { PersonnelMission } from '@/Types';

type Props = {
    mission: PersonnelMission;
};

export default function PersonnelMissionCard({ mission }: Props) {
    return (
        <Link href={`/personnel/missions/${mission.id}`} className="block group">
            <Card className="shadow-xs transition-all duration-200 hover:shadow-md hover:border-emerald-300 border-slate-200/80 bg-white">
                <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-700">{mission.id}</span>
                        <MissionStatusBadge status={mission.status} />
                    </div>
                    <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">{mission.title}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-2">{mission.location}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-slate-100">
                        <Badge
                            variant="outline"
                            className={
                                mission.priority === 'high'
                                    ? 'border-red-200 bg-red-50 text-red-700 font-bold'
                                    : 'border-amber-200 bg-amber-50 text-amber-700 font-bold'
                            }
                        >
                            {mission.priority === 'med' ? 'Medium Priority' : `${mission.priority.toUpperCase()} Priority`}
                        </Badge>
                        <span className="text-muted-foreground ml-auto">Due {mission.due_date}</span>
                        
                        {mission.is_overdue && !['completed', 'verified', 'cancelled'].includes(mission.status) && (
                            <span className="flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                <Clock className="h-3 w-3" /> Overdue
                            </span>
                        )}
                        {mission.visibility === 'private' && (
                            <span className="flex items-center gap-1 font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                                <AlertTriangle className="h-3 w-3" /> Private Case
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-end pt-1 text-xs font-bold text-emerald-700 group-hover:underline">
                        <span>Execute Mission</span>
                        <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}