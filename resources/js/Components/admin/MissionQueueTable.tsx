import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowUpRight, CalendarDays, Clock3, Users } from 'lucide-react';
import MissionQueueCard from '@/Components/admin/MissionQueueCard';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { missionQueueHref } from '@/Lib/missionRef';
import { rowNavProps, stopRowNav, visitHref } from '@/Lib/tableRow';
import type { AdminMission, MissionStatus } from '@/Types';
import { cn } from '@/Lib/utils';

const statusLabel: Record<MissionStatus, string> = {
    assigned: 'Assigned',
    acknowledged: 'Acknowledged',
    in_progress: 'In progress',
    completed: 'Work submitted',
    verified: 'Verified & closed',
    cancelled: 'Cancelled',
};

const statusStyle: Record<MissionStatus, string> = {
    assigned: 'border-blue-100 bg-blue-50/70 text-blue-800',
    acknowledged: 'border-sky-100 bg-sky-50/70 text-sky-800',
    in_progress: 'border-indigo-100 bg-indigo-50/70 text-indigo-800',
    completed: 'border-amber-100 bg-amber-50/70 text-amber-800',
    verified: 'border-emerald-100 bg-emerald-50/70 text-emerald-800',
    cancelled: 'border-slate-200/70 bg-slate-100/70 text-slate-700',
};

type Props = {
    missions: (AdminMission & { rank?: number })[];
    onOpenAssign?: (mission: AdminMission) => void;
    onClearFilters?: () => void;
    filtersActive?: boolean;
};

export default function MissionQueueTable({ missions, onOpenAssign, onClearFilters, filtersActive = false }: Props) {
    if (missions.length === 0) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 py-20 text-center">
                <p className="text-sm font-semibold text-muted-foreground">{filtersActive ? 'No missions match these filters.' : 'There are no missions in the queue yet.'}</p>
                <p className="mt-1 text-xs text-slate-500">{filtersActive ? 'Try another status or clear your search.' : 'Assigned response missions will appear here.'}</p>
                {filtersActive && onClearFilters && <Button type="button" variant="outline" size="sm" onClick={onClearFilters} className="mt-4">Clear filters</Button>}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 md:hidden">
                {missions.map((mission) => <MissionQueueCard key={mission.concern_id} mission={mission} onOpenAssign={onOpenAssign} />)}
            </div>

            <div className="hidden overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-2xs md:block">
                <table className="w-full min-w-[1120px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-black uppercase tracking-wider text-slate-400">
                                <th scope="col" className="w-20 px-6 py-4">Rank</th>
                                <th scope="col" className="w-32 px-6 py-4">ID</th>
                                <th scope="col" className="px-6 py-4">Mission concern</th>
                                <th scope="col" className="w-56 px-6 py-4">Assigned personnel</th>
                                <th scope="col" className="w-36 px-6 py-4">Priority</th>
                                <th scope="col" className="w-40 px-6 py-4">Status</th>
                                <th scope="col" className="w-40 px-6 py-4">Due date</th>
                                <th scope="col" className="w-52 px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {missions.map((mission) => {
                                const href = missionQueueHref(mission);

                                return (
                                    <tr
                                        key={mission.concern_id}
                                        className="group cursor-pointer border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/70 focus-visible:bg-slate-50/70"
                                        {...rowNavProps(href)}
                                        onKeyDown={(event) => {
                                            if ((event.target as HTMLElement).closest('a, button')) return;
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                visitHref(href);
                                            }
                                        }}
                                    >
                                        <td className="px-6 py-4 align-top">
                                            {mission.rank ? (
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white shadow-2xs">#{mission.rank}</span>
                                            ) : <span className="text-xs text-slate-400">—</span>}
                                        </td>
                                        <td className="px-6 py-4 align-top font-mono text-xs font-black text-blue-700">
                                            {mission.display_id ?? mission.id}
                                        </td>
                                        <td className="max-w-sm px-6 py-4 align-top">
                                            <Link href={href} onClick={stopRowNav} className="text-xs font-extrabold text-slate-900 transition-colors hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                                                {mission.concern_title}
                                            </Link>
                                            <p className="mt-1 line-clamp-2 text-[11px] font-medium text-slate-500">{mission.location}</p>
                                            {mission.department_label && <span className="mt-2 inline-flex max-w-full rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">{mission.department_label}</span>}
                                        </td>
                                        <td className="px-6 py-4 align-top text-slate-600">
                                            <span className="flex items-start gap-2 font-medium">
                                                <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                <span className="line-clamp-2">{mission.assignee || 'No personnel assigned'}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <Badge variant="outline" className={cn('font-bold', mission.priority === 'high'
                                                ? 'border-rose-100 bg-rose-50/70 text-rose-800'
                                                : mission.priority === 'low'
                                                    ? 'border-slate-200/70 bg-slate-50 text-slate-700'
                                                    : 'border-amber-100 bg-amber-50/70 text-amber-800')}>
                                                {mission.priority === 'med' ? 'Medium' : mission.priority === 'low' ? 'Low' : 'High'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col items-start gap-1.5">
                                                <Badge variant="outline" className={cn('px-2.5 py-0.5 text-[10px] font-bold', statusStyle[mission.status])}>
                                                    {statusLabel[mission.status]}
                                                </Badge>
                                                {mission.is_overdue && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700"><Clock3 className="h-3 w-3" />Overdue</span>}
                                                {mission.is_escalated && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-700"><AlertTriangle className="h-3 w-3" />Escalated</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top text-slate-600">
                                            <span className="inline-flex items-start gap-1.5"><CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />{mission.due_date || 'Not set'}</span>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex justify-end gap-2">
                                                {onOpenAssign && <Button type="button" size="sm" variant="outline" className="h-9 rounded-xl border-slate-200 bg-white px-3 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-50" onClick={(event) => { event.stopPropagation(); onOpenAssign(mission); }}>{mission.assignee ? 'Change team' : 'Assign team'}</Button>}
                                                <Button asChild size="sm" variant="outline" className="h-9 rounded-xl border-slate-200 bg-white px-3 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-50">
                                                    <Link href={href} onClick={stopRowNav}>Open<ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
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
