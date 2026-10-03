import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { rowNavProps, stopRowNav } from '@/Lib/tableRow';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

declare function route(name: string, params?: any): string;

interface QueueItem {
    id: string;
    account_id: string;
    first_name: string;
    last_name: string;
    email?: string;
    mobile?: string;
    verification_status: string;
    created_at: string | null;
}

function statusLabel(status: string) {
    if (status === 'in_progress') return 'In Review';
    if (status === 'pending') return 'Pending Review';
    return status.replace('_', ' ');
}

export default function Index({ queue = [] }: { queue: QueueItem[] }) {
    return (
        <AdminLayout title="Mission-Lokal Admin: Verification Queue">
            <Head title="Verification Queue" />

            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                    Resident Verification Queue
                </h2>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                    Review self-registered applications and cross-reference them against physical barangay logbooks.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
                {!queue || queue.length === 0 ? (
                    <div className="py-16 text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
                        <h3 className="text-sm font-bold text-slate-900">Inbox Zero — All Clear</h3>
                        <p className="mt-1 text-xs text-muted-foreground">There are no self-registrations waiting for physical verification right now.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-3.5">Reference ID</th>
                                    <th className="px-4 py-3.5">Applicant Name</th>
                                    <th className="px-4 py-3.5">Contact Details</th>
                                    <th className="px-4 py-3.5">Submitted At</th>
                                    <th className="px-4 py-3.5">Status Tag</th>
                                    <th className="px-4 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {queue.map((person) => (
                                    <tr
                                        key={person.id}
                                        className="cursor-pointer hover:bg-slate-50/50 transition-colors group"
                                        {...rowNavProps(route('admin.verifications.show', person.id))}
                                    >
                                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-blue-700">
                                            {person.account_id}
                                        </td>
                                        <td className="px-4 py-3.5 font-bold text-slate-900">
                                            {person.first_name} {person.last_name}
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-slate-600">
                                            <div className="font-semibold text-slate-900">{person.email || 'Unknown'}</div>
                                            <div className="text-[11px] text-muted-foreground">{person.mobile || 'Unknown'}</div>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                                            {person.created_at ? new Date(person.created_at).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wide rounded-md border inline-block ${
                                                person.verification_status === 'in_progress'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {statusLabel(person.verification_status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <Link 
                                                href={route('admin.verifications.show', person.id)} 
                                                onClick={stopRowNav}
                                                className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 inline-block shadow-2xs"
                                            >
                                                Compare ID →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}