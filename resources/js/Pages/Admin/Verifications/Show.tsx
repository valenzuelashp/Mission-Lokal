import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Input } from '@/Components/ui/input';

declare function route(name: string, params?: any): string;

interface ResidentProfile {
    government_id_storage_key: string;
}

interface User {
    id: string;
    account_id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    name_extension?: string;
    birthday: string;
    house_street: string;
    barangay_name: string;
    city: string;
    province: string;
    email: string;
    mobile: string;
    parent_name?: string;
    parent_contact?: string;
    resident_profile: ResidentProfile | null;
}

export default function Show({ resident }: { resident: User }) {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [physicalRecordChecked, setPhysicalRecordChecked] = useState(false);

    // Form for approval with complete editable override fields
    const approveForm = useForm({
        first_name: resident.first_name,
        middle_name: resident.middle_name || '',
        last_name: resident.last_name,
        name_extension: resident.name_extension || '',
        birthday: resident.birthday,
        house_street: resident.house_street,
        barangay_name: resident.barangay_name,
        city: resident.city,
        province: resident.province,
        mobile: resident.mobile || '',
    });

    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejecting, errors: rejectErrors } = useForm({
        rejection_reason: '',
    });

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        if (!physicalRecordChecked) {
            alert('Please confirm that you have checked the physical barangay records before approving.');
            return;
        }
        if (confirm('Approve this resident, generate their credentials, and email their login details?')) {
            approveForm.post(route('admin.verifications.approve', resident.id));
        }
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        postReject(route('admin.verifications.reject', resident.id), {
            onSuccess: () => setShowRejectModal(false),
        });
    };

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `/admin/view-id/${path.split('/').map(encodeURIComponent).join('/')}`;
    };

    const idPath = resident.resident_profile?.government_id_storage_key || '';
    const isPdfId = /\.pdf(\.enc)?$/i.test(idPath);
    const idLabel = `${(resident.last_name || 'UNKNOWN').toUpperCase()}, ${[resident.first_name, resident.middle_name]
        .filter((part) => (part || '').trim())
        .map((part) => (part || '').trim().charAt(0).toUpperCase())
        .join('')} ID`;


    return (
        <AdminLayout title={`Reviewing Registration: ${resident.first_name} ${resident.last_name}`}>
            <Head title={`Review: ${resident.first_name} ${resident.last_name}`} />

            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Physical Record Verification</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Verify submitted registration details against physical barangay logbooks and papers.
                        </p>
                    </div>
                    <Link 
                        href={route('admin.verifications.index')} 
                        className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                        &larr; Back to Queue
                    </Link>
                </div>

                <form onSubmit={handleApprove} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* LEFT COLUMN: Submitted Details & Editable Overrides */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800">Submitted Resident Details</h3>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide bg-blue-100 text-blue-800">
                                        Pending Physical Check
                                    </span>
                                </div>
                                
                                <div className="p-6 space-y-4 text-sm">
                                    <p className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                                        Review the fields below and verify them against the physical records in your barangay office. You may adjust any minor typos before approving.
                                    </p>
                                    {(approveForm.errors as Record<string, string>).general && (
                                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                                            {(approveForm.errors as Record<string, string>).general}
                                        </p>
                                    )}

                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b pb-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">First Name</label>
                                            <Input value={approveForm.data.first_name} onChange={e => approveForm.setData('first_name', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Middle Name</label>
                                            <Input value={approveForm.data.middle_name} onChange={e => approveForm.setData('middle_name', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b pb-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Last Name</label>
                                            <Input value={approveForm.data.last_name} onChange={e => approveForm.setData('last_name', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Name Extension</label>
                                            <Input placeholder="e.g. Jr., III" value={approveForm.data.name_extension} onChange={e => approveForm.setData('name_extension', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="border-b pb-3">
                                        <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Birthday</label>
                                        <Input type="date" value={approveForm.data.birthday} onChange={e => approveForm.setData('birthday', e.target.value)} required />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b pb-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">House / Street</label>
                                            <Input value={approveForm.data.house_street} onChange={e => approveForm.setData('house_street', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Barangay Name</label>
                                            <Input value={approveForm.data.barangay_name} onChange={e => approveForm.setData('barangay_name', e.target.value)} required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b pb-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">City / Municipality</label>
                                            <Input value={approveForm.data.city} onChange={e => approveForm.setData('city', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Province</label>
                                            <Input value={approveForm.data.province} onChange={e => approveForm.setData('province', e.target.value)} required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b pb-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Mobile Number</label>
                                            <Input value={approveForm.data.mobile} onChange={e => approveForm.setData('mobile', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Email Address</label>
                                            <div className="p-2 bg-gray-50 rounded border text-gray-800 text-xs truncate">{resident.email}</div>
                                        </div>
                                    </div>

                                    {(resident.parent_name || resident.parent_contact) && (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                                            <p className="text-xs font-bold uppercase text-amber-800">Parent / Guardian (Minor Applicant)</p>
                                            <p className="mt-1">{resident.parent_name || '—'}</p>
                                            <p className="text-xs text-muted-foreground">{resident.parent_contact || '—'}</p>
                                        </div>
                                    )}

                                    {/* Physical Record Confirmation Checkbox */}
                                    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={physicalRecordChecked}
                                                onChange={e => setPhysicalRecordChecked(e.target.checked)}
                                                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                                required
                                            />
                                            <span className="text-xs text-slate-700 font-medium leading-relaxed">
                                                I confirm that I have cross-referenced this resident's name, birthday, and details against our official physical barangay logbook or records, and verified the authenticity of their submitted government ID.
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button 
                                    type="submit"
                                    disabled={approveForm.processing || rejecting || !physicalRecordChecked}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-sm transition-colors focus:ring-4 focus:ring-green-200 disabled:opacity-50"
                                >
                                    {approveForm.processing ? 'Creating Account...' : 'Approve & send login credentials'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={approveForm.processing || rejecting}
                                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-4 px-6 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Uploaded Government ID */}
                        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
                            <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
                                <h3 className="text-lg font-semibold text-white">Submitted Government ID</h3>
                                <p className="mt-1 text-sm font-mono text-gray-300">{idLabel}</p>
                            </div>
                            <div className="flex-1 p-6 flex justify-center items-center bg-gray-800 min-h-[400px]">
                                {idPath ? (
                                    isPdfId ? (
                                        <iframe
                                            src={getImageUrl(idPath)}
                                            title="Resident Government ID"
                                            className="h-[600px] w-full rounded border border-gray-600 bg-white"
                                        />
                                    ) : (
                                        <img 
                                            src={getImageUrl(idPath)} 
                                            alt="Resident Government ID" 
                                            className="max-w-full max-h-[600px] object-contain rounded border border-gray-600 shadow-2xl"
                                        />
                                    )
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>No ID image found in the database.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </form>
            </div>

            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Reject Application</h3>
                            <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleReject} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Rejection / Resubmission <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm p-3"
                                    rows={4}
                                    placeholder="e.g. Your name was not found in our physical barangay records. Please visit the barangay hall in person to update your information."
                                    value={rejectData.rejection_reason}
                                    onChange={e => setRejectData('rejection_reason', e.target.value)}
                                    required
                                ></textarea>
                                {rejectErrors.rejection_reason && (
                                    <p className="mt-1 text-sm text-red-600">{rejectErrors.rejection_reason}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={rejecting || !rejectData.rejection_reason}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 text-sm"
                                >
                                    {rejecting ? 'Processing...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}