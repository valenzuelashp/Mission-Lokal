import { Link } from '@inertiajs/react';
import { UserCheck } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { rowNavProps, stopRowNav } from '@/Lib/tableRow';
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
    onOpenAssign?: (mission: AdminMission) => void;
};

export default function MissionQueueTable({ missions, onOpenAssign }: Props) {
    if (missions.length === 0) {
        return <p className="py-10 text-center text-sm text-muted-foreground">No missions in this queue.</p>;
    }

    return (
        <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Mission ID</th>
                        <th className="px-4 py-3">Title & Location</th>
                        <th className="px-4 py-3">Personnel(s) Assigned</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {missions.map((row: any) => {
                        const href = row.id ? `/admin/missions/${row.id}` : null;
                        return (
                            <tr
                                key={row.id}
                                className="cursor-pointer hover:bg-slate-50/50"
                                {...rowNavProps(href)}
                            >
                                <td className="px-4 py-3 font-medium text-blue-900">
                                    {row.display_id ?? `MS-${row.id.substring(0, 4).toUpperCase()}`}
                                </td>
                                <td className="px-4 py-3">
                                    <Link href={`/admin/missions/${row.id}`} onClick={stopRowNav} className="font-medium text-blue-900 hover:underline">
                                        {row.concern_title}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">{row.location}</p>
                                </td>
                                <td className="px-4 py-3">
                                    {row.assignee ? (
                                        <span className="font-medium text-slate-800">{row.assignee}</span>
                                    ) : (
                                        <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-1 rounded">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        variant="outline"
                                        className={
                                            row.priority === 'high'
                                                ? 'border-red-200 bg-red-50 text-red-700'
                                                : 'border-amber-200 bg-amber-50 text-amber-700'
                                        }
                                    >
                                        {row.priority === 'med' ? 'Med' : row.priority.toUpperCase()}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge className={statusStyle[row.status as MissionStatus]}>{statusLabel[row.status as MissionStatus] ?? row.status}</Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2" onClick={stopRowNav}>
                                        {onOpenAssign && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                                onClick={() => onOpenAssign(row)}
                                            >
                                                <UserCheck className="mr-1 h-3.5 w-3.5" />
                                                Assign
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                                            <Link href={`/admin/missions/${row.id}`}>
                                                Manage
                                            </Link>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}