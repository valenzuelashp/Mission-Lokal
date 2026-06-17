import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';
import type { AdminResidentActivity } from '@/Types';

const statusStyle: Record<AdminResidentActivity['status'], string> = {
    resolved: 'text-emerald-600',
    complete: 'text-emerald-600',
    acknowledged: 'text-blue-600',
    active: 'text-amber-600',
    pending: 'text-muted-foreground',
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
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-4 w-4 text-muted-foreground" />
                    Activity history
                </CardTitle>
                {activities.length > 0 && (
                    <button type="button" className="text-xs font-medium text-blue-700 hover:underline">
                        View all
                    </button>
                )}
            </CardHeader>
            <CardContent className="p-0">
                {activities.length === 0 ? (
                    <p className="px-6 pb-6 text-sm text-muted-foreground">No activity recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
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
                                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                                        <td className="px-4 py-3 text-muted-foreground">{row.date}</td>
                                        <td className="px-4 py-3">{typeLabel[row.type]}</td>
                                        <td className="px-4 py-3">{row.description}</td>
                                        <td className={cn('px-4 py-3 font-semibold', statusStyle[row.status])}>
                                            {statusLabel[row.status]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
