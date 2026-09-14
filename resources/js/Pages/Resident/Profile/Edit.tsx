import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { ShieldAlert } from 'lucide-react';

export default function ProfileEdit({ profile }: { profile: any }) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: profile?.first_name || '',
        middle_name: profile?.middle_name || '',
        last_name: profile?.last_name || '',
        name_extension: profile?.name_extension || '',
        birthday: profile?.birthday || '',
        sex: profile?.sex || 'Male',
        civil_status: profile?.civil_status || 'Single',
        house_street: profile?.house_street || '',
        barangay_name: profile?.barangay_name || '',
        city: profile?.city || '',
        province: profile?.province || '',
        email: profile?.email || '',
        mobile: profile?.mobile || '',
        parent_name: profile?.parent_name || '',
        parent_contact: profile?.parent_contact || '',
    });

    const isMinor = profile?.is_minor || false;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile/edit');
    };

    return (
        <ResidentLayout>
            <Head title="Edit Profile" />

            <div className="mx-auto max-w-xl space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900">Update Profile Details</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Modify your personal, contact, or address information. Changes will be submitted to barangay administration for review.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    
                    {/* Personal Information */}
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Personal Information</h3>
                        
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">First Name *</label>
                                <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required />
                                {errors.first_name && <span className="mt-1 block text-xs text-red-600">{errors.first_name}</span>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Middle Name</label>
                                <Input value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} />
                                {errors.middle_name && <span className="mt-1 block text-xs text-red-600">{errors.middle_name}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Last Name *</label>
                                <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required />
                                {errors.last_name && <span className="mt-1 block text-xs text-red-600">{errors.last_name}</span>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Name Extension</label>
                                <Input placeholder="e.g. Jr., III" value={data.name_extension} onChange={(e) => setData('name_extension', e.target.value)} />
                                {errors.name_extension && <span className="mt-1 block text-xs text-red-600">{errors.name_extension}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Birthday *</label>
                                <Input type="date" value={data.birthday} onChange={(e) => setData('birthday', e.target.value)} required />
                                {errors.birthday && <span className="mt-1 block text-xs text-red-600">{errors.birthday}</span>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Sex *</label>
                                <select 
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                    value={data.sex}
                                    onChange={(e) => setData('sex', e.target.value)}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.sex && <span className="mt-1 block text-xs text-red-600">{errors.sex}</span>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Civil Status *</label>
                                <select 
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                    value={data.civil_status}
                                    onChange={(e) => setData('civil_status', e.target.value)}
                                >
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Separated">Separated</option>
                                </select>
                                {errors.civil_status && <span className="mt-1 block text-xs text-red-600">{errors.civil_status}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Address Details</h3>
                        
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">House / Street Address *</label>
                            <Input value={data.house_street} onChange={(e) => setData('house_street', e.target.value)} required />
                            {errors.house_street && <span className="mt-1 block text-xs text-red-600">{errors.house_street}</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Barangay *</label>
                                <Input value={data.barangay_name} onChange={(e) => setData('barangay_name', e.target.value)} required />
                                {errors.barangay_name && <span className="mt-1 block text-xs text-red-600">{errors.barangay_name}</span>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">City / Municipality *</label>
                                <Input value={data.city} onChange={(e) => setData('city', e.target.value)} required />
                                {errors.city && <span className="mt-1 block text-xs text-red-600">{errors.city}</span>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Province *</label>
                                <Input value={data.province} onChange={(e) => setData('province', e.target.value)} required />
                                {errors.province && <span className="mt-1 block text-xs text-red-600">{errors.province}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Contact Details</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Email address *</label>
                                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Mobile number *</label>
                                <Input value={data.mobile} onChange={(e) => setData('mobile', e.target.value)} required />
                                {errors.mobile && <span className="mt-1 block text-xs text-red-600">{errors.mobile}</span>}
                            </div>
                        </div>
                    </div>

                    {isMinor && (
                        <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900">
                                <ShieldAlert className="h-4 w-4 text-amber-600" />
                                Parent / guardian information
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Guardian name *</label>
                                    <Input value={data.parent_name} onChange={(e) => setData('parent_name', e.target.value)} required={isMinor} />
                                    {errors.parent_name && <span className="mt-1 block text-xs text-red-600">{errors.parent_name}</span>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">Guardian contact *</label>
                                    <Input value={data.parent_contact} onChange={(e) => setData('parent_contact', e.target.value)} required={isMinor} />
                                    {errors.parent_contact && <span className="mt-1 block text-xs text-red-600">{errors.parent_contact}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <Link href="/profile">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700">
                            {processing ? 'Submitting...' : 'Submit profile changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </ResidentLayout>
    );
}