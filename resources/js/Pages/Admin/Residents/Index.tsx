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

            {/* MANDATORY PROMINENT POPUP MODAL FOR CREDENTIALS */}
            {credentialsData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border-2 border-emerald-500 space-y-4">
                        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black text-lg">✓</span>
                            <div>
                                <h3 className="text-base font-black text-emerald-900">Resident Successfully Registered!</h3>
                                <p className="text-xs text-muted-foreground font-medium">Account created & approved for <strong>{credentialsData.name}</strong>.</p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Account ID (Login Username)</span>
                                <span className="font-mono text-base font-bold text-blue-900">{credentialsData.account_id}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Registered Email</span>
                                <span className="font-mono text-xs font-bold text-slate-700">{credentialsData.username}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Generated Temporary Password</span>
                                <span className="font-mono text-xl font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 inline-block mt-1 shadow-2xs">{credentialsData.password}</span>
                            </div>
                        </div>

                        <p className="text-xs text-amber-900 bg-amber-50 p-3.5 rounded-xl border border-amber-200 font-semibold leading-relaxed">
                            ⚠️ Please copy or write down these secure login credentials and hand them to the resident before closing this window.
                        </p>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                            <Button 
                                size="sm" 
                                variant="outline"
                                className="cursor-pointer text-xs font-bold"
                                onClick={() => copyToClipboard(`Account ID: ${credentialsData.account_id}\nUsername: ${credentialsData.username}\nPassword: ${credentialsData.password}`)}
                            >
                                <Copy className="h-4 w-4 mr-1.5" />
                                {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={() => setCredentialsData(null)}
                                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shadow-sm"
                            >
                                Done & Back to Directory
                                <ArrowRight className="h-4 w-4 ml-1.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <FolderKanban className="h-6 w-6 text-blue-600" />
                        Residents Directory
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                        View verified resident accounts, register walk-ins in-person, and monitor civic engagement XP.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button 
                        onClick={() => setShowAddForm(!showAddForm)} 
                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm cursor-pointer"
                        size="sm"
                    >
                        <UserPlus className="mr-2 h-4 w-4" /> 
                        {showAddForm ? 'Hide Registration Form' : 'Register Walk-In Resident'}
                        {showAddForm ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </Button>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span><strong className="text-slate-900">{residents.length}</strong> total registered</span>
                    </div>
                </div>
            </div>

            {/* EXPANDABLE WALK-IN REGISTRATION FORM */}
            {showAddForm && (
                <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-blue-900">In-Person Walk-in Resident Intake</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">For residents registering directly at the barangay hall (Gmail & ID are optional).</p>
                        </div>
                        <button onClick={() => setShowAddForm(false)} className="rounded-full p-1.5 hover:bg-slate-100 cursor-pointer">
                            <X className="h-4 w-4 text-slate-500" />
                        </button>
                    </div>

                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>First Name *</Label>
                                <Input value={manualForm.data.first_name} onChange={e => manualForm.setData('first_name', e.target.value)} required placeholder="FIRST NAME" />
                                {manualForm.errors.first_name && <p className="text-xs text-red-600 mt-1">{manualForm.errors.first_name}</p>}
                            </div>
                            <div>
                                <Label>Middle Name</Label>
                                <Input value={manualForm.data.middle_name} onChange={e => manualForm.setData('middle_name', e.target.value)} disabled={manualForm.data.no_middle_name} placeholder="MIDDLE NAME" />
                                <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
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
                            <div>
                                <Label>Last Name *</Label>
                                <Input value={manualForm.data.last_name} onChange={e => manualForm.setData('last_name', e.target.value)} required placeholder="LAST NAME" />
                                {manualForm.errors.last_name && <p className="text-xs text-red-600 mt-1">{manualForm.errors.last_name}</p>}
                            </div>
                            <div>
                                <Label>Name Extension</Label>
                                <Input placeholder="JR, III, etc." value={manualForm.data.name_extension} onChange={e => manualForm.setData('name_extension', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label>Birthday *</Label>
                                <Input type="date" value={manualForm.data.birthday} onChange={e => manualForm.setData('birthday', e.target.value)} required />
                                {manualForm.errors.birthday && <p className="text-xs text-red-600 mt-1">{manualForm.errors.birthday}</p>}
                            </div>
                            <div>
                                <Label>Mobile Number</Label>
                                <Input placeholder="09123456789" value={manualForm.data.mobile} onChange={e => manualForm.setData('mobile', e.target.value)} />
                            </div>
                            <div>
                                <Label>Email Address (Optional)</Label>
                                <Input type="email" placeholder="resident@email.com" value={manualForm.data.email} onChange={e => manualForm.setData('email', e.target.value)} />
                                {manualForm.errors.email && <p className="text-xs text-red-600 mt-1">{manualForm.errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <Label className="mb-1.5 block">Government ID (Optional)</Label>
                            <input 
                                type="file" 
                                accept=".jpg, .jpeg, .png, .pdf"
                                onChange={e => manualForm.setData('government_id', e.target.files ? e.target.files[0] : null)}
                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                            {manualForm.errors.government_id && <p className="text-xs text-red-600 mt-1">{manualForm.errors.government_id}</p>}
                        </div>

                        {isManualMinor && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                                    Minor Account — Parent / Guardian Information Required
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Guardian Full Name *</Label>
                                        <Input placeholder="Guardian Name" value={manualForm.data.parent_name} onChange={e => manualForm.setData('parent_name', e.target.value)} required={isManualMinor} />
                                    </div>
                                    <div>
                                        <Label>Guardian Contact *</Label>
                                        <Input placeholder="09123456789" value={manualForm.data.parent_contact} onChange={e => manualForm.setData('parent_contact', e.target.value)} required={isManualMinor} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
                            <div>
                                <Label>House / Street *</Label>
                                <Input placeholder="House #, Street" value={manualForm.data.house_street} onChange={e => manualForm.setData('house_street', e.target.value)} required />
                            </div>
                            <div>
                                <Label>Barangay Name *</Label>
                                <Input placeholder="Barangay" value={manualForm.data.barangay_name} onChange={e => manualForm.setData('barangay_name', e.target.value)} required />
                            </div>
                            <div>
                                <Label>City / Municipality *</Label>
                                <Input placeholder="City" value={manualForm.data.city} onChange={e => manualForm.setData('city', e.target.value)} required />
                            </div>
                            <div>
                                <Label>Province *</Label>
                                <Input placeholder="Province" value={manualForm.data.province} onChange={e => manualForm.setData('province', e.target.value)} required />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="cursor-pointer font-bold text-xs">Cancel</Button>
                            <Button type="submit" disabled={manualForm.processing} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-sm">
                                {manualForm.processing ? 'Registering...' : 'Register & Generate Credentials'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {pendingReview > 0 && (
                <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-xs font-bold text-amber-900 shadow-2xs">
                    ⚠️ <strong className="font-black">{pendingReview}</strong> resident{pendingReview > 1 ? 's' : ''} currently awaiting verification. See the{' '}
                    <a href="/admin/verifications" className="font-extrabold underline">
                        Verification Queue
                    </a>
                    .
                </div>
            )}

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key)}
                            className={cn(
                                'rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer',
                                filter === tab.key
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200',
                            )}
                        >
                            {tab.label}
                            <span className="ml-1.5 opacity-80 text-[10px]">({counts[tab.key] ?? 0})</span>
                        </button>
                    ))}
                    </div>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        className="pl-9 bg-white text-xs h-10 border-slate-200 shadow-2xs"
                        placeholder="Search name, ID, contact…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
                <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Showing {filtered.length} of {residents.length} residents · sorted by Civic XP</span>
                </div>
                <ResidentsTable residents={filtered} />
            </section>
        </AdminLayout>
    );
}