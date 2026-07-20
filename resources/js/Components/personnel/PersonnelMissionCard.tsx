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
        <Link href={`/personnel/missions/${mission.id}`} className="block group">
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-neutral-400/60 group-hover:shadow-md active:scale-[0.995]">
                <CardContent className="space-y-3 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 group-hover:text-neutral-900 transition-colors">
                            {mission.id}
                        </span>
                        <MissionStatusBadge status={mission.status} />
                    </div>
                    
                    <p className="font-black text-sm tracking-tight text-neutral-900 leading-snug">
                        {mission.title}
                    </p>
                    
                    <p className="flex items-start gap-1.5 text-xs font-medium text-neutral-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{mission.location}</span>
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-black uppercase tracking-wider">
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
                        
                        <span className="text-neutral-400 font-bold tracking-tight lowercase normal-case text-xs">
                            due {mission.due_date}
                        </span>
                        
                        {mission.is_overdue && !['completed', 'verified', 'cancelled'].includes(mission.status) && (
                            <span className="flex items-center gap-1 font-black text-neutral-900 bg-neutral-100 border border-neutral-200 rounded-lg px-1.5 py-0.5 text-[9px]">
                                <Clock className="h-3 w-3" />
                                Overdue
                            </span>
                        )}
                        
                        {mission.visibility === 'private' && (
                            <span className="flex items-center gap-1 font-black text-neutral-600 bg-neutral-50 border border-neutral-200/60 rounded-lg px-1.5 py-0.5 text-[9px]">
                                <AlertTriangle className="h-3 w-3 text-neutral-400" />
                                Private
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}