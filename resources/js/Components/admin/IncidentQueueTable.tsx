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
        return <p className="py-10 text-center text-sm text-muted-foreground">No active incidents.</p>;
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {incidents.map((incident) => (
                    <IncidentQueueCard key={incident.id} incident={incident} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
                <table className="w-full min-w-[800px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Incident type</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">AI severity</th>
                            <th className="px-4 py-3">Priority</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.map((row) => {
                            const Icon = typeIcons[row.type_icon] ?? Flame;
                            return (
                                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                                    <td className="px-4 py-3 font-medium text-blue-700">{row.id}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            {row.incident_type}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{row.location}</td>
                                    <td className="px-4 py-3">
                                        <SeverityBar score={row.ai_severity} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant="outline"
                                            className={
                                                row.priority === 'high'
                                                    ? 'border-red-200 bg-red-50 text-red-700'
                                                    : row.priority === 'med'
                                                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                      : 'border-slate-200 bg-slate-50'
                                            }
                                        >
                                            {row.priority === 'med' ? 'Med' : row.priority.charAt(0).toUpperCase() + row.priority.slice(1)}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            className={
                                                row.status === 'ongoing'
                                                    ? 'bg-red-600 hover:bg-red-600'
                                                    : row.status === 'done'
                                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                                            }
                                        >
                                            {row.status === 'ongoing' ? 'Ongoing' : row.status === 'done' ? 'Done' : 'Seen'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button variant="ghost" className="h-auto p-0 text-blue-700 hover:bg-transparent" asChild>
                                            <Link href={`/admin/reports/${row.concern_id}`}>View details</Link>
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
