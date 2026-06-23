import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

declare function route(name: string, params?: any): string;

// Define our data shapes
interface ResidentProfile {
    government_id_storage_key: string;
    rejection_reason?: string;
}

interface User {
    id: string;
    account_id: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    birthday: string;
    address: string;
    resident_profile: ResidentProfile | null;
}

interface CensusData {
    first_name: string;
    last_name: string;
    address: string;
    // Add other fields if your census table has them
}

export default function VerificationShow({ resident, censusData }: { resident: User, censusData: CensusData | null }) {
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Form specifically for handling Rejections (so we can send the reason)
    const { data, setData, post: postReject, processing: rejecting, errors } = useForm({
        rejection_reason: '',
    });

    // Form for Approvals
    const { post: postApprove, processing: approving } = useForm();

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Are you sure you want to officially verify this resident?')) {
            postApprove(route('admin.verifications.approve', resident.id));
        }
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        postReject(route('admin.verifications.reject', resident.id), {
            onSuccess: () => setShowRejectModal(false),
        });
    };

    // Helper to resolve image path (checks if it's already a full URL or needs the storage prefix)
    const getImageUrl = (path: string) => {
    if (!path) return '';
    
    // If it's already a full URL, leave it alone
    if (path.startsWith('http')) return path;

    // Call the named route we defined in admin.php
    // The 'path' parameter is the exact string from your database
    return `/admin/view-id/${path}`;
};

    return (
        <AdminLayout>
            <Head title={`Review: ${resident.first_name} ${resident.last_name} | Admin`} />

            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Review Identity Document</h1>
                        <p className="mt-1 text-sm text-gray-500">Account ID: {resident.account_id}</p>
                    </div>
                    <Link 
                        href={route('admin.verifications.index')} 
                        className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                        &larr; Back to Queue
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* LEFT COLUMN: Data Comparison */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">Detail Comparison</h3>
                                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    In Progress
                                </span>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {/* Name Comparison */}
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Full Name</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <span className="text-xs text-blue-500 font-bold uppercase block mb-1">User Submitted</span>
                                            <span className="text-gray-900 font-medium">{resident.first_name} {resident.middle_name} {resident.last_name}</span>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                            <span className="text-xs text-green-600 font-bold uppercase block mb-1">Census Record</span>
                                            <span className="text-gray-900 font-medium">
                                                {censusData ? `${censusData.first_name} ${censusData.last_name}` : 'No Record Found'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Comparison */}
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Registered Address</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <span className="text-gray-900 text-sm">{resident.address || 'Not Provided'}</span>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                            <span className="text-gray-900 text-sm">
                                                {censusData ? censusData.address : 'No Record Found'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Birthday */}
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Birthday</p>
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 w-1/2">
                                        <span className="text-gray-900 text-sm">{resident.birthday || 'Not Provided'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-4">
                            <button 
                                onClick={handleApprove}
                                disabled={approving || rejecting}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-sm transition-colors focus:ring-4 focus:ring-green-200 disabled:opacity-50"
                            >
                                {approving ? 'Approving...' : '✓ Approve Resident'}
                            </button>
                            <button 
                                onClick={() => setShowRejectModal(true)}
                                disabled={approving || rejecting}
                                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-4 px-6 rounded-xl transition-colors disabled:opacity-50"
                            >
                                ✕ Reject ID
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Uploaded ID */}
                    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
                        <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">Uploaded Government ID</h3>
                        </div>
                        <div className="flex-1 p-6 flex justify-center items-center bg-gray-800 min-h-[400px]">
                            {resident.resident_profile?.government_id_storage_key ? (
                                <img 
                                    src={getImageUrl(resident.resident_profile?.government_id_storage_key)} 
                                    alt="Resident ID" 
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
            </div>

            {/* REJECTION MODAL */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Reject Uploaded ID</h3>
                            <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleReject} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Rejection <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    The resident will see this exact message on their screen so they know how to fix it.
                                </p>
                                <textarea
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                    rows={4}
                                    placeholder="e.g. The uploaded image is too blurry to read your name. Please upload a clear, well-lit photo."
                                    value={data.rejection_reason}
                                    onChange={e => setData('rejection_reason', e.target.value)}
                                    required
                                ></textarea>
                                {errors.rejection_reason && (
                                    <p className="mt-1 text-sm text-red-600">{errors.rejection_reason}</p>
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
                                    disabled={rejecting || !data.rejection_reason}
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