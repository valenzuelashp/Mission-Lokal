import { Head, useForm, usePage } from '@inertiajs/react';
import { Search, Users, UserPlus, X, ShieldAlert, CheckCircle2, Copy, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import ResidentsTable from '@/Components/admin/ResidentsTable';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoResidents, residentCounts } from '@/Lib/adminDemo';
import { cn } from '@/Lib/utils';
import type { AdminResidentsPageProps, VerificationStatus } from '@/Types';

type FilterKey = 'all' | VerificationStatus;

const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'approved', label: 'Verified' },
    { key: 'in_progress', label: 'ID review' },
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
        // Listen to flash data from Laravel
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border-2 border-emerald-500 space-y-4">
                        <div className="flex items-center gap-3 border-b pb-3">
                            <CheckCircle2 className="h-9 w-9 text-emerald-600 shrink-0" />
                            <div>
                                <h3 className="text-lg font-bold text-emerald-900">Resident Successfully Registered!</h3>
                                <p className="text-xs text-muted-foreground">Account created & approved for <strong>{credentialsData.name}</strong>.</p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 border space-y-3">
                            <div>
                                <span className="text-xs text-muted-foreground uppercase font-semibold block">Account ID (Login Username if no email)</span>
                                <span className="font-mono text-lg font-bold text-blue-900">{credentialsData.account_id}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase font-semibold block">Registered Email</span>
                                <span className="font-mono text-sm font-semibold text-gray-800">{credentialsData.username}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase font-semibold block">Generated Temporary Password</span>
                                <span className="font-mono text-2xl font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded border border-red-200 inline-block mt-1">{credentialsData.password}</span>
                            </div>
                        </div>

                        <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200 font-medium">
                            ⚠️ Please copy or write down these login credentials and hand them to the resident before closing this window.
                        </p>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => copyToClipboard(`Account ID: ${credentialsData.account_id}\nUsername: ${credentialsData.username}\nPassword: ${credentialsData.password}`)}
                            >
                                <Copy className="h-4 w-4 mr-1.5" />
                                {copied ? 'Copied!' : 'Copy Credentials'}
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={() => setCredentialsData(null)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Done & Back to Directory
                                <ArrowRight className="h-4 w-4 ml-1.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Residents Directory</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View verified resident accounts, register walk-ins in-person, and track civic participation.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button 
                        onClick={() => setShowAddForm(!showAddForm)} 
                        className="bg-red-600 hover:bg-red-700 shadow-sm"
                    >
                        <UserPlus className="mr-2 h-4 w-4" /> 
                        {showAddForm ? 'Hide Registration Form' : 'Register Walk-in Resident'}
                        {showAddForm ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
                        <Users className="h-4 w-4" />
                        <span>
                            <strong className="text-foreground">{residents.length}</strong> total registered
                        </span>
                    </div>
                </div>
            </div>

            {/* Expanding / Collapsing Walk-in Registration Section */}
            {showAddForm && (
                <div className="mb-6 rounded-xl border bg-white p-6 shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <div>
                            <h3 className="text-base font-bold text-blue-900">In-Person Walk-in Resident Registration</h3>
                            <p className="text-xs text-muted-foreground">For elders or residents registering directly at the barangay hall (Gmail & ID are optional).</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium">First Name *</label>
                                <Input value={manualForm.data.first_name} onChange={e => manualForm.setData('first_name', e.target.value)} required placeholder="FIRST NAME" />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Middle Name</label>
                                <Input value={manualForm.data.middle_name} onChange={e => manualForm.setData('middle_name', e.target.value)} disabled={manualForm.data.no_middle_name} placeholder="MIDDLE NAME" />
                                <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={manualForm.data.no_middle_name}
                                        onChange={(e) => {
                                            const noMiddle = e.target.checked;
                                            manualForm.setData('no_middle_name', noMiddle);
                                            manualForm.setData('middle_name', noMiddle ? 'N/A' : '');
                                        }}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                    />
                                    No middle name
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium">Last Name *</label>
                                <Input value={manualForm.data.last_name} onChange={e => manualForm.setData('last_name', e.target.value)} required placeholder="LAST NAME" />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Name Extension</label>
                                <Input placeholder="JR, III, etc." value={manualForm.data.name_extension} onChange={e => manualForm.setData('name_extension', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium">Birthday *</label>
                                <Input type="date" value={manualForm.data.birthday} onChange={e => manualForm.setData('birthday', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Mobile Number</label>
                                <Input placeholder="09123456789" value={manualForm.data.mobile} onChange={e => manualForm.setData('mobile', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Email Address (Optional)</label>
                                <Input type="email" placeholder="resident@email.com" value={manualForm.data.email} onChange={e => manualForm.setData('email', e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium mb-1 block">Government ID (Optional)</label>
                            <input 
                                type="file" 
                                accept=".jpg, .jpeg, .png, .pdf"
                                onChange={e => manualForm.setData('government_id', e.target.files ? e.target.files[0] : null)}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        {isManualMinor && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4">
                                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
                                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                                    Minor Account — Parent / Guardian Information
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium">Guardian Full Name *</label>
                                        <Input placeholder="Guardian Name" value={manualForm.data.parent_name} onChange={e => manualForm.setData('parent_name', e.target.value)} required={isManualMinor} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium">Guardian Contact *</label>
                                        <Input placeholder="09123456789" value={manualForm.data.parent_contact} onChange={e => manualForm.setData('parent_contact', e.target.value)} required={isManualMinor} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-3">
                            <div>
                                <label className="text-xs font-medium">House / Street *</label>
                                <Input placeholder="House #, Street" value={manualForm.data.house_street} onChange={e => manualForm.setData('house_street', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Barangay Name *</label>
                                <Input placeholder="Barangay" value={manualForm.data.barangay_name} onChange={e => manualForm.setData('barangay_name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium">City / Municipality *</label>
                                <Input placeholder="City" value={manualForm.data.city} onChange={e => manualForm.setData('city', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Province *</label>
                                <Input placeholder="Province" value={manualForm.data.province} onChange={e => manualForm.setData('province', e.target.value)} required />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                            <Button type="submit" disabled={manualForm.processing} className="bg-red-600 hover:bg-red-700 text-white">
                                {manualForm.processing ? 'Registering...' : 'Register & Generate Credentials'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {pendingReview > 0 && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <strong>{pendingReview}</strong> resident{pendingReview > 1 ? 's' : ''} awaiting verification — see{' '}
                    <a href="/admin/verifications" className="font-medium underline">
                        Verification queue
                    </a>
                    .
                </div>
            )}

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key)}
                            className={cn(
                                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                                filter === tab.key
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-muted-foreground ring-1 ring-border hover:bg-muted',
                            )}
                        >
                            {tab.label}
                            <span className="ml-1.5 text-xs opacity-80">({counts[tab.key] ?? 0})</span>
                        </button>
                    ))}
                    </div>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search name, ID, contact…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <section className="rounded-lg border bg-card p-3 shadow-sm sm:p-4 lg:p-5">
                <p className="mb-4 text-sm text-muted-foreground">
                    Showing {filtered.length} of {residents.length} residents · sorted by civic XP
                </p>
                <ResidentsTable residents={filtered} />
            </section>
        </AdminLayout>
    );
}