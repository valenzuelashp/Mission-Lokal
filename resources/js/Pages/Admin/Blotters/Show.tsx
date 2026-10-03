import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps } from '@/Types';

type BlotterDetail = {
    id: string;
    ticket_number: string | null;
    type: string;
    complainant: string;
    respondent: string;
    incident_date: string;
    location: string;
    narrative: string;
    relief_sought: string;
    status: string;
    created_at: string;
};

export default function Show({ blotter }: { blotter: BlotterDetail }) {
    const { auth } = usePage<PageProps & { auth: { user: any } }>().props;
    const canModify = auth.user?.can_modify_system ?? true;

    const handleApprove = () => {
        if (confirm("Are you sure you want to officially file this blotter and issue a sequential ticket number?")) {
            router.post(`/admin/blotters/${blotter.id}/approve`);
        }
    };

    return (
        <AdminLayout title="Review Blotter">
            <Head title="Review Blotter" />
            
            <div className="mb-4">
                <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer" asChild>
                    <Link href="/admin/blotters">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Blotter Desk
                    </Link>
                </Button>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        {blotter.ticket_number ?? 'Pending Official Filing'}
                    </h2>
                    <p className="text-muted-foreground text-xs font-medium mt-1">Submitted on record: {blotter.created_at}</p>
                </div>
                <div>
                    <Badge variant={blotter.status === 'pending_approval' ? 'warning' : 'success'} className="text-xs font-extrabold uppercase tracking-wide px-3 py-1">
                        {(blotter.status || '').replace('_', ' ')}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Statement of Facts / Narrative</h3>
                                <p className="text-slate-800 whitespace-pre-wrap text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{blotter.narrative}</p>
                            </div>
                            
                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Relief Sought / Resolution Requested</h3>
                                <p className="text-slate-800 whitespace-pre-wrap text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{blotter.relief_sought || 'No specific relief stated.'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {blotter.status === 'pending_approval' && canModify && (
                        <Card className="border-emerald-200 bg-emerald-50/70 shadow-xs rounded-2xl">
                            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-extrabold text-emerald-900 text-sm">Official Intake Review Required</h4>
                                    <p className="text-xs text-emerald-800 mt-0.5">Approving this case officially logs it into the barangay blotter register and generates a ticket number.</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button variant="outline" className="bg-white hover:bg-slate-50 text-xs font-bold cursor-pointer">Reject</Button>
                                    <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                                        <CheckCircle className="mr-1.5 h-4 w-4" /> Approve & Issue Ticket
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                        <CardContent className="p-6 space-y-4 text-xs">
                            <div>
                                <p className="font-black text-slate-400 uppercase tracking-wider">Dispute Type</p>
                                <p className="font-bold text-slate-900 mt-0.5 capitalize text-sm">{blotter.type.replace('_', ' ')}</p>
                            </div>
                            <div className="border-t border-slate-100 pt-3">
                                <p className="font-black text-slate-400 uppercase tracking-wider">Complainant</p>
                                <p className="font-bold text-blue-700 mt-0.5 text-sm">{blotter.complainant}</p>
                            </div>
                            <div className="border-t border-slate-100 pt-3">
                                <p className="font-black text-slate-400 uppercase tracking-wider">Respondent</p>
                                <p className="font-bold text-red-600 mt-0.5 text-sm">{blotter.respondent || 'None / Unknown'}</p>
                            </div>
                            <div className="border-t border-slate-100 pt-3">
                                <p className="font-black text-slate-400 uppercase tracking-wider">Incident Timestamp</p>
                                <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 text-sm">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span>{blotter.incident_date}</span>
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-3">
                                <p className="font-black text-slate-400 uppercase tracking-wider">Location</p>
                                <p className="text-slate-900 mt-0.5 font-semibold text-sm">{blotter.location}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}