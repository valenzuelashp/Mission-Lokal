import { Link } from '@inertiajs/react';
import { Droplets, Flame, Lightbulb, Trash2, Volume2, Waves } from 'lucide-react';
import IncidentQueueCard from '@/Components/admin/IncidentQueueCard';
import SeverityBar from '@/Components/admin/SeverityBar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
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
    incidents: AdminIncident[];
};

export default function IncidentQueueTable({ incidents }: Props) {
    if (incidents.length === 0) {
        return (
            <p className="py-12 text-center text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50/30 rounded-2xl border border-dashed border-neutral-200">
                Zero telemetry profiles logged in active queues.
            </p>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {incidents.map((incident) => (
                    <IncidentQueueCard key={incident.id} incident={incident} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm md:block">
                <table className="w-full min-w-[800px] text-xs font-bold tracking-tight text-neutral-700">
                    <thead>
                        <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            <th className="px-5 py-4">Report ID</th>
                            <th className="px-5 py-4 w-[30%]">Incident metadata</th>
                            <th className="px-5 py-4">Location threshold</th>
                            <th className="px-5 py-4">AI Criticality index</th>
                            <th className="px-5 py-4">Priority level</th>
                            <th className="px-5 py-4">Workflow status</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {incidents.map((row) => {
                            const Icon = typeIcons[row.type_icon] ?? Flame;
                            return (
                                <tr key={row.id} className="group transition-colors hover:bg-neutral-50/40">
                                    <td className="px-5 py-4 font-black text-neutral-900 tracking-wider">
                                        {row.id}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50/60 text-neutral-800">
                                                <Icon className="h-3.5 w-3.5 shrink-0 stroke-[2]" />
                                            </div>
                                            <span className="font-black text-neutral-900 tracking-tight">{row.incident_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 font-medium text-neutral-500 leading-relaxed">{row.location}</td>
                                    <td className="px-5 py-4">
                                        <div className="w-28 transform scale-95 origin-left">
                                            <SeverityBar score={row.ai_severity} />
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Badge
                                            variant="outline"
                                            className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                                                row.priority === 'high'
                                                    ? 'border-neutral-900 bg-neutral-900 text-white'
                                                    : row.priority === 'med'
                                                      ? 'border-neutral-300 bg-neutral-50 text-neutral-700'
                                                      : 'border-neutral-200 bg-white text-neutral-400'
                                            }`}
                                        >
                                            {row.priority === 'med' ? 'Med' : row.priority.charAt(0).toUpperCase() + row.priority.slice(1)}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Badge
                                            className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-2xs transition-all ${
                                                row.status === 'ongoing'
                                                    ? 'bg-neutral-900 text-white border-transparent'
                                                    : row.status === 'done'
                                                      ? 'bg-neutral-50 text-neutral-500 border-neutral-200/40 line-through decoration-neutral-300'
                                                      : 'bg-white text-neutral-600 border-neutral-200'
                                            }`}
                                        >
                                            {row.status === 'ongoing' ? 'Ongoing' : row.status === 'done' ? 'Done' : 'Seen'}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Button variant="ghost" className="h-8 rounded-xl border border-neutral-200 bg-white px-3 text-[11px] font-black uppercase tracking-wider shadow-sm hover:bg-neutral-50 text-neutral-900 transition-all active:scale-95" asChild>
                                            <Link href={`/admin/reports/${row.concern_id}`}>Inspect file</Link>
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}