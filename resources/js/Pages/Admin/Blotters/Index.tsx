import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { rowNavProps, stopRowNav } from '@/Lib/tableRow';
import { ShieldAlert, FileText, ChevronRight } from 'lucide-react';

type Blotter = {
    id: string;
    ticket_number: string;
    type: string;
    complainant: string;
    respondent: string;
    incident_date: string;
    status: string;
    created_at: string;
};

export default function Index({ blotters = [] }: { blotters: Blotter[] }) {
    return (
        <AdminLayout title="Blotter Management">
            <Head title="Blotters" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        Katarungang Pambarangay Desk
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                        Manage formal dispute logs, scheduled hearings, and official incident tickets.
                    </p>
                </div>
            </div>

            <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    {!blotters || blotters.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                            <p className="text-sm font-bold text-slate-700">No formal blotter records currently logged.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3.5">Ticket / Status</th>
                                        <th className="px-4 py-3.5">Dispute Type</th>
                                        <th className="px-4 py-3.5">Complainant</th>
                                        <th className="px-4 py-3.5">Respondent</th>
                                        <th className="px-4 py-3.5">Date Filed</th>
                                        <th className="px-4 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {blotters.map((blotter) => (
                                        <tr
                                            key={blotter.id}
                                            className="cursor-pointer border-b last:border-0 hover:bg-slate-50/50 transition-colors group"
                                            {...rowNavProps(`/admin/blotters/${blotter.id}`)}
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="font-mono font-bold text-blue-700 text-xs">{blotter.ticket_number}</div>
                                                <Badge variant={blotter.status === 'pending_approval' ? 'warning' : 'success'} className="mt-1 capitalize text-[10px] font-bold">
                                                    {(blotter.status || 'pending').replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3.5 text-xs font-semibold text-slate-700 capitalize">{blotter.type.replace('_', ' ')}</td>
                                            <td className="px-4 py-3.5 font-bold text-slate-900">{blotter.complainant}</td>
                                            <td className="px-4 py-3.5 text-slate-600 font-medium">{blotter.respondent || '—'}</td>
                                            <td className="px-4 py-3.5 text-xs text-muted-foreground">{blotter.created_at}</td>
                                            <td className="px-4 py-3.5 text-right">
                                                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold bg-white text-blue-700 hover:bg-blue-50 border-blue-200 shadow-2xs cursor-pointer" asChild>
                                                    <Link href={`/admin/blotters/${blotter.id}`} onClick={stopRowNav}>
                                                        Review
                                                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}