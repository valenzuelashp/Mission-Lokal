import { Link } from '@inertiajs/react';
import { AlertTriangle, Clock } from 'lucide-react';
import PersonnelMissionCard from '@/Components/personnel/PersonnelMissionCard';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import type { MissionStatus, PersonnelMission } from '@/Types';

const statusLabel: Record<MissionStatus, string> = {
    assigned: 'Assigned',
    acknowledged: 'Acknowledged',
    in_progress: 'In progress',
    completed: 'Completed',
    verified: 'Verified',
    cancelled: 'Cancelled',
};

const statusStyle: Record<MissionStatus, string> = {
    assigned: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    acknowledged: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
    in_progress: 'bg-red-600 text-white hover:bg-red-600',
    completed: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    verified: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    cancelled: 'bg-slate-100 text-slate-500 hover:bg-slate-100',
};

type Props = {
    missions: PersonnelMission[];
};

export default function PersonnelMissionTable({ missions }: Props) {
    if (missions.length === 0) {
        return <p className="py-10 text-center text-sm text-muted-foreground">No missions in this queue.</p>;
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {missions.map((mission) => (
                    <PersonnelMissionCard key={mission.id} mission={mission} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
                <table className="w-full min-w-[800px] text-sm">
                    <thead>
                        <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <th className="px-4 py-3">Mission ID</th>
                            <th className="px-4 py-3">Concern</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Priority</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Due</th>
                            <th className="px-4 py-3">Flags</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {missions.map((row) => (
                            <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {/* Show the first image if it exists, otherwise show a gray placeholder box */}
                                        {row.images && row.images.length > 0 ? (
                                            <img 
                                                src={row.images[0]} 
                                                alt="Concern" 
                                                className="h-10 w-10 shrink-0 rounded object-cover border border-slate-200"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 shrink-0 rounded bg-slate-100 border border-slate-200" />
                                        )}
                                        
                                        <div>
                                            <div className="font-medium text-blue-900">{row.id}</div>
                                            <div className="text-sm text-muted-foreground">{row.title}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="max-w-[180px] px-4 py-3">
                                    <p className="text-xs text-muted-foreground">{row.concern_id}</p>
                                </td>
                                <td className="max-w-[140px] truncate px-4 py-3 text-muted-foreground" title={row.location}>
                                    {row.location}
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
                                    <Badge className={statusStyle[row.status]}>{statusLabel[row.status]}</Badge>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                                    {row.due_date}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {row.is_overdue && !['completed', 'verified', 'cancelled'].includes(row.status) && (
                                            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                                                <Clock className="mr-1 h-3 w-3" />
                                                Overdue
                                            </Badge>
                                        )}
                                        {row.visibility === 'private' && (
                                            <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                                                <AlertTriangle className="mr-1 h-3 w-3" />
                                                Private
                                            </Badge>
                                        )}
                                        {!row.is_overdue && row.visibility !== 'private' && (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Button variant="ghost" className="h-auto p-0 text-blue-700 hover:bg-transparent" asChild>
                                        <Link href={`/personnel/missions/${row.id}`}>Open</Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
