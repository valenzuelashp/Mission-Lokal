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
    assigned: 'bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-100',
    acknowledged: 'bg-neutral-50 text-neutral-600 border-neutral-200/40 hover:bg-neutral-50',
    in_progress: 'bg-neutral-900 text-white border-transparent hover:bg-neutral-900 shadow-xs',
    completed: 'bg-neutral-50 text-neutral-500 border-neutral-200/40 hover:bg-neutral-50 line-through decoration-neutral-300',
    verified: 'bg-neutral-900 text-neutral-100 border-transparent hover:bg-neutral-900 font-black',
    cancelled: 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-100 opacity-60',
};

type Props = {
    mission: AdminMission;
};

export default function MissionQueueCard({ mission }: Props) {
    return (
        <Link href={`/admin/missions/${mission.id.replace('#', '')}`} className="block group">
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-neutral-400/60 group-hover:shadow-md active:scale-[0.995]">
                <CardContent className="space-y-3 p-4.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 group-hover:text-neutral-900 transition-colors">
                            {mission.id}
                        </span>
                        <Badge className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all ${statusStyle[mission.status]}`}>
                            {statusLabel[mission.status]}
                        </Badge>
                    </div>
                    
                    <p className="font-black text-sm tracking-tight text-neutral-900 leading-snug">{mission.concern_title}</p>
                    
                    <p className="flex items-start gap-1.5 text-xs font-medium text-neutral-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{mission.location}</span>
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[10px] font-black uppercase tracking-wider border-t border-neutral-100/60">
                        <Badge
                            variant="outline"
                            className={`rounded-lg border px-2 py-0.5 font-black text-[9px] uppercase tracking-widest ${
                                mission.priority === 'high'
                                    ? 'border-neutral-900 bg-neutral-900 text-white'
                                    : mission.priority === 'med'
                                      ? 'border-neutral-300 bg-neutral-50 text-neutral-700'
                                      : 'border-neutral-200 bg-white text-neutral-400'
                            }`}
                        >
                            {mission.priority === 'med' ? 'Med' : mission.priority} priority
                        </Badge>
                        
                        <span className="text-neutral-800 font-bold tracking-tight">
                            {mission.assignee ? mission.assignee : 'Unassigned node'}
                        </span>
                        
                        <span className="text-neutral-400 font-medium lowercase tracking-tight normal-case text-xs">
                            due {mission.due_date}
                        </span>
                        
                        {mission.is_overdue && (
                            <span className="flex items-center gap-1 font-black text-neutral-900 bg-neutral-100 border border-neutral-200 rounded-lg px-1.5 py-0.5 text-[9px]">
                                <Clock className="h-3 w-3" />
                                Overdue
                            </span>
                        )}
                        {mission.is_escalated && (
                            <span className="flex items-center gap-1 font-black text-neutral-600 bg-neutral-50 border border-neutral-200/60 rounded-lg px-1.5 py-0.5 text-[9px]">
                                <AlertTriangle className="h-3 w-3 text-neutral-400" />
                                Escalated
                            </span>
                        )}
                    </div>
                    
                    <p className="text-right text-[11px] font-black uppercase tracking-widest text-neutral-900 pt-1 leading-none group-hover:translate-x-0.5 transition-transform">
                        Manage file →
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}