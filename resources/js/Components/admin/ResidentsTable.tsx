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
    in_progress: 'ID Review',
    rejected: 'Rejected',
    unverified: 'Unverified',
};

const statusClasses: Record<ExtendedVerificationStatus, string> = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200 font-bold',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
    unverified: 'bg-slate-100 text-slate-600 border-slate-200 font-bold',
};

type Props = {
    residents: AdminResident[];
};

export default function ResidentsTable({ residents }: Props) {
    if (residents.length === 0) {
        return (
            <div className="py-16 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
                <p className="text-sm font-semibold text-muted-foreground">No residents match your search criteria.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {residents.map((resident) => (
                    <ResidentCard key={resident.id} resident={resident} />
                ))}
            </div>

            <div className="hidden rounded-xl border border-slate-200 bg-card shadow-xs md:block">
                <table className="w-full table-fixed text-sm text-left">
                    <thead>
                        <tr className="border-b bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <th className="w-[12%] px-4 py-3.5">Account ID</th>
                            <th className="w-[24%] px-4 py-3.5">Resident Profile</th>
                            <th className="w-[16%] px-4 py-3.5">Contact Number</th>
                            <th className="w-[12%] px-4 py-3.5">Verification</th>
                            <th className="w-[10%] px-4 py-3.5">Civic XP</th>
                            <th className="w-[10%] px-4 py-3.5">Reports</th>
                            <th className="w-[10%] px-4 py-3.5">Joined</th>
                            <th className="w-[6%] px-4 py-3.5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {residents.map((row: any) => {
                            const statusKey = (row.verification_status as ExtendedVerificationStatus) ?? 'unverified';
                            return (
                                <tr
                                    key={row.id}
                                    className="cursor-pointer border-b last:border-0 hover:bg-blue-50/30 transition-colors group"
                                    {...rowNavProps(`/admin/residents/${row.id}`)}
                                >
                                    <td className="px-4 py-3.5 font-mono text-xs font-bold truncate text-blue-700">{row.account_id}</td>
                                    <td className="px-4 py-3.5 truncate">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs">
                                                {row.full_name
                                                    .split(' ')
                                                    .map((n: string) => n[0])
                                                    .slice(0, 2)
                                                    .join('')}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">{row.full_name}</p>
                                                <p className="truncate text-[11px] text-muted-foreground">{row.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 truncate text-xs">
                                        <p className="text-slate-800 font-bold truncate">{row.mobile ?? '—'}</p>
                                        <p className="truncate text-[11px] text-muted-foreground">{row.email ?? '—'}</p>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <Badge className={`font-bold border text-xs px-2.5 py-0.5 ${statusClasses[statusKey] ?? 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                                            {statusLabel[statusKey] ?? row.verification_status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="inline-flex items-center gap-1 font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 text-xs">
                                            <Award className="h-3.5 w-3.5 text-blue-600" />
                                            {row.civic_xp}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-800 font-black text-xs">{row.reports_count ?? 0}</td>
                                    <td className="px-4 py-3.5 text-muted-foreground text-xs truncate">{row.joined_at}</td>
                                    <td className="px-4 py-3.5 text-right">
                                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold bg-white text-blue-700 hover:bg-blue-50 border-blue-200 shadow-2xs cursor-pointer" asChild>
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