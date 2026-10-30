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

function formatSubmittedAt(value: string | null) {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

export default function Index({ queue = [] }: { queue: QueueItem[] }) {
    return (
        <AdminLayout title="Mission-Lokal Admin: Verification Queue">
            <Head title="Verification Queue" />

            <div className="w-full space-y-8 pb-16">
                
                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <ShieldCheck className="h-3 w-3" /> Identity Audit Desk
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            Resident Verification Queue
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Review self-registered applications and cross-reference them against physical barangay logbooks.
                        </p>
                    </div>
                </div>

                {/* Verification Queue Data Table Card */}
                <div className="bg-white rounded-3xl shadow-2xs border border-slate-200/80 overflow-hidden">
                    {!queue || queue.length === 0 ? (
                        <div className="py-20 text-center space-y-3">
                            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Inbox Zero — All Clear</h3>
                            <p className="mt-1 text-xs text-muted-foreground">There are no self-registrations waiting for physical verification right now.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-black uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Reference ID</th>
                                        <th className="px-5 py-4">Applicant Name</th>
                                        <th className="px-5 py-4">Contact Details</th>
                                        <th className="px-5 py-4">Submitted At</th>
                                        <th className="px-5 py-4">Status Tag</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {queue.map((person) => (
                                        <tr
                                            key={person.id}
                                            className="cursor-pointer hover:bg-slate-50/70 transition-colors group"
                                            {...rowNavProps(route('admin.verifications.show', person.id))}
                                        >
                                            <td className="px-6 py-4 font-mono text-xs font-black text-blue-700">
                                                {person.account_id}
                                            </td>
                                            <td className="px-5 py-4 font-extrabold text-slate-900 text-xs">
                                                {person.first_name} {person.last_name}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-600">
                                                <div className="font-bold text-slate-900">{person.email || 'Unknown'}</div>
                                                <div className="text-[11px] text-slate-400 font-medium">{person.mobile || 'Unknown'}</div>
                                            </td>
                                            <td className="px-5 py-4 text-xs font-medium text-slate-500">
                                                {formatSubmittedAt(person.created_at)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl border inline-block shadow-2xs ${
                                                    person.verification_status === 'in_progress'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {statusLabel(person.verification_status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link 
                                                    href={route('admin.verifications.show', person.id)} 
                                                    onClick={stopRowNav}
                                                    className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50/80 px-3.5 py-2 rounded-xl border border-blue-100 inline-block shadow-2xs transition-colors"
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
            </div>
        </AdminLayout>
    );
}