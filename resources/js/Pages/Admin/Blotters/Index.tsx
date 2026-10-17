import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { rowNavProps, stopRowNav } from '@/Lib/tableRow';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { FileText, ChevronRight, Scale } from 'lucide-react';

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

            <div className="w-full space-y-8 pb-16">
                
                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">
                                <Scale className="h-3 w-3" /> Katarungang Pambarangay Desk
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            Formal Dispute & Blotter Register
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Manage formal dispute logs, scheduled hearings, and official incident tickets.
                        </p>
                    </div>
                </div>

                {/* Blotter Data Table Card */}
                <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-0">
                        {!blotters || blotters.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground space-y-3">
                                <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <FileText className="h-6 w-6 text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">No formal blotter records currently logged.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-black uppercase tracking-wider text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4">Ticket / Status</th>
                                            <th className="px-5 py-4">Dispute Type</th>
                                            <th className="px-5 py-4">Complainant</th>
                                            <th className="px-5 py-4">Respondent</th>
                                            <th className="px-5 py-4">Date Filed</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {blotters.map((blotter) => (
                                            <tr
                                                key={blotter.id}
                                                className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors group"
                                                {...rowNavProps(`/admin/blotters/${blotter.id}`)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-mono font-black text-blue-700 text-xs">{blotter.ticket_number}</div>
                                                    <Badge variant={blotter.status === 'pending_approval' ? 'warning' : 'success'} className="mt-1.5 capitalize text-[10px] font-black px-2.5 py-0.5">
                                                        {(blotter.status || 'pending').replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 text-xs font-bold text-slate-700 capitalize">{blotter.type.replace('_', ' ')}</td>
                                                <td className="px-5 py-4 font-extrabold text-slate-900 text-xs">{blotter.complainant}</td>
                                                <td className="px-5 py-4 text-slate-600 font-semibold text-xs">{blotter.respondent || '—'}</td>
                                                <td className="px-5 py-4 text-xs font-medium text-slate-500">{blotter.created_at}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button size="sm" variant="outline" className="h-9 px-3.5 text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 border-slate-200 shadow-2xs cursor-pointer rounded-xl" asChild>
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
            </div>
        </AdminLayout>
    );
}