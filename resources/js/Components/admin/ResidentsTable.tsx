import { Link } from '@inertiajs/react';
import { Award, ChevronRight } from 'lucide-react';
import ResidentCard from '@/Components/admin/ResidentCard';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { rowNavProps, stopRowNav } from '@/Lib/tableRow';
import type { AdminResident, VerificationStatus } from '@/Types';

type ExtendedVerificationStatus = VerificationStatus | 'unverified';

const statusLabel: Record<ExtendedVerificationStatus, string> = {
    approved: 'Verified',
    pending: 'Pending',
    in_progress: 'ID review',
    rejected: 'Rejected',
    unverified: 'Unverified',
};

// Custom Tailwind styling classes matching your color mapping request
const statusClasses: Record<ExtendedVerificationStatus, string> = {
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',     // Green
    pending: 'bg-amber-100 text-amber-800 border-amber-300',           // Yellow / Amber
    in_progress: 'bg-blue-100 text-blue-800 border-blue-300',          // Blue
    rejected: 'bg-purple-100 text-purple-800 border-purple-300',       // Violet / Purple
    unverified: 'bg-rose-100 text-rose-800 border-rose-300',           // Red / Rose
};

type Props = {
    residents: AdminResident[];
};

export default function ResidentsTable({ residents }: Props) {
    if (residents.length === 0) {
        return <p className="py-10 text-center text-sm text-muted-foreground">No residents match your search.</p>;
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {residents.map((resident) => (
                    <ResidentCard key={resident.id} resident={resident} />
                ))}
            </div>

            <div className="hidden rounded-lg border bg-card md:block">
                <table className="w-full table-fixed text-sm">
                    <thead>
                        <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <th className="w-[16%] px-4 py-3">Resident</th>
                            <th className="w-[8%] px-4 py-3">Account ID</th>
                            <th className="w-[8%] px-4 py-3">Contact</th>
                            <th className="w-[8%] px-4 py-3">Verification</th>
                            <th className="w-[5%] px-4 py-3">Civic XP</th>
                            <th className="w-[5%] px-4 py-3">Reports</th>
                            <th className="w-[6%] px-4 py-3">Joined</th>
                            <th className="w-[5%] px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {residents.map((row) => {
                            const statusKey = (row.verification_status as ExtendedVerificationStatus) ?? 'unverified';
                            return (
                                <tr
                                    key={row.id}
                                    className="cursor-pointer border-b last:border-0 hover:bg-muted/20"
                                    {...rowNavProps(`/admin/residents/${row.id}`)}
                                >
                                    <td className="px-4 py-3 truncate">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                                                {row.full_name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .slice(0, 2)
                                                    .join('')}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{row.full_name}</p>
                                                <p className="truncate text-xs text-muted-foreground">{row.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 font-mono text-xs truncate">{row.account_id}</td>
                                    <td className="px-2 py-3 truncate">
                                        <p className="text-muted-foreground truncate">{row.mobile ?? '—'}</p>
                                        <p className="truncate text-xs text-muted-foreground">{row.email ?? '—'}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={statusClasses[statusKey] ?? 'bg-gray-100 text-gray-800 border-gray-300'}>
                                            {statusLabel[statusKey] ?? row.verification_status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 font-semibold text-blue-800">
                                            <Award className="h-3.5 w-3.5" />
                                            {row.civic_xp}
                                        </span>
                                    </td>
                                    <td className="px-2 py-3 text-muted-foreground">{row.report_count}</td>
                                    <td className="px-1 py-3 text-muted-foreground truncate">{row.joined_at}</td>
                                    <td className="px-2 py-3">
                                        <Button size="sm" variant="outline" className="h-8" asChild>
                                            <Link href={`/admin/residents/${row.id}`} onClick={stopRowNav}>
                                                View
                                                <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}