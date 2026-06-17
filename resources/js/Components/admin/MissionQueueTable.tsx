import { Link } from '@inertiajs/react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
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
    assigned: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    acknowledged: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
    in_progress: 'bg-red-600 text-white hover:bg-red-600',
    completed: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    verified: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    cancelled: 'bg-slate-100 text-slate-500 hover:bg-slate-100',
};

type Props = {
    missions: AdminMission[];
};

export default function MissionQueueTable({ missions }: Props) {
    return (
        <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[900px] text-sm">
                <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3">Mission ID</th>
                        <th className="px-4 py-3">Concern</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Assigned to</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Due</th>
                        <th className="px-4 py-3">Flags</th>
                        <th className="px-4 py-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {missions.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                                No missions in this queue.
                            </td>
                        </tr>
                    ) : (
                        missions.map((row) => (
                            <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                                <td className="px-4 py-3 font-medium text-blue-700">{row.id}</td>
                                <td className="max-w-[180px] px-4 py-3">
                                    <p className="font-medium leading-snug">{row.concern_title}</p>
                                    <p className="text-xs text-muted-foreground">{row.concern_id}</p>
                                </td>
                                <td className="max-w-[140px] truncate px-4 py-3 text-muted-foreground" title={row.location}>
                                    {row.location}
                                </td>
                                <td className="px-4 py-3">
                                    {row.assignee ? (
                                        <span className="font-medium">{row.assignee}</span>
                                    ) : (
                                        <span className="text-amber-600">Unassigned</span>
                                    )}
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
                                        {row.is_overdue && (
                                            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                                                <Clock className="mr-1 h-3 w-3" />
                                                Overdue
                                            </Badge>
                                        )}
                                        {row.is_escalated && (
                                            <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                                                <AlertTriangle className="mr-1 h-3 w-3" />
                                                Escalated
                                            </Badge>
                                        )}
                                        {!row.is_overdue && !row.is_escalated && (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Button variant="ghost" className="h-auto p-0 text-blue-700 hover:bg-transparent" asChild>
                                        <Link href={`/admin/missions/${row.id.replace('#', '')}`}>Manage</Link>
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
