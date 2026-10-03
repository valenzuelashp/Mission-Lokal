import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';
import type { AdminResidentActivity } from '@/Types';

const statusStyle: Record<AdminResidentActivity['status'], string> = {
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    complete: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    acknowledged: 'bg-blue-50 text-blue-700 border-blue-200 font-bold',
    active: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
    pending: 'bg-slate-100 text-slate-700 border-slate-200 font-bold',
};

const statusLabel: Record<AdminResidentActivity['status'], string> = {
    resolved: 'Resolved',
    complete: 'Complete',
    acknowledged: 'Acknowledged',
    active: 'Active',
    pending: 'Pending',
};

const typeLabel: Record<AdminResidentActivity['type'], string> = {
    mission: 'Mission Task',
    broadcast: 'Broadcast',
    blotter: 'Blotter Case',
};

type Props = {
    activities: AdminResidentActivity[];
    onViewAllClick: () => void;
};

export default function ResidentActivityTable({ activities, onViewAllClick }: Props) {
    return (
        <Card className="shadow-xs border-slate-200/80 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700">
                    <History className="h-4 w-4 text-blue-600" />
                    Activity History & Concerns Log
                </CardTitle>
                {activities.length > 0 && (
                    <button type="button" onClick={onViewAllClick} className="text-xs font-bold text-blue-700 hover:underline cursor-pointer">
                        View all history →
                    </button>
                )}
            </CardHeader>
            <CardContent className="p-0">
                {activities.length === 0 ? (
                    <p className="p-6 text-center text-xs text-muted-foreground">No recent activity recorded for this resident.</p>
                ) : (
                    <>
                        <div className="space-y-0 divide-y divide-slate-100 md:hidden">
                            {activities.map((row) => (
                                <div key={row.id} className="space-y-1.5 px-4 py-3.5 block">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-muted-foreground font-semibold">{row.date}</span>
                                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', statusStyle[row.status])}>
                                            {statusLabel[row.status]}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-900 mt-1">{row.description}</p>
                                    <span className="text-[11px] text-blue-700 font-extrabold">{typeLabel[row.type]}</span>
                                </div>
                            ))}
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <th className="px-5 py-3 w-36">Timestamp</th>
                                        <th className="px-4 py-3 w-36">Record Type</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 w-36">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activities.map((row) => (
                                        <tr key={row.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3 text-muted-foreground text-xs font-medium">{row.date}</td>
                                            <td className="px-4 py-3 font-bold text-slate-700 text-xs">{typeLabel[row.type]}</td>
                                            <td className="px-4 py-3 text-slate-900 font-bold text-xs">{row.description}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-block', statusStyle[row.status])}>
                                                    {statusLabel[row.status]}
                                                </span>
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