import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle, ArrowRight, ShieldAlert, UserCircle, Building2, Clock } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout'; // Fixed import
import { PageProps } from '@/Types';

interface PendingEdit {
    id: string;
    account_id: string;
    admin_name: string;
    barangay_name: string;
    current_values: Record<string, string>;
    requested_changes: Record<string, string>;
    submitted_at: string;
}

interface Props extends PageProps {
    pendingEdits: PendingEdit[];
}

export default function ProfileEditsIndex({ pendingEdits, flash }: Props) {
    
    const handleApprove = (id: string) => {
        if (confirm('Are you sure you want to approve this request? The Admin and Barangay details will be updated immediately.')) {
            router.post(`/super-admin/profile-edits/${id}/approve`);
        }
    };

    const handleReject = (id: string) => {
        if (confirm('Are you sure you want to reject this request? The Admin will be notified.')) {
            router.post(`/super-admin/profile-edits/${id}/reject`);
        }
    };

    // Utility to format keys like "first_name" to "First Name"
    const formatLabel = (key: string) => {
        if (key === 'barangay_name') return 'Barangay Name';
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <SuperAdminLayout title="Super Admin Dashboard"> {/* Fixed Wrapper */}
            <Head title="Pending Profile Edits | Super Admin" />

            <div className="w-full space-y-6 pb-16">
                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <ShieldAlert className="h-3 w-3" /> Super Admin Queue
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                            <UserCircle className="h-7 w-7 text-blue-600" /> Admin Profile Requests
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Review and approve settings modifications requested by Barangay Administrators.
                        </p>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-xs font-bold text-emerald-900 shadow-2xs">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-xs font-bold text-red-900 shadow-2xs">
                        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Pending Edits List */}
                {pendingEdits.length === 0 ? (
                    <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="rounded-full bg-slate-100 p-4 mb-4">
                                <CheckCircle className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700">No Pending Requests</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                All administrative profile update requests have been processed. You're all caught up!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {pendingEdits.map((edit) => (
                            <Card key={edit.id} className="shadow-sm border-slate-200/80 bg-white rounded-2xl overflow-hidden">
                                <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-row items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-sm font-extrabold text-slate-900">
                                                {edit.admin_name}
                                            </CardTitle>
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                                {edit.account_id}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Building2 className="h-3.5 w-3.5" />
                                                {edit.barangay_name}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                Requested: {edit.submitted_at}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleReject(edit.id)}
                                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold text-xs cursor-pointer"
                                        >
                                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                                        </Button>
                                        <Button 
                                            size="sm"
                                            onClick={() => handleApprove(edit.id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                                        >
                                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-white border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-3 font-bold text-slate-500 uppercase tracking-wider w-1/4">Field</th>
                                                    <th className="px-6 py-3 font-bold text-slate-500 uppercase tracking-wider w-2/5">Current Value</th>
                                                    <th className="px-6 py-3 font-bold text-slate-500 uppercase tracking-wider w-12 text-center"></th>
                                                    <th className="px-6 py-3 font-bold text-slate-500 uppercase tracking-wider w-2/5">Requested Change</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {Object.entries(edit.requested_changes).map(([key, requestedValue]) => {
                                                    const currentValue = edit.current_values[key] || '—';
                                                    // Only show fields that actually changed
                                                    if (String(currentValue) === String(requestedValue)) return null;
                                                    
                                                    return (
                                                        <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4 font-bold text-slate-700">
                                                                {formatLabel(key)}
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500 font-medium line-through decoration-slate-300">
                                                                {currentValue || '—'}
                                                            </td>
                                                            <td className="px-2 py-4 text-center">
                                                                <ArrowRight className="h-4 w-4 text-sky-400 inline-block mx-auto" />
                                                            </td>
                                                            <td className="px-6 py-4 font-bold text-emerald-700 bg-emerald-50/30">
                                                                {String(requestedValue) || '—'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
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