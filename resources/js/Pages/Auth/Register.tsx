import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { ShieldAlert, Search, ChevronDown, FileText, CheckCircle2 } from 'lucide-react';
import FormProgress from '@/Components/shared/FormProgress';

function formatDateInputForPH(date: Date) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const parts = formatter.formatToParts(date);
    const values = Object.fromEntries(
        parts
            .filter((part) => part.type !== 'literal')
            .map((part) => [part.type, part.value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
}

function parseDateOnly(value: string) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
}

function TextInput({
    value,
    onChange,
    required,
    placeholder,
    disabled,
    id,
    maxLength = 255,
}: {
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    maxLength?: number;
}) {
    return (
        <Input
            id={id}
            name={id}
            value={value}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            className="bg-slate-50/50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all text-base sm:text-xs font-medium h-11"
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

// Searchable Dropdown Component with Alphabetical Sorting & Search Bar
function SearchableSelect({
    label,
    options,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    name,
    error,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    required?: boolean;
    disabled?: boolean;
    name: string;
    error?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const sortedAndFilteredOptions = useMemo(() => {
        return [...options]
            .filter((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => a.localeCompare(b));
    }, [options, searchTerm]);

    return (
        <div className="relative min-w-0">
            <label htmlFor={name} className="text-xs font-semibold text-slate-700 mb-1 block">
                {label} {required && <span className="text-blue-600">*</span>}
            </label>
            <button
                type="button"
                id={name}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen && !disabled}
                aria-required={required}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${name}-error` : undefined}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(event) => { if (event.key === 'Escape') setIsOpen(false); }}
                className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-left text-sm transition-all cursor-pointer ${
                    disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:border-blue-400 hover:bg-white focus:ring-2 focus:ring-blue-500/20'
                }`}
            >
                <span className={`min-w-0 break-words ${value ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                    {value || placeholder}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 opacity-70" />
            </button>
            {error && <p id={`${name}-error`} role="alert" className="mt-1 text-xs text-red-600">{error}</p>}

            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-100 bg-white shadow-xl shadow-blue-950/5 overflow-hidden animate-in fade-in-50 zoom-in-95">
                    <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/80">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            aria-label={`Search ${label}`}
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') event.preventDefault();
                                if (event.key === 'Escape') setIsOpen(false);
                            }}
                            className="min-w-0 w-full bg-transparent text-base sm:text-xs focus:outline-none text-slate-800 font-medium"
                            autoFocus
                        />
                    </div>
                    <div role="listbox" aria-label={label} className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                        {sortedAndFilteredOptions.length === 0 ? (
                            <div className="py-2 text-center text-xs text-slate-400 font-medium">No matches found in DB</div>
                        ) : (
                            sortedAndFilteredOptions.map((opt) => (
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={value === opt}
                                    key={opt}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`min-h-11 w-full cursor-pointer rounded-md px-2.5 py-2 text-left text-sm transition-colors font-medium ${
                                        value === opt ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Register() {
    const { data, setData: setFormData, post, processing, errors, clearErrors, reset } = useForm({
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
        government_id: null as File | null,
        consent: false,
        parent_name: '',
        parent_contact: '',
    });

    const formErrors = errors as Record<string, string | undefined>;
    const [isMinor, setIsMinor] = useState(false);
    const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);

    const identityFields = ['first_name', 'middle_name', 'no_middle_name', 'last_name', 'name_extension', 'birthday', 'email', 'mobile', 'parent_name', 'parent_contact'];
    const setData = <K extends keyof typeof data>(field: K, value: (typeof data)[K]) => {
        setFormData((current) => ({ ...current, [field]: value }));
        clearErrors(field);
        if (identityFields.includes(field) && formErrors.general) {
            clearErrors('general' as keyof typeof data);
        }
    };

    const showValidationErrors = (validationErrors: Record<string, string>) => {
        const identityError = Object.keys(validationErrors).find((field) => identityFields.includes(field));
        if (identityError || validationErrors.general) setRegistrationStep(1);
        requestAnimationFrame(() => {
            const target = document.getElementById(validationErrors.general ? 'registration-error' : identityError ?? Object.keys(validationErrors)[0]);
            target?.focus();
            target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    };
    
    // Catch flash messages from the backend
    const { flash } = usePage().props as any;

    // Determine the absolute max date available (12 years ago from today)
    const [maxDateString] = useState(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 12);
        return formatDateInputForPH(d);
    });
    
    // Cascading DB Data States
    const [provinces, setProvinces] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [barangays, setBarangays] = useState<{ id: string; name: string; code: string }[]>([]);

    // Load Provinces on mount
    useEffect(() => {
        fetch('/api/location-options?type=provinces')
            .then((res) => res.json())
            .then((data) => setProvinces(data))
            .catch(() => setProvinces([]));
    }, []);

    // Load Cities when Province changes
    useEffect(() => {
        if (!data.province) {
            setCities([]);
            setBarangays([]);
            return;
        }
        fetch(`/api/location-options?type=cities&province=${encodeURIComponent(data.province)}`)
            .then((res) => res.json())
            .then((resData) => setCities(resData))
            .catch(() => setCities([]));
    }, [data.province]);

    // Load Barangays when City changes
    useEffect(() => {
        if (!data.city) {
            setBarangays([]);
            return;
        }
        fetch(`/api/location-options?type=barangays&province=${encodeURIComponent(data.province)}&city=${encodeURIComponent(data.city)}`)
            .then((res) => res.json())
            .then((resData) => setBarangays(resData))
            .catch(() => setBarangays([]));
    }, [data.city, data.province]);

    useEffect(() => {
        if (data.birthday) {
            const birthDate = parseDateOnly(data.birthday);
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

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (processing) return;

        if (registrationStep === 1) {
            post('/register/identity', {
                preserveScroll: true,
                onSuccess: () => {
                    setRegistrationStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
                onError: showValidationErrors,
            });
            return;
        }

        const form = e.currentTarget;
        post('/register', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                form.reset();
                setRegistrationStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onError: showValidationErrors,
        });
    };

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 px-4 sm:px-10 py-4 sm:py-6 flex items-center justify-center">
            <Head title="Resident Registration" />

            <div aria-hidden="true" className="progressive-blur-background pointer-events-none absolute inset-x-0 top-1/4 h-72 bg-blue-200/20" />
            <div className="glass-card relative w-full max-w-5xl min-w-0 rounded-2xl border border-blue-100/80 bg-white/95 p-4 sm:p-8 shadow-xl shadow-blue-950/5 space-y-5">
                
                {/* Header Banner */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold mb-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            Official Resident Portal
                        </span>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                            Mission-Lokal Registration
                        </h1>
                    </div>
                    <Link 
                        href="/login" 
                        className="inline-flex min-h-11 shrink-0 items-center self-start text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                    >
                        Sign in instead
                    </Link>
                </div>

                {/* Display Success Flash Message */}
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {formErrors.general && (
                    <div id="registration-error" role="alert" tabIndex={-1} className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
                        <span>{formErrors.general}</span>
                    </div>
                )}

                {/* Form Body in 2 Columns */}
                <form onSubmit={submit} className="space-y-4">
                    <FormProgress current={registrationStep} total={2} labels={['Identity', 'Address & Verification']} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        
                        {/* COLUMN 1: Personal Info & Contacts */}
                        <fieldset disabled={registrationStep !== 1 || processing} className={`min-w-0 space-y-3 md:col-span-2 ${registrationStep === 1 ? 'block' : 'hidden'}`}>
                            <div className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b pb-1">
                                1. Personal & Contact Details
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="first_name" className="text-xs font-semibold text-slate-700 mb-1 block">First Name *</label>
                                    <TextInput id="first_name" value={data.first_name} onChange={(value) => setData('first_name', value)} required placeholder="Juan" />
                                    {errors.first_name && <p className="text-[10px] text-red-600 mt-0.5">{errors.first_name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="middle_name" className="text-xs font-semibold text-slate-700 mb-1 block">Middle Name</label>
                                    <TextInput
                                        id="middle_name"
                                        value={data.middle_name}
                                        onChange={(value) => setData('middle_name', value)}
                                        disabled={data.no_middle_name}
                                        placeholder="Santos"
                                    />
                                    <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-600 font-medium mt-1.5">
                                        <input
                                            type="checkbox"
                                            checked={data.no_middle_name}
                                            onChange={(e) => {
                                                const noMiddleName = e.target.checked;
                                                setData('no_middle_name', noMiddleName);
                                                setData('middle_name', noMiddleName ? 'N/A' : '');
                                            }}
                                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                        />
                                        No middle name
                                    </label>
                                    {errors.middle_name && <p role="alert" className="mt-1 text-xs text-red-600">{errors.middle_name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="last_name" className="text-xs font-semibold text-slate-700 mb-1 block">Last Name *</label>
                                    <TextInput id="last_name" value={data.last_name} onChange={(value) => setData('last_name', value)} required placeholder="Dela Cruz" />
                                    {errors.last_name && <p className="text-[10px] text-red-600 mt-0.5">{errors.last_name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="name_extension" className="text-xs font-semibold text-slate-700 mb-1 block">Extension</label>
                                    <TextInput id="name_extension" maxLength={20} placeholder="Jr, III" value={data.name_extension} onChange={(value) => setData('name_extension', value)} />
                                    {errors.name_extension && <p role="alert" className="mt-1 text-xs text-red-600">{errors.name_extension}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="birthday" className="text-xs font-semibold text-slate-700 mb-1 block">Birthday (Must be 12+) *</label>
                                    <Input 
                                        id="birthday"
                                        name="birthday"
                                        type="date" 
                                        max={maxDateString}
                                        value={data.birthday} 
                                        onChange={e => setData('birthday', e.target.value)} 
                                        required 
                                        className="min-w-0 bg-slate-50/50 border-slate-200 text-base sm:text-xs h-11 font-medium"
                                    />
                                    {errors.birthday && <p className="text-[10px] text-red-600 mt-0.5">{errors.birthday}</p>}
                                </div>
                                <div>
                                    <label htmlFor="mobile" className="text-xs font-semibold text-slate-700 mb-1 block">Phone Number *</label>
                                    <Input 
                                        id="mobile"
                                        name="mobile"
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="09123456789" 
                                        value={data.mobile} 
                                        onChange={e => {
                                            // Ensure only numbers are inputted and limit to 11 digits
                                            const numericValue = e.target.value.replace(/\D/g, '').slice(0, 11);
                                            setData('mobile', numericValue);
                                        }} 
                                        required
                                        pattern="^09[0-9]{9}$"
                                        title="Phone number must start with 09 and be exactly 11 digits long."
                                        maxLength={11}
                                        className="bg-slate-50/50 border-slate-200 text-base sm:text-xs h-11 font-medium"
                                    />
                                    {errors.mobile && <p className="text-[10px] text-red-600 mt-0.5">{errors.mobile}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="text-xs font-semibold text-slate-700 mb-1 block">Gmail Address *</label>
                                <Input 
                                    id="email"
                                    name="email"
                                    type="email" 
                                    value={data.email} 
                                    onChange={e => setData('email', e.target.value)} 
                                    required 
                                    pattern=".*@gmail\.com$"
                                    maxLength={255}
                                    title="Please provide a valid @gmail.com address."
                                    placeholder="name@gmail.com"
                                    className="bg-slate-50/50 border-slate-200 text-base sm:text-xs h-11 font-medium"
                                />
                                {errors.email && <p className="text-[10px] text-red-600 mt-0.5">{errors.email}</p>}
                            </div>

                            {isMinor && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-2.5 space-y-2">
                                    <p className="text-[10px] text-amber-900 font-semibold">Minor detected (under 18). Guardian details required:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor="parent_name" className="mb-1 block text-xs font-semibold text-slate-700">Guardian name *</label>
                                            <TextInput id="parent_name" value={data.parent_name} onChange={(value) => setData('parent_name', value)} required placeholder="Guardian name" />
                                            {errors.parent_name && <p role="alert" className="mt-1 text-xs text-red-600">{errors.parent_name}</p>}
                                        </div>
                                        <div>
                                        <label htmlFor="parent_contact" className="mb-1 block text-xs font-semibold text-slate-700">Guardian phone number *</label>
                                        <Input 
                                            id="parent_contact"
                                            name="parent_contact"
                                            type="tel"
                                            inputMode="numeric"
                                            placeholder="09123456789" 
                                            value={data.parent_contact} 
                                            onChange={e => {
                                                const numericValue = e.target.value.replace(/\D/g, '').slice(0, 11);
                                                setData('parent_contact', numericValue);
                                            }} 
                                            required={isMinor} 
                                            pattern="^09[0-9]{9}$"
                                            title="Phone number must start with 09 and be exactly 11 digits long."
                                            maxLength={11}
                                            className="bg-white text-base sm:text-xs h-11"
                                        />
                                        {errors.parent_contact && <p role="alert" className="mt-1 text-xs text-red-600">{errors.parent_contact}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </fieldset>

                        {/* COLUMN 2: Address & Identity Verification */}
                        <fieldset disabled={registrationStep !== 2 || processing} className={`min-w-0 space-y-3 md:col-span-2 ${registrationStep === 2 ? 'block' : 'hidden'}`}>
                            <div className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b pb-1">
                                2. Address & Verification
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <SearchableSelect
                                    name="province"
                                    error={errors.province}
                                    label="Province"
                                    options={provinces}
                                    value={data.province}
                                    onChange={(val) => {
                                        setData('province', val);
                                        setData('city', '');
                                        setData('barangay_name', '');
                                    }}
                                    placeholder="SELECT PROVINCE"
                                    required
                                />

                                <SearchableSelect
                                    name="city"
                                    error={errors.city}
                                    label="City / Municipality"
                                    options={cities}
                                    value={data.city}
                                    onChange={(val) => {
                                        setData('city', val);
                                        setData('barangay_name', '');
                                    }}
                                    placeholder="SELECT CITY"
                                    required
                                    disabled={!data.province}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <SearchableSelect
                                    name="barangay_name"
                                    error={errors.barangay_name}
                                    label="Barangay Name"
                                    options={barangays.map(b => b.name)}
                                    value={data.barangay_name}
                                    onChange={(val) => setData('barangay_name', val)}
                                    placeholder="SELECT BARANGAY"
                                    required
                                    disabled={!data.city}
                                />

                                <div>
                                    <label htmlFor="house_street" className="text-xs font-semibold text-slate-700 mb-1 block">House / Street *</label>
                                    <TextInput id="house_street" maxLength={150} placeholder="House #, Street" value={data.house_street} onChange={(value) => setData('house_street', value)} required />
                                    {errors.house_street && <p role="alert" className="mt-1 text-xs text-red-600">{errors.house_street}</p>}
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
                                <label htmlFor="government_id" className="text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                                    Government Issued ID (Image/PDF) *
                                </label>
                                <input 
                                    id="government_id"
                                    name="government_id"
                                    type="file" 
                                    accept=".jpg, .jpeg, .png, .pdf"
                                    onChange={e => setData('government_id', e.target.files ? e.target.files[0] : null)}
                                    className="min-h-11 min-w-0 w-full text-xs text-slate-600 file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer bg-white border border-slate-200 rounded-md p-1"
                                    required
                                />
                                {errors.government_id && <p className="text-[10px] text-red-600 mt-0.5">{errors.government_id}</p>}
                                <p className="mt-1 text-xs text-slate-500">JPG, PNG, or PDF. Maximum file size: 2 MB.</p>
                            </div>

                            <div>
                                <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/30 p-2.5">
                                    <input
                                        type="checkbox"
                                        id="consent"
                                        checked={data.consent}
                                        onChange={e => setData('consent', e.target.checked)}
                                        className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                        required
                                    />
                                    <label htmlFor="consent" className="text-xs text-slate-700 leading-relaxed font-medium">
                                        I consent to the collection and processing of my data for barangay verification under the Data Privacy Act of 2012.{' '}
                                        <Link href="/privacy" className="font-bold text-blue-700 underline">Privacy Policy</Link>
                                    </label>
                                </div>
                                {errors.consent && <p className="text-[10px] font-semibold text-red-600 mt-1">{errors.consent}</p>}
                            </div>
                        </fieldset>

                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-100">
                        {registrationStep === 2 ? (
                            <Button type="button" variant="outline" disabled={processing} onClick={() => setRegistrationStep(1)} className="w-full sm:w-auto rounded-xl text-xs font-bold">
                                &larr; Previous
                            </Button>
                        ) : (
                            <Link href="/account-status" className="inline-flex min-h-11 items-center text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline">
                                Already submitted? Check your application status
                            </Link>
                        )}
                        {registrationStep === 1 ? (
                            <Button type="submit" disabled={processing} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-md shadow-blue-600/20 text-xs">
                                {processing ? 'Checking details...' : 'Continue to Address'}
                            </Button>
                        ) : (
                            <Button type="submit" disabled={processing} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-md shadow-blue-600/20 transition-all text-xs tracking-wide">
                                {processing ? 'Submitting...' : 'Submit Registration'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
