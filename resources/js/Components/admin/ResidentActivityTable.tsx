import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';
import type { AdminResidentActivity } from '@/Types';

const statusStyle: Record<AdminResidentActivity['status'], string> = {
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    complete: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    acknowledged: 'bg-blue-50 text-blue-700 border-blue-200',
    active: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-slate-100 text-slate-700 border-slate-200',
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
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <History className="h-4 w-4 text-muted-foreground" />
                    Activity history & concerns
                </CardTitle>
                {activities.length > 0 && (
                    <button type="button" onClick={onViewAllClick} className="text-xs font-semibold text-blue-700 hover:underline">
                        View all history →
                    </button>
                )}
            </CardHeader>
            <CardContent className="p-0">
                {activities.length === 0 ? (
                    <p className="px-4 pb-6 text-sm text-muted-foreground sm:px-6">No activity recorded yet.</p>
                ) : (
                    <>
                        <div className="space-y-0 divide-y md:hidden">
                            {activities.map((row) => (
                                <tr key={row.id} className="space-y-1 px-4 py-3 block">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-muted-foreground font-medium">{row.date}</span>
                                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', statusStyle[row.status])}>
                                            {statusLabel[row.status]}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800 mt-1">{row.description}</p>
                                    <span className="text-xs text-blue-600 font-semibold">{typeLabel[row.type]}</span>
                                </tr>
                            ))}
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.map((row) => (
                                        <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 text-muted-foreground text-xs">{row.date}</td>
                                            <td className="px-4 py-3 font-medium text-slate-700 text-xs">{typeLabel[row.type]}</td>
                                            <td className="px-4 py-3 text-gray-900 font-medium">{row.description}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border inline-block', statusStyle[row.status])}>
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