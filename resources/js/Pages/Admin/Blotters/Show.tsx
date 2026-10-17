import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, Scale, MapPin, User } from 'lucide-react';
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
            
            <div className="w-full space-y-8 pb-16">
                
                {/* Immersive Top Command Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-all rounded-xl" asChild>
                            <Link href="/admin/blotters" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4 text-slate-500" /> Back to Desk
                            </Link>
                        </Button>
                        <div className="h-5 w-px bg-slate-200 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">Submitted:</span>
                            <span className="text-xs font-semibold text-slate-700">{blotter.created_at}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Badge variant={blotter.status === 'pending_approval' ? 'warning' : 'success'} className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 shadow-2xs">
                            {(blotter.status || '').replace('_', ' ')}
                        </Badge>
                    </div>
                </div>

                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">
                                <Scale className="h-3 w-3" /> Katarungang Pambarangay Case Record
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-mono">
                            {blotter.ticket_number ?? 'Pending Official Filing'}
                        </h1>
                    </div>
                </div>

                {/* Main Asymmetric Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl">
                            <CardContent className="p-6 sm:p-8 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Statement of Facts / Narrative</h3>
                                    <p className="text-slate-800 whitespace-pre-wrap text-sm leading-relaxed bg-slate-50/80 p-5 rounded-2xl border border-slate-100 font-medium">
                                        {blotter.narrative}
                                    </p>
                                </div>
                                
                                <div className="border-t border-slate-100 pt-6 space-y-2">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Relief Sought / Resolution Requested</h3>
                                    <p className="text-slate-800 whitespace-pre-wrap text-sm leading-relaxed bg-slate-50/80 p-5 rounded-2xl border border-slate-100 font-medium">
                                        {blotter.relief_sought || 'No specific relief stated.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {blotter.status === 'pending_approval' && canModify && (
                            <div className="rounded-3xl border bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-emerald-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
                                <div className="space-y-1">
                                    <h4 className="font-black text-emerald-950 text-base flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-emerald-600" /> Official Intake Review Required
                                    </h4>
                                    <p className="text-xs text-emerald-800 leading-relaxed max-w-xl font-medium">
                                        Approving this case officially logs it into the barangay blotter register and generates a sequential ticket number.
                                    </p>
                                </div>
                                <div className="flex gap-2.5 shrink-0">
                                    <Button variant="outline" className="bg-white hover:bg-slate-50 text-xs font-bold cursor-pointer rounded-2xl h-11 px-5 border-slate-200">
                                        Reject
                                    </Button>
                                    <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer rounded-2xl h-11 px-5">
                                        <CheckCircle className="mr-1.5 h-4 w-4" /> Approve & Issue Ticket
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl">
                            <CardContent className="p-6 sm:p-8 space-y-5 text-xs">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">Case Metadata</h3>
                                
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Dispute Type</p>
                                    <p className="font-extrabold text-slate-900 capitalize text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        {blotter.type.replace('_', ' ')}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Complainant</p>
                                    <p className="font-black text-blue-700 text-sm bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 text-blue-600" /> {blotter.complainant}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Respondent</p>
                                    <p className="font-black text-red-600 text-sm bg-red-50/60 p-2.5 rounded-xl border border-red-100 flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 text-red-600" /> {blotter.respondent || 'None / Unknown'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Incident Timestamp</p>
                                    <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span>{blotter.incident_date}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Location</p>
                                    <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                                        <span>{blotter.location}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}