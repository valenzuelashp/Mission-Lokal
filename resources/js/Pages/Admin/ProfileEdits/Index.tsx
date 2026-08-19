import { Head, useForm } from '@inertiajs/react';
import { UserCheck, UserX, UserCog, CalendarDays } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';

interface EditRequest {
    id: string;
    user_id: string;
    account_id: string;
    resident_name: string;
    current_values: Record<string, string>;
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
                    Review side-by-side identity comparisons and authorize profile amendments requested by residents.
                </p>
            </div>

            <div className="space-y-6 max-w-5xl">
                {pendingEdits.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground bg-white shadow-sm">
                        <UserCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                        <p className="text-sm font-medium">No pending profile changes require review.</p>
                    </div>
                ) : (
                    pendingEdits.map((request) => (
                        <div key={request.id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                            
                            {/* Card Header Context */}
                            <div className="p-4 bg-slate-50 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">{request.resident_name}</h3>
                                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700 inline-block mt-0.5">
                                        {request.account_id}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Requested: {request.submitted_at}
                                </div>
                            </div>

                            {/* Comparison Table View */}
                            <div className="p-5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-3">
                                    <UserCog className="h-4 w-4 text-blue-600" /> Side-by-Side Field Comparison
                                </h4>

                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-600 border-b">
                                            <tr>
                                                <th className="px-4 py-2.5 w-1/4">Field</th>
                                                <th className="px-4 py-2.5 w-3/8 text-slate-500">Current System Record</th>
                                                <th className="px-4 py-2.5 w-3/8 text-emerald-800">Requested Edit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {Object.entries(request.requested_changes).map(([field, newValue]) => {
                                                const currentValue = request.current_values[field] ?? '—';
                                                const isChanged = String(currentValue).trim() !== String(newValue).trim();

                                                return (
                                                    <tr key={field} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-slate-700 text-xs uppercase tracking-wider">
                                                            {formatKeyLabel(field)}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs break-words">
                                                            {currentValue}
                                                        </td>
                                                        <td className={`px-4 py-3 break-words ${isChanged ? 'font-semibold text-emerald-900 bg-emerald-50/70 border-l-2 border-emerald-500' : 'text-slate-700 font-normal'}`}>
                                                            {newValue || <em className="text-muted-foreground font-normal">Empty / Cleared</em>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Decision Options Block */}
                                <div className="flex gap-3 justify-end pt-4 mt-4 border-t">
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