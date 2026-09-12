import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { ShieldAlert } from 'lucide-react';

function toUpperCase(value: string) {
    return value.toUpperCase();
}

function CapsInput({
    value,
    onChange,
    required,
    placeholder,
    disabled,
}: {
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <Input
            value={value}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="uppercase"
            onChange={(e) => onChange(toUpperCase(e.target.value))}
        />
    );
}

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        middle_name: '',
        no_middle_name: false,
        last_name: '',
        name_extension: '',
        house_street: '',
        barangay_name: '',
        city: '',
        province: '',
        birthday: '',
        email: '',
        mobile: '',
        sex: 'Male',
        civil_status: 'Single',
        government_id: null as File | null,
        consent: false, // PHASE 9: Track the consent checkbox state
        parent_name: '',
        parent_contact: '',
    });

    const formErrors = errors as Record<string, string | undefined>;
    const [isMinor, setIsMinor] = useState(false);

    // Watch birthday changes to dynamically calculate if user is a minor (< 18)
    useEffect(() => {
        if (data.birthday) {
            const birthDate = new Date(data.birthday);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            setIsMinor(age < 18);
        } else {
            setIsMinor(false);
        }
    }, [data.birthday]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
            <Head title="Resident Registration" />

            <div className="w-full max-w-2xl rounded-xl border bg-white p-8 shadow-sm">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-blue-900">Mission-Lokal Resident Portal</h1>
                    <p className="text-sm text-muted-foreground mt-1">Submit your details to compare with barangay records and request verification.</p>
                </div>

                {formErrors.general && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {formErrors.general}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium">First Name *</label>
                            <CapsInput value={data.first_name} onChange={(value) => setData('first_name', value)} required />
                            {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium">Middle Name</label>
                            <CapsInput
                                value={data.middle_name}
                                onChange={(value) => setData('middle_name', value)}
                                disabled={data.no_middle_name}
                            />
                            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.no_middle_name}
                                    onChange={(e) => {
                                        const noMiddleName = e.target.checked;
                                        setData('no_middle_name', noMiddleName);
                                        setData('middle_name', noMiddleName ? 'N/A' : '');
                                    }}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                />
                                No middle name
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium">Last Name *</label>
                            <CapsInput value={data.last_name} onChange={(value) => setData('last_name', value)} required />
                            {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium">Name Extension</label>
                            <CapsInput placeholder="JR, III, etc." value={data.name_extension} onChange={(value) => setData('name_extension', value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-medium">Sex *</label>
                            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm" value={data.sex} onChange={e => setData('sex', e.target.value)}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium">Civil Status *</label>
                            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm" value={data.civil_status} onChange={e => setData('civil_status', e.target.value)}>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Widowed">Widowed</option>
                                <option value="Separated">Separated</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium">Birthday *</label>
                            <Input type="date" value={data.birthday} onChange={e => setData('birthday', e.target.value)} required />
                            {errors.birthday && <p className="text-xs text-red-600 mt-1">{errors.birthday}</p>}
                        </div>
                    </div>

                    {/* --- CONDITIONAL GUARDIAN SECTION FOR MINORS --- */}
                    {isMinor && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4">
                            <div className="flex items-start gap-2">
                                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-900 font-medium">
                                    You have entered a birthdate indicating you are a minor (under 18 years old). Please provide your parent or guardian's details below.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium">Parent / Guardian Full Name *</label>
                                    <CapsInput value={data.parent_name} onChange={(value) => setData('parent_name', value)} required={isMinor} placeholder="Guardian Name" />
                                    {errors.parent_name && <p className="text-xs text-red-600 mt-1">{errors.parent_name}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-medium">Parent / Guardian Contact *</label>
                                    <Input placeholder="09123456789" value={data.parent_contact} onChange={e => setData('parent_contact', e.target.value)} required={isMinor} />
                                    {errors.parent_contact && <p className="text-xs text-red-600 mt-1">{errors.parent_contact}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-3">
                        <div>
                            <label className="text-xs font-medium">House / Street *</label>
                            <CapsInput placeholder="House #, Street" value={data.house_street} onChange={(value) => setData('house_street', value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-medium">Barangay Name *</label>
                            <CapsInput placeholder="Barangay" value={data.barangay_name} onChange={(value) => setData('barangay_name', value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-medium">City / Municipality *</label>
                            <CapsInput placeholder="City" value={data.city} onChange={(value) => setData('city', value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-medium">Province *</label>
                            <CapsInput placeholder="Province" value={data.province} onChange={(value) => setData('province', value)} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
                        <div className="sm:col-span-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900">
                            Email and phone number are not in the barangay census yet. Please add them here so the admin can send your login credentials after approval.
                        </div>
                        <div>
                            <label className="text-xs font-medium">Email Address *</label>
                            <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium">Phone Number *</label>
                            <Input placeholder="09123456789" value={data.mobile} onChange={e => setData('mobile', e.target.value)} required />
                            {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium mb-1 block">Submit Government ID (Image or PDF) *</label>
                        <input 
                            type="file" 
                            accept=".jpg, .jpeg, .png, .pdf"
                            onChange={e => setData('government_id', e.target.files ? e.target.files[0] : null)}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                            required
                        />
                        {errors.government_id && <p className="text-xs text-red-600 mt-1">{errors.government_id}</p>}
                    </div>

                    {/* PHASE 9: Data Privacy Consent Checkbox */}
                    <div className="pt-2">
                        <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                            <input
                                type="checkbox"
                                id="consent"
                                checked={data.consent}
                                onChange={e => setData('consent', e.target.checked)}
                                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                required
                            />
                            <label htmlFor="consent" className="text-xs text-slate-600 leading-relaxed">
                                By registering, I consent to the collection and processing of my personal data by Mission-Lokal for the purpose of barangay identity verification and community service management, in accordance with the Data Privacy Act of 2012. I have read the{' '}
                                <Link href="/privacy" className="font-medium text-blue-700 underline underline-offset-2">
                                    Privacy Policy
                                </Link>
                                .
                            </label>
                        </div>
                        {errors.consent && <p className="text-xs font-medium text-red-600 mt-1">{errors.consent}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <Link href="/login" className="text-sm text-blue-600 hover:underline">Back to Login</Link>
                        <Button type="submit" disabled={processing} className="bg-red-600 hover:bg-red-700">Submit Registration</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}