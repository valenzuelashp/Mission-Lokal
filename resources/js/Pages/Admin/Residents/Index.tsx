import { Head, useForm } from '@inertiajs/react';
import { Search, Users, UserPlus, Upload, X } from 'lucide-react';
import { useMemo, useState } from 'react';
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

    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');
    const [activePanel, setActivePanel] = useState<'none' | 'manual' | 'csv'>('none');

    const manualForm = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        name_extension: '',
        sex: 'Male',
        house_street: '',
        barangay_name: '',
        city: '',
        province: '',
        birthday: '',
    });

    const csvForm = useForm<{ file: File | null }>({
        file: null,
    });

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        manualForm.post('/admin/residents', {
            onSuccess: () => {
                setActivePanel('none');
                manualForm.reset();
            },
        });
    };

    const handleCsvSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        csvForm.post('/admin/residents/import-csv', {
            onSuccess: () => {
                setActivePanel('none');
                csvForm.reset();
            },
        });
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

            <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Residents</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Search verified residents, review IDs, and view civic participation history.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button 
                        onClick={() => setActivePanel(activePanel === 'manual' ? 'none' : 'manual')} 
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <UserPlus className="mr-2 h-4 w-4" /> 
                        {activePanel === 'manual' ? 'Close Form' : 'Add Resident'}
                    </Button>
                    <Button 
                        onClick={() => setActivePanel(activePanel === 'csv' ? 'none' : 'csv')} 
                        variant="outline"
                    >
                        <Upload className="mr-2 h-4 w-4" /> 
                        {activePanel === 'csv' ? 'Close Import' : 'Import CSV'}
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
                        <Users className="h-4 w-4" />
                        <span>
                            <strong className="text-foreground">{residents.length}</strong> registered
                        </span>
                    </div>
                </div>
            </div>

            {activePanel === 'manual' && (
                <div className="mb-6 rounded-lg border bg-card p-5 shadow-sm transition-all">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <h3 className="text-base font-semibold text-blue-900">Add Preloaded Resident Manually</h3>
                        <Button variant="ghost" size="sm" onClick={() => setActivePanel('none')}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-medium">First Name</label>
                                <Input value={manualForm.data.first_name} onChange={e => manualForm.setData('first_name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Middle Name</label>
                                <Input value={manualForm.data.middle_name} onChange={e => manualForm.setData('middle_name', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Last Name</label>
                                <Input value={manualForm.data.last_name} onChange={e => manualForm.setData('last_name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Name Extension</label>
                                <Input placeholder="Jr, III, etc." value={manualForm.data.name_extension} onChange={e => manualForm.setData('name_extension', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium">Sex</label>
                                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm" value={manualForm.data.sex} onChange={e => manualForm.setData('sex', e.target.value)}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium">Birthday</label>
                                <Input type="date" value={manualForm.data.birthday} onChange={e => manualForm.setData('birthday', e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-3">
                            <div>
                                <label className="text-xs font-medium">House / Street</label>
                                <Input placeholder="House #, Street name" value={manualForm.data.house_street} onChange={e => manualForm.setData('house_street', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Barangay Name</label>
                                <Input placeholder="Barangay" value={manualForm.data.barangay_name} onChange={e => manualForm.setData('barangay_name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium">City / Municipality</label>
                                <Input placeholder="City" value={manualForm.data.city} onChange={e => manualForm.setData('city', e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Province</label>
                                <Input placeholder="Province" value={manualForm.data.province} onChange={e => manualForm.setData('province', e.target.value)} required />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setActivePanel('none')}>Cancel</Button>
                            <Button type="submit" disabled={manualForm.processing} className="bg-red-600 hover:bg-red-700">Save Resident</Button>
                        </div>
                    </form>
                </div>
            )}

            {activePanel === 'csv' && (
                <div className="mb-6 rounded-lg border bg-card p-5 shadow-sm transition-all">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <h3 className="text-base font-semibold text-blue-900">Batch Import Residents (CSV)</h3>
                        <Button variant="ghost" size="sm" onClick={() => setActivePanel('none')}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <form onSubmit={handleCsvSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium mb-1 block">Select CSV File</label>
                            <input 
                                type="file" 
                                accept=".csv, text/plain" 
                                onChange={e => csvForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                required 
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                CSV columns expected format: First Name, Middle Name, Last Name, Name Extension, Sex, House/Street, Barangay Name, City, Province, Birthday.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setActivePanel('none')}>Cancel</Button>
                            <Button type="submit" disabled={csvForm.processing} className="bg-red-600 hover:bg-red-700">Upload & Import</Button>
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