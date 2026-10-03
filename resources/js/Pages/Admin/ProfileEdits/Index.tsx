import { Head, useForm } from '@inertiajs/react';
import { UserCheck, UserX, UserCog, CalendarDays, ShieldCheck } from 'lucide-react';
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
        const labels: Record<string, string> = {
            first_name: 'First Name',
            middle_name: 'Middle Name',
            last_name: 'Last Name',
            name_extension: 'Name Extension',
            birthday: 'Birthday',
            house_street: 'House / Street',
            barangay_name: 'Barangay',
            city: 'City / Municipality',
            province: 'Province',
            email: 'Email Address',
            mobile: 'Mobile Number',
            parent_name: 'Guardian Name',
            parent_contact: 'Guardian Contact',
        };
        return labels[key] || key.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <AdminLayout title="Mission-Lokal Admin: Profile Updates Queue">
            <Head title="Profile Modification Approvals" />

            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                    Resident Profile Edit Approvals
                </h2>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                    Review side-by-side identity comparisons and authorize profile amendments requested by residents.
                </p>
            </div>

            <div className="space-y-6 max-w-5xl">
                {pendingEdits.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-xs">
                        <UserCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-sm font-bold text-slate-700">No pending profile changes require administrative review.</p>
                    </div>
                ) : (
                    pendingEdits.map((request) => (
                        <div key={request.id} className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
                            <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">{request.resident_name}</h3>
                                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-100 inline-block mt-1">
                                        {request.account_id}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                    Requested: {request.submitted_at}
                                </div>
                            </div>

                            <div className="p-5 sm:p-6">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                    <UserCog className="h-4 w-4 text-blue-600" /> Side-by-Side Field Comparison
                                </h4>

                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b">
                                            <tr>
                                                <th className="px-4 py-3 w-1/4">Field Attribute</th>
                                                <th className="px-4 py-3 w-3/8 text-slate-500">Current System Record</th>
                                                <th className="px-4 py-3 w-3/8 text-emerald-800">Requested Edit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white text-xs">
                                            {Object.entries(request.requested_changes).map(([field, newValue]) => {
                                                const currentValue = request.current_values[field] ?? '—';
                                                const isChanged = String(currentValue).trim() !== String(newValue).trim();

                                                return (
                                                    <tr key={field} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-4 py-3 font-bold text-slate-700 uppercase tracking-wider">
                                                            {formatKeyLabel(field)}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500 font-mono break-words">
                                                            {currentValue}
                                                        </td>
                                                        <td className={`px-4 py-3 break-words ${isChanged ? 'font-bold text-emerald-900 bg-emerald-50/70 border-l-2 border-emerald-500' : 'text-slate-700 font-normal'}`}>
                                                            {newValue || <em className="text-muted-foreground font-normal">Empty / Cleared</em>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex gap-3 justify-end pt-5 mt-5 border-t border-slate-100">
                                    <Button
                                        disabled={processing}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleReject(request.id)}
                                        className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold text-xs h-9 cursor-pointer shadow-2xs"
                                    >
                                        <UserX className="mr-1.5 h-4 w-4" /> Reject Request
                                    </Button>
                                    <Button
                                        disabled={processing}
                                        size="sm"
                                        onClick={() => handleApprove(request.id)}
                                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-9 cursor-pointer shadow-sm"
                                    >
                                        <UserCheck className="mr-1.5 h-4 w-4" /> Commit Changes & Update Registry
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