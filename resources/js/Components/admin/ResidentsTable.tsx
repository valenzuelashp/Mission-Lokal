import { Link } from '@inertiajs/react';
import { Award, ChevronRight } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import type { AdminResident, VerificationStatus } from '@/Types';

const statusLabel: Record<VerificationStatus, string> = {
    approved: 'Verified',
    pending: 'Pending',
    in_progress: 'ID review',
    rejected: 'Rejected',
};

const statusStyle: Record<VerificationStatus, 'success' | 'warning' | 'outline' | 'danger'> = {
    approved: 'success',
    pending: 'warning',
    in_progress: 'warning',
    rejected: 'danger',
};

type Props = {
    residents: AdminResident[];
};

export default function ResidentsTable({ residents }: Props) {
    return (
        <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[960px] text-sm">
                <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3">Resident</th>
                        <th className="px-4 py-3">Account ID</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Verification</th>
                        <th className="px-4 py-3">Civic XP</th>
                        <th className="px-4 py-3">Reports</th>
                        <th className="px-4 py-3">Joined</th>
                        <th className="px-4 py-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {residents.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                No residents match your search.
                            </td>
                        </tr>
                    ) : (
                        residents.map((row) => (
                            <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                                            {row.full_name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .slice(0, 2)
                                                .join('')}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium">{row.full_name}</p>
                                            <p className="truncate text-xs text-muted-foreground">{row.address}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs">{row.account_id}</td>
                                <td className="px-4 py-3">
                                    <p className="text-muted-foreground">{row.mobile ?? '—'}</p>
                                    <p className="truncate text-xs text-muted-foreground">{row.email ?? '—'}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={statusStyle[row.verification_status]}>
                                        {statusLabel[row.verification_status]}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1 font-semibold text-blue-800">
                                        <Award className="h-3.5 w-3.5" />
                                        {row.civic_xp}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{row.report_count}</td>
                                <td className="px-4 py-3 text-muted-foreground">{row.joined_at}</td>
                                <td className="px-4 py-3">
                                    <Button size="sm" variant="outline" className="h-8" asChild>
                                        <Link href={`/admin/residents/${row.id}`}>
                                            View
                                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
