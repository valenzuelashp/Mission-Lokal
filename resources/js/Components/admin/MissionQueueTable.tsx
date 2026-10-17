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
            <div className="py-20 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
                <p className="text-sm font-semibold text-muted-foreground">No missions found in this queue.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 md:hidden">
                {missions.map((mission) => (
                    <MissionQueueCard key={mission.id} mission={mission} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-3xl border border-slate-200/80 bg-card shadow-2xs md:block">
                <table className="w-full min-w-[1020px] text-sm text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-black uppercase tracking-wider text-slate-400">
                            <th className="px-6 py-4 w-20">Rank</th>
                            <th className="px-6 py-4 w-36">Mission ID</th>
                            <th className="px-6 py-4">Title & Location</th>
                            <th className="px-6 py-4">Assigned Personnel</th>
                            <th className="px-6 py-4 w-36">Priority Tier</th>
                            <th className="px-6 py-4 w-44">Status</th>
                            <th className="px-6 py-4 text-right w-40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {missions.map((row: any) => {
                            const href = row.id ? `/admin/missions/${row.id}` : null;
                            return (
                                <tr
                                    key={row.id}
                                    className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors group"
                                    {...rowNavProps(href)}
                                >
                                    <td className="px-6 py-4">
                                        {row.rank ? (
                                            <span className="inline-flex items-center justify-center bg-blue-600 text-white rounded-xl h-8 w-8 text-xs font-black shadow-2xs">
                                                #{row.rank}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs font-black text-blue-700">
                                        {row.display_id ?? `MS-${row.id.substring(0, 4).toUpperCase()}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/missions/${row.id}`} onClick={stopRowNav} className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors block text-xs">
                                            {row.concern_title}
                                        </Link>
                                        <p className="text-xs text-slate-400 truncate max-w-[280px] font-medium mt-0.5">{row.location}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.assignee ? (
                                            <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl text-xs border border-slate-200/80 inline-block">
                                                {row.assignee}
                                            </span>
                                        ) : (
                                            <span className="text-amber-700 text-xs font-black bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 inline-block shadow-2xs">
                                                ⚠️ Unassigned
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs font-bold px-3 py-1",
                                                row.priority === 'high'
                                                    ? 'border-red-200 bg-red-50 text-red-700'
                                                    : 'border-amber-200 bg-amber-50 text-amber-700'
                                            )}
                                        >
                                            {row.priority === 'med' ? 'Med Priority' : `${row.priority.toUpperCase()} Priority`}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className={cn("text-xs capitalize px-3 py-1 font-bold", statusStyle[row.status as MissionStatus])}>
                                            {statusLabel[row.status as MissionStatus] ?? row.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2" onClick={stopRowNav}>
                                            {onOpenAssign && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 px-3.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-2xs cursor-pointer rounded-xl"
                                                    onClick={() => onOpenAssign(row)}
                                                >
                                                    <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                                                    Assign
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" className="h-9 px-3.5 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs cursor-pointer rounded-xl" asChild>
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