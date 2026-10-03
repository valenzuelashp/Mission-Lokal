import { Link } from '@inertiajs/react';
import { UserCheck, ChevronRight } from 'lucide-react';
import MissionQueueCard from '@/Components/admin/MissionQueueCard';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { rowNavProps, stopRowNav } from '@/Lib/tableRow';
import type { AdminMission, MissionStatus } from '@/Types';
import { cn } from '@/Lib/utils';

const statusLabel: Record<MissionStatus, string> = {
    assigned: 'Assigned',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    completed: 'Completed Work',
    verified: 'Verified & Closed',
    cancelled: 'Cancelled',
};

const statusStyle: Record<MissionStatus, string> = {
    assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    acknowledged: 'bg-sky-50 text-sky-700 border-sky-200',
    in_progress: 'bg-red-600 text-white font-bold',
    completed: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

type Props = {
    missions: (AdminMission & { rank?: number })[];
    onOpenAssign?: (mission: AdminMission) => void;
};

export default function MissionQueueTable({ missions, onOpenAssign }: Props) {
    if (missions.length === 0) {
        return (
            <div className="py-16 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
                <p className="text-sm font-semibold text-muted-foreground">No missions found in this queue.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {missions.map((mission) => (
                    <MissionQueueCard key={mission.id} mission={mission} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-card shadow-xs md:block">
                <table className="w-full min-w-[1020px] text-sm text-left">
                    <thead>
                        <tr className="border-b bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3.5 w-20">Rank</th>
                            <th className="px-4 py-3.5 w-32">Mission ID</th>
                            <th className="px-4 py-3.5">Title & Location</th>
                            <th className="px-4 py-3.5">Assigned Personnel</th>
                            <th className="px-4 py-3.5 w-36">Priority Tier</th>
                            <th className="px-4 py-3.5 w-40">Status</th>
                            <th className="px-4 py-3.5 text-right w-36">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {missions.map((row: any) => {
                            const href = row.id ? `/admin/missions/${row.id}` : null;
                            return (
                                <tr
                                    key={row.id}
                                    className="cursor-pointer border-b last:border-0 hover:bg-blue-50/30 transition-colors group"
                                    {...rowNavProps(href)}
                                >
                                    <td className="px-4 py-3.5">
                                        {row.rank ? (
                                            <span className="inline-flex items-center justify-center bg-blue-700 text-white rounded-md h-7 w-7 text-xs font-black shadow-2xs">
                                                #{row.rank}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-blue-700">
                                        {row.display_id ?? `MS-${row.id.substring(0, 4).toUpperCase()}`}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <Link href={`/admin/missions/${row.id}`} onClick={stopRowNav} className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors block">
                                            {row.concern_title}
                                        </Link>
                                        <p className="text-xs text-muted-foreground truncate max-w-[260px]">{row.location}</p>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {row.assignee ? (
                                            <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200">
                                                {row.assignee}
                                            </span>
                                        ) : (
                                            <span className="text-amber-700 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block">
                                                ⚠️ Unassigned
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs font-bold",
                                                row.priority === 'high'
                                                    ? 'border-red-200 bg-red-50 text-red-700'
                                                    : 'border-amber-200 bg-amber-50 text-amber-700'
                                            )}
                                        >
                                            {row.priority === 'med' ? 'Med Priority' : `${row.priority.toUpperCase()} Priority`}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <Badge variant="outline" className={cn("text-xs capitalize px-2.5 py-0.5", statusStyle[row.status as MissionStatus])}>
                                            {statusLabel[row.status as MissionStatus] ?? row.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <div className="flex justify-end gap-1.5" onClick={stopRowNav}>
                                            {onOpenAssign && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-2xs cursor-pointer"
                                                    onClick={() => onOpenAssign(row)}
                                                >
                                                    <UserCheck className="mr-1 h-3.5 w-3.5" />
                                                    Assign
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs cursor-pointer" asChild>
                                                <Link href={`/admin/missions/${row.id}`}>
                                                    Manage
                                                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
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
        </>
    );
}