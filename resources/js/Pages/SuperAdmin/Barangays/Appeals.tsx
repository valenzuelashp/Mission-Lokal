import { Head, useForm } from '@inertiajs/react';
import { ShieldAlert, CheckCircle2, XCircle, Building2, Mail, Clock } from 'lucide-react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';

export default function SuperAdminAppeals({ appeals = [] }: { appeals: any[] }) {
    const actionForm = useForm({
        action: 'approve',
    });

    const handleResolve = (appealId: string, action: 'approve' | 'reject') => {
        actionForm.transform(() => ({ action }));
        actionForm.post(`/super-admin/barangay-appeals/${appealId}/resolve`, {
            preserveScroll: true,
        });
    };

    return (
        <SuperAdminLayout title="Node Reactivation Appeals">
            <Head title="Barangay Appeals" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Barangay Reactivation Appeals</h2>
                <p className="text-sm text-muted-foreground">Review incoming suspension appeals submitted by suspended barangay administrators.</p>
            </div>

            {appeals.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-white shadow-sm">
                    <ShieldAlert className="h-10 w-10 text-slate-300 mb-3" />
                    <h3 className="text-sm font-bold text-slate-800">No Appeals Found</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">There are currently no pending or historical suspension appeals from container nodes.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {appeals.map((appeal) => (
                        <Card key={appeal.appeal_id} className="border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{appeal.barangay_name}</h3>
                                            <p className="text-xs font-mono text-muted-foreground">{appeal.barangay_code} • {appeal.location}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                        appeal.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                        appeal.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                        'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                        {appeal.status}
                                    </span>
                                </div>

                                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border text-xs">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Contact Email</span>
                                        <span className="font-mono text-slate-800 flex items-center gap-1 mt-0.5">
                                            <Mail className="h-3.5 w-3.5 text-sky-600" /> {appeal.contact_email}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Reason for Appeal</span>
                                        <p className="text-slate-700 mt-0.5 whitespace-pre-wrap leading-relaxed">{appeal.reason}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1 font-mono">
                                        <Clock className="h-3.5 w-3.5" /> {appeal.created_at}
                                    </span>
                                    {appeal.status === 'pending' && (
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleResolve(appeal.appeal_id, 'reject')}
                                                disabled={actionForm.processing}
                                                className="text-rose-600 border-rose-200 hover:bg-rose-50 h-8 text-xs font-bold"
                                            >
                                                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleResolve(appeal.appeal_id, 'approve')}
                                                disabled={actionForm.processing}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold"
                                            >
                                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Reactivate Node
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </SuperAdminLayout>
    );
}