import { Link } from '@inertiajs/react';
import { AlertTriangle, Clock } from 'lucide-react';
import PersonnelMissionCard from '@/Components/personnel/PersonnelMissionCard';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import type { MissionStatus, PersonnelMission } from '@/Types';

type Props = {
    missions: PersonnelMission[];
};

export default function PersonnelMissionTable({ missions }: Props) {
    if (missions.length === 0) {
        return (
            <p className="py-12 text-center text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50/30 rounded-xl border border-dashed border-neutral-200">
                No missions in this queue.
            </p>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {missions.map((mission) => (
                    <PersonnelMissionCard key={mission.id} mission={mission} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm md:block">
                <table className="w-full min-w-[800px] text-xs font-bold tracking-tight text-neutral-700">
                    <thead>
                        <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            <th className="px-5 py-4">Mission ID</th>
                            <th className="px-5 py-4">Concern</th>
                            <th className="px-5 py-4">Location</th>
                            <th className="px-5 py-4">Priority</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4">Due</th>
                            <th className="px-5 py-4">Flags</th>
                            <th className="px-5 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {missions.map((row) => (
                            <tr key={row.id} className="group transition-colors hover:bg-neutral-50/40">
                                <td className="px-5 py-4 font-black text-neutral-900 tracking-wider">
                                    {row.id}
                                </td>
                                <td className="max-w-[200px] px-5 py-4">
                                    <p className="font-black text-neutral-900 leading-snug line-clamp-1">{row.title}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5">{row.concern_id}</p>
                                </td>
                                <td className="max-w-[160px] truncate px-5 py-4 font-medium text-neutral-500" title={row.location}>
                                    {row.location}
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
                                    <span className="inline-block transform scale-90 origin-left">
                                        <PersonnelMissionCard mission={row} /> {/* Dynamic rendering or simpler mapping alternative below */}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-medium text-neutral-400 tabular-nums">
                                    {row.due_date}
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {row.is_overdue && !['completed', 'verified', 'cancelled'].includes(row.status) && (
                                            <Badge variant="outline" className="border-neutral-200 bg-neutral-50 text-neutral-900 rounded-md font-black text-[9px] uppercase tracking-wider">
                                                <Clock className="mr-1 h-3 w-3" />
                                                Overdue
                                            </Badge>
                                        )}
                                        {row.visibility === 'private' && (
                                            <Badge variant="outline" className="border-neutral-200/60 bg-white text-neutral-500 rounded-md font-black text-[9px] uppercase tracking-wider">
                                                <AlertTriangle className="mr-1 h-3 w-3 text-neutral-400" />
                                                Private
                                            </Badge>
                                        )}
                                        {!row.is_overdue && row.visibility !== 'private' && (
                                            <span className="text-neutral-300 text-xs font-light">—</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <Button variant="ghost" className="h-8 rounded-xl border border-neutral-200 bg-white px-3 text-[11px] font-black uppercase tracking-wider shadow-sm hover:bg-neutral-50 text-neutral-900 transition-all active:scale-95" asChild>
                                        <Link href={`/personnel/missions/${row.id}`}>View</Link>
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