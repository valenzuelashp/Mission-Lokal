import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { ShieldAlert, Upload } from 'lucide-react';

export default function ResubmitRegistration({ resident }: { resident: any }) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: resident.first_name || '',
        middle_name: resident.middle_name || '',
        last_name: resident.last_name || '',
        name_extension: resident.name_extension || '',
        sex: resident.sex || 'Male',
        civil_status: resident.civil_status || 'Single',
        birthday: resident.birthday || '',
        house_street: resident.house_street || '',
        barangay_name: resident.barangay_name || '',
        city: resident.city || '',
        province: resident.province || '',
        email: resident.email || '',
        mobile: resident.mobile || '',
        government_id: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/account-status/resubmit-form/${resident.id}`, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Resubmit Registration | Mission-Lokal Resident Portal" />

            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                    
                    {/* Header Banner */}
                    <div className="border-b pb-4">
                        <div className="flex items-center gap-2 text-red-600 mb-1">
                            <ShieldAlert className="h-5 w-5" />
                            <span className="font-bold text-xs uppercase tracking-wider">Verification Update Required</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Mission-Lokal Resident Portal</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Review your details, make any corrections, and re-upload your valid government ID for barangay verification.
                        </p>
                    </div>

                    {/* Admin Rejection Feedback Box */}
                    {resident.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-xs text-red-900">
                            <strong className="block font-bold mb-1 uppercase tracking-wider text-red-800">Reason for Rejection:</strong>
                            "{resident.rejection_reason}"
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">First Name *</label>
                                <Input value={data.first_name} onChange={e => setData('first_name', e.target.value)} required />
                                {errors.first_name && <span className="text-xs text-red-600 mt-1 block">{errors.first_name}</span>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Middle Name</label>
                                <Input value={data.middle_name} onChange={e => setData('middle_name', e.target.value)} />
                                {errors.middle_name && <span className="text-xs text-red-600 mt-1 block">{errors.middle_name}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Last Name *</label>
                                <Input value={data.last_name} onChange={e => setData('last_name', e.target.value)} required />
                                {errors.last_name && <span className="text-xs text-red-600 mt-1 block">{errors.last_name}</span>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Name Extension</label>
                                <Input placeholder="e.g. Jr., III" value={data.name_extension} onChange={e => setData('name_extension', e.target.value)} />
                                {errors.name_extension && <span className="text-xs text-red-600 mt-1 block">{errors.name_extension}</span>}
                            </div>
                        </div>

                        {/* Sex, Civil Status, Birthday */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Sex *</label>
                                <select 
                                    value={data.sex} 
                                    onChange={e => setData('sex', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    required
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.sex && <span className="text-xs text-red-600 mt-1 block">{errors.sex}</span>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Civil Status *</label>
                                <select 
                                    value={data.civil_status} 
                                    onChange={e => setData('civil_status', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    required
                                >
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Separated">Separated</option>
                                </select>
                                {errors.civil_status && <span className="text-xs text-red-600 mt-1 block">{errors.civil_status}</span>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Birthday *</label>
                                <Input type="date" value={data.birthday} onChange={e => setData('birthday', e.target.value)} required />
                                {errors.birthday && <span className="text-xs text-red-600 mt-1 block">{errors.birthday}</span>}
                            </div>
                        </div>

                        {/* Address Fields */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">House / Street *</label>
                            <Input value={data.house_street} onChange={e => setData('house_street', e.target.value)} required />
                            {errors.house_street && <span className="text-xs text-red-600 mt-1 block">{errors.house_street}</span>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Barangay Name *</label>
                                <Input value={data.barangay_name} onChange={e => setData('barangay_name', e.target.value)} required />
                                {errors.barangay_name && <span className="text-xs text-red-600 mt-1 block">{errors.barangay_name}</span>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">City / Municipality *</label>
                                <Input value={data.city} onChange={e => setData('city', e.target.value)} required />
                                {errors.city && <span className="text-xs text-red-600 mt-1 block">{errors.city}</span>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Province *</label>
                                <Input value={data.province} onChange={e => setData('province', e.target.value)} required />
                                {errors.province && <span className="text-xs text-red-600 mt-1 block">{errors.province}</span>}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Email Address *</label>
                                <Input value={data.email} disabled className="bg-gray-100 text-gray-500 cursor-not-allowed" />
                                <span className="text-[10px] text-gray-400 mt-0.5 block">Email cannot be changed once registered.</span>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Phone Number *</label>
                                <Input value={data.mobile} onChange={e => setData('mobile', e.target.value)} required />
                                {errors.mobile && <span className="text-xs text-red-600 mt-1 block">{errors.mobile}</span>}
                            </div>
                        </div>

                        {/* Government ID Upload */}
                        <div className="pt-2 border-t">
                            <label className="block text-xs font-bold uppercase text-gray-800 mb-2">Submit Government ID (Image or PDF) *</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <input 
                                    type="file" 
                                    accept="image/*,application/pdf"
                                    onChange={e => setData('government_id', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                    required
                                />
                            </div>
                            {errors.government_id && <span className="text-xs text-red-600 mt-1 block">{errors.government_id}</span>}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex items-center justify-between border-t gap-4">
                            <Link href="/account-status" className="text-sm font-medium text-blue-600 hover:underline">
                                Back to Account Status
                            </Link>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                                {processing ? 'Submitting...' : 'Submit Registration'}
                            </Button>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}