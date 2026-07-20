import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';
import type { AdminResidentActivity } from '@/Types';

const statusStyle: Record<AdminResidentActivity['status'], string> = {
    resolved: 'text-neutral-900 font-black',
    complete: 'text-neutral-900 font-black',
    acknowledged: 'text-neutral-500 font-bold',
    active: 'text-neutral-800 font-black underline decoration-neutral-400',
    pending: 'text-neutral-400 font-medium',
};

const statusLabel: Record<AdminResidentActivity['status'], string> = {
    resolved: 'Resolved',
    complete: 'Complete',
    acknowledged: 'Acknow.',
    active: 'Active',
    pending: 'Pending',
};

const typeLabel: Record<AdminResidentActivity['type'], string> = {
    mission: 'Mission',
    broadcast: 'Broadcast',
    blotter: 'Blotter',
};

type Props = {
    activities: AdminResidentActivity[];
};

export default function ResidentActivityTable({ activities }: Props) {
    return (
        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 bg-white/40 border-b border-neutral-100 px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-800">
                    <History className="h-4 w-4 text-neutral-400 stroke-[2.5]" />
                    Activity history Tracker
                </CardTitle>
                {activities.length > 0 && (
                    <button type="button" className="text-[11px] font-black uppercase tracking-widest text-neutral-900 border-b border-neutral-900/30 pb-0.5 hover:border-neutral-900 transition-colors">
                        View all indices
                    </button>
                )}
            </CardHeader>
            <CardContent className="p-0">
                {activities.length === 0 ? (
                    <p className="px-5 py-8 text-center text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50/20">No data points logged inside history stream yet.</p>
                ) : (
                    <>
                        <div className="space-y-0 divide-y divide-neutral-100 md:hidden">
                            {activities.map((row) => (
                                <div key={row.id} className="space-y-1.5 px-4 py-4 bg-white/50">
                                    <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-wider">
                                        <span className="text-neutral-400 font-medium font-sans text-xs normal-case">{row.date}</span>
                                        <span className={cn(statusStyle[row.status])}>
                                            {statusLabel[row.status]}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold tracking-tight text-neutral-800 leading-relaxed">{row.description}</p>
                                    <span className="inline-block text-[9px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-md border border-neutral-200/40">{typeLabel[row.type]}</span>
                                </div>
                            ))}
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-xs font-bold tracking-tight text-neutral-700">
                                <thead>
                                    <tr className="border-b border-neutral-200/40 bg-neutral-50/30 text-left text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                        <th className="px-5 py-3">Timestamp</th>
                                        <th className="px-5 py-3">Classification</th>
                                        <th className="px-5 py-3 w-[50%]">Diagnostic Context</th>
                                        <th className="px-5 py-3">Index Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {activities.map((row) => (
                                        <tr key={row.id} className="group transition-colors hover:bg-neutral-50/40">
                                            <td className="px-5 py-3.5 text-neutral-400 font-medium tabular-nums">{row.date}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-neutral-50 border border-neutral-200/60 px-1.5 py-0.5 rounded-md">{typeLabel[row.type]}</span>
                                            </td>
                                            <td className="px-5 py-3.5 font-semibold text-neutral-800 leading-relaxed">{row.description}</td>
                                            <td className={cn('px-5 py-3.5 uppercase text-[10px] tracking-wider', statusStyle[row.status])}>
                                                {statusLabel[row.status]}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}