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

            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-blue-900">Residents</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Search verified residents, review IDs, and view civic participation history.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                        <strong className="text-foreground">{residents.length}</strong> registered
                    </span>
                </div>
            </div>

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
                <div className="flex flex-wrap gap-2">
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
                            <span className="ml-1.5 text-xs opacity-80">({counts[tab.key]})</span>
                        </button>
                    ))}
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

            <section className="rounded-lg border bg-card p-4 shadow-sm lg:p-5">
                <p className="mb-4 text-sm text-muted-foreground">
                    Showing {filtered.length} of {residents.length} residents · sorted by civic XP
                </p>
                <ResidentsTable residents={filtered} />
            </section>
        </AdminLayout>
    );
}
