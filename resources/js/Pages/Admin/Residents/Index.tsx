import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Users, UserPlus, X, ShieldAlert, Copy, ArrowRight, ChevronDown, ChevronUp, FolderKanban } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import ResidentsTable from '@/Components/admin/ResidentsTable';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoResidents, residentCounts } from '@/Lib/adminDemo';
import { cn } from '@/Lib/utils';
import type { AdminResidentsPageProps, VerificationStatus } from '@/Types';

type FilterKey = 'all' | VerificationStatus;

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Residents' },
    { key: 'approved', label: 'Verified' },
    { key: 'in_progress', label: 'ID Review' },
    { key: 'pending', label: 'Pending' },
    { key: 'rejected', label: 'Rejected' },
];

export default function Index(props: Partial<AdminResidentsPageProps>) {
    const residents = props.residents ?? demoResidents;
    const counts = props.counts ?? residentCounts(residents);
    const { flash } = usePage().props as any;

    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [credentialsData, setCredentialsData] = useState<any>(null);
    const [isManualMinor, setIsManualMinor] = useState(false);
    const [copied, setCopied] = useState(false);

    const manualForm = useForm({
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
        parent_name: '',
        parent_contact: '',
    });

    useEffect(() => {
        if (flash?.new_credentials) {
            setCredentialsData(flash.new_credentials);
            setShowAddForm(false);
        } else if (flash?.credentials) {
            setCredentialsData(flash.credentials);
            setShowAddForm(false);
        }
    }, [flash]);

    useEffect(() => {
        if (manualForm.data.birthday) {
            const birthDate = new Date(manualForm.data.birthday);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            setIsManualMinor(age < 18);
        } else {
            setIsManualMinor(false);
        }
    }, [manualForm.data.birthday]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        manualForm.post('/admin/residents', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page: any) => {
                manualForm.reset();
                setIsManualMinor(false);
                setShowAddForm(false);
                const pageProps = page.props as any;
                const creds = pageProps.flash?.new_credentials || pageProps.flash?.credentials;
                if (creds) {
                    setCredentialsData(creds);
                }
            },
            onError: (errors) => {
                console.error('Walk-in resident submission errors:', errors);
            },
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        return residents
            .filter((row) => {
                const matchesFilter = filter === 'all' || row.verification_status === filter;
                const matchesSearch =
                    !q ||
                    row.full_name.toLowerCase().includes(q) ||
                    row.account_id.toLowerCase().includes(q) ||
                    row.address.toLowerCase().includes(q) ||
                    (row.email?.toLowerCase().includes(q) ?? false) ||
                    (row.mobile?.includes(q) ?? false);

                return matchesFilter && matchesSearch;
            })
            .sort((a, b) => b.civic_xp - a.civic_xp);
    }, [residents, filter, search]);

    const pendingReview = residents.filter(
        (r) => r.verification_status === 'pending' || r.verification_status === 'in_progress',
    ).length;

    return (
        <AdminLayout title="Mission-Lokal Admin: Residents">
            <Head title="Residents" />

            <div className="w-full space-y-8 pb-16">

                {/* MANDATORY PROMINENT POPUP MODAL FOR CREDENTIALS */}
                {credentialsData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border-2 border-emerald-500 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black text-lg">✓</span>
                                <div>
                                    <h3 className="text-base font-black text-emerald-950">Resident Successfully Registered!</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Account created & approved for <strong>{credentialsData.name}</strong>.</p>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80 space-y-3.5 shadow-2xs">
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Account ID (Login Username)</span>
                                    <span className="font-mono text-base font-black text-blue-900">{credentialsData.account_id}</span>
                                </div>
                                <div className="border-t border-slate-200/60 pt-2.5">
                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Registered Email</span>
                                    <span className="font-mono text-xs font-bold text-slate-700">{credentialsData.username}</span>
                                </div>
                                <div className="border-t border-slate-200/60 pt-2.5">
                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Generated Temporary Password</span>
                                    <span className="font-mono text-xl font-black text-rose-600 bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 inline-block mt-1 shadow-2xs">{credentialsData.password}</span>
                                </div>
                            </div>

                            <p className="text-xs text-amber-900 bg-amber-50 p-4 rounded-2xl border border-amber-200 font-semibold leading-relaxed">
                                ⚠️ Please copy or write down these secure login credentials and hand them to the resident before closing this window.
                            </p>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="cursor-pointer text-xs font-bold rounded-xl h-10 px-4 border-slate-200"
                                    onClick={() => copyToClipboard(`Account ID: ${credentialsData.account_id}\nUsername: ${credentialsData.username}\nPassword: ${credentialsData.password}`)}
                                >
                                    <Copy className="h-4 w-4 mr-1.5 text-slate-500" />
                                    {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                                </Button>
                                <Button 
                                    size="sm" 
                                    onClick={() => setCredentialsData(null)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm rounded-xl h-10 px-5"
                                >
                                    Done & Back to Directory
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <FolderKanban className="h-3 w-3" /> Community Census & Registry
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            Residents Directory
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            View verified resident accounts, register walk-ins in-person, and monitor civic engagement XP.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button 
                            onClick={() => setShowAddForm(!showAddForm)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer h-11 px-5 rounded-2xl"
                            size="sm"
                        >
                            <UserPlus className="mr-2 h-4 w-4" /> 
                            {showAddForm ? 'Hide Registration Form' : 'Register Walk-In Resident'}
                            {showAddForm ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                        </Button>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span><strong className="text-slate-900">{residents.length}</strong> total registered</span>
                        </div>
                    </div>
                </div>

                {/* EXPANDABLE WALK-IN REGISTRATION FORM */}
                {showAddForm && (
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                    Intake Desk
                                </span>
                                <h3 className="text-base font-black text-slate-900 mt-1">In-Person Walk-in Resident Intake</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">For residents registering directly at the barangay hall (Gmail & ID are optional).</p>
                            </div>
                            <button onClick={() => setShowAddForm(false)} className="rounded-full p-2 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:text-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleManualSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">First Name *</Label>
                                    <Input value={manualForm.data.first_name} onChange={e => manualForm.setData('first_name', e.target.value)} required placeholder="FIRST NAME" className="rounded-xl h-11 text-xs" />
                                    {manualForm.errors.first_name && <p className="text-xs font-semibold text-red-600 mt-1">{manualForm.errors.first_name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">Middle Name</Label>
                                    <Input value={manualForm.data.middle_name} onChange={e => manualForm.setData('middle_name', e.target.value)} disabled={manualForm.data.no_middle_name} placeholder="MIDDLE NAME" className="rounded-xl h-11 text-xs" />
                                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={manualForm.data.no_middle_name}
                                            onChange={(e) => {
                                                const noMiddle = e.target.checked;
                                                manualForm.setData('no_middle_name', noMiddle);
                                                manualForm.setData('middle_name', noMiddle ? 'N/A' : '');
                                            }}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                                        />
                                        No middle name
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">Last Name *</Label>
                                    <Input value={manualForm.data.last_name} onChange={e => manualForm.setData('last_name', e.target.value)} required placeholder="LAST NAME" className="rounded-xl h-11 text-xs" />
                                    {manualForm.errors.last_name && <p className="text-xs font-semibold text-red-600 mt-1">{manualForm.errors.last_name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">Name Extension</Label>
                                    <Input placeholder="JR, III, etc." value={manualForm.data.name_extension} onChange={e => manualForm.setData('name_extension', e.target.value)} className="rounded-xl h-11 text-xs" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">Birthday *</Label>
                                    <Input type="date" value={manualForm.data.birthday} onChange={e => manualForm.setData('birthday', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                    {manualForm.errors.birthday && <p className="text-xs font-semibold text-red-600 mt-1">{manualForm.errors.birthday}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">Mobile Number</Label>
                                    <Input placeholder="09123456789" value={manualForm.data.mobile} onChange={e => manualForm.setData('mobile', e.target.value)} className="rounded-xl h-11 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">Email Address (Optional)</Label>
                                    <Input type="email" placeholder="resident@email.com" value={manualForm.data.email} onChange={e => manualForm.setData('email', e.target.value)} className="rounded-xl h-11 text-xs" />
                                    {manualForm.errors.email && <p className="text-xs font-semibold text-red-600 mt-1">{manualForm.errors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">Government ID (Optional)</Label>
                                <input 
                                    type="file" 
                                    accept=".jpg, .jpeg, .png, .pdf"
                                    onChange={e => manualForm.setData('government_id', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-xl bg-slate-50/50"
                                />
                                {manualForm.errors.government_id && <p className="text-xs font-semibold text-red-600 mt-1">{manualForm.errors.government_id}</p>}
                            </div>

                            {isManualMinor && (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 space-y-3">
                                    <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider">
                                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                                        Minor Account — Parent / Guardian Information Required
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-black uppercase tracking-wider text-slate-700">Guardian Full Name *</Label>
                                            <Input placeholder="Guardian Name" value={manualForm.data.parent_name} onChange={e => manualForm.setData('parent_name', e.target.value)} required={isManualMinor} className="rounded-xl h-11 text-xs bg-white" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-black uppercase tracking-wider text-slate-700">Guardian Contact *</Label>
                                            <Input placeholder="09123456789" value={manualForm.data.parent_contact} onChange={e => manualForm.setData('parent_contact', e.target.value)} required={isManualMinor} className="rounded-xl h-11 text-xs bg-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">House / Street *</Label>
                                    <Input placeholder="House #, Street" value={manualForm.data.house_street} onChange={e => manualForm.setData('house_street', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">Barangay Name *</Label>
                                    <Input placeholder="Barangay" value={manualForm.data.barangay_name} onChange={e => manualForm.setData('barangay_name', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">City / Municipality *</Label>
                                    <Input placeholder="City" value={manualForm.data.city} onChange={e => manualForm.setData('city', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-700">Province *</Label>
                                    <Input placeholder="Province" value={manualForm.data.province} onChange={e => manualForm.setData('province', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="cursor-pointer font-bold text-xs rounded-xl h-10 px-4">Cancel</Button>
                                <Button type="submit" disabled={manualForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm rounded-xl h-10 px-5">
                                    {manualForm.processing ? 'Registering...' : 'Register & Generate Credentials'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {pendingReview > 0 && (
                    <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 text-xs font-bold text-amber-950 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                            <span className="text-base">⚠️</span>
                            <span><strong className="font-black">{pendingReview}</strong> resident{pendingReview > 1 ? 's' : ''} currently awaiting verification in the review queue.</span>
                        </div>
                        <a href="/admin/verifications" className="font-black uppercase tracking-wider text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs hover:bg-amber-100 transition-colors">
                            Open Verification Queue →
                        </a>
                    </div>
                )}

                {/* Filter and Search Controls - Unboxed / Direct Page Content */}
                <div className="space-y-4 pt-1">
                    <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:overflow-visible sm:px-0">
                        <div className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setFilter(tab.key)}
                                    className={cn(
                                        'rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-2xs',
                                        filter === tab.key
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-600/20'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80',
                                    )}
                                >
                                    <span>{tab.label}</span>
                                    <span className={cn(
                                        'rounded-md px-1.5 py-0.5 text-[10px] font-black',
                                        filter === tab.key ? 'bg-blue-700/60 text-white' : 'bg-slate-200/70 text-slate-700'
                                    )}>
                                        {counts[tab.key] ?? 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-1">
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                className="pl-10 bg-white text-xs h-11 border-slate-200 focus:bg-white transition-colors rounded-xl shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                placeholder="Search by resident name, Account ID, address, email, or mobile number…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Data Table Section */}
                <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Showing <strong className="text-slate-900">{filtered.length}</strong> of <strong className="text-slate-900">{residents.length}</strong> residents · sorted by Civic XP</span>
                    </div>
                    <div className="overflow-x-auto">
                        <ResidentsTable residents={filtered} />
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}