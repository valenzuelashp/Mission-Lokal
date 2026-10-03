import { Link } from '@inertiajs/react';
import { Droplets, Flame, Lightbulb, Trash2, Volume2, Waves, ChevronRight } from 'lucide-react';
import IncidentQueueCard from '@/Components/admin/IncidentQueueCard';
import SeverityBar from '@/Components/admin/SeverityBar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { rowNavProps, stopRowNav } from '@/Lib/tableRow';
import type { AdminIncident } from '@/Types';
import { cn } from '@/Lib/utils';

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
            <div className="py-16 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
                <p className="text-sm font-semibold text-muted-foreground">No active incidents in queue.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {incidents.map((incident) => (
                    <IncidentQueueCard key={incident.id} incident={incident} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-card shadow-xs md:block">
                <table className="w-full min-w-[880px] text-sm text-left">
                    <thead>
                        <tr className="border-b bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-5 py-3.5 w-28">ID Code</th>
                            <th className="px-4 py-3.5">Incident Type</th>
                            <th className="px-4 py-3.5">Location</th>
                            <th className="px-4 py-3.5 w-40">AI Severity</th>
                            <th className="px-4 py-3.5 w-32">Priority</th>
                            <th className="px-4 py-3.5 w-32">Status</th>
                            <th className="px-4 py-3.5 text-right w-28">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {incidents.map((row) => {
                            const Icon = typeIcons[row.type_icon] ?? Flame;
                            const href = `/admin/reports/${row.concern_id}`;
                            return (
                                <tr
                                    key={row.id}
                                    className="cursor-pointer border-b last:border-0 hover:bg-blue-50/30 transition-colors group"
                                    {...rowNavProps(href)}
                                >
                                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-blue-700">
                                        <Link href={href} onClick={stopRowNav} className="hover:underline">
                                            {row.display_id ?? row.id}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{row.incident_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-600 text-xs truncate max-w-[200px]" title={row.location}>{row.location}</td>
                                    <td className="px-4 py-3.5">
                                        <SeverityBar score={row.ai_severity} />
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs font-bold",
                                                row.priority === 'high'
                                                    ? 'border-red-200 bg-red-50 text-red-700'
                                                    : row.priority === 'med'
                                                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                    : 'border-slate-200 bg-slate-50 text-slate-700'
                                            )}
                                        >
                                            {row.priority === 'med' ? 'Med' : row.priority.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <Badge
                                            className={cn(
                                                "text-xs font-bold px-2.5 py-0.5",
                                                row.status === 'ongoing'
                                                    ? 'bg-red-600 text-white'
                                                    : row.status === 'done'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                            )}
                                        >
                                            {row.status === 'ongoing' ? '● Ongoing' : row.status === 'done' ? '✓ Resolved' : '○ Seen'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold bg-white text-blue-700 hover:bg-blue-50 border-blue-200 shadow-2xs" asChild>
                                            <Link href={href} onClick={stopRowNav}>
                                                View
                                                <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                            </Link>
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