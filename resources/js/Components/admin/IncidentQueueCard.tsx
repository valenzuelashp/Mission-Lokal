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
        <Link href={`/admin/reports/${incident.concern_id}`} className="block group">
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-neutral-400/60 group-hover:shadow-md active:scale-[0.995]">
                <CardContent className="space-y-3 p-4.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 group-hover:text-neutral-900 transition-colors">
                            {incident.id}
                        </span>
                        <Badge
                            className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                                incident.status === 'ongoing'
                                    ? 'bg-neutral-900 text-white border-transparent shadow-xs'
                                    : incident.status === 'done'
                                      ? 'bg-neutral-50 text-neutral-500 border-neutral-200/40 line-through decoration-neutral-300'
                                      : 'bg-white text-neutral-600 border-neutral-200'
                            }`}
                        >
                            {incident.status === 'ongoing' ? 'Ongoing' : incident.status === 'done' ? 'Done' : 'Seen'}
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-0.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50/50 text-neutral-800">
                            <Icon className="h-3.5 w-3.5 shrink-0 stroke-[2]" />
                        </div>
                        <p className="font-black text-sm tracking-tight text-neutral-900 leading-snug">{incident.incident_type}</p>
                    </div>
                    
                    <p className="flex items-start gap-1.5 text-xs font-medium text-neutral-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{incident.location}</span>
                    </p>
                    
                    <div className="flex items-center justify-between gap-4 pt-1 border-t border-neutral-100/60">
                        <Badge
                            variant="outline"
                            className={`rounded-lg border px-2 py-0.5 font-black text-[9px] uppercase tracking-widest ${
                                incident.priority === 'high'
                                    ? 'border-neutral-900 bg-neutral-900 text-white'
                                    : incident.priority === 'med'
                                      ? 'border-neutral-300 bg-neutral-50 text-neutral-700'
                                      : 'border-neutral-200 bg-white text-neutral-400'
                            }`}
                        >
                            {incident.priority === 'med' ? 'Med' : incident.priority} priority
                        </Badge>
                        <div className="w-24 shrink-0 transform scale-90 origin-right">
                            <SeverityBar score={incident.ai_severity} />
                        </div>
                    </div>
                    
                    <p className="text-right text-[11px] font-black uppercase tracking-widest text-neutral-900 pt-1 leading-none group-hover:translate-x-0.5 transition-transform">
                        Inspect file →
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}