import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

declare function route(name: string, params?: any): string;

interface QueueItem {
    id: string;
    account_id: string;
    first_name: string;
    last_name: string;
    email?: string;
    mobile?: string;
    verification_status: string;
    census_match: boolean;
    created_at: string | null;
}

function statusLabel(status: string) {
    if (status === 'in_progress') return 'In review';
    if (status === 'pending') return 'Pending review';
    return status.replace('_', ' ');
}

export default function Index({ queue = [] }: { queue: QueueItem[] }) {
    return (
        <AdminLayout title="Mission-Lokal Admin: Verification Queue">
            <Head title="Verification Queue" />

            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Verification Queue</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Review self-registered applications and match them against barangay records.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {!queue || queue.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Inbox Zero</h3>
                            <p className="mt-1 text-sm text-gray-500">There are no self-registrations waiting for verification right now.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resident</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Census</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {queue.map((person) => (
                                    <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                            {person.census_match ? person.account_id : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {person.first_name} {person.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{person.email || 'Unknown'}</div>
                                            <div className="text-xs text-gray-400">{person.mobile || 'Unknown'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {person.created_at ? new Date(person.created_at).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                person.census_match
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                {person.census_match ? 'Matched' : 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                person.verification_status === 'in_progress'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {statusLabel(person.verification_status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link 
                                                href={route('admin.verifications.show', person.id)}
                                                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors inline-block"
                                            >
                                                Compare & Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
