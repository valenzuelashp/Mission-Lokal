import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { Lock, ShieldAlert } from 'lucide-react';

function LockedField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">{label}</label>
            <Input value={value || '—'} disabled className="bg-slate-50 text-slate-700" />
        </div>
    );
}

export default function ProfileEdit({ profile }: { profile: any }) {
    const { data, setData, post, processing, errors } = useForm({
        email: profile?.email || '',
        mobile: profile?.mobile || '',
        parent_name: profile?.parent_name || '',
        parent_contact: profile?.parent_contact || '',
    });

    const isMinor = profile?.is_minor || false;
    const address = [profile?.house_street, profile?.barangay_name, profile?.city, profile?.province]
        .filter(Boolean)
        .join(', ');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile/edit');
    };

    return (
        <ResidentLayout>
            <Head title="Edit Profile" />

            <div className="mx-auto max-w-xl space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900">Request contact update</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Email, mobile, and guardian details go to the barangay for review. Census identity stays locked.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                            <Lock className="h-4 w-4 text-slate-500" />
                            Census record (not editable)
                        </div>
                        <p className="mb-4 text-xs text-slate-500">
                            Name, birthday, sex, civil status, and address can only be corrected at the barangay hall with a valid ID.
                        </p>
                        <div className="space-y-3">
                            <LockedField label="Full name" value={profile?.full_name || ''} />
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <LockedField label="Birthday" value={profile?.birthday || ''} />
                                <LockedField label="Sex" value={profile?.sex || ''} />
                                <LockedField label="Civil status" value={profile?.civil_status || ''} />
                            </div>
                            <LockedField label="Address" value={address} />
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

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <Link href="/profile">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700">
                            {processing ? 'Submitting...' : 'Submit contact request'}
                        </Button>
                    </div>
                </form>
            </div>
        </ResidentLayout>
    );
}
