import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

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
    const [showRejectBox, setShowRejectBox] = useState(false);
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
            onSuccess: () => setShowRejectBox(false),
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

            <div className="mx-auto max-w-7xl space-y-8 pb-16">
                
                {/* Top Back Navigation Bar */}
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                    <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-all rounded-xl" asChild>
                        <Link href={route('admin.verifications.index')} className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4 text-slate-500" /> Back to Queue
                        </Link>
                    </Button>
                </div>

                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <ShieldCheck className="h-3 w-3" /> Identity Audit & Comparison
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            {resident.first_name} {resident.last_name}
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Cross-reference self-submitted applicant data against physical logbooks and uploaded files.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleApprove} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* LEFT COLUMN: Submitted Details & Editable Overrides */}
                        <div className="lg:col-span-6 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Applicant Submitted Data</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Review and adjust any typos before approval.</p>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shadow-2xs">
                                    Pending Physical Audit
                                </span>
                            </div>

                            {(approveForm.errors as Record<string, string>).general && (
                                <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-2xl p-4">
                                    {(approveForm.errors as Record<string, string>).general}
                                </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">First Name</label>
                                    <Input value={approveForm.data.first_name} onChange={e => approveForm.setData('first_name', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">Middle Name</label>
                                    <Input value={approveForm.data.middle_name} onChange={e => approveForm.setData('middle_name', e.target.value)} className="rounded-xl h-11 text-xs" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">Last Name</label>
                                    <Input value={approveForm.data.last_name} onChange={e => approveForm.setData('last_name', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">Name Extension</label>
                                    <Input placeholder="e.g. Jr., III" value={approveForm.data.name_extension} onChange={e => approveForm.setData('name_extension', e.target.value)} className="rounded-xl h-11 text-xs" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">Birthday</label>
                                <Input type="date" value={approveForm.data.birthday} onChange={e => approveForm.setData('birthday', e.target.value)} required className="rounded-xl h-11 text-xs" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">House / Street</label>
                                    <Input value={approveForm.data.house_street} onChange={e => approveForm.setData('house_street', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">Barangay Name</label>
                                    <Input value={approveForm.data.barangay_name} onChange={e => approveForm.setData('barangay_name', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">City / Municipality</label>
                                    <Input value={approveForm.data.city} onChange={e => approveForm.setData('city', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">Province</label>
                                    <Input value={approveForm.data.province} onChange={e => approveForm.setData('province', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">Mobile Number</label>
                                    <Input value={approveForm.data.mobile} onChange={e => approveForm.setData('mobile', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">Email Address</label>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono truncate h-11 flex items-center">{resident.email}</div>
                                </div>
                            </div>

                            {/* Physical Record Confirmation Checkbox */}
                            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-2xs">
                                <label className="flex items-start gap-3.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={physicalRecordChecked}
                                        onChange={e => setPhysicalRecordChecked(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                        required
                                    />
                                    <span className="text-xs text-blue-950 font-bold leading-relaxed">
                                        I certify that I have verified this applicant's identity against our physical barangay registration logbook and checked their valid government ID.
                                    </span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 sm:flex-row">
                                <Button 
                                    type="submit"
                                    disabled={approveForm.processing || rejecting || !physicalRecordChecked}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-12 shadow-sm cursor-pointer rounded-2xl"
                                >
                                    {approveForm.processing ? 'Approving Account...' : 'Approve & Send Credentials'}
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowRejectBox(!showRejectBox)}
                                    disabled={approveForm.processing || rejecting}
                                    className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50 font-bold text-xs h-12 cursor-pointer shadow-2xs rounded-2xl"
                                >
                                    {showRejectBox ? 'Cancel Rejection' : 'Reject Application'}
                                </Button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Submitted Government ID View & Rejection Card underneath */}
                        <div className="lg:col-span-6 space-y-6">
                            <div className="bg-slate-900 rounded-3xl shadow-md overflow-hidden flex flex-col border border-slate-800">
                                <div className="px-6 py-5 bg-slate-950 border-b border-slate-800">
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Submitted Government ID Document</h3>
                                    <p className="mt-1 font-mono text-xs text-blue-400 font-semibold">{idLabel}</p>
                                </div>
                                <div className="flex-1 p-6 flex justify-center items-center bg-slate-900 min-h-[520px]">
                                    {idPath ? (
                                        isPdfId ? (
                                            <iframe
                                                src={getImageUrl(idPath)}
                                                title="Resident Government ID"
                                                className="h-[550px] w-full rounded-2xl border border-slate-700 bg-white shadow-xl"
                                            />
                                        ) : (
                                            <img 
                                                src={getImageUrl(idPath)} 
                                                alt="Resident Government ID" 
                                                className="max-w-full max-h-[550px] object-contain rounded-2xl border border-slate-700 shadow-2xl bg-white"
                                            />
                                        )
                                    ) : (
                                        <div className="text-center text-slate-400 py-16 space-y-2">
                                            <AlertCircle className="mx-auto h-8 w-8 text-slate-500" />
                                            <p className="text-xs font-medium">No ID graphic file attached to this submission.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rejection Message Card on Right Side under ID Card */}
                            {showRejectBox && (
                                <div className="rounded-3xl border border-rose-200 bg-white p-6 sm:p-8 shadow-md space-y-5 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-100">
                                                Action Required
                                            </span>
                                            <h3 className="text-base font-black text-slate-900 mt-1">Reject Registration Application</h3>
                                        </div>
                                        <button onClick={() => setShowRejectBox(false)} className="rounded-full p-2 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:text-slate-700">
                                            ✕
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                                Reason for Rejection / Resubmission Instruction <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                className="w-full rounded-2xl border border-slate-200 bg-white shadow-2xs focus:border-blue-600 focus:ring-blue-600 text-xs p-4 font-medium resize-none"
                                                rows={4}
                                                placeholder="e.g. Your name was not found in our physical records. Please visit the barangay hall in person."
                                                value={rejectData.rejection_reason}
                                                onChange={e => setRejectData('rejection_reason', e.target.value)}
                                                required
                                            ></textarea>
                                            {rejectErrors.rejection_reason && (
                                                <p className="text-xs font-semibold text-red-600">{rejectErrors.rejection_reason}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowRejectBox(false)}
                                                className="cursor-pointer text-xs font-bold rounded-xl h-10 px-4"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={handleReject}
                                                disabled={rejecting || !rejectData.rejection_reason}
                                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm rounded-xl h-10 px-5"
                                            >
                                                {rejecting ? 'Processing...' : 'Confirm Rejection'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}