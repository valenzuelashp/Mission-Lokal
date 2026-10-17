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

            <div className="w-full space-y-8 pb-16">
                
                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <ShieldCheck className="h-3 w-3" /> Profile Audit Desk
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            Resident Profile Edit Approvals
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Review side-by-side identity comparisons and authorize profile amendments requested by residents.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {pendingEdits.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-2xs">
                            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                <UserCheck className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">No pending profile changes require administrative review.</p>
                        </div>
                    ) : (
                        pendingEdits.map((request) => (
                            <div key={request.id} className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
                                <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h3 className="font-black text-slate-900 text-base">{request.resident_name}</h3>
                                        <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-100 inline-block mt-1.5 shadow-2xs">
                                            {request.account_id}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2 font-semibold bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
                                        <CalendarDays className="h-4 w-4 text-slate-400" />
                                        <span>Requested: {request.submitted_at}</span>
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8 space-y-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <UserCog className="h-4 w-4 text-blue-600" /> Side-by-Side Field Comparison
                                    </h4>

                                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                                                <tr>
                                                    <th className="px-6 py-4 w-1/4">Field Attribute</th>
                                                    <th className="px-6 py-4 w-3/8 text-slate-500">Current System Record</th>
                                                    <th className="px-6 py-4 w-3/8 text-emerald-800">Requested Edit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white text-xs">
                                                {Object.entries(request.requested_changes).map(([field, newValue]) => {
                                                    const currentValue = request.current_values[field] ?? '—';
                                                    const isChanged = String(currentValue).trim() !== String(newValue).trim();

                                                    return (
                                                        <tr key={field} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4 font-black text-slate-700 uppercase tracking-wider">
                                                                {formatKeyLabel(field)}
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500 font-mono break-words">
                                                                {currentValue}
                                                            </td>
                                                            <td className={`px-6 py-4 break-words ${isChanged ? 'font-extrabold text-emerald-950 bg-emerald-50/70 border-l-4 border-emerald-500' : 'text-slate-700 font-medium'}`}>
                                                                {newValue || <em className="text-slate-400 font-normal">Empty / Cleared</em>}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-slate-100">
                                        <Button
                                            disabled={processing}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReject(request.id)}
                                            className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold text-xs h-11 px-5 cursor-pointer shadow-2xs rounded-2xl"
                                        >
                                            <UserX className="mr-2 h-4 w-4" /> Reject Request
                                        </Button>
                                        <Button
                                            disabled={processing}
                                            size="sm"
                                            onClick={() => handleApprove(request.id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 px-6 cursor-pointer shadow-sm rounded-2xl"
                                        >
                                            <UserCheck className="mr-2 h-4 w-4" /> Commit Changes & Update Registry
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}