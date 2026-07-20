import { Head, useForm } from '@inertiajs/react';
import { UserCheck, UserX, UserCog, CalendarDays } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';

interface EditRequest {
    id: string;
    user_id: string;
    account_id: string;
    resident_name: string;
    requested_changes: Record<string, string>;
    submitted_at: string;
}

interface Props {
    pendingEdits: EditRequest[];
}

export default function Index({ pendingEdits = [] }: Props) {
    const { post, processing } = useForm();

    const handleApprove = (id: string) => {
        if (confirm('Approve these changes and update the official resident profile registry?')) {
            post(`/admin/profile-edits/${id}/approve`);
        }
    };

    const handleReject = (id: string) => {
        if (confirm('Reject this profile update request?')) {
            post(`/admin/profile-edits/${id}/reject`);
        }
    };

    const formatKeyLabel = (key: string) => {
        return key.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <AdminLayout title="Mission-Lokal Admin: Profile Updates Queue">
            <Head title="Profile Modification Approvals" />

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Profile Edit Queue</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Review and authorize identity corrections or name updates submitted by registered residents.
                </p>
            </div>

            <div className="space-y-4 max-w-4xl">
                {pendingEdits.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground bg-white shadow-sm">
                        <UserCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                        <p className="text-sm font-medium">No pending profile changes require review.</p>
                    </div>
                ) : (
                    pendingEdits.map((request) => (
                        <div key={request.id} className="rounded-xl border bg-white shadow-sm overflow-hidden grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                            {/* Resident Card Context */}
                            <div className="p-5 bg-slate-50/50 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{request.resident_name}</h3>
                                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 block w-max mt-1">
                                        {request.account_id}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-4">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Requested: {request.submitted_at}
                                </div>
                            </div>

                            {/* Comparison block */}
                            <div className="p-5 md:col-span-2 flex flex-col justify-between gap-4">
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <UserCog className="h-4 w-4 text-blue-600" /> Proposed Field Amendments
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(request.requested_changes).map(([field, newValue]) => (
                                            <div key={field} className="grid grid-cols-3 gap-2 items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                                                <span className="text-muted-foreground font-medium text-xs">
                                                    {formatKeyLabel(field)}
                                                </span>
                                                <span className="col-span-2 font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 break-words">
                                                    {newValue || <em className="text-muted-foreground/60 font-normal">Wiped / Null</em>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Decision Options Block */}
                                <div className="flex gap-2 justify-end pt-2 border-t md:border-t-0">
                                    <Button
                                        disabled={processing}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleReject(request.id)}
                                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-9"
                                    >
                                        <UserX className="mr-1.5 h-4 w-4" /> Reject Request
                                    </Button>
                                    <Button
                                        disabled={processing}
                                        size="sm"
                                        onClick={() => handleApprove(request.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9"
                                    >
                                        <UserCheck className="mr-1.5 h-4 w-4" /> Commit Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AdminLayout>
    );
}