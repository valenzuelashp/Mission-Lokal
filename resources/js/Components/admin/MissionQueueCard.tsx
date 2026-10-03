import { Link } from '@inertiajs/react';
import { AlertTriangle, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminMission, MissionStatus } from '@/Types';
import { cn } from '@/Lib/utils';

const statusLabel: Record<MissionStatus, string> = {
    assigned: 'Assigned',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    completed: 'Completed Work',
    verified: 'Verified & Closed',
    cancelled: 'Cancelled',
};

const statusStyle: Record<MissionStatus, string> = {
    assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    acknowledged: 'bg-sky-50 text-sky-700 border-sky-200',
    in_progress: 'bg-red-600 text-white font-bold',
    completed: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

type Props = {
    mission: AdminMission;
};

export default function MissionQueueCard({ mission }: Props) {
    return (
        <Link href={`/admin/missions/${mission.id.replace('#', '')}`} className="block group">
            <Card className="shadow-xs transition-all duration-200 hover:shadow-md hover:border-blue-300 border-slate-200/80 bg-white">
                <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-blue-700">{mission.display_id ?? mission.id}</span>
                        <Badge variant="outline" className={cn("text-[11px] capitalize px-2.5 py-0.5", statusStyle[mission.status])}>
                            {statusLabel[mission.status]}
                        </Badge>
                    </div>
                    
                    <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors text-sm">{mission.concern_title}</p>
                    
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-2">{mission.location}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-slate-100">
                        <Badge
                            variant="outline"
                            className={cn(
                                "font-bold text-[11px]",
                                mission.priority === 'high'
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : 'border-amber-200 bg-amber-50 text-amber-700'
                            )}
                        >
                            {mission.priority === 'med' ? 'Medium Priority' : `${mission.priority.toUpperCase()} Priority`}
                        </Badge>
                        <span className="text-slate-600 font-medium">
                            {mission.assignee ? `Unit: ${mission.assignee}` : '⚠️ Unassigned'}
                        </span>
                        <span className="text-muted-foreground ml-auto">Due {mission.due_date}</span>
                    </div>

                    {(mission.is_overdue || mission.is_escalated) && (
                        <div className="flex gap-2 pt-1 text-xs">
                            {mission.is_overdue && (
                                <span className="flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                    <Clock className="h-3 w-3" /> Overdue
                                </span>
                            )}
                            {mission.is_escalated && (
                                <span className="flex items-center gap-1 font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                                    <AlertTriangle className="h-3 w-3" /> Escalated
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-end pt-1 text-xs font-bold text-blue-700 group-hover:underline">
                        <span>Manage Mission</span>
                        <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}