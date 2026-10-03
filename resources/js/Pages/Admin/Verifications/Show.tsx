import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

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
        if (confirm('Approve this resident, generate their secure credentials, and email their login details?')) {
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
        .join('')} ID Document`;

    return (
        <AdminLayout title={`Reviewing Registration: ${resident.first_name} ${resident.last_name}`}>
            <Head title={`Verify: ${resident.first_name} ${resident.last_name}`} />

            <div className="mb-4">
                <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer" asChild>
                    <Link href={route('admin.verifications.index')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Verification Queue
                    </Link>
                </Button>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                        Physical Record ID Comparison
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                        Cross-reference self-submitted applicant data against physical logbooks and uploaded files.
                    </p>
                </div>
            </div>

            <form onSubmit={handleApprove} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* LEFT COLUMN: Submitted Details & Editable Overrides */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Applicant Submitted Data</h3>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                Pending Physical Audit
                            </span>
                        </div>
                        
                        <p className="text-xs text-slate-500 font-medium">
                            Review and adjust any typos before issuing official approval and account credentials.
                        </p>

                        {(approveForm.errors as Record<string, string>).general && (
                            <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                                {(approveForm.errors as Record<string, string>).general}
                            </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">First Name</label>
                                <Input value={approveForm.data.first_name} onChange={e => approveForm.setData('first_name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">Middle Name</label>
                                <Input value={approveForm.data.middle_name} onChange={e => approveForm.setData('middle_name', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">Last Name</label>
                                <Input value={approveForm.data.last_name} onChange={e => approveForm.setData('last_name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">Name Extension</label>
                                <Input placeholder="e.g. Jr., III" value={approveForm.data.name_extension} onChange={e => approveForm.setData('name_extension', e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">Birthday</label>
                            <Input type="date" value={approveForm.data.birthday} onChange={e => approveForm.setData('birthday', e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">House / Street</label>
                                <Input value={approveForm.data.house_street} onChange={e => approveForm.setData('house_street', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">Barangay Name</label>
                                <Input value={approveForm.data.barangay_name} onChange={e => approveForm.setData('barangay_name', e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">City / Municipality</label>
                                <Input value={approveForm.data.city} onChange={e => approveForm.setData('city', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">Province</label>
                                <Input value={approveForm.data.province} onChange={e => approveForm.setData('province', e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">Mobile Number</label>
                                <Input value={approveForm.data.mobile} onChange={e => approveForm.setData('mobile', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">Email Address</label>
                                <div className="p-2.5 bg-slate-50 rounded-xl border text-slate-800 text-xs font-mono truncate">{resident.email}</div>
                            </div>
                        </div>

                        {/* Physical Record Confirmation Checkbox */}
                        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 mt-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={physicalRecordChecked}
                                    onChange={e => setPhysicalRecordChecked(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                    required
                                />
                                <span className="text-xs text-blue-900 font-bold leading-relaxed">
                                    I certify that I have verified this applicant's identity against our physical barangay registration logbook and checked their valid government ID.
                                </span>
                            </label>
                        </div>

                        <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100 sm:flex-row">
                            <Button 
                                type="submit"
                                disabled={approveForm.processing || rejecting || !physicalRecordChecked}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 shadow-sm cursor-pointer"
                            >
                                {approveForm.processing ? 'Approving Account...' : 'Approve & Send Credentials'}
                            </Button>
                            <Button 
                                type="button"
                                variant="outline"
                                onClick={() => setShowRejectModal(true)}
                                disabled={approveForm.processing || rejecting}
                                className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50 font-bold text-xs py-3 cursor-pointer shadow-2xs"
                            >
                                Reject Application
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Submitted Government ID View */}
                    <div className="bg-slate-900 rounded-2xl shadow-md overflow-hidden flex flex-col border border-slate-800">
                        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Submitted Government ID Document</h3>
                            <p className="mt-0.5 font-mono text-xs text-blue-400">{idLabel}</p>
                        </div>
                        <div className="flex-1 p-6 flex justify-center items-center bg-slate-900 min-h-[420px]">
                            {idPath ? (
                                isPdfId ? (
                                    <iframe
                                        src={getImageUrl(idPath)}
                                        title="Resident Government ID"
                                        className="h-[550px] w-full rounded-xl border border-slate-700 bg-white shadow-xl"
                                    />
                                ) : (
                                    <img 
                                        src={getImageUrl(idPath)} 
                                        alt="Resident Government ID" 
                                        className="max-w-full max-h-[550px] object-contain rounded-xl border border-slate-700 shadow-2xl bg-white"
                                    />
                                )
                            ) : (
                                <div className="text-center text-slate-400 py-12">
                                    <p className="text-xs font-medium">No ID graphic file attached to this submission.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-base font-black text-slate-900">Reject Registration Application</h3>
                            <button onClick={() => setShowRejectModal(false)} className="rounded-full p-1.5 hover:bg-slate-100 cursor-pointer">
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleReject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                    Reason for Rejection / Resubmission Instruction <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full rounded-xl border-slate-200 shadow-2xs focus:border-blue-600 focus:ring-blue-600 text-xs p-3 font-medium resize-none"
                                    rows={4}
                                    placeholder="e.g. Your name was not found in our physical records. Please visit the barangay hall in person."
                                    value={rejectData.rejection_reason}
                                    onChange={e => setRejectData('rejection_reason', e.target.value)}
                                    required
                                ></textarea>
                                {rejectErrors.rejection_reason && (
                                    <p className="mt-1 text-xs font-medium text-red-600">{rejectErrors.rejection_reason}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowRejectModal(false)}
                                    className="cursor-pointer text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={rejecting || !rejectData.rejection_reason}
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                                >
                                    {rejecting ? 'Processing...' : 'Confirm Rejection'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}