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
    sex: string;
    civil_status: string;
    house_street: string;
    barangay_name: string;
    city: string;
    province: string;
    email: string;
    mobile: string;
    resident_profile: ResidentProfile | null;
}

interface CensusData {
    id: number;
    account_id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    name_extension?: string;
    birthday: string;
    sex: string;
    civil_status: string;
    house_street: string;
    barangay_name: string;
    city: string;
    province: string;
    mobile?: string;
}

export default function Show({ resident, censusData }: { resident: User, censusData: CensusData | null }) {
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Form for approval with editable override fields (mobile is locked to resident.mobile)
    const approveForm = useForm({
        census_id: censusData?.id || null,
        first_name: resident.first_name,
        middle_name: resident.middle_name || '',
        last_name: resident.last_name,
        name_extension: resident.name_extension || '',
        birthday: resident.birthday,
        sex: resident.sex,
        civil_status: resident.civil_status,
        house_street: resident.house_street,
        barangay_name: resident.barangay_name,
        city: resident.city,
        province: resident.province,
        mobile: resident.mobile,
    });

    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejecting, errors: rejectErrors } = useForm({
        rejection_reason: '',
    });

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Approve this resident? Any updated fields will overwrite outdated barangay records, and account credentials will be generated.')) {
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
        return `/admin/view-id/${path}`;
    };

    return (
        <AdminLayout title={`Reviewing Registration: ${resident.first_name} ${resident.last_name}`}>
            <Head title={`Review: ${resident.first_name} ${resident.last_name}`} />

            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Thorough Comparison & Record Override</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {censusData ? `Census Match ID: ${censusData.account_id}` : 'No Census Match Found — New Independent Record'}
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
                        
                        {/* LEFT COLUMN: Thorough Comparison & Override Form */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800">Field Comparison & Data Overwrite</h3>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                                        censusData ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {censusData ? 'Census Roster Matched' : 'New Resident Entry'}
                                    </span>
                                </div>
                                
                                <div className="p-6 space-y-4 text-sm">
                                    <p className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                                        ℹ️ Compare resident input against outdated barangay records. You can modify any field below before approval to overwrite official records with the latest verified data.
                                    </p>

                                    {/* Name Fields */}
                                    <div className="grid grid-cols-2 gap-3 border-b pb-3">
                                        <div>
                                            <label className="text-xs font-bold text-blue-600 uppercase block mb-1">Resident First Name</label>
                                            <Input value={approveForm.data.first_name} onChange={e => approveForm.setData('first_name', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-green-600 uppercase block mb-1">Census First Name</label>
                                            <div className="p-2 bg-green-50 rounded border text-gray-800 text-sm font-medium">{censusData?.first_name || '—'}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 border-b pb-3">
                                        <div>
                                            <label className="text-xs font-bold text-blue-600 uppercase block mb-1">Resident Last Name</label>
                                            <Input value={approveForm.data.last_name} onChange={e => approveForm.setData('last_name', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-green-600 uppercase block mb-1">Census Last Name</label>
                                            <div className="p-2 bg-green-50 rounded border text-gray-800 text-sm font-medium">{censusData?.last_name || '—'}</div>
                                        </div>
                                    </div>

                                    {/* Birthday */}
                                    <div className="grid grid-cols-2 gap-3 border-b pb-3">
                                        <div>
                                            <label className="text-xs font-bold text-blue-600 uppercase block mb-1">Resident Birthday</label>
                                            <Input type="date" value={approveForm.data.birthday} onChange={e => approveForm.setData('birthday', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-green-600 uppercase block mb-1">Census Birthday</label>
                                            <div className="p-2 bg-green-50 rounded border text-gray-800 text-sm font-medium">{censusData?.birthday || '—'}</div>
                                        </div>
                                    </div>

                                    {/* Civil Status & Sex (Often Outdated in Census!) */}
                                    <div className="grid grid-cols-2 gap-3 border-b pb-3 bg-amber-50/40 p-2 rounded">
                                        <div>
                                            <label className="text-xs font-bold text-amber-700 uppercase block mb-1">Civil Status (Editable)</label>
                                            <select 
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                                value={approveForm.data.civil_status}
                                                onChange={e => approveForm.setData('civil_status', e.target.value)}
                                            >
                                                <option value="Single">Single</option>
                                                <option value="Married">Married</option>
                                                <option value="Widowed">Widowed</option>
                                                <option value="Separated">Separated</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-green-600 uppercase block mb-1">Census Civil Status</label>
                                            <div className="p-2 bg-green-50 rounded border text-gray-800 text-sm font-medium">{censusData?.civil_status || '—'}</div>
                                        </div>
                                    </div>

                                    {/* Address Breakdown */}
                                    <div className="space-y-2 border-b pb-3">
                                        <label className="text-xs font-bold text-blue-600 uppercase block">Address Override Fields</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-[10px] text-muted-foreground">House / Street</span>
                                                <Input value={approveForm.data.house_street} onChange={e => approveForm.setData('house_street', e.target.value)} required />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-muted-foreground">Barangay</span>
                                                <Input value={approveForm.data.barangay_name} onChange={e => approveForm.setData('barangay_name', e.target.value)} required />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-muted-foreground">City</span>
                                                <Input value={approveForm.data.city} onChange={e => approveForm.setData('city', e.target.value)} required />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-muted-foreground">Province</span>
                                                <Input value={approveForm.data.province} onChange={e => approveForm.setData('province', e.target.value)} required />
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            <strong>Census Address on File:</strong> {censusData ? `${censusData.house_street}, ${censusData.barangay_name || ''}, ${censusData.city}, ${censusData.province}` : 'None'}
                                        </div>
                                    </div>

                                    {/* Contact (Read-only as requested) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-blue-600 uppercase block mb-1">Mobile Number</label>
                                            <div className="p-2 bg-gray-50 rounded border text-gray-800 text-xs">{resident.mobile}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-blue-600 uppercase block mb-1">Email (Account Login)</label>
                                            <div className="p-2 bg-gray-50 rounded border text-gray-800 text-xs truncate">{resident.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    type="submit"
                                    disabled={approveForm.processing || rejecting}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-sm transition-colors focus:ring-4 focus:ring-green-200 disabled:opacity-50"
                                >
                                    {approveForm.processing ? 'Overwriting & Approving...' : '✓ Overwrite & Approve Account'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={approveForm.processing || rejecting}
                                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-4 px-6 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    ✕ Reject ID
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Uploaded Government ID */}
                        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
                            <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
                                <h3 className="text-lg font-semibold text-white">Submitted Government ID</h3>
                            </div>
                            <div className="flex-1 p-6 flex justify-center items-center bg-gray-800 min-h-[400px]">
                                {resident.resident_profile?.government_id_storage_key ? (
                                    <img 
                                        src={getImageUrl(resident.resident_profile.government_id_storage_key)} 
                                        alt="Resident Government ID" 
                                        className="max-w-full max-h-[600px] object-contain rounded border border-gray-600 shadow-2xl"
                                    />
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
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                    rows={4}
                                    placeholder="e.g. Your ID photo is blurry. Please re-upload."
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
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={rejecting || !rejectData.rejection_reason}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
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