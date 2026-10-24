import { Head, router } from '@inertiajs/react';
import { KeyRound, ShieldCheck, CheckCircle, XCircle, Mail, Building2, Clock } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';

export default function ClearanceRequestsIndex({ requests, flash }: any) {
    
    const handleApprove = (id: string) => {
        if (confirm('Generate and email a clearance key to this Admin?')) {
            router.post(`/super-admin/clearances/${id}/approve`);
        }
    };

    const handleReject = (id: string) => {
        if (confirm('Reject this request?')) {
            router.post(`/super-admin/clearances/${id}/reject`);
        }
    };

    return (
        <SuperAdminLayout title="Security Clearance Queue">
            <Head title="Security Clearances | Super Admin" />
            
            <div className="w-full space-y-6 pb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200/60">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                            <KeyRound className="h-7 w-7 text-rose-600" /> Security Clearances
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 font-medium">
                            Approve requests to generate and email dual-factor clearance keys for Admin profile email changes.
                        </p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-xs font-bold text-emerald-900 shadow-2xs">
                        <CheckCircle className="h-4 w-4 text-emerald-600" /> <span>{flash.success}</span>
                    </div>
                )}

                {requests.length === 0 ? (
                    <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <ShieldCheck className="h-8 w-8 text-slate-400 mb-4" />
                            <h3 className="text-sm font-bold text-slate-700">No Pending Requests</h3>
                            <p className="text-xs text-slate-500 mt-1">All administrative clearance requests have been processed.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requests.map((req: any) => (
                            <Card key={req.id} className="shadow-sm border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                                <CardContent className="p-6 flex flex-col justify-between h-full gap-5">
                                    <div className="space-y-4">
                                        {/* Top Header inside Card */}
                                        <div className="flex items-start justify-between gap-2 border-b pb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-extrabold text-sm text-slate-900">
                                                        {req.admin.first_name} {req.admin.last_name}
                                                    </h3>
                                                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 font-mono">
                                                        {req.admin.account_id}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-mono">
                                                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {req.admin.email}
                                                </p>
                                            </div>
                                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                                                Pending Review
                                            </span>
                                        </div>

                                        {/* Middle Details Grid */}
                                        <div className="grid grid-cols-1 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                                                <span>Barangay Node: <strong className="text-slate-900">{req.barangay.name}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span>Requested At: <strong className="text-slate-900">{req.created_at}</strong></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-1">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => handleReject(req.id)} 
                                            className="w-full text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold cursor-pointer rounded-xl h-10"
                                        >
                                            <XCircle className="h-4 w-4 mr-1.5" /> Reject
                                        </Button>
                                        <Button 
                                            onClick={() => handleApprove(req.id)} 
                                            className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer rounded-xl h-10 shadow-sm"
                                        >
                                            <KeyRound className="h-4 w-4 mr-1.5" /> Send Key
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </SuperAdminLayout>
    );
}