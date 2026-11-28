import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowUpRight, CalendarDays, Clock3, MapPin, Users } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminMission, MissionStatus } from '@/Types';
import { missionQueueHref } from '@/Lib/missionRef';
import { cn } from '@/Lib/utils';

const statusLabel: Record<MissionStatus, string> = {
    assigned: 'Assigned',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    completed: 'Work Submitted',
    verified: 'Verified & Closed',
    cancelled: 'Cancelled',
};

const statusStyle: Record<MissionStatus, string> = {
    assigned: 'border-blue-100 bg-blue-50/70 text-blue-800',
    acknowledged: 'border-sky-100 bg-sky-50/70 text-sky-800',
    in_progress: 'border-indigo-100 bg-indigo-50/70 text-indigo-800',
    completed: 'border-amber-100 bg-amber-50/70 text-amber-800',
    verified: 'border-emerald-100 bg-emerald-50/70 text-emerald-800',
    cancelled: 'border-slate-200/70 bg-slate-100/70 text-slate-700',
};

type Props = {
    mission: AdminMission & { rank?: number };
    onOpenAssign?: (mission: AdminMission) => void;
};

export default function MissionQueueCard({ mission, onOpenAssign }: Props) {
    const href = missionQueueHref(mission);

    return (
        <Card className="group overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-2xs transition-all duration-200 hover:border-blue-300 hover:shadow-md">
            <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        {mission.rank && (
                            <span className="inline-flex h-7 items-center justify-center rounded-xl bg-blue-600 px-2.5 text-xs font-black text-white shadow-2xs">
                                #{mission.rank}
                            </span>
                        )}
                        <span className="font-mono text-xs font-bold text-slate-400">{mission.display_id ?? mission.id}</span>
                    </div>
                    <Badge variant="outline" className={cn('shrink-0 px-3 py-1 text-[11px] font-bold', statusStyle[mission.status])}>
                        {statusLabel[mission.status]}
                    </Badge>
                </div>

                <div className="flex items-start gap-4 pt-1">
                    <div className="min-w-0 flex-1">
                        <Link href={href} className="line-clamp-2 text-sm font-extrabold text-slate-900 transition-colors hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                            {mission.concern_title}
                        </Link>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                            <span className="truncate">{mission.location}</span>
                        </p>
                    </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-slate-600">
                            <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="truncate">{mission.assignee || 'No personnel assigned'}</span>
                        </span>
                        <div className="flex shrink-0 items-center gap-2">
                            {onOpenAssign && (
                                <button type="button" className="text-[10px] font-bold text-blue-700 hover:underline" onClick={() => onOpenAssign(mission)}>
                                    {mission.assignee ? 'Change team' : 'Assign team'}
                                </button>
                            )}
                            <span className="flex items-center gap-1.5 text-slate-500">
                                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                {mission.due_date || 'Not set'}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className={cn('px-2 py-0.5 text-[10px] font-bold', mission.priority === 'high'
                        ? 'border-rose-100 bg-rose-50/70 text-rose-800'
                        : mission.priority === 'low'
                            ? 'border-slate-200/70 bg-slate-50 text-slate-700'
                            : 'border-amber-100 bg-amber-50/70 text-amber-800')}>
                        {mission.priority === 'med' ? 'Medium priority' : `${mission.priority} priority`}
                    </Badge>
                    {mission.department_label && <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-medium text-slate-600">{mission.department_label}</Badge>}
                    {mission.is_overdue && <Badge variant="outline" className="gap-1 border-rose-100 bg-rose-50/70 px-2 py-0.5 text-[10px] font-bold text-rose-800"><Clock3 className="h-3 w-3" />Overdue</Badge>}
                    {mission.is_escalated && <Badge variant="outline" className="gap-1 border-orange-100 bg-orange-50/70 px-2 py-0.5 text-[10px] font-bold text-orange-800"><AlertTriangle className="h-3 w-3" />Escalated</Badge>}
                    </div>
                </div>

                <div className="flex items-center justify-end pt-2 text-xs font-black text-blue-700 group-hover:underline">
                    <Link href={href} className="inline-flex items-center hover:underline">
                        <span>Open mission</span>
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
