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
            <div className="py-20 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
                <p className="text-sm font-semibold text-muted-foreground">No residents match your search criteria.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 md:hidden">
                {residents.map((resident) => (
                    <ResidentCard key={resident.id} resident={resident} />
                ))}
            </div>

            <div className="hidden rounded-3xl border border-slate-200/80 bg-card shadow-2xs md:block w-full overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-black uppercase tracking-wider text-slate-400">
                            <th className="px-5 py-4 w-[13%]">Account ID</th>
                            <th className="px-5 py-4 w-[25%]">Resident Profile</th>
                            <th className="px-5 py-4 w-[18%]">Contact Number</th>
                            <th className="px-5 py-4 w-[12%]">Verification</th>
                            <th className="px-4 py-4 w-[9%]">Civic XP</th>
                            <th className="px-4 py-4 w-[8%]">Reports</th>
                            <th className="px-4 py-4 w-[9%]">Joined</th>
                            <th className="px-6 py-4 w-[6%] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {residents.map((row: any) => {
                            const statusKey = (row.verification_status as ExtendedVerificationStatus) ?? 'unverified';
                            return (
                                <tr
                                    key={row.id}
                                    className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors group"
                                    {...rowNavProps(`/admin/residents/${row.id}`)}
                                >
                                    <td className="px-5 py-4 font-mono text-xs font-black text-blue-700 whitespace-nowrap">{row.account_id}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-extrabold border border-blue-100 shadow-2xs">
                                                {row.full_name
                                                    .split(' ')
                                                    .map((n: string) => n[0])
                                                    .slice(0, 2)
                                                    .join('')}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors truncate">{row.full_name}</p>
                                                <p className="truncate text-[11px] text-slate-400 font-medium">{row.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-xs">
                                        <p className="text-slate-900 font-bold truncate">{row.mobile ?? '—'}</p>
                                        <p className="truncate text-[11px] text-slate-400 font-medium">{row.email ?? '—'}</p>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Badge className={`font-bold border text-xs px-2.5 py-0.5 shadow-2xs inline-block ${statusClasses[statusKey] ?? 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                                            {statusLabel[statusKey] ?? row.verification_status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100 text-xs shadow-2xs">
                                            <Award className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                            <span>{row.civic_xp}</span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-slate-900 font-black text-xs whitespace-nowrap">{row.reports_count ?? 0}</td>
                                    <td className="px-4 py-4 text-slate-400 font-semibold text-xs whitespace-nowrap">{row.joined_at}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <Button size="sm" variant="outline" className="h-9 px-3.5 text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 border-slate-200 shadow-2xs cursor-pointer rounded-xl" asChild>
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