import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import PersonnelMissionCard from '@/Components/personnel/PersonnelMissionCard';
import MissionStatusBadge from '@/Components/personnel/MissionStatusBadge';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { rowNavProps, stopRowNav } from '@/Lib/tableRow';
import type { PersonnelMission } from '@/Types';

type Props = {
    missions: PersonnelMission[];
};

export default function PersonnelMissionTable({ missions }: Props) {
    if (missions.length === 0) {
        return (
            <div className="py-20 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
                <p className="text-sm font-bold text-muted-foreground">No field missions assigned to your roster.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 md:hidden">
                {missions.map((mission) => (
                    <PersonnelMissionCard key={mission.id} mission={mission} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-3xl border border-slate-200/80 bg-card shadow-2xs md:block">
                <table className="w-full min-w-[920px] text-sm text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-black uppercase tracking-wider text-slate-400">
                            <th className="px-6 py-4 w-36">Mission ID</th>
                            <th className="px-5 py-4">Concern Overview</th>
                            <th className="px-5 py-4">Location</th>
                            <th className="px-5 py-4 w-36">Priority</th>
                            <th className="px-5 py-4 w-40">Status</th>
                            <th className="px-5 py-4 w-32">Deadline</th>
                            <th className="px-6 py-4 text-right w-32">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {missions.map((row) => {
                            const href = `/personnel/missions/${row.id}`;
                            return (
                                <tr
                                    key={row.id}
                                    className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-emerald-50/30 transition-colors group"
                                    {...rowNavProps(href)}
                                >
                                    <td className="px-6 py-4 font-mono text-xs font-black text-emerald-700">
                                        {row.id}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3.5">
                                            {row.images && row.images.length > 0 ? (
                                                <img 
                                                    src={row.images[0]} 
                                                    alt="Concern" 
                                                    className="h-11 w-11 shrink-0 rounded-xl object-cover border border-slate-200 shadow-2xs"
                                                />
                                            ) : (
                                                <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-xs">
                                                    IMG
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                                                    {row.title}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">ID: {row.concern_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="max-w-[200px] truncate px-5 py-4 text-slate-600 font-medium" title={row.location}>
                                        {row.location}
                                    </td>
                                    <td className="px-5 py-4">
                                        <Badge
                                            variant="outline"
                                            className={
                                                row.priority === 'high'
                                                    ? 'border-red-200 bg-red-50 text-red-700 font-black text-xs rounded-xl'
                                                    : 'border-amber-200 bg-amber-50 text-amber-800 font-black text-xs rounded-xl'
                                            }
                                        >
                                            {row.priority === 'med' ? 'Med Priority' : `${row.priority.toUpperCase()} Priority`}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4">
                                        <MissionStatusBadge status={row.status} />
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-xs font-bold text-slate-700">
                                        {row.due_date}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" variant="outline" className="h-9 px-3.5 text-xs font-black bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200 shadow-2xs cursor-pointer rounded-xl" asChild>
                                            <Link href={href} onClick={stopRowNav}>
                                                Execute
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