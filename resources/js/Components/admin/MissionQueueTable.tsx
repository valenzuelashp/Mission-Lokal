import { Link } from '@inertiajs/react';
import { AlertTriangle, Clock } from 'lucide-react';
import MissionQueueCard from '@/Components/admin/MissionQueueCard';
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
    assigned: 'bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-100',
    acknowledged: 'bg-neutral-50 text-neutral-600 border-neutral-200/40 hover:bg-neutral-50',
    in_progress: 'bg-neutral-900 text-white border-transparent hover:bg-neutral-900 shadow-xs',
    completed: 'bg-neutral-50 text-neutral-500 border-neutral-200/40 hover:bg-neutral-50 line-through decoration-neutral-300',
    verified: 'bg-neutral-900 text-neutral-100 border-transparent hover:bg-neutral-900 font-black',
    cancelled: 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-100 opacity-60',
};

type Props = {
    missions: AdminMission[];
};

export default function MissionQueueTable({ missions }: Props) {
    if (missions.length === 0) {
        return (
            <p className="py-12 text-center text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50/30 rounded-2xl border border-dashed border-neutral-200">
                Zero system assignment models registered under this module node.
            </p>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {missions.map((mission) => (
                    <MissionQueueCard key={mission.id} mission={mission} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm md:block">
                <table className="w-full min-w-[900px] text-xs font-bold tracking-tight text-neutral-700">
                    <thead>
                        <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            <th className="px-5 py-4">Mission ID</th>
                            <th className="px-5 py-4 w-[25%]">Concern file</th>
                            <th className="px-5 py-4">Location threshold</th>
                            <th className="px-5 py-4">Assigned node</th>
                            <th className="px-5 py-4">Priority level</th>
                            <th className="px-5 py-4">Workflow status</th>
                            <th className="px-5 py-4">Due parameters</th>
                            <th className="px-5 py-4">Alert flags</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {missions.map((row) => (
                            <tr key={row.id} className="group transition-colors hover:bg-neutral-50/40">
                                <td className="px-5 py-4 font-black text-neutral-900 tracking-wider">{row.id}</td>
                                <td className="px-5 py-4">
                                    <p className="font-black text-neutral-900 leading-snug line-clamp-1">{row.concern_title}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5">{row.concern_id}</p>
                                </td>
                                <td className="max-w-[160px] truncate px-5 py-4 font-medium text-neutral-500" title={row.location}>
                                    {row.location}
                                </td>
                                <td className="px-5 py-4 font-bold text-neutral-900">
                                    {row.assignee ? (
                                        <span>{row.assignee}</span>
                                    ) : (
                                        <span className="text-neutral-400 uppercase text-[10px] font-black tracking-wider bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded-md">Unassigned</span>
                                    )}
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
                                        {row.priority === 'med' ? 'Med' : row.priority}
                                    </Badge>
                                </td>
                                <td className="px-5 py-4">
                                    <Badge className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all ${statusStyle[row.status]}`}>
                                        {statusLabel[row.status]}
                                    </Badge>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-medium text-neutral-400 tabular-nums">
                                    {row.due_date}
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {row.is_overdue && (
                                            <Badge variant="outline" className="border-neutral-200 bg-neutral-50 text-neutral-900 rounded-md font-black text-[9px] uppercase tracking-wider">
                                                <Clock className="mr-1 h-3 w-3" />
                                                Overdue
                                            </Badge>
                                        )}
                                        {row.is_escalated && (
                                            <Badge variant="outline" className="border-neutral-200/60 bg-white text-neutral-500 rounded-md font-black text-[9px] uppercase tracking-wider">
                                                <AlertTriangle className="mr-1 h-3 w-3 text-neutral-400" />
                                                Escalated
                                            </Badge>
                                        )}
                                        {!row.is_overdue && !row.is_escalated && (
                                            <span className="text-neutral-300 font-light pr-4">—</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <Button variant="ghost" className="h-8 rounded-xl border border-neutral-200 bg-white px-3 text-[11px] font-black uppercase tracking-wider shadow-sm hover:bg-neutral-50 text-neutral-900 transition-all active:scale-95" asChild>
                                        <Link href={`/admin/missions/${row.id.replace('#', '')}`}>Manage</Link>
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