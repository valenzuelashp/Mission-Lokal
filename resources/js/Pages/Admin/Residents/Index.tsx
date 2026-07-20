import { Head } from '@inertiajs/react';
import { Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import ResidentsTable from '@/Components/admin/ResidentsTable';
import { Input } from '@/Components/ui/input';
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

            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-neutral-200/40 pb-4">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 sm:text-2xl">Residents registry</h2>
                    <p className="mt-1 text-xs font-medium text-neutral-500 max-w-md leading-relaxed">
                        Verify local account clusters, execute document audits, and compile civic progression ledgers.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200/40 shadow-2xs">
                    <Users className="h-3.5 w-3.5 text-neutral-500" />
                    <span>
                        <strong className="text-neutral-900 font-black tabular-nums">{residents.length}</strong> nodes active
                    </span>
                </div>
            </div>

            {pendingReview > 0 && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-md px-4 py-3 text-xs font-bold text-neutral-800 shadow-xs">
                    <div className="h-2 w-2 rounded-full bg-neutral-950 animate-pulse" />
                    <span>Identity check delay: <strong className="font-black underline">{pendingReview} verification flow models</strong> pending evaluation. Navigate to <a href="/admin/verifications" className="font-black underline">Verification Queue</a>.</span>
                </div>
            )}

            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setFilter(tab.key)}
                                className={cn(
                                    'rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wider border transition-all active:scale-[0.98]',
                                    filter === tab.key
                                        ? 'bg-neutral-900 text-white border-transparent shadow-sm'
                                        : 'bg-white/80 border-neutral-200/60 text-neutral-500 hover:text-neutral-900 hover:bg-white hover:border-neutral-300',
                                )}
                            >
                                {tab.label}
                                <span className="ml-1.5 text-[10px] font-bold opacity-60 tabular-nums">({counts[tab.key]})</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                    <Input
                        className="pl-8.5 h-9 rounded-xl border-neutral-200 bg-white/50 text-xs font-bold shadow-2xs focus:bg-white placeholder-neutral-400 focus:border-neutral-900 focus:ring-neutral-900"
                        placeholder="Search lookup profiles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Displaying {filtered.length} of {residents.length} identity points · sorted dynamically by Civic XP density
                    </p>
                </div>
                <ResidentsTable residents={filtered} />
            </div>
        </AdminLayout>
    );
}