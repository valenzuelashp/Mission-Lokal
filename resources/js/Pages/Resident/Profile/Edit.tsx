import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { ShieldAlert } from 'lucide-react';

export default function ProfileEdit({ profile }: { profile: any }) {
    const { data, setData, post, processing, errors } = useForm({
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        mobile: profile?.mobile || '',
        sex: profile?.sex || 'Male',
        civil_status: profile?.civil_status || 'Single',
        house_street: profile?.house_street || '',
        barangay_name: profile?.barangay_name || '',
        city: profile?.city || '',
        province: profile?.province || '',
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

            <div className="max-w-xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">Request Profile Modification</h1>
                    <p className="text-sm text-gray-500 mt-1">Changes to your official profile require administrative review.</p>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Full Name *</label>
                        <Input value={data.full_name} onChange={e => setData('full_name', e.target.value)} required />
                        {errors.full_name && <span className="text-xs text-red-600 mt-1 block">{errors.full_name}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Sex *</label>
                            <select 
                                value={data.sex} 
                                onChange={e => setData('sex', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
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
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                            >
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Widowed">Widowed</option>
                                <option value="Separated">Separated</option>
                            </select>
                            {errors.civil_status && <span className="text-xs text-red-600 mt-1 block">{errors.civil_status}</span>}
                        </div>
                    </div>

                    {/* --- GUARDIAN FIELDS FOR MINOR PROFILE EDITS --- */}
                    {isMinor && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4">
                            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
                                <ShieldAlert className="h-4 w-4 text-amber-600" />
                                Parent / Guardian Information (Required Review)
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Guardian Name *</label>
                                    <Input value={data.parent_name} onChange={e => setData('parent_name', e.target.value)} required={isMinor} />
                                    {errors.parent_name && <span className="text-xs text-red-600 mt-1 block">{errors.parent_name}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Guardian Contact *</label>
                                    <Input value={data.parent_contact} onChange={e => setData('parent_contact', e.target.value)} required={isMinor} />
                                    {errors.parent_contact && <span className="text-xs text-red-600 mt-1 block">{errors.parent_contact}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Email Address *</label>
                            <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                            {errors.email && <span className="text-xs text-red-600 mt-1 block">{errors.email}</span>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">Mobile Number *</label>
                            <Input value={data.mobile} onChange={e => setData('mobile', e.target.value)} required />
                            {errors.mobile && <span className="text-xs text-red-600 mt-1 block">{errors.mobile}</span>}
                        </div>
                    </div>

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

                    <div className="pt-4 flex justify-end gap-3 border-t">
                        <Link href="/profile">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {processing ? 'Submitting...' : 'Submit Edit Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </ResidentLayout>
    );
}