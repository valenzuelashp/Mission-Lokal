import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { ShieldAlert, Search, ChevronDown, FileText, CheckCircle2 } from 'lucide-react';

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
            className="uppercase bg-slate-50/50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all text-xs font-medium h-9"
            onChange={(e) => onChange(toUpperCase(e.target.value))}
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
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    required?: boolean;
    disabled?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const sortedAndFilteredOptions = useMemo(() => {
        return [...options]
            .filter((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => a.localeCompare(b));
    }, [options, searchTerm]);

    return (
        <div className="relative">
            <label className="text-[11px] font-semibold text-slate-700 mb-1 block">
                {label} {required && <span className="text-blue-600">*</span>}
            </label>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs transition-all cursor-pointer ${
                    disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:border-blue-400 hover:bg-white focus:ring-2 focus:ring-blue-500/20'
                }`}
            >
                <span className={value ? 'uppercase text-slate-900 font-semibold tracking-wide' : 'text-slate-400'}>
                    {value || placeholder}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 opacity-70" />
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-100 bg-white shadow-xl shadow-blue-950/5 overflow-hidden animate-in fade-in-50 zoom-in-95">
                    <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/80">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent text-xs uppercase focus:outline-none text-slate-800 font-medium"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-40 overflow-y-auto p-1 space-y-0.5">
                        {sortedAndFilteredOptions.length === 0 ? (
                            <div className="py-2 text-center text-xs text-slate-400 font-medium">No matches found in DB</div>
                        ) : (
                            sortedAndFilteredOptions.map((opt) => (
                                <div
                                    key={opt}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`cursor-pointer rounded-md px-2.5 py-1.5 text-xs uppercase transition-colors font-medium ${
                                        value === opt ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {opt}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
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
    
    // Catch flash messages from the backend
    const { flash } = usePage().props as any;

    // Determine the absolute max date available (12 years ago from today)
    const [maxDateString] = useState(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 12);
        return d.toISOString().split('T')[0];
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
        // Upon success, reset the form so it is ready for another submission if needed.
        post('/register', {
            onSuccess: () => reset()
        });
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 px-6 sm:px-10 py-6 flex items-center justify-center">
            <Head title="Resident Registration" />

            <div className="w-full rounded-2xl border border-blue-100/80 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-blue-950/5 space-y-5">
                
                {/* Header Banner */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
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
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
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
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
                        <span>{formErrors.general}</span>
                    </div>
                )}

                {/* Form Body in 2 Columns */}
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        
                        {/* COLUMN 1: Personal Info & Contacts */}
                        <div className="space-y-3">
                            <div className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b pb-1">
                                1. Personal & Contact Details
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">First Name *</label>
                                    <CapsInput value={data.first_name} onChange={(value) => setData('first_name', value)} required placeholder="JUAN" />
                                    {errors.first_name && <p className="text-[10px] text-red-600 mt-0.5">{errors.first_name}</p>}
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Middle Name</label>
                                    <CapsInput
                                        value={data.middle_name}
                                        onChange={(value) => setData('middle_name', value)}
                                        disabled={data.no_middle_name}
                                        placeholder="SANTOS"
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
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Last Name *</label>
                                    <CapsInput value={data.last_name} onChange={(value) => setData('last_name', value)} required placeholder="DELA CRUZ" />
                                    {errors.last_name && <p className="text-[10px] text-red-600 mt-0.5">{errors.last_name}</p>}
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Extension</label>
                                    <CapsInput placeholder="JR, III" value={data.name_extension} onChange={(value) => setData('name_extension', value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Birthday (Must be 12+) *</label>
                                    <Input 
                                        type="date" 
                                        max={maxDateString}
                                        value={data.birthday} 
                                        onChange={e => setData('birthday', e.target.value)} 
                                        required 
                                        className="bg-slate-50/50 border-slate-200 text-xs h-9 font-medium"
                                    />
                                    {errors.birthday && <p className="text-[10px] text-red-600 mt-0.5">{errors.birthday}</p>}
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Phone Number *</label>
                                    <Input 
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
                                        className="bg-slate-50/50 border-slate-200 text-xs h-9 font-medium"
                                    />
                                    {errors.mobile && <p className="text-[10px] text-red-600 mt-0.5">{errors.mobile}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Gmail Address *</label>
                                <Input 
                                    type="email" 
                                    value={data.email} 
                                    onChange={e => setData('email', e.target.value)} 
                                    required 
                                    pattern=".*@gmail\.com$"
                                    title="Please provide a valid @gmail.com address."
                                    placeholder="name@gmail.com"
                                    className="bg-slate-50/50 border-slate-200 text-xs h-9 font-medium"
                                />
                                {errors.email && <p className="text-[10px] text-red-600 mt-0.5">{errors.email}</p>}
                            </div>

                            {isMinor && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-2.5 space-y-2">
                                    <p className="text-[10px] text-amber-900 font-semibold">Minor detected (under 18). Guardian details required:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <CapsInput value={data.parent_name} onChange={(value) => setData('parent_name', value)} required={isMinor} placeholder="GUARDIAN NAME" />
                                        <Input 
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
                                            className="bg-white text-xs h-9" 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* COLUMN 2: Address & Identity Verification */}
                        <div className="space-y-3">
                            <div className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b pb-1">
                                2. Address & Verification
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <SearchableSelect
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

                            <div className="grid grid-cols-2 gap-3">
                                <SearchableSelect
                                    label="Barangay Name"
                                    options={barangays.map(b => b.name)}
                                    value={data.barangay_name}
                                    onChange={(val) => setData('barangay_name', val)}
                                    placeholder="SELECT BARANGAY"
                                    required
                                    disabled={!data.city}
                                />

                                <div>
                                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">House / Street *</label>
                                    <CapsInput placeholder="HOUSE #, STREET" value={data.house_street} onChange={(value) => setData('house_street', value)} required />
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
                                <label className="text-[11px] font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                                    Government Issued ID (Image/PDF) *
                                </label>
                                <input 
                                    type="file" 
                                    accept=".jpg, .jpeg, .png, .pdf"
                                    onChange={e => setData('government_id', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer bg-white border border-slate-200 rounded-md p-1"
                                    required
                                />
                                {errors.government_id && <p className="text-[10px] text-red-600 mt-0.5">{errors.government_id}</p>}
                            </div>

                            <div>
                                <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/30 p-2.5">
                                    <input
                                        type="checkbox"
                                        id="consent"
                                        checked={data.consent}
                                        onChange={e => setData('consent', e.target.checked)}
                                        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                        required
                                    />
                                    <label htmlFor="consent" className="text-[10px] text-slate-700 leading-tight font-medium">
                                        I consent to the collection and processing of my data for barangay verification under the Data Privacy Act of 2012.{' '}
                                        <Link href="/privacy" className="font-bold text-blue-700 underline">Privacy Policy</Link>
                                    </label>
                                </div>
                                {errors.consent && <p className="text-[10px] font-semibold text-red-600 mt-1">{errors.consent}</p>}
                            </div>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <Link href="/login" className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors">
                            &larr; Back to Login
                        </Link>
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-md shadow-blue-600/20 transition-all text-xs tracking-wide h-9"
                        >
                            {processing ? 'Submitting...' : 'Submit Registration'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}